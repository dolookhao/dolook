import BLOG from '@/blog.config'
import { getOrSetDataWithCache } from '../cache/cache_manager'
import { getAllCategories } from '@/lib/db/notion/getAllCategories'
import getAllPageIds from '@/lib/db/notion/getAllPageIds'
import { getAllTags } from '@/lib/db/notion/getAllTags'
import { getConfigMapFromConfigPage } from '@/lib/db/notion/getNotionConfig'
import getPageProperties, {
  adjustPageProperties
} from '@/lib/db/notion/getPageProperties'
import {
  getCustomMenu,
  getSourcePageSlugs
} from '@/lib/db/notion/getCustomMenu'
import {
  fetchInBatches,
  fetchNotionPageBlocks,
  formatNotionBlock
} from '@/lib/db/notion/getPostBlocks'
import { compressImage, mapImgUrl } from '@/lib/db/notion/mapImage'
import { deepClone } from '@/lib/utils'
import { idToUuid } from 'notion-utils'
import { siteConfig } from '../config'
import { extractLangId, extractLangPrefix, getShortId } from '../utils/pageId'
import {
  normalizeNotionMetadata,
  normalizeCollection,
  normalizeSchema,
  normalizePageBlock
} from './notion/normalizeUtil'
import { filterCollectionViewData } from './notion/filterCollectionViewData'
import { fetchPageFromNotion } from './notion/getNotionPost'
import { processPostData } from '../utils/post'
import { writePwaManifest } from '../pwa.server'
import { adapterNotionBlockMap } from '../utils/notion.util'
import { sortPinnedPostsByLatestUpdate } from '@/lib/utils/pinnedPosts'
import { redactPost, redactSiteData } from '@/lib/utils/publicPost'
import { resolveUuidPostAccess, normalizePostId, redactProtectedBlocks, verifyPostPassword } from '@/lib/server/postAccess'
import { isExport } from '@/lib/utils/buildMode'
import { assertDemoPreviewEnvironment } from '@/lib/build/demoPreviewEnv'
import { loadDemoPreviewData } from '@/lib/build/demoPreviewData'
import { assertNoPublishedDemoContent } from '@/lib/build/demoContentGuard'
import { fetchMembersFromOfficialAPI } from './notion/memberDataSource'
import {
  getPublishedTypedPages,
  sortTypedPagesByPublishDate
} from '@/lib/site/typedCollections'
// import pLimit from 'p-limit'

export { getAllTags } from './notion/getAllTags'
export { fetchPageFromNotion as getPost } from './notion/getNotionPost'
export { fetchNotionPageBlocks as getPostBlocks } from './notion/getPostBlocks'

/**
 * èŽ·å–å…¨ç«™æ•°æ®ï¼›åŸºäºŽ Notion å®žçŽ°
 * æ”¯æŒå¤šç«™ç‚¹ï¼ˆpageId é€—å·åˆ†éš”ï¼‰å’Œå¤šè¯­è¨€ï¼ˆlocale å‰ç¼€ï¼‰
 */
