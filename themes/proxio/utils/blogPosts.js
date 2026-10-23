const BLOG_CATEGORY = '图文文章'

const getCategoryNames = category =>
  (Array.isArray(category) ? category : String(category || '').split(','))
    .map(value => String(value).trim())
    .filter(Boolean)

const getTagName = tag => {
  if (typeof tag === 'string') return tag.trim()
  if (tag && typeof tag.name === 'string') return tag.name.trim()
  if (tag && typeof tag.label === 'string') return tag.label.trim()
  return ''
}

/** The callers receive public Notion data, but keep the filter explicit at the UI boundary. */
export function getPublishedBlogPosts(posts) {
  if (!Array.isArray(posts)) return []
  return posts.filter(
    post =>
      post?.type === 'Post' &&
      post?.status === 'Published' &&
      getCategoryNames(post?.category).includes(BLOG_CATEGORY)
  )
}

export function getPublishedPosts(posts) {
  if (!Array.isArray(posts)) return []
  return posts.filter(post => post?.type === 'Post' && post?.status === 'Published')
}

export function getBlogTagOptions(posts) {
  return Array.from(
    new Set(
      getPublishedBlogPosts(posts)
        .flatMap(post => (Array.isArray(post.tags) ? post.tags : []))
        .map(getTagName)
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right, 'zh-CN'))
}

export function getNotionCategoryNames(category) {
  return getCategoryNames(category)
}

export function getNotionTagName(tag) {
  return getTagName(tag)
}
