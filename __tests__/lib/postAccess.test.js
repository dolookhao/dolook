/** @jest-environment node */
import { createHash } from 'crypto'
import { resolvePostProps, fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { getOrSetDataWithCache } from '@/lib/cache/cache_manager'
import { fetchNotionPageBlocks } from '@/lib/db/notion/getPostBlocks'
import { fetchPageFromNotion } from '@/lib/db/notion/getNotionPost'
import { processPostData } from '@/lib/utils/post'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'
import { writePwaManifest } from '@/lib/pwa.server'
import {
  redactProtectedBlocks,
  verifyPostPassword
} from '@/lib/server/postAccess'

jest.mock('@/blog.config', () => ({
  NOTION_PAGE_ID: 'audit-root',
  LANG: 'zh-CN',
  LINK: 'https://example.invalid',
  AUTHOR: 'Audit',
  POST_RECOMMEND_COUNT: 6
}))
jest.mock('@/lib/cache/cache_manager', () => ({
  getOrSetDataWithCache: jest.fn()
}))
jest.mock('@/lib/db/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {}
}))
jest.mock('@/lib/db/notion/getNotionPost', () => ({
  fetchPageFromNotion: jest.fn()
}))
jest.mock('@/lib/db/notion/getPostBlocks', () => ({
  fetchNotionPageBlocks: jest.fn(),
  formatNotionBlock: block => block
}))
jest.mock('@/lib/utils/notion.util', () => ({
  adapterNotionBlockMap: jest.fn(raw => raw)
}))
jest.mock('@/lib/utils/post', () => ({
  ...jest.requireActual('@/lib/utils/post'),
  processPostData: jest.fn((...args) => jest.requireActual('@/lib/utils/post').processPostData(...args))
}))
jest.mock('@/lib/plugins/algolia', () => ({ uploadDataToAlgolia: jest.fn() }))
jest.mock('@/lib/pwa.server', () => ({ writePwaManifest: jest.fn() }))
jest.mock('@/lib/utils/originalityProofManifest', () => ({
  isOriginalityProofAutoManifestEnabled: () => false,
  findOriginalityProofManifestRecord: () => null,
  recordOriginalityProofManifest: () => {}
}))
jest.mock('p-limit', () => () => fn => fn())
jest.mock('notion-utils', () => ({
  idToUuid: value => value,
  getTextContent: value => (value || []).map(x => x[0]).join('')
}))

const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const textId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const secret = 'regression-password'
const digest = createHash('sha256').update(secret).digest('hex')
const marker = 'PRIVATE_BODY_REGRESSION_MARKER'
const options = { prefix: 'protected', locale: 'zh-CN' }
const body = () => ({
  block: {
    [id]: {
      value: {
        id,
        type: 'page',
        content: [textId],
        properties: { title: [['Title']], secretColumn: [[secret]] }
      }
    },
    [textId]: {
      value: {
        id: textId,
        type: 'text',
        parent_id: id,
        properties: { title: [[marker]] }
      }
    }
  }
})

beforeEach(() => {
  delete process.env.EXPORT
  getOrSetDataWithCache.mockResolvedValue({
    NOTION_CONFIG: {},
    allPages: [
      {
        id,
        title: 'Title',
        slug: 'protected',
        type: 'Post',
        status: 'Published',
        password: digest,
        tags: []
      }
    ],
    latestPosts: [],
    tagOptions: []
  })
  fetchNotionPageBlocks.mockImplementation(() => Promise.resolve(body()))
})

it.each([undefined, 'wrong password'])(
  'never fetches or serializes protected body without a valid password (%s)',
  async password => {
    const props = await resolvePostProps({ ...options, password })
    expect(props.post.password).toBe('protected')
    expect(props.post.blockMap).toBeUndefined()
    expect(JSON.stringify(props)).not.toContain(digest)
    expect(JSON.stringify(props)).not.toContain(marker)
    expect(fetchNotionPageBlocks).not.toHaveBeenCalled()
  }
)

it('returns the body only after server verification, without the Notion password column', async () => {
  const props = await resolvePostProps({ ...options, password: secret })
  expect(JSON.stringify(props.post)).toContain(marker)
  expect(JSON.stringify(props)).not.toContain(secret)
  expect(JSON.stringify(props)).not.toContain(digest)
})