export async function fetchGlobalAllData({
  pageId = BLOG.NOTION_PAGE_ID,
  from,
  locale,
  includePasswordHashes = false,
  includeUnpublishedPageIds = false,
  requireAvailableData = false
}) {
  if (process.env.DEMO_PREVIEW === 'true') {
    assertDemoPreviewEnvironment()
    return loadDemoPreviewData()
  }

  if (BLOG.BUNDLE_ANALYZER) {
    const data = EmptyData(pageId)
    delete data.__notionDataUnavailable
    return data
  }

  const cacheKey = getGlobalDataCacheKey({ pageId, locale })
  const cachedData = await getOrSetDataWithCache(cacheKey, async () => {
    const siteIds = pageId?.split(',') || []
    let data = EmptyData(pageId)

    try {
      for (let index = 0; index < siteIds.length; index++) {
        const siteId = siteIds[index]
        const id = extractLangId(siteId)
        const prefix = extractLangPrefix(siteId)

        if (index === 0 || locale === prefix) {
          data = await getSiteDataByPageId({ pageId: id, from })
        }
      }
    } catch (error) {
      console.error('å¼‚å¸¸', error)
      data = EmptyData(pageId)
    }

    return handleDataBeforeReturn(deepClone(data))
  })

  const data = deepClone(cachedData)
  // A static export must fail instead of publishing the placeholder site when
  // Notion cannot be reached during a scheduled or manual rebuild.
  if ((requireAvailableData || isExport()) && data?.__notionDataUnavailable) {
    throw new Error('Site catalog is temporarily unavailable')
  }
  if (isExport()) assertNoPublishedDemoContent(data)
  delete data.__notionDataUnavailable
  const siteLink = siteConfig('LINK')
  if (data.NOTION_CONFIG) data.NOTION_CONFIG.LINK = siteLink
  if (data.siteInfo) data.siteInfo.link = siteLink
  // A copied demo catalog is rejected above, before any build-time manifest
  // or page data is written from the fetched Notion content.
  writePwaManifest({ siteInfo: data.siteInfo, notionConfig: data.NOTION_CONFIG })
  if (isExport()) {
    for (const key of ['allPages', 'latestPosts', 'allNavPages', 'allLinkPages', 'allMembers', 'allEvents']) {
      if (Array.isArray(data[key])) {
        data[key] = data[key].filter(page => page?.status === 'Published')
      }
    }
  }
  data.latestPosts = cleanPostSummaries(data.latestPosts)
  if (data.notice?.blockMap) redactProtectedBlocks(data.notice, data.allPages || [], data.__unpublishedPageIds || [])
  data.notice = cleanNoticeForClient(data.notice)
  if (data.notice) delete data.notice.id
  if (!includeUnpublishedPageIds) delete data.__unpublishedPageIds
  return includePasswordHashes ? data : redactSiteData(data)
}

function getGlobalDataCacheKey({ pageId, locale }) {
  const safePageId = String(pageId || BLOG.NOTION_PAGE_ID).replace(
    /[^a-z0-9,_:-]/gi,
    '_'
  )
  const safeLocale = String(locale || 'default').replace(/[^a-z0-9_-]/gi, '_')
  return `global_data_${safeLocale}_${safePageId}`
}

/**
 * èŽ·å–æŒ‡å®š Notion collection æ•°æ®
 * å¸¦é˜²å‡»ç©¿ç¼“å­˜ï¼šåŒä¸€ pageId å¹¶å‘æ—¶åªå‘ä¸€æ¬¡ API è¯·æ±‚
 */
export async function getSiteDataByPageId({ pageId, from }) {
  // const siteStart = Date.now()

  const cacheKey = `site_${pageId}`

  const data = await getOrSetDataWithCache(cacheKey,
    async () => {
      console.log('èŽ·å–å…¨ç«™æ•°æ® ', pageId)
      // æ‹‰å–æ•°æ®
      const originalPageRecordMap = await fetchNotionPageBlocks(pageId, from)
      // è½¬æ¢æ ¼å¼
      const r = await convertNotionToSiteData(pageId, from, originalPageRecordMap)
      // è¿”å›žå¹¶å¡žå…¥ç¼“å­˜
      return Array.isArray(r?.allPages) ? r : EmptyData(pageId)
    }

  )
  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[ThemeResolver][site-data]',
      JSON.stringify({
        from,
        pageId,
        notionTheme: data?.NOTION_CONFIG?.THEME || null,
        configTheme: BLOG.THEME,
        cacheEnabled: BLOG.ENABLE_CACHE
      })
    )
  }
  return data

  // const originalPageRecordMap = await promise
  // const siteEnd = Date.now()
  // console.log(`â± [Notion API] ç«™ç‚¹ ${pageId} è€—æ—¶: ${siteEnd - siteStart}ms`)
  // return convertNotionToSiteData(pageId, from, deepClone(originalPageRecordMap))


}

/**
 * èŽ·å–å…¬å‘Š block
 * æ‹‰å–åŽå¿…é¡»ç»è¿‡ adapter + formatï¼Œå¦åˆ™æ–°æ ¼å¼åŒå±‚åµŒå¥—å¯¼è‡´ type undefined
 */
