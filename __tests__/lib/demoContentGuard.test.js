/** @jest-environment node */
import { assertNoPublishedDemoContent } from '@/lib/build/demoContentGuard'

const published = (slug, extra = {}) => ({ slug, status: 'Published', type: 'Post', ...extra })

describe('copied NotionNext demo content export guard', () => {
  it.each(['example-1', 'example-10'])(
    'rejects a remaining Published %s page',
    slug => {
      expect(() => assertNoPublishedDemoContent({
        allPages: [published('real-project'), published(slug)]
      })).toThrow(slug)
    }
  )

  it('rejects template guide but accepts a personal guide and incremental real content', () => {
    expect(() => assertNoPublishedDemoContent({
      allPages: [published('guide', { title: 'NotionNext 模板说明' })]
    })).toThrow(/guide/)
    expect(() => assertNoPublishedDemoContent({
      allPages: [published('guide', { title: 'My design guide' })]
    })).not.toThrow()
    expect(() => assertNoPublishedDemoContent({
      allPages: [published('portfolio', { title: 'My portfolio' })]
    })).not.toThrow()
  })

  it('recognizes upstream menu destinations but not unrelated hosts or article citations', () => {
    expect(() => assertNoPublishedDemoContent({
      allPages: [published('source', {
        type: 'Menu', href: 'https://preview.tangly1024.com/'
      })]
    })).toThrow(/Tangly menu/)
    expect(() => assertNoPublishedDemoContent({
      allPages: [published('source', {
        type: 'Menu', href: 'https://tangly1024.com.evil.example/'
      }), published('citation', {
        href: 'https://docs.tangly1024.com/article/reference'
      })]
    })).not.toThrow()
  })

  it('does not reject unpublished copied rows or menus', () => {
    expect(() => assertNoPublishedDemoContent({
      allPages: [published('example-1', { status: 'Invisible' })],
      customMenu: [{ type: 'Menu', status: 'Invisible', href: 'https://tangly1024.com' }]
    })).not.toThrow()
  })

  it('rejects explicitly marked demo fixtures from production exports', () => {
    expect(() => assertNoPublishedDemoContent({
      allPages: [published('ai-app-matrix', { demoFixture: true })]
    })).toThrow(/demo fixture/i)
    expect(() => assertNoPublishedDemoContent({
      allPages: [published('draft-demo', { status: 'Draft', demoFixture: true })]
    })).not.toThrow()
  })

  it.each([
    ['Notice', '公告', '#'],
    ['Page', '友链', 'links'],
    ['Page', '友链副本', 'friends'],
    ['Page', '作品集', 'portfolio'],
    ['Menu', '友情链接', 'links'],
    ['Menu', '建站教程', '#'],
    ['Menu', '往期整理', '#'],
    ['Menu', 'English', 'en']
  ])('rejects the verified Published template row %s / %s / %s', (type, title, slug) => {
    expect(() => assertNoPublishedDemoContent({
      allPages: [{ type, title, slug, status: 'Published' }]
    })).toThrow(/Official NotionNext demo content/)
  })

  it('matches title, type and slug together for verified template rows', () => {
    expect(() => assertNoPublishedDemoContent({
      allPages: [
        { type: 'Post', title: '作品集', slug: 'portfolio', status: 'Published' },
        { type: 'Page', title: '我的作品集', slug: 'portfolio', status: 'Published' },
        { type: 'Menu', title: 'English', slug: 'english', status: 'Published' },
        { type: 'Notice', title: '公告', slug: '#', status: 'Invisible' }
      ]
    })).not.toThrow()
  })

  it('also checks verified menu rows when they are only in customMenu', () => {
    expect(() => assertNoPublishedDemoContent({
      allPages: [],
      customMenu: [{ type: 'Menu', title: 'English', slug: 'en', status: 'Published' }]
    })).toThrow(/English/)
  })
})