it.each([id, id.replace(/-/g, ''), `other/${id.replace(/-/g, '')}`])(
  'does not bypass a password through a UUID alias: %s',
  async path => {
    const [prefix, slug] = path.split('/')
    const props = await resolvePostProps({ prefix, slug })
    expect(props.post.password).toBe('protected')
    expect(props.post.blockMap).toBeUndefined()
    expect(fetchPageFromNotion).not.toHaveBeenCalled()
  }
)

it('redacts hashes from public global page data while retaining server-side verification data', async () => {
  expect(JSON.stringify(await fetchGlobalAllData({}))).not.toContain(digest)
  expect(
    (await fetchGlobalAllData({ includePasswordHashes: true })).allPages[0]
      .password
  ).toBe(digest)
})

it.each([null, { block: {} }])(
  'rejects missing/invalid body data instead of generating a successful blank article (%j)',
  async blocks => {
    fetchNotionPageBlocks.mockResolvedValue(blocks)
    await expect(
      resolvePostProps({ ...options, password: secret })
    ).rejects.toThrow('Unable to load article body')
  }
)

it('propagates an upstream failure so ISR can keep its successful version', async () => {
  fetchNotionPageBlocks.mockRejectedValue(new Error('timeout'))
  await expect(
    resolvePostProps({ ...options, password: secret })
  ).rejects.toThrow('Unable to load article body')
})

it.each([undefined, secret])('exports only a safe lock page even with a valid password (%s)', async password => {
  process.env.EXPORT = 'true'
  try {
    const props = await resolvePostProps({ ...options, password })
    expect(props.postUnlockUnavailable).toBe(true)
    expect(props.post.password).toBe('protected')
    expect(props.post.blockMap).toBeUndefined()
    expect(JSON.stringify(props)).not.toContain(marker)
    expect(JSON.stringify(props)).not.toContain(digest)
    expect(fetchNotionPageBlocks).not.toHaveBeenCalled()
  } finally {
    delete process.env.EXPORT
  }
})

it('exports public content while removing a nested protected article', async () => {
  process.env.EXPORT = 'true'
  const publicId = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  const publicTextId = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  const cached = await getOrSetDataWithCache()
  cached.allPages.push({ id: publicId, title: 'Public article', slug: 'public', type: 'Post', status: 'Published', tags: [] })
  const blocks = body()
  blocks.block[publicId] = { value: { id: publicId, type: 'page', content: [id, publicTextId], properties: { title: [['Public article']] } } }
  blocks.block[id].value.parent_id = publicId
  blocks.block[publicTextId] = { value: { id: publicTextId, type: 'text', parent_id: publicId, properties: { title: [['PUBLIC_EXPORT_BODY']] } } }
  fetchNotionPageBlocks.mockResolvedValueOnce(blocks)
  try {
    const props = await resolvePostProps({ prefix: 'public' })
    expect(JSON.stringify(props.post)).toContain('PUBLIC_EXPORT_BODY')
    expect(JSON.stringify(props)).not.toContain(marker)
    expect(JSON.stringify(props)).not.toContain(digest)
    expect(props.postUnlockUnavailable).toBeUndefined()
  } finally {
    delete process.env.EXPORT
  }
})

it.each([
  ['build', 'fetch'], ['build', 'adapt'],
  ['export', 'fetch'], ['export', 'adapt']
])(
  'renders a safe public summary during %s after a %s failure',
  async (phase, failure) => {
    if (phase === 'export') process.env.EXPORT = 'true'
    const cached = await getOrSetDataWithCache()
    cached.allPages[0].password = ''
    if (failure === 'fetch') fetchNotionPageBlocks.mockRejectedValueOnce(new Error('timeout'))
    if (failure === 'adapt') adapterNotionBlockMap.mockImplementationOnce(() => { throw new Error('bad blocks') })
    const props = await resolvePostProps({ ...options, revalidateReason: phase === 'build' ? 'build' : undefined })
    expect(props.post.title).toBe('Title')
    expect(props.post.blockMap).toBeUndefined()
    expect(JSON.stringify(props)).not.toContain(marker)
    expect(JSON.stringify(props)).not.toContain(digest)
  }
)