async function getNotice(post) {
  if (!post) return null

  try {
    const rawBlockMap = await fetchNotionPageBlocks(post.id, 'data-notice', {
      cacheVersion: post.lastEditedDate
    })
    const adapted = adapterNotionBlockMap(rawBlockMap)
    post.blockMap = {
      ...adapted,
      block: formatNotionBlock(adapted.block)
    }
  } catch (e) {
    console.warn('[getNotice] fetchNotionPageBlocks failed:', post.id, e)
    post.blockMap = null
  }

  return post
}

const CLIENT_POST_SUMMARY_FIELDS = [
  'id',
  'short_id',
  'title',
  'name',
  'slug',
  'href',
  'target',
  'pageIcon',
  'icon',
  'pageCover',
  'pageCoverThumbnail',
  'date',
  'publishDate',
  'publishDay',
  'lastEditedDate',
  'lastEditedDay',
  'category',
  'tags',
  'tagItems',
  'summary',
  'description',
  'type',
  'status',
  'demoFixture',
  'demoLabel',
  'password',
  'readTime',
  'wordCount',
  'ext'
]

export function cleanPostSummary(post) {
  if (!post || typeof post !== 'object') return post

  const result = {}
  CLIENT_POST_SUMMARY_FIELDS.forEach(field => {
    if (post[field] !== undefined) result[field] = post[field]
  })
  return redactPost(result)
}

export function cleanPostSummaries(posts) {
  if (!Array.isArray(posts)) return posts
  return posts.map(cleanPostSummary)
}

function cleanPostForClient(post) {
  if (!post?.blockMap) return post
  const cleanedPost = cleanBlock(post)
  delete cleanedPost.content
  cleanRecordMapMetadata(cleanedPost.blockMap)
  filterCollectionViewData(cleanedPost.blockMap)
  pruneUnusedCollectionRecords(cleanedPost.blockMap)
  return cleanedPost
}

function cleanNoticeForClient(notice) {
  if (!notice?.blockMap) return notice
  const cleanedNotice = cleanBlock(notice)
  pruneBlockMapToRootPage(cleanedNotice.blockMap, cleanedNotice.id)
  cleanRecordMapMetadata(cleanedNotice.blockMap)
  filterCollectionViewData(cleanedNotice.blockMap)
  pruneUnusedCollectionRecords(cleanedNotice.blockMap)
  return cleanedNotice
}

function pruneBlockMapToRootPage(blockMap, rootId) {
  if (!blockMap?.block) return

  const rootBlockId = rootId || findRootPageBlockId(blockMap.block)
  if (!rootBlockId) return

  const keepIds = new Set([rootBlockId])
  let changed = true
  while (changed) {
    changed = false
    Object.entries(blockMap.block).forEach(([id, entry]) => {
      const block = entry?.value || entry
      if (!keepIds.has(id) && keepIds.has(block?.parent_id)) {
        keepIds.add(id)
        changed = true
      }
    })
  }

  Object.keys(blockMap.block).forEach(id => {
    if (!keepIds.has(id)) delete blockMap.block[id]
  })
}

function findRootPageBlockId(blockRecord) {
  return Object.values(blockRecord)
    .map(entry => entry?.value || entry)
    .find(block => block?.type === 'page' && Array.isArray(block.content))
    ?.id
}

function cleanRecordMapMetadata(blockMap) {
  if (!blockMap) return

  delete blockMap.__version__
  if (blockMap.notion_user && Object.keys(blockMap.notion_user).length === 0) {
    delete blockMap.notion_user
  }

  cleanRecordEntries(blockMap.collection)
  cleanRecordEntries(blockMap.collection_view)
}

