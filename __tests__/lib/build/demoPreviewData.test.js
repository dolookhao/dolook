const {
  assertDemoPreviewEnvironment,
  isDemoPreviewBuild
} = require('@/lib/build/demoPreviewEnv')
const { loadDemoPreviewData } = require('@/lib/build/demoPreviewData')
const fs = require('node:fs')
const path = require('node:path')

describe('demo preview content adapter', () => {
  it('maps every structured item to a full, published site page', () => {
    const data = loadDemoPreviewData({ includeFullMarkdown: true })
    const publicData = loadDemoPreviewData()
    const projects = data.allPages.filter(page => page.type === 'Post' && page.category.includes('项目案例'))
    const articles = data.allPages.filter(page => page.type === 'Post' && page.category.includes('图文文章'))
    const experiences = data.demoContent.timeline

    expect(projects).toHaveLength(8)
    expect(articles).toHaveLength(8)
    expect(experiences).toHaveLength(5)
    expect(data.allPages.filter(page => page.status !== 'Published')).toHaveLength(0)
    expect(data.allPages.find(page => page.slug === projects[0].slug).demoContentMarkdown).toMatch(/项目概述/)
    expect(data.allPages.find(page => page.slug === articles[0].slug).demoContentMarkdown).toMatch(/##/)
    expect(data.allPages.find(page => page.slug === 'about').demoContentMarkdown).toMatch(/产品方法/)
    expect(data.allPages.find(page => page.slug === 'contact').demoContentMarkdown).toMatch(/联系我/)
    expect(data.allPages.find(page => page.slug === 'experience').demoContentMarkdown).toMatch(/职业经历/)
    expect(data.allPages.every(page => page.demoFixture === true)).toBe(true)
    expect(publicData.allPages.every(page => !page.demoContentMarkdown)).toBe(true)
    expect(projects.every(page => fs.existsSync(path.join(process.cwd(), 'demo-preview-data/assets', path.basename(page.pageCoverThumbnail))))).toBe(true)
    expect(articles.every(page => fs.existsSync(path.join(process.cwd(), 'demo-preview-data/assets', path.basename(page.pageCoverThumbnail))))).toBe(true)
  })

  it('requires an explicit non-production Cloudflare preview branch and URL', () => {
    expect(() => assertDemoPreviewEnvironment({
      enabled: 'true',
      publicEnabled: 'true',
      branch: 'portfolio/demo-preview',
      siteUrl: 'https://portfolio-demo-preview.notionnext-2nm.pages.dev'
    })).not.toThrow()
    expect(() => assertDemoPreviewEnvironment({
      enabled: 'true',
      publicEnabled: 'true',
      branch: 'portfolio/cloudflare-pages-prelaunch',
      siteUrl: 'https://preview.pages.dev'
    })).toThrow(/branch/i)
    expect(() => assertDemoPreviewEnvironment({
      enabled: 'true',
      publicEnabled: 'true',
      branch: 'portfolio/demo-preview',
      siteUrl: 'https://dolookhao.bid'
    })).toThrow(/production domain/i)
    expect(() => assertDemoPreviewEnvironment({
      enabled: 'true',
      publicEnabled: 'true',
      branch: 'portfolio/demo-preview',
      siteUrl: 'https://notionnext-2nm.pages.dev'
    })).toThrow(/production domain/i)
    expect(() => assertDemoPreviewEnvironment({ enabled: 'true', publicEnabled: 'true', branch: '', siteUrl: 'https://preview.pages.dev' })).toThrow(/CF_PAGES_BRANCH/i)
  })

  it('does not enable demo mode implicitly', () => {
    expect(isDemoPreviewBuild({ DEMO_PREVIEW: 'false', CF_PAGES_BRANCH: 'portfolio/demo-preview' })).toBe(false)
    expect(isDemoPreviewBuild({ DEMO_PREVIEW: 'true', CF_PAGES_BRANCH: 'portfolio/demo-preview' })).toBe(true)
    expect(isDemoPreviewBuild({ DEMO_PREVIEW: 'true', CF_PAGES_BRANCH: 'portfolio/cloudflare-pages-prelaunch' })).toBe(false)
  })
})
