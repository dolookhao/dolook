const DEMO_PREVIEW_BRANCH = 'portfolio/demo-preview'
const PRODUCTION_HOSTS = new Set([
  'dolookhao.bid',
  'www.dolookhao.bid',
  'notionnext-2nm.pages.dev'
])

function isDemoPreviewBuild(env = process.env) {
  return env.DEMO_PREVIEW === 'true' && env.CF_PAGES_BRANCH === DEMO_PREVIEW_BRANCH
}

function assertDemoPreviewEnvironment({
  enabled = process.env.DEMO_PREVIEW,
  publicEnabled = process.env.NEXT_PUBLIC_DEMO_PREVIEW,
  branch = process.env.CF_PAGES_BRANCH,
  siteUrl = process.env.NEXT_PUBLIC_LINK
} = {}) {
  if (enabled !== 'true') throw new Error('DEMO_PREVIEW must be explicitly set to true')
  if (publicEnabled !== 'true') throw new Error('NEXT_PUBLIC_DEMO_PREVIEW must be explicitly set to true with DEMO_PREVIEW')
  if (branch !== DEMO_PREVIEW_BRANCH) {
    throw new Error(`Demo fixtures are restricted to the ${DEMO_PREVIEW_BRANCH} branch (CF_PAGES_BRANCH)`)
  }
  if (!siteUrl) throw new Error('NEXT_PUBLIC_LINK must be set to the demo preview URL')

  let hostname
  try {
    hostname = new URL(siteUrl).hostname.toLowerCase()
  } catch {
    throw new Error('NEXT_PUBLIC_LINK must be an absolute HTTPS URL for demo preview')
  }

  if (new URL(siteUrl).protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_LINK must use HTTPS for demo preview')
  }
  if (PRODUCTION_HOSTS.has(hostname)) {
    throw new Error('Demo preview must not use a production domain or the production Pages hostname')
  }
  if (!hostname.endsWith('.pages.dev')) {
    throw new Error('NEXT_PUBLIC_LINK must use the Cloudflare Pages branch preview URL')
  }
}

module.exports = {
  DEMO_PREVIEW_BRANCH,
  isDemoPreviewBuild,
  assertDemoPreviewEnvironment
}