function pruneUnusedCollectionRecords(blockMap) {
  if (!blockMap?.block) return

  const collectionIds = new Set()
  const viewIds = new Set()
  Object.values(blockMap.block).forEach(entry => {
    const block = entry?.value || entry
    if (!block || typeof block !== 'object') return
    if (block.collection_id) collectionIds.add(block.collection_id)
    block.view_ids?.forEach(viewId => viewIds.add(viewId))
  })

  pruneRecordByIds(blockMap.collection, collectionIds)
  pruneRecordByIds(blockMap.collection_view, viewIds)
  pruneRecordByIds(blockMap.collection_query, collectionIds)
}

function pruneRecordByIds(record, ids) {
  if (!record || typeof record !== 'object') return
  Object.keys(record).forEach(id => {
    if (!ids.has(id)) delete record[id]
  })
}

function cleanRecordEntries(record) {
  if (!record || typeof record !== 'object') return

  Object.values(record).forEach(entry => {
    const value = entry?.value || entry
    if (!value || typeof value !== 'object') return

    delete value.version
    delete value.created_by_table
    delete value.created_by_id
    delete value.last_edited_by_table
    delete value.last_edited_by_id
    delete value.space_id
    delete value.parent_table
    delete value.permissions
    delete value.alive
    delete value.role
    delete value.copied_from_pointer
    delete value.copied_from
  })
}

/**
 * ç©ºçš„é»˜è®¤æ•°æ®ï¼ˆNotion æ‹‰å–å¤±è´¥æ—¶çš„å…œåº•ï¼‰
 */
const EmptyData = pageId => ({
  // Persist the failure distinction in the cache, never in public page props.
  __notionDataUnavailable: true,
  notice: null,
  siteInfo: getSiteInfo({}),
  allPages: [
    {
      id: 1,
      title: `æ— æ³•èŽ·å–Notionæ•°æ®ï¼Œè¯·æ£€æŸ¥Notion_IDï¼š \n å½“å‰ ${pageId}`,
      summary:
        'è®¿é—®æ–‡æ¡£èŽ·å–å¸®åŠ© â†’ https://docs.tangly1024.com/article/vercel-deploy-notion-next',
      status: 'Published',
      type: 'Post',
      slug: 'oops',
      publishDay: '2024-11-13',
      pageCoverThumbnail: BLOG.HOME_BANNER_IMAGE || '/bg_image.jpg',
      date: {
        start_date: '2023-04-24',
        lastEditedDay: '2023-04-24',
        tagItems: []
      }
    }
  ],
  allNavPages: [],
  allLinkPages: [],
  collection: [],
  collectionQuery: {},
  collectionId: null,
  collectionView: {},
  viewIds: [],
  block: {},
  schema: {},
  tagOptions: [],
  categoryOptions: [],
  rawMetadata: {},
  customNav: [],
  customMenu: [],
  allMembers: [],
  allEvents: [],
  postCount: 1,
  pageIds: [],
  latestPosts: []
})
/**
 * åœ¨æœåŠ¡ç«¯è§£æžå•ç¯‡æ–‡ç« çš„ props
 * å…¼å®¹ prefix / slug / suffix ä»»æ„ç»„åˆ
 * åªèƒ½åœ¨ getStaticProps / getServerSideProps ä¸­ä½¿ç”¨
 */
