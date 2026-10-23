/**
 * @jest-environment node
 */
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'

describe('siteConfig', () => {
  const originalPostListStyle = BLOG.POST_LIST_STYLE

  afterEach(() => {
    BLOG.POST_LIST_STYLE = originalPostListStyle
  })

  it('uses BLOG/env config before caller default for server-only keys', () => {
    BLOG.POST_LIST_STYLE = 'scroll'

    expect(siteConfig('POST_LIST_STYLE', 'page', {})).toBe('scroll')
  })

  it('keeps extend config higher priority than BLOG/env config', () => {
    BLOG.POST_LIST_STYLE = 'scroll'

    expect(siteConfig('POST_LIST_STYLE', 'page', { POST_LIST_STYLE: 'page' })).toBe(
      'page'
    )
  })

  it('reads inner page parent path toggle from Notion Config', () => {
    expect(
      siteConfig('INNER_PAGE_URL_PARENT_PATH', false, {
        INNER_PAGE_URL_PARENT_PATH: 'true'
      })
    ).toBe(true)
  })

  it('uses an explicit production URL ahead of a stale Notion demo URL', () => {
    const previous = process.env.NEXT_PUBLIC_LINK
    process.env.NEXT_PUBLIC_LINK = 'https://dolookhao.bid'
    try {
      expect(siteConfig('LINK', null, { LINK: 'https://preview.tangly1024.com' }))
        .toBe('https://dolookhao.bid')
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_LINK
      else process.env.NEXT_PUBLIC_LINK = previous
    }
  })

  it('uses the project URL when the env var is absent and Notion Config has a demo URL', () => {
    const previousEnv = process.env.NEXT_PUBLIC_LINK
    const previousLink = BLOG.LINK
    delete process.env.NEXT_PUBLIC_LINK
    BLOG.LINK = 'https://dolookhao.bid'
    try {
      expect(siteConfig('LINK', null, { LINK: 'https://preview.tangly1024.com' }))
        .toBe('https://dolookhao.bid')
    } finally {
      BLOG.LINK = previousLink
      if (previousEnv !== undefined) process.env.NEXT_PUBLIC_LINK = previousEnv
    }
  })
})
