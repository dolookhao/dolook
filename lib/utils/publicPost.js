import BLOG from '@/blog.config'

export const normalizePostId = value =>
  String(value || '')
    .replace(/-/g, '')
    .toLowerCase()

const PUBLIC_CONFIG_KEY_ALLOWLIST = new Set([
  'ALGOLIA_SEARCH_ONLY_APP_KEY',
  'COMMENT_VALINE_APP_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'
])

function redactSensitiveConfig(node) {
  if (Array.isArray(node)) {
    return node.map(redactSensitiveConfig)
  }
  if (!node || typeof node !== 'object') return node

  for (const [key, value] of Object.entries(node)) {
    const normalizedKey = key.toUpperCase()
    const sensitive =
      !PUBLIC_CONFIG_KEY_ALLOWLIST.has(normalizedKey) &&
      /(TOKEN|SECRET|PASSWORD|PASSWD|PRIVATE|SERVICE.?ROLE|(?:^|_)KEY$)/i.test(key)
    if (sensitive) delete node[key]
    else node[key] = redactSensitiveConfig(value)
  }
  return node
}

/** Keep the existing truthy password flag without publishing a password hash. */
export function redactPost(post) {
  if (!post || typeof post !== 'object' || !post.password) return post
  const summary = { ...post }
  for (const key of [
    'blockMap',
    'content',
    'toc',
    'results',
    'wordCount',
    'readTime',
    'originalityProof'
  ])
    delete summary[key]
  return { ...summary, password: 'protected' }
}

export function redactSiteData(data) {
  if (data.NOTION_CONFIG && typeof data.NOTION_CONFIG === 'object') {
    data.NOTION_CONFIG = redactSensitiveConfig(data.NOTION_CONFIG)
  }
  for (const key of [
    'allPages',
    'latestPosts',
    'allNavPages',
    'allLinkPages',
    'allMembers',
    'allEvents',
    'customNav',
    'customMenu'
  ]) {
    if (Array.isArray(data[key])) data[key] = data[key].map(redactPost)
  }
  if (data.notice) data.notice = redactPost(data.notice)
  return data
}

/** A public article must not serialize a protected or unpublished collection row. */
export function redactProtectedBlocks(post, allPages = [], unpublishedPageIds = []) {
  const blocks = post.blockMap?.block || {}
  const allowedRoot = normalizePostId(post.id)
  const denied = new Set(
    allPages
      .filter(
        page =>
          page?.id &&
          (page.password || page.status !== 'Published') &&
          normalizePostId(page.id) !== allowedRoot
      )
      .map(page => normalizePostId(page.id))
  )
  unpublishedPageIds.forEach(id => {
    if (normalizePostId(id) !== allowedRoot) denied.add(normalizePostId(id))
  })

  // A published Notion page can contain a whole collection view in its
  // recordMap. Detect unpublished rows there even when the public allPages
  // list was filtered before this page was rendered.
  const statusName = BLOG.NOTION_PROPERTY_NAME?.status || 'status'
  const publishedStatus = BLOG.NOTION_PROPERTY_NAME?.status_publish || 'Published'
  const statusKeys = new Map()
  for (const [collectionId, record] of Object.entries(post.blockMap?.collection || {})) {
    const schema = record?.value?.schema || record?.schema || {}
    const statusKey = Object.entries(schema).find(
      ([, property]) => property?.name === statusName
    )?.[0]
    if (statusKey) statusKeys.set(normalizePostId(collectionId), statusKey)
  }
  for (const [id, entry] of Object.entries(blocks)) {
    if (normalizePostId(id) === allowedRoot) continue
    const value = entry?.value?.value || entry?.value || entry
    const statusKey = statusKeys.get(normalizePostId(value?.parent_id))
    if (!statusKey || value?.type !== 'page') continue
    const status = value?.properties?.[statusKey]?.[0]?.[0]
    if (status !== publishedStatus) denied.add(normalizePostId(id))
  }

  let changed = true
  while (changed) {
    changed = false
    for (const [id, entry] of Object.entries(blocks)) {
      const value = entry?.value?.value || entry?.value || entry
      if (
        normalizePostId(id) !== allowedRoot &&
        !denied.has(normalizePostId(id)) &&
        denied.has(normalizePostId(value?.parent_id))
      ) {
        denied.add(normalizePostId(id))
        changed = true
      }
      const referencedBlockIds = [
        value?.format?.transclusion_reference_pointer?.id,
        value?.format?.alias_pointer?.id
      ]
      if (
        normalizePostId(id) !== allowedRoot &&
        !denied.has(normalizePostId(id)) &&
        referencedBlockIds.some(pointer => denied.has(normalizePostId(pointer)))
      ) {
        denied.add(normalizePostId(id))
        changed = true
      }
      if (denied.has(normalizePostId(id))) {
        for (const child of value?.content || []) {
          if (normalizePostId(child) !== allowedRoot && !denied.has(normalizePostId(child))) {
            denied.add(normalizePostId(child))
            changed = true
          }
        }
      }
    }
  }
  for (const id of Object.keys(post.blockMap?.signed_urls || {})) {
    if (denied.has(normalizePostId(id))) delete post.blockMap.signed_urls[id]
  }
  for (const [id, entry] of Object.entries(blocks)) {
    if (denied.has(normalizePostId(id))) {
      delete blocks[id]
      if (post.blockMap.signed_urls) delete post.blockMap.signed_urls[id]
    } else if (entry?.value?.content) {
      entry.value.content = entry.value.content.filter(
        child => !denied.has(normalizePostId(child))
      )
    }
  }

  // Collection views and query results can still contain row IDs after the
  // row blocks are removed. These maps are serialized into HTML and JSON.
  const removeDeniedReferences = node => {
    if (Array.isArray(node)) {
      for (let index = node.length - 1; index >= 0; index--) {
        const value = node[index]
        if (typeof value === 'string' && denied.has(normalizePostId(value))) {
          node.splice(index, 1)
        } else if (value && typeof value === 'object') {
          removeDeniedReferences(value)
        }
      }
    } else if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (denied.has(normalizePostId(key)) ||
            (typeof value === 'string' && denied.has(normalizePostId(value)))) {
          delete node[key]
        } else if (value && typeof value === 'object') {
          removeDeniedReferences(value)
        }
      }
    }
  }
  removeDeniedReferences(post.blockMap?.collection_view)
  removeDeniedReferences(post.blockMap?.collection_query)

  const root = Object.entries(blocks).find(
    ([id]) => normalizePostId(id) === normalizePostId(post.id)
  )?.[1]?.value
  // A database page's properties may contain the original Notion password column.
  if (root?.properties)
    root.properties = { title: root.properties.title || [[post.title || '']] }
}

/** Clone cached records before filtering them for a public response or index. */
export function getPublicPostBlockMap(post, blockMap, allPages = [], unpublishedPageIds = []) {
  if (!blockMap || post?.password) return { block: {} }
  const publicPost = { ...post, blockMap: JSON.parse(JSON.stringify(blockMap)) }
  redactProtectedBlocks(publicPost, allPages, unpublishedPageIds)
  return publicPost.blockMap
}