export async function resolvePostProps({ prefix, slug, suffix, locale, from, password, revalidateReason }) {
  const segments = [prefix, slug].filter(Boolean)
  if (Array.isArray(suffix)) segments.push(...suffix)
  const fullSlug = segments.join('/')
  const lastSegment = segments.at(-1)
  const source = from || `slug-props-${fullSlug}`
  if (process.env.DEMO_PREVIEW === 'true') {
    assertDemoPreviewEnvironment()
    const fixture = loadDemoPreviewData()
    const fullPage = loadDemoPreviewData({ includeFullMarkdown: true }).allPages.find(page => page.slug === fullSlug && page.status === 'Published')
    const post = fullPage || null
    return {
      ...fixture,
      post,
      prev: null,
      next: null,
      recommendPosts: [],
      demoPreview: true
    }
  }
  // Use Next's per-request phase rather than BUILD_MODE, which can remain set
  // in a deployed process. Runtime failures must not replace a successful ISR page.
  const allowPublicFallback = isExport() || revalidateReason === 'build'
  const taskId = `${fullSlug || lastSegment}-${Date.now()}` // å½“å‰ä»»åŠ¡å”¯ä¸€æ ‡è¯†

  const startTime = Date.now()
  console.log(`[${taskId}] ðŸ•’ å¼€å§‹è§£æžæ–‡ç« : ${fullSlug || las~õçkh‘éì¶»§q«^vnæ:+©9ag9n¥yfï‚ˆÛÛœÝYÙPÛÝ™\ˆHÛÛXÝ[ÛË˜ÛÝ™\‚ˆÈX\[YÕ\›
ÛÛXÝ[ÛË˜ÛÝ™\‹ÛÛXÝ[Û‹	ØÛÛXÝ[Û‰ÊBˆˆ˜]ÓY]Y]OË™›Ü›X]ËœYÙWØÛÝ™\‚ˆÈX\[YÕ\›
˜]ÓY]Y]OË™›Ü›X]ËœYÙWØÛÝ™\‹˜]ÓY]Y]K	Ø›ØÚÉÊBˆˆY˜][YÙPÛÝ™\‚‚ˆ]XÛÛˆHÛÛ\™\ÜÒ[XYÙJˆÛÛXÝ[ÛËšXÛÛ‚ˆÈX\[YÕ\›
ÛÛXÝ[ÛËšXÛÛ‹ÛÛXÝ[Û‹	ØÛÛXÝ[Û‰ÊBˆˆY˜][XÛÛ‚ˆ
BˆÛÛœÝ[šÈHY˜][[šÂˆÛÛœÝ[[ÚšT]\›ˆH×QÐÖ×QŒWQ‘‘—_QÑ×QÌWQM—KÙÂˆYˆ
ZXÛÛˆ[[ÚšT]\›‹\Ý
XÛÛŠJHXÛÛˆHY˜][XÛÛ‚‚ˆ™]\›ˆÈ]K\ØÜš\[Û‹YÙPÛÝ™\‹XÛÛ‹[šÈBŸB‚™[˜Ý[Ûˆ\Ò[”˜[™ÙJ]K]HHßJHÂˆÛÛœÝÂˆÝ\Ù]KˆÝ\Ý[YHH	ÌŒ	Ëˆ[™Ù]Kˆ[™Ý[YHH	ÌŒÎNIËˆ[YWÞ›Û™HH	Ð\ÚXKÔÚ[™ÚZIÂˆHH]B‚ˆÛÛœÝÝ\œ™[[Y\Ý[\H]K››ÝÊ
BˆÛÛœÝÝ\[Y\Ý[\HÙ][Y\Ý[\
Ý\Ù]KÝ\Ý[YK[YWÞ›Û™JBˆÛÛœÝ[™[Y\Ý[\HÙ][Y\Ý[\
[™Ù]K[™Ý[YK[YWÞ›Û™JB‚ˆYˆ
Ý\[Y\Ý[\	‰ˆÝ\œ™[[Y\Ý[\Ý\[Y\Ý[\
H™]\›ˆ˜[ÙBˆYˆ
[™[Y\Ý[\	‰ˆÝ\œ™[[Y\Ý[\ˆ[™[Y\Ý[\
H™]\›ˆ˜[ÙBˆ™]\›ˆYBŸB‚™[˜Ý[ÛˆÛÛ™\ÕUÊ]TÝ‹[YV›Û™HH	Ð\ÚXKÔÚ[™ÚZIÊHÂˆÛÛœÝ[YV›Û™SÙ™œÙ]ÈHÂˆUÎˆ	Ñ]ËÑÓU	Îˆ	Ñ]ËÑÓU
Ì	Îˆˆ	Ð\ÚXKÔÚ[™ÚZIÎˆ	Ð\ÚXKÕZ\ZIÎˆ	Ð\ÚXKÕÚÞ[ÉÎˆK	Ð\ÚXKÔÙ[Ý[	ÎˆKˆ	Ð\ÚXKÒÛÛØ]IÎˆKK	Ð\ÚXKÒ˜ZØ\IÎˆË	Ð\ÚXKÔÚ[™Ø\Ü™IÎˆˆ	Ð\ÚXKÒÛ™×ÒÛÛ™ÉÎˆ	Ð\ÚXKÐ˜[™ÚÛÚÉÎˆË	Ð\ÚXKÑX˜ZIÎˆˆ	Ð\ÚXKÕZ˜[‰ÎˆËK	Ð\ÚXKÔš^XY	ÎˆËˆ	Ñ]\›ÜKÓÛ™Û‰Îˆ	Ñ]\›ÜKÔ\š\ÉÎˆK	Ñ]\›ÜKÐ™\›[‰ÎˆKˆ	Ñ]\›ÜKÓ[ÜØÛÝÉÎˆË	Ñ]\›ÜKÐ[\Ý\™[IÎˆKˆ	Ð[Y\šXØKÓ™]×Ö[ÜšÉÎˆMK	Ð[Y\šXØKÐÚXØYÛÉÎˆM‹	Ð[Y\šXØKÑ[™\‰ÎˆMËˆ	Ð[Y\šXØKÓÜ×Ð[™Ù[\ÉÎˆN	Ð[Y\šXØKÔØ[×Ô][ÉÎˆLËˆ	Ð[Y\šXØKÐ\™Ù[[˜KÐY[›Ü×ÐZ\™\ÉÎˆLËˆ	ÐYœšXØKÒ›Ú[›™\Ø\™ÉÎˆ‹	ÐYœšXØKÐØZ\›ÉÎˆ‹	ÐYœšXØKÓ˜Z\›ØšIÎˆËˆ	Ð]\Ý˜[XKÔÞY™^IÎˆL	Ð]\Ý˜[XKÔ\	Îˆˆ	ÔXÚYšXËÐ]XÚÛ[™	ÎˆLË	ÔXÚYšXËÑšZšIÎˆL‹ˆ	Ð[\˜ÝXØKÔ[Y\‰ÎˆLË	Ð[\˜ÝXØKÓXÓ]\™ÉÎˆLÂˆBˆÛÛœÝÛÛ[™[Y˜][ÈHÂˆ\ÚXNˆ	Ð\ÚXKÔÚ[™ÚZIË]\›ÜNˆ	Ñ]\›ÜKÓÛ™Û‰Ë[Y\šXØNˆ	Ð[Y\šXØKÓ™]×Ö[ÜšÉËˆYœšXØNˆ	ÐYœšXØKÐØZ\›ÉË]\Ý˜[XNˆ	Ð]\Ý˜[XKÔÞY™^IËˆXÚYšXÎˆ	ÔXÚYšXËÐ]XÚÛ[™	Ë[\˜ÝXØNˆ	Ð[\˜ÝXØKÔ[Y\‰ËUÎˆ	ÕUÉÂˆB‚ˆ]Ù™œÙ]Ý\œÈH[YV›Û™SÙ™œÙ]ÖÝ[YV›Û™WBˆYˆ
Ù™œÙ]Ý\œÈOOH[™Yš[™Y
HÂˆÛÛœÝÛÛ[™[H[YV›Û™KœÜ]
	ËÉÊVÌBˆÛÛœÝ˜[˜XÚÖ›Û™HHÛÛ[™[Y˜][ÖØÛÛ[™[H	ÕUÉÂˆÙ™œÙ]Ý\œÈH[YV›Û™SÙ™œÙ]ÖÙ˜[˜XÚÖ›Û™WBˆÛÛœÛÛKØ\›ŠˆØ\›š[™Îˆ[œÝ\ÜY[YH›Û™H‰Ý[YV›Û™_H‹ˆ\Ú[™ÈY˜][‰Ù˜[˜XÚÖ›Û™_H‹˜ˆ
BˆB‚ˆÛÛœÝØØ[]HH™]È]J	Ù]TÝ‹œ™\XÙJ	È	Ë	Õ	Ê_V˜
BˆYˆ
\Ó˜SŠØØ[]K™Ù][YJ
JJHÂˆ›ÝÈ™]È\œ›ÜŠ[˜[Y]HÝš[™Îˆ	Ù]TÝŸX
BˆBˆ™]\›ˆ™]È]JØØ[]K™Ù][YJ
HHÙ™œÙ]Ý\œÈ
ˆÍŒ
ˆL
BŸB‚™[˜Ý[ÛˆÙ][Y\Ý[\
]K[YHH	ÌŒ	Ë[YWÞ›Û™JHÂˆYˆ
Y]JH™]\›ˆ[ˆ™]\›ˆÛÛ™\ÕUÊ	Ù]_H	Ý[Y_NŒ[YWÞ›Û™JK™Ù][YJ
BŸB‚™^Ü[˜Ý[ÛˆÙ]˜]”YÙ\ÊÈ[YÙ\ÈJHÂˆÛÛœÝ[˜]”YÙ\ÈH[YÙ\ÏË™š[\ŠˆÜÝO‚ˆÜÝ	‰‚ˆÜÝËœÛYÈ	‰‚ˆÜÝË\HOOH	ÔÜÝ	È	‰‚ˆÜÝËœÝ]\ÈOOH	ÔX›\ÚY	Âˆ
Bˆ™]\›ˆ[˜]”YÙ\Ë›X\
][HOˆ
ÂˆYˆ][KšYˆ]Nˆ][K]H	ÉËˆ\Nˆ][K\KˆÝ]\Îˆ][KœÝ]\ËˆYÙPÛÝ™\•[X›˜Z[ˆ][KœYÙPÛÝ™\•[X›˜Z[	ÉËˆØ]YÛÜžNˆ][K˜Ø]YÛÜžH[ˆYÜÎˆ][KYÜÈ[ˆÝ[[X\žNˆ][KœÝ[[X\žH[ˆÛYÎˆ][KœÛYËˆ™YŽˆ][Kš™Y‹ˆYÙRXÛÛŽˆ][KœYÙRXÛÛˆ	ÉËˆ\ÝY]Y]Nˆ][K›\ÝY]Y]KˆX›\Ú]Nˆ][KœX›\Ú]KˆX›\Ú^Nˆ][KœX›\Ú^Kˆ^ˆ][K™^ßBˆJJBŸB‚‹ÊŠ‚ˆ
ˆ›Ý[ÛˆÛÛ[[šÜÈØ[ˆ\™Ù]›ÝÜÝÈ[™Ý[™[Û™HYÙ\ËˆÙY\\Âˆ
ˆ\ÝÙ\\˜]Hœ›ÛH[˜]”YÙ\È™XØ]\ÙH[Y\È\ÙH[˜]”YÙ\È\ÈHÜÝ\Ý‚ˆ
‹Â™^Ü[˜Ý[ÛˆÙ][šÔYÙ\ÊÈ[YÙ\ÈJHÂˆÛÛœÝ[[šÔYÙ\ÈH
[YÙ\È×JK™š[\ŠˆÜÝO‚ˆÜÝ	‰‚ˆÜÝËœÛYÈ	‰‚ˆ
ÜÝË\HOOH	ÔÜÝ	ÈÜÝË\HOOH	ÔYÙIÊH	‰‚ˆÜÝËœÝ]\ÈOOH	ÔX›\ÚY	Âˆ
Bˆ™]\›ˆ[[šÔYÙ\Ë›X\
][HOˆ
ÂˆYˆ][KšYˆ]Nˆ][K]H	ÉËˆ\Nˆ][K\KˆÛYÎˆ][KœÛYËˆ™YŽˆ][Kš™Y‹ˆÚÜÚYˆ][KœÚÜÚYˆJJBŸB‚‹ÊŠ‚ˆ
ˆ:#­ùcå¹¢`9§"ymì¹cäyn ùæ¡9é/¹c.¹¢$9dfˆ
ˆ9.ãˆ[YÙ\È9.+yëfú`"H\OSY[X™\ˆ	‰ˆÝ]\ÏTX›\ÚY9æ¡9§hyæë‚ˆ
‹Â™^Ü[˜Ý[ÛˆÙ][Y[X™\œÊÈ[YÙ\ÈJHÂˆÛÛœÝX›\ÚYHÙ]X›\ÚY\YYÙ\ÊÈ[YÙ\Ë\Nˆ	ÓY[X™\‰ÈJB‚ˆËÈ9ì¯¹ë 9¢$9df9¥l9£k»ï#9cê¹/çyåfybcyêëúg :) yæ¡9keù«­{ï#9aãùl$HYÙT›ÜÈ9/dùéëÂˆÛÛœÝÛ[HHX›\ÚY›X\
HOˆ
ÂˆYˆKšY	ÉËˆ]NˆK]H	ÉËˆ\NˆK\H	ÓY[X™\‰ËˆÝ]\ÎˆKœÝ]\È	ÔX›\ÚY	ËˆÛYÎˆKœÛYÈ	ÉËˆÝ[[X\žNˆKœÝ[[X\žH	ÉËˆ]˜]\ŽˆK˜]˜]\ˆ	ÉËˆ][ÝNˆKœ][ÝH	ÉËˆ›ÛNˆKœ›ÛH	ÉËˆš[ÎˆK˜š[È	ÉËˆ™X]\™YˆK™™X]\™Y	ÉËˆ™\šYšYYˆK™\šYšYY	ÉËˆÛÜÜ™\ŽˆKœÛÜÜ™\ˆÏÈ[ˆ›Ú[™Y]^ˆKš›Ú[™Y]^	ÉËˆYÙRXÛÛŽˆKœYÙRXÛÛˆ	ÉËˆYÙPÛÝ™\•[X›˜Z[ˆKœYÙPÛÝ™\•[X›˜Z[	ÉËˆYÙPÛÝ™\ŽˆKœYÙPÛÝ™\ˆ	ÉËˆX›\Ú]NˆKœX›\Ú]HÏÈ[ˆJJB‚ˆ™]\›ˆÛ[KœÛÜ

KŠHOˆÂˆËÈ™X]\™Y9/&9abˆÛÛœÝQ™X]\™YH›ÛÛX[ŠK™™X]\™Y
BˆÛÛœÝ‘™X]\™YH›ÛÛX[Š‹™™X]\™Y
BˆYˆ
Q™X]\™YOOH‘™X]\™Y
H™]\›ˆ‘™X]\™YÈHˆLBˆËÈ™\šYšYY9/&9abˆÛÛœÝU™\šYšYYH›ÛÛX[ŠK™\šYšYY
BˆÛÛœÝ•™\šYšYYH›ÛÛX[Š‹™\šYšYY
BˆYˆ
U™\šYšYYOOH•™\šYšYY
H™]\›ˆ•™\šYšYYÈHˆLBˆËÈÛÜÜ™\ˆ9caùn£ÂˆYˆ
KœÛÜÜ™\ˆOH[	‰ˆ‹œÛÜÜ™\ˆOH[
H™]\›ˆKœÛÜÜ™\ˆH‹œÛÜÜ™\‚ˆËÈ9cäyn ù¥íºeí9`$¹n£Âˆ™]\›ˆ
ËœX›\Ú]HÏÈ
HH
OËœX›\Ú]HÏÈ
BˆJBŸB‚‹ÊŠ‚ˆ
ˆ:#­ùcå¹¢`9§"ymì¹cäyn ùæ¡9é/¹c.¹­.ùbªˆ
ˆ9.ãˆ[YÙ\È9.+yëfú`"H\OQ]™[	‰ˆÝ]\ÏTX›\ÚY9æ¡9§hyæë‚ˆ
‹Â™^Ü[˜Ý[ÛˆÙ][]™[ÊÈ[YÙ\ÈJHÂˆ™]\›ˆÛÜ\YYÙ\ÐžTX›\Ú]JˆÙ]X›\ÚY\YYÙ\ÊÈ[YÙ\Ë\Nˆ	Ñ]™[	ÈJBˆ
BŸB