it.each(['build', 'export'])('retains only filtered public body data after post-processing fails during %s', async phase => {
  if (phase === 'export') process.env.EXPORT = 'true'
  const publicId = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  const publicTextId = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  const cached = await getOrSetDataWithCache()
  cached.allPages.push({ id: publicId, title: 'Public', slug: 'public', type: 'Post', status: 'Published', tags: [] })
  const blocks = body()
  blocks.block[publicId] = { value: { id: publicId, type: 'page', content: [id, publicTextId], properties: { title: [['Public']], privateColumn: [[secret]] } } }
  blocks.block[id].value.parent_id = publicId
  blocks.block[publicTextId] = { value: { id: publicTextId, type: 'text', parent_id: publicId, properties: { title: [['SAFE_PUBLIC_BODY']] } } }
  fetchNotionPageBlocks.mockResolvedValueOnce(blocks)
  processPostData.mockImplementationOnce(props => {
    props.post.aiSummary = 'PARTIAL_AI_SUMMARY'
    props.post.blockMap.block[publicTextId].value.properties.title = [['PARTIAL_BODY']]
    props.prev = { password: digest, blockMap: body() }
    throw new Error('summary failure')
  })
  const props = await resolvePostProps({ prefix: 'public', revalidateReason: phase === 'build' ? 'build' : undefined })
  const serialized = JSON.stringify(props)
  expect(serialized).toContain('SAFE_PUBLIC_BODY')
  for (const value of [marker, digest, secret, 'PARTIAL_AI_SUMMARY', 'PARTIAL_BODY']) {
    expect(serialized).not.toContain(value)
  }
})

it.each([
  ['stale', 'fetch'], ['stale', 'adapt'], ['stale', 'process'],
  ['on-demand', 'fetch'], ['on-demand', 'adapt'], ['on-demand', 'process'],
  [undefined, 'fetch']
])('propagates a public %s regeneration %s failure instead of replacing the successful page', async (revalidateReason, failure) => {
  const cached = await getOrSetDataWithCache()
  cached.allPages[0].password = ''
  if (failure === 'fetch') fetchNotionPageBlocks.mockRejectedValueOnce(new Error('timeout'))
  if (failure === 'adapt') adapterNotionBlockMap.mockImplementationOnce(() => { throw new Error('bad blocks') })
  if (failure === 'process') processPostData.mockRejectedValueOnce(new Error('processing failed'))
  const previousBuildMode = process.env.BUILD_MODE
  process.env.BUILD_MODE = 'true'
  try {
    await expect(resolvePostProps({ ...options, revalidateReason })).rejects.toThrow()
  } finally {
    if (previousBuildMode === undefined) delete process.env.BUILD_MODE
    else process.env.BUILD_MODE = previousBuildMode
  }
})

it('keeps protected processing failures closed', async () => {
  processPostData.mockRejectedValueOnce(new Error('processing failed'))
  await expect(resolvePostProps({ ...options, password: secret })).rejects.toThrow('processing failed')
})

it('turns failed build-time UUID fetches into not-found without exposing a partial body', async () => {
  fetchPageFromNotion.mockRejectedValueOnce(new Error('Notion unavailable'))
  expect((await resolvePostProps({ prefix: textId, revalidateReason: 'build' })).post).toBeNull()
})

it('propagates runtime UUID fetch failures so ISR retains an existing child page', async () => {
  fetchPageFromNotion.mockRejectedValueOnce(new Error('Notion unavailable'))
  await expect(resolvePostProps({ prefix: textId, revalidateReason: 'stale' })).rejects.toThrow('Notion unavailable')
})

it.each(['fetch-error', 'empty-response', 'invalid-database'])(
  'does not turn an unavailable site catalog (%s) into a successful runtime 404',
  async failure => {
    getOrSetDataWithCache.mockImplementation((_key, loader) => loader())
    if (failure === 'fetch-error') fetchNotionPageBlocks.mockRejectedValue(new Error('timeout'))
    else fetchNotionPageBlocks.mockResolvedValue(failure === 'empty-response' ? null : { block: {} })
    await expect(resolvePostProps({ ...options, revalidateReason: 'stale' })).rejects.toThrow('Site catalog is temporarily unavailable')
    const fallback = await resolvePostProps({ ...options, revalidateReason: 'build' })
    expect(fallback.post).toBeNull()
    expect(fallback.__notionDataUnavailable).toBeUndefined()
  }
)

it('keeps cached catalog failures distinguishable without exposing the internal flag', async () => {
  const cached = { __notionDataUnavailable: true, allPages: [], latestPosts: [] }
  getOrSetDataWithCache.mockResolvedValue(cached)
  expect((await fetchGlobalAllData({})).__notionDataUnavailable).toBeUndefined()
  expect(cached.__notionDataUnavailable).toBe(true)
  await expect(resolvePostProps({ ...options, revalidateReason: 'on-demand' })).rejects.toThrow('Site catalog is temporarily unavailable')
})

