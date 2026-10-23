import { render, screen } from '@testing-library/react'
import { FeaturedProjects } from '@/themes/proxio/components/FeaturedProjects'

jest.mock('@/themes/proxio/components/Blog', () => ({
  Blog: ({ posts, title }) => (
    <section>
      <h2>{title}</h2>
      {posts.map(post => (
        <h3 key={post.id}>{post.title}</h3>
      ))}
    </section>
  )
}))

describe('Proxio featured projects', () => {
  it('shows an honest empty state when no approved Notion cases are published', () => {
    render(<FeaturedProjects posts={[]} />)

    expect(screen.getByText(/暂无已发布的项目案例/)).toBeInTheDocument()
    expect(screen.queryByText(/^CASE 0/)).not.toBeInTheDocument()
    expect(
      screen.queryByText(/AI 应用与智能工作流|SaaS \+ IoT 产品体系/)
    ).not.toBeInTheDocument()
  })

  it('shows only explicitly Published Notion cases', () => {
    render(
      <FeaturedProjects
        posts={[
          {
            id: 'published',
            type: 'Post',
            status: 'Published',
            title: '已发布案例'
          },
          { id: 'draft', type: 'Post', status: 'Draft', title: '私人草稿案例' },
          { id: 'unknown', type: 'Post', title: '未确认状态案例' }
        ]}
      />
    )

    expect(screen.getByText('已发布案例')).toBeInTheDocument()
    expect(screen.queryByText('私人草稿案例')).not.toBeInTheDocument()
    expect(screen.queryByText('未确认状态案例')).not.toBeInTheDocument()
  })
})
