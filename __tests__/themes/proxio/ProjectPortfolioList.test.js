/* eslint-disable @next/next/no-img-element */

import { fireEvent, render, screen } from '@testing-library/react'
import { ProjectPortfolioList } from '@/themes/proxio/components/ProjectPortfolioList'
import { ProjectCaseHeader } from '@/themes/proxio/components/ProjectCaseHeader'

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
  default: ({ alt = '', ...props }) => <img alt={alt} {...props} />
}))

const project = {
  id: 'case-1',
  type: 'Post',
  status: 'Published',
  category: '项目案例',
  title: 'AI 应用案例',
  href: '/article/ai-app',
  summary: 'AI 应用产品方案',
  tags: ['AI', '海外内容', '演示'],
  demoFixture: true,
  pageCoverThumbnail: '/demo-preview-assets/project-01.svg'
}

describe('ProjectPortfolioList', () => {
  it('shows published cases with their demo cover and meaningful filters', () => {
    render(
      <ProjectPortfolioList
        posts={[
          project,
          { ...project, id: 'draft', status: 'Draft', title: '私有草稿' }
        ]}
      />
    )

    expect(
      screen.getByRole('heading', { name: 'AI 应用案例' })
    ).toBeInTheDocument()
    expect(screen.queryByText('私有草稿')).not.toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'AI 应用案例 项目截图' })
    ).toHaveAttribute('src', '/demo-preview-assets/project-01.svg')
    expect(screen.getAllByText(/演示项目/).length).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: '演示' })
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '海外内容' }))
    expect(
      screen.getByRole('heading', { name: 'AI 应用案例' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /查看案例/ })).toHaveAttribute(
      'href',
      '/article/ai-app'
    )
  })

  it('shows a factual empty state when there are no published cases', () => {
    render(<ProjectPortfolioList posts={[]} />)

    expect(screen.getByText('暂无已发布的项目案例')).toBeInTheDocument()
    expect(screen.queryByText(/NotionNext/)).not.toBeInTheDocument()
  })

  it('provides a return-to-list link on project detail pages', () => {
    render(<ProjectCaseHeader post={project} />)

    expect(
      screen.getByRole('heading', { name: 'AI 应用案例' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /返回项目作品/ })).toHaveAttribute(
      'href',
      '/projects'
    )
    expect(screen.getByText('演示案例')).toBeInTheDocument()
  })
})