it('fails an export when the Notion catalog cannot be read', async () => {
  getOrSetDataWithCache.mockResolvedValue({
    __notionDataUnavailable: true,
    allPages: [],
    latestPosts: []
  })
  process.env.EXPORT = 'true'
  await expect(fetchGlobalAllData({})).rejects.toThrow('Site catalog is temporarily unavailable')
})

it.each([
  [{ slug: 'example-7', title: 'Example 7', type: 'Post' }, /example-7/],
  [{ slug: 'guide', title: 'NotionNext 模板说明', type: 'Post' }, /guide/]
])('rejects a published copied template page during personal-source export: %p', async (demoPage, reason) => {
  getOrSetDataWithCache.mockResolvedValue({
    NOTION_CONFIG: {},
    allPages: [
      { id: 'personal-project', slug: 'my-project', status: 'Published', type: 'Post' },
      { id: 'copied-demo', status: 'Published', ...demoPage }
    ],
    latestPosts: [],
    tagOptions: []
  })
  process.env.EXPORT = 'true'
  await expect(fetchGlobalAllData({ pageId: 'a36bc76aecc7839d900381b217ffc738' })).rejects.toThrow(reason)
})

it('rejects a copied Tangly menu link, including a submenu, before static export', async () => {
  getOrSetDataWithCache.mockResolvedValue({
    NOTION_CONFIG: {},
    allPages: [{ id: 'real-blog', slug: 'my-article', status: 'Published', type: 'Post' }],
    customMenu: [{ status: 'Published', type: 'Menu', subMenus: [
      { status: 'Published', type: 'SubMenu', href: 'https://www.tangly1024.com/' }
    ] }],
    latestPosts: [],
    tagOptions: []
  })
  process.env.EXPORT = 'true'
  await expect(fetchGlobalAllData({ pageId: 'a36bc76aecc7839d900381b217ffc738' })).rejects.toThrow(/Tangly menu/i)
})

it('allows an incremental personal export when demo fingerprints are unpublished', async () => {
  getOrSetDataWithCache.mockResolvedValue({
    NOTION_CONFIG: {},
    allPages: [
      { id: 'real-blog', slug: 'my-article', status: 'Published', type: 'Post' },
      { id: 'old-demo', slug: 'example-1', status: 'Invisible', type: 'Post' }
    ],
    customMenu: [{ status: 'Invisible', type: 'Menu', href: 'https://www.tangly1024.com/' }],
    latestPosts: [],
    tagOptions: []
  })
  process.env.EXPORT = 'true'
  const data = await fetchGlobalAllData({ pageId: 'a36bc76aecc7839d900381b217ffc738' })
  expect(data.allPages.map(page => page.slug)).toEqual(['my-article'])
})

it('writes a PWA manifest only after a clean export catalog passes demo checks', async () => {
  getOrSetDataWithCache.mockResolvedValue({
    NOTION_CONFIG: { PWA_ENABLE: true },
    siteInfo: { title: 'Personal portfolio' },
    allPages: [{ id: 'real-blog', slug: 'my-article', status: 'Published', type: 'Post' }],
    latestPosts: [],
    tagOptions: []
  })
  process.env.EXPORT = 'true'
  await fetchGlobalAllData({ pageId: 'a36bc76aecc7839d900381b217ffc738' })
  expect(writePwaManifest).toHaveBeenCalledWith({
    siteInfo: expect.objectContaining({ title: 'Personal portfolio' }),
    notionConfig: expect.objectContaining({ PWA_ENABLE: true })
  })

  writePwaManifest.mockClear()
  getOrSetDataWithCache.mockResolvedValue({
    NOTION_CONFIG: { PWA_ENABLE: true },
    siteInfo: { title: 'Copied demo' },
    allPages: [
      { id: 'old-demo', slug: 'example-1', status: 'Published', type: 'Post' }
    ],
    latestPosts: [],
    tagOptions: []
  })
  await expect(fetchGlobalAllData({ pageId: 'a36bc76aecc7839d900381b217ffc738' })).rejects.toThrow(/example-1/)
  expect(writePwaManifest).not.toHaveBeenCalled()
})

