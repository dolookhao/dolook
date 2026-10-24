import React from 'react'
import { render, screen } from '@testing-library/react'
import ArticleList from '@/themes/proxio/components/ArticleList'

jest.mock('@/components/SmartLink', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

jest.mock('@/components/LazyImage', () => ({
  __esModule: true,
  default: ({ alt, className, src }) => (
    <img alt={alt} className={className} src={src} />
  )
}))

jest.mock('@/components/BlogAdSlot', () => ({
  __esModule: true,
  default: ({ placement }) => (
    <div data-testid='blog-ad-slot' data-placement={placement} />
  )
}))

describe('Proxio ArticleList', () => {
  it('renders a real post link, cover, summary, and tags', () => {
    render(
      <ArticleList
        title='图文文章'
        posts={[
          {
            href: '/article/product-notes',
            title: '产品复盘',
            summary: '从问题到方案的过程记录。',
            publishDay: '2026-10-20',
            pageCoverThumbnail: 'https://images.example.com/cover.jpg',
            tags: ['产品思考', 'AI']
          }
        ]}
      />
    )

    expect(screen.getByRole('link', { name: '产品复盘' })).toHaveAttribute(
      'href',
      '/article/product-notes'
    )
    expect(screen.getByText('从问题到方案的过程记录。')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '产品复盘' })).toHaveAttribute(
      'src',
      'https://images.example.com/cover.jpg'
    )
    expect(
      screen.getAllByRole('link', { name: '#产品思考' })[0]
    ).toHaveAttribute('href', '/tag/%E4%BA%A7%E5%93%81%E6%80%9D%E8%80%83')
  })

  it('shows an honest empty state without an invented article', () => {
    render(<ArticleList title='图文文章' posts={[]} />)

    expect(screen.getByText('暂无已发布文章')).toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('labels demo article archives clearly', () => {
    render(
      <ArticleList
        category='图文文章'
        posts={[{ href: '/blog/one', title: '演示文章', demoFixture: true }]}
      />
    )

    expect(screen.getByText(/演示内容/)).toBeInTheDocument()
  })

  it('links to the next static archive page when the Notion list is paginated', () => {
    render(
      <ArticleList
        category='图文文章'
        baseHref='/category/图文文章'
        currentPage={1}
        pageSize={12}
        postCount={17}
        posts={[{ href: '/article/one', title: '文章一' }]}
      />
    )

    expect(screen.getByRole('link', { name: '下一页 →' })).toHaveAttribute(
      'href',
      '/category/图文文章/page/2'
    )
  })

  it('keeps ad placements off unless the blog archive explicitly enables them', () => {
    const { rerender } = render(
      <ArticleList
        category='图文文章'
        posts={[{ href: '/article/one', title: '文章一' }]}
      />
    )
    expect(screen.queryByTestId('blog-ad-slot')).not.toBeInTheDocument()

    rerender(
      <ArticleList
        category='图文文章'
        allowAds
        posts={[{ href: '/article/one', title: '文章一' }]}
      />
    )
    expect(screen.getByTestId('blog-ad-slot')).toHaveAttribute(
      'data-placement',
      'archive'
    )
  })
})
