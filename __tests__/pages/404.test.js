import { render, screen } from '@testing-library/react'
import NoFound from '@/pages/404'

jest.mock('@/lib/config', () => ({ siteConfig: () => 'proxio' }))
jest.mock('@/lib/db/SiteDataApi', () => ({ fetchGlobalAllData: jest.fn() }))
jest.mock('@/themes/theme', () => ({
  DynamicLayout: () => <div data-testid='dynamic-theme-layout' />
}))

describe('static demo 404 page', () => {
  it('renders a useful not-found message and navigation in the demo export', () => {
    render(<NoFound demoPreview />)

    expect(screen.getByRole('heading', { name: '找不到页面' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '回到首页' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: '浏览项目作品' })).toHaveAttribute('href', '/projects')
    expect(screen.queryByTestId('dynamic-theme-layout')).not.toBeInTheDocument()
  })

  it('keeps the configured theme 404 layout for normal site builds', () => {
    render(<NoFound />)
    expect(screen.getByTestId('dynamic-theme-layout')).toBeInTheDocument()
  })
})
