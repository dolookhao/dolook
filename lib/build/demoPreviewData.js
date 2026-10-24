const fs = require('node:fs')
const path = require('node:path')

const DATA_ROOT = path.resolve(process.cwd(), 'demo-preview-data/content')
const ASSET_PREFIX = '/demo-preview-assets'

function readMarkdown(directory, slugPrefix) {
  const file = fs.readdirSync(path.join(DATA_ROOT, directory)).find(name =>
    name.endsWith('.md') && name.includes(slugPrefix)
  )
  if (!file) throw new Error(`Missing demo markdown for ${directory}/${slugPrefix}`)
  return fs.readFileSync(path.join(DATA_ROOT, directory, file), 'utf8').trim()
}

function toTimestamp(date) {
  const parsed = Date.parse(date)
  return Number.isNaN(parsed) ? 0 : parsed
}

function postBase({ id, slug, title, summary, category, tags, cover, date }) {
  return {
    id,
    short_id: id,
    title,
    name: title,
    slug,
    href: `/${slug}`,
    type: 'Post',
    status: 'Published',
    category: [category],
    tags: tags || ['演示'],
    summary,
    date: { start_date: date },
    publishDay: date,
    publishDate: toTimestamp(date),
    pageCoverThumbnail: cover,
    pageCover: cover,
    demoFixture: true,
    demoLabel: '演示内容｜所有公司、经历与指标均为虚构示例'
  }
}

function loadDemoPreviewData({ includeFullMarkdown = false } = {}) {
  const content = JSON.parse(fs.readFileSync(path.join(DATA_ROOT, 'site-data.json'), 'utf8'))
  if (content.mode !== 'DEMO_PREVIEW_ONLY') throw new Error('Demo fixture mode marker is missing')

  const projects = content.projects.map((item, index) => {
    const cover = `${ASSET_PREFIX}/${path.basename(item.cover)}`
    return {
      ...postBase({
        id: `demo-project-${String(index + 1).padStart(2, '0')}`,
        slug: `projects/${item.slug}`,
        title: item.title,
        summary: item.summary,
        category: '项目案例',
        tags: [item.category, '演示'],
        cover,
        date: item.period.match(/\d{4}\.\d{2}/)?.[0] || ''
      }),
      demoProject: item,
      demoContentMarkdown: readMarkdown('projects', item.slug)
    }
  })

  const articles = content.articles.map((item, index) => {
    const cover = `${ASSET_PREFIX}/${path.basename(item.cover)}`
    return {
      ...postBase({
        id: `demo-article-${String(index + 1).padStart(2, '0')}`,
        slug: `blog/${item.slug}`,
        title: item.title,
        summary: item.summary,
        category: '图文文章',
        tags: item.tags,
        cover,
        date: item.date
      }),
      demoArticle: item,
      demoContentMarkdown: readMarkdown('articles', item.slug)
    }
  })

  const pages = ['experience', 'about', 'contact'].map((slug, index) => {
    const title = { experience: '职业经历', about: '关于我', contact: '联系我' }[slug]
    return {
      id: `demo-page-${String(index + 1).padStart(2, '0')}`,
      title,
      name: title,
      slug,
      href: `/${slug}`,
      type: 'Page',
      status: 'Published',
      summary: slug === 'experience'
        ? content.timeline.map(item => `${item.period}｜${item.title}`).join('；')
        : content[slug]?.paragraphs?.[0] || content[slug]?.description || content[slug]?.title,
      demoFixture: true,
      demoLabel: '演示内容｜所有公司、经历与指标均为虚构示例',
      demoContentMarkdown: readMarkdown('', `${slug}.md`)
    }
  })

  const fullPages = [...pages, ...projects, ...articles]
  const allPages = includeFullMarkdown
    ? fullPages
    : fullPages.map(({ demoContentMarkdown, ...page }) => page)
  const categories = Array.from(new Set(allPages.flatMap(page => page.category || [])))
  const siteUrl = process.env.NEXT_PUBLIC_LINK
  const siteInfo = {
    title: `${content.identity.displayName} · 产品经理作品集（演示）`,
    description: content.hero.description,
    link: siteUrl,
    language: 'zh-CN'
  }
  const postSummaries = [...projects, ...articles]
    .map(({ demoContentMarkdown, ...post }) => post)
    .sort((a, b) => b.publishDate - a.publishDate)

  return {
    demoPreview: true,
    demoContent: content,
    notice: null,
    siteInfo,
    NOTION_CONFIG: { THEME: 'proxio', LINK: siteUrl, SITE_NAME: siteInfo.title },
    allPages,
    allNavPages: postSummaries,
    allLinkPages: [],
    allMembers: [],
    allEvents: [],
    latestPosts: postSummaries.filter(post => post.category.includes('图文文章')).slice(0, 8),
    postCount: projects.length + articles.length,
    pageIds: allPages.map(page => page.id),
    categoryOptions: categories.map(name => ({ name })),
    tagOptions: Array.from(new Set([...projects, ...articles].flatMap(post => post.tags))).map(name => ({ name })),
    customNav: content.navigation,
    customMenu: content.navigation
  }
}

module.exports = { loadDemoPreviewData }