it('omits invisible records from every public export page list', async () => {
  const published = { id: 'published', slug: 'live', status: 'Published', type: 'Post' }
  const draft = { id: 'draft', slug: 'draft', title: 'Private', status: 'Invisible', type: 'Post' }
  getOrSetDataWithCache.mockResolvedValue({
    NOTION_CONFIG: {},
    allPages: [published, draft],
    latestPosts: [published, draft],
    allNavPages: [published, draft],
    allLinkPages: [published, draft],
    allMembers: [],
    allEvents: [],
    tagOptions: []
  })
  process.env.EXPORT = 'true'
  const data = await fetchGlobalAllData({})
  expect(JSON.stringify(data)).not.toContain('Private')
  for (const key of ['allPages', 'latestPosts', 'allNavPages', 'allLinkPages']) {
    expect(data[key].map(page => page.slug)).toEqual(['live'])
  }
})

it('keeps unpublished IDs server-only while making them available to redaction', async () => {
  const draftId = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  getOrSetDataWithCache.mockResolvedValue({
    NOTION_CONFIG: {}, allPages: [], latestPosts: [], tagOptions: [],
    __unpublishedPageIds: [draftId]
  })
  expect(JSON.stringify(await fetchGlobalAllData({}))).not.toContain(draftId)
  expect((await fetchGlobalAllData({ includeUnpublishedPageIds: true })).__unpublishedPageIds)
    .toEqual([draftId])
})

it('does not render an invisible article through its direct slug', async () => {
  getOrSetDataWithCache.mockResolvedValue({
    NOTION_CONFIG: {},
    allPages: [{ id, slug: 'draft', status: 'Invisible', type: 'Post' }],
    latestPosts: [],
    tagOptions: []
  })
  const props = await resolvePostProps({ prefix: 'draft' })
  expect(props.post).toBeNull()
  expect(fetchNotionPageBlocks).not.toHaveBeenCalled()
})

it('does not serialize a stale Notion demo URL when a production URL is set', async () => {
  const previous = process.env.NEXT_PUBLIC_LINK
  process.env.NEXT_PUBLIC_LINK = 'https://dolookhao.bid'
  try {
    getOrSetDataWithCache.mockResolvedValue({
      NOTION_CONFIG: { LINK: 'https://preview.tangly1024.com' },
      allPages: [],
      latestPosts: [],
      tagOptions: []
    })
    const data = await fetchGlobalAllData({})
    expect(data.NOTION_CONFIG.LINK).toBe('https://dolookhao.bid')
    expect(JSON.stringify(data)).not.toContain('preview.tangly1024.com')
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_LINK
    else process.env.NEXT_PUBLIC_LINK = previous
  }
})

it('removes invisible collection rows and their references from a published block map', () => {
  const draftId = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  const draftChildId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
  const transclusionId = 'ffffffff-ffff-ffff-ffff-ffffffffffff'
  const publicPost = {
    id,
    blockMap: {
      block: {
        [id]: { value: { id, type: 'page', content: [draftId, transclusionId] } },
        [draftId]: {
          value: {
            id: draftId,
            type: 'page',
            parent_id: 'collection-1',
            content: [draftChildId],
            properties: { status_key: [['Invisible']], title: [['Private draft']] }
          }
        },
        [draftChildId]: { value: { id: draftChildId, parent_id: draftId, type: 'text' } },
        [transclusionId]: {
          value: {
            id: transclusionId,
            parent_id: id,
            type: 'transclusion_reference',
            format: { transclusion_reference_pointer: { id: draftChildId, table: 'block' } }
          }
        }
      },
      collection: {
        'collection-1': { value: { schema: { status_key: { name: 'status', type: 'select' } } } }
      },
      collection_view: {
        'view-1': { value: { value: { page_sort: [id, draftId] } } }
      },
      signed_urls: { [draftChildId]: 'https://example.invalid/private-image' }
    }
  }
  redactProtectedBlocks(publicPost, [])
  expect(JSON.stringify(publicPost.blockMap)).not.toContain(draftId)
  expect(JSON.stringify(publicPost.blockMap)).not.toContain(draftChildId)
  expect(JSON.stringify(publicPost.blockMap)).not.toContain(transclusionId)
  expect(JSON.stringify(publicPost.blockMap)).not.toContain('Private draft')
  expect(publicPost.blockMap.block[id]).toBeDefined()
})

it('removes unpublished IDs from collection views even when their row blocks are absent', () => {
  const draftId = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  const publicPost = {
    id,
    blockMap: {
      block: { [id]: { value: { id, type: 'page' } } },
      collection_view: { view: { value: { value: { page_sort: [id, draftId] } } } }
    }
  }
  redactProtectedBlocks(publicPost, [], [draftId])
  expect(JSON.stringify(publicPost.blockMap)).not.toContain(draftId)
  expect(publicPost.blockMap.collection_view.view.value.value.page_sort).toEqual([id])
})

