const DEMO_PAGE_IDS = new Set([
  '02ab3b8678004aa69e9e415905ef32a5',
  '7c1d570661754c8fbc568e00a01fd70e'
])

function assertPersonalNotionSource(value) {
  const source = String(value || '').trim()
  if (!source) {
    throw new Error('NOTION_PAGE_ID is required: copy your own NotionNext template before building this portfolio')
  }

  for (const site of source.split(',')) {
    const parts = site.trim().split(':')
    const pageId = parts.pop()?.replace(/-/g, '').toLowerCase()
    if (parts.length > 1 || !/^[0-9a-f]{32}$/.test(pageId || '')) {
      throw new Error(`Invalid NOTION_PAGE_ID format: ${site.trim()}`)
    }
    if (DEMO_PAGE_IDS.has(pageId)) {
      throw new Error('Demo Notion page ID cannot be used for this personal portfolio')
    }
  }

  return source
}

module.exports = { assertPersonalNotionSource }
