import { render, screen } from '@testing-library/react'
import { Career } from '@/themes/proxio/components/Career'

jest.mock('@/components/SmartLink', () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>
}))

jest.mock('@/lib/config', () => ({
  siteConfig: key => ({ PROXIO_CAREER_TITLE: '职业经历' })[key] || ''
}))

describe('Proxio career section', () => {
  it('renders only a published Notion experience page', () => {
    const page = {
      type: 'Page',
      status: 'Published',
      slug: 'experience',
      href: '/experience',
      title: '经审核的职业经历',
      summary: '来自用户自己的 Notion 页面'
    }

    render(<Career page={page} />)

    expect(screen.getByText('经审核的职业经历')).toBeInTheDocument()
    expect(screen.getByText('来自用户自己的 Notion 页面')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '查看完整经历' })).toHaveAttribute(
      'href',
      '/experience'
    )
    expect(
      screen.queryByText(/Spotify|Freelance Architect/)
    ).not.toBeInTheDocument()
  })

  it('hides the section until a real published page exists', () => {
    const { container } = render(<Career page={null} />)
    expect(container).toBeEmptyDOMElement()
    const draft = {
      type: 'Page',
      status: 'Invisible',
      slug: 'experience',
      href: '/experience'
    }
    render(<Career page={draft} />)
    expect(screen.queryByText('职业经历')).not.toBeInTheDocument()
  })
})