it('keeps compatibility with precomputed uppercase SHA256 and legacy MD5', () => {
  expect(verifyPostPassword({ password: digest.toUpperCase() }, secret)).toBe(
    true
  )
  // Historical fixture for slug "protected" and password "regression-password".
  // Read compatibility must not require generating new legacy password hashes.
  const legacy = '9a311a7d5436c9dd57f43f36fe6b6354'
  expect(
    verifyPostPassword({ slug: 'protected', password: legacy }, secret)
  ).toBe(true)
  expect(
    verifyPostPassword({ slug: 'protected', password: legacy }, 'incorrect')
  ).toBe(false)
  expect(verifyPostPassword({ password: 'protected' }, secret)).toBe(false)
})

it('does not mutate cached raw blocks while removing private Notion properties', async () => {
  const raw = body()
  fetchNotionPageBlocks.mockResolvedValue(raw)
  await resolvePostProps({ ...options, password: secret })
  expect(raw.block[id].value.properties.secretColumn).toEqual([[secret]])
})

it('redacts a protected nested page, its descendants, and signed attachment URLs', () => {
  const outer = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  const post = {
    id: outer,
    blockMap: {
      ...body(),
      signed_urls: { [textId]: 'https://private.example/file' }
    }
  }
  post.blockMap.block[outer] = {
    value: { id: outer, type: 'page', content: [id] }
  }
  post.blockMap.block[id].value.parent_id = outer
  redactProtectedBlocks(post, [{ id, password: digest }])
  expect(JSON.stringify(post)).not.toContain(marker)
  expect(Object.keys(post.blockMap.block)).toEqual([outer])
  expect(post.blockMap.signed_urls).toEqual({})
  expect(post.blockMap.block[outer].value.content).toEqual([])
})

it('denies unknown UUID pages without a catalogued ancestor', async () => {
  const unknown = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  fetchPageFromNotion.mockResolvedValue({
    id: unknown,
    blockMap: { block: { [unknown]: { value: { id: unknown, type: 'page' } } } }
  })
  expect((await resolvePostProps({ prefix: unknown })).post).toBeNull()
})

it('allows a nested page only after verifying its protected Published catalog ancestor', async () => {
  const cached = await getOrSetDataWithCache()
  cached.allPages[0].status = 'Published'
  const child = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  const blocks = body()
  blocks.block[child] = { value: { id: child, type: 'page', parent_id: id, content: [textId], properties: { title: [['Child']] } } }
  blocks.block[textId].value.parent_id = child
  blocks.block[id].value.content = [child]
  fetchPageFromNotion.mockResolvedValue({ id: child, title: 'Child', slug: child, type: 'Page', tags: [], blockMap: blocks })
  const locked = await resolvePostProps({ prefix: child })
  expect(locked.post.blockMap).toBeUndefined()
  expect(locked.post.password).toBe('protected')
  expect(JSON.stringify(locked)).not.toContain(marker)
  expect(JSON.stringify(locked)).not.toContain(digest)
  const unlocked = await resolvePostProps({ prefix: child, password: secret })
  expect(JSON.stringify(unlocked.post)).toContain(marker)
  expect(unlocked.post.blockMap.block[child]).toBeDefined()
  expect(unlocked.post.blockMap.block[id]).toBeUndefined()
  expect(JSON.stringify(unlocked)).not.toContain(digest)
  expect(JSON.stringify(unlocked)).not.toContain(secret)
})

it.each([false, true])('denies a child of an Invisible catalog page (password protected: %s)', async protectedAncestor => {
  const cached = await getOrSetDataWithCache()
  cached.allPages[0].status = 'Invisible'
  cached.allPages[0].password = protectedAncestor ? digest : ''
  const child = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  const blocks = body()
  blocks.block[child] = { value: { id: child, type: 'page', parent_id: id, content: [textId], properties: { title: [['Child']] } } }
  blocks.block[textId].value.parent_id = child
  fetchPageFromNotion.mockResolvedValueOnce({ id: child, title: 'Child', slug: child, type: 'Page', tags: [], blockMap: blocks })
  const props = await resolvePostProps({ prefix: child })
  expect(props.post).toBeNull()
  expect(JSON.stringify(props)).not.toContain(marker)
})
