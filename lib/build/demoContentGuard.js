const DEMO_EXAMPLE_SLUG = /^example-(?:10|[1-9])$/i
const TEMPLATE_GUIDE_TITLE = /模板说明|NotionNext.*(?:模板|template)|template.*NotionNext/i
// These combinations were verified against the 34-row official template copy.
// Match all three fields so an unrelated personal page can reuse a slug.
const VERIFIED_TEMPLATE_ROWS = new Set([
  ['Notice', '公告', '#'],
  ['Page', '友链', 'links'],
  ['Page', '友链副本', 'friends'],
  ['Page', '作品集', 'portfolio'],
  ['Menu', '友情链接', 'links'],
  ['Menu', '建站教程', '#'],
  ['Menu', '往期整理', '#'],
  ['Menu', 'English', 'en']
].map(row => JSON.stringify(row)))

function verifiedTemplateRow(item) {
  const type = String(item?.type || '').trim()
  const title = String(item?.title || '').trim()
  const slug = String(item?.slug || '').trim().toLowerCase()
  if (!VERIFIED_TEMPLATE_ROWS.has(JSON.stringify([type, title, slug]))) return null
  return `${type} / ${title} / ${slug}`
}

function isOfficialDemoLink(value) {
  if (typeof value !== 'string') return false

  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return false

    const host = url.hostname.toLowerCase()
    if (host === 'tangly1024.com' || host.endsWith('.tangly1024.com')) {
      return true
    }

    return host === 'tanghh.notion.site' &&
      /(?:02ab3b8678004aa69e9e415905ef32a5|7c1d570661754c8fbc568e00a01fd70e)/i.test(url.pathname)
  } catch {
    return false
  }
}

function isPublishedMenu(item) {
  return item?.status === 'Published' &&
    (item?.type === 'Menu' || item?.type === 'SubMenu')
}

function findDemoFingerprint({ allPages, customMenu } = {}) {
  for (const page of Array.isArray(allPages) ? allPages : []) {
    if (page?.status !== 'Published') continue

    const slug = String(page.slug || '').trim().toLowerCase()
    if (page?.demoFixture === true) return `demo fixture / ${slug || 'unidentified page'}`
    if (DEMO_EXAMPLE_SLUG.test(slug)) return slug
    if (slug === 'guide' && TEMPLATE_GUIDE_TITLE.test(String(page.title || ''))) {
      return 'guide / 模板说明'
    }
    const templateRow = verifiedTemplateRow(page)
    if (templateRow) return templateRow
    if (isPublishedMenu(page) && isOfficialDemoLink(page.href || page.slug)) {
      return 'Tangly menu link'
    }
  }

  const pending = [...(Array.isArray(customMenu) ? customMenu : [])]
  const seen = new Set()
  while (pending.length > 0) {
    const menu = pending.shift()
    if (!menu || seen.has(menu)) continue
    seen.add(menu)
    if (menu.status === 'Published') {
      const templateRow = verifiedTemplateRow(menu)
      if (templateRow) return templateRow
    }
    if (isPublishedMenu(menu) && isOfficialDemoLink(menu.href || menu.slug)) {
      return 'Tangly menu link'
    }
    if (Array.isArray(menu.subMenus)) pending.push(...menu.subMenus)
  }

  return null
}

function assertNoPublishedDemoContent(siteData) {
  const fingerprint = findDemoFingerprint(siteData)
  if (fingerprint) {
    throw new Error(
      `Official NotionNext demo content is still Published (${fingerprint}). ` +
      'Remove or unpublish copied template content before static export.'
    )
  }
}

module.exports = { assertNoPublishedDemoContent }
