const PROJECT_CATEGORY = '项目案例'

const getTagName = tag => {
  if (typeof tag === 'string') return tag.trim()
  if (tag && typeof tag.name === 'string') return tag.name.trim()
  if (tag && typeof tag.label === 'string') return tag.label.trim()
  return ''
}

export function getPublicProjectPosts(posts) {
  if (!Array.isArray(posts)) return []
  return posts.filter(
    post =>
      post?.type === 'Post' &&
      post?.status === 'Published' &&
      (Array.isArray(post?.category)
        ? post.category.includes(PROJECT_CATEGORY)
        : String(post?.category || '')
            .split(',')
            .map(category => category.trim())
            .includes(PROJECT_CATEGORY))
  )
}

export function getProjectTagOptions(posts) {
  return Array.from(
    new Set(
      getPublicProjectPosts(posts)
        .flatMap(post => (Array.isArray(post?.tags) ? post.tags : []))
        .map(getTagName)
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right, 'zh-CN'))
}

export function filterProjectsByTag(posts, selectedTag = '全部') {
  const publicPosts = getPublicProjectPosts(posts)
  if (!selectedTag || selectedTag === '全部') return publicPosts
  return publicPosts.filter(post =>
    (Array.isArray(post?.tags) ? post.tags : []).some(
      tag => getTagName(tag) === selectedTag
    )
  )
}

export function isProjectCasePost(post) {
  return (
    post?.type === 'Post' &&
    (Array.isArray(post?.category)
      ? post.category.includes(PROJECT_CATEGORY)
      : String(post?.category || '')
          .split(',')
          .map(category => category.trim())
          .includes(PROJECT_CATEGORY))
  )
}

export function getProjectTagNames(post) {
  return (Array.isArray(post?.tags) ? post.tags : [])
    .map(getTagName)
    .filter(Boolean)
}
