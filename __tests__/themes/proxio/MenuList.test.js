import { fireEvent, render, screen } from '@testing-library/react'
import { MenuList } from '@/themes/proxio/components/MenuList'

jest.mock('next/router', () => {
  const router = { route: '/', asPath: '/', pathname: '/' }
  return { useRouter: jest.fn(() => router) }
})

jest.mock('@/themes/proxio/components/MenuItem', () => ({
  MenuItem: ({ link }) => (
    <li>
      <a href={link.href}>{link.name}</a>
    </li>
  )
}))

describe('Proxio portfolio navigation', () => {
  it('provides the six expected portfolio destinations', () => {
    render(<MenuList />)

    const expected = [
      ['首页', '/'],
      ['项目作品', '/#projects'],
      ['图文博客', '/category/图文文章'],
      ['经历摘要', '/#career'],
      ['简历', '/resume'],
      ['联系我', '/#contact']
    ]
    for (const [name, href] of expected) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  it('exposes and updates the mobile menu state accessibly', () => {
    render(<MenuList />)

    const toggler = screen.getByRole('button', { name: '打开导航菜单' })
    expect(toggler).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('navigation', { name: '主导航' })).toHaveClass(
      'hidden'
    )

    fireEvent.click(toggler)
    expect(
      screen.getByRole('button', { name: '关闭导航菜单' })
    ).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: '主导航' })).not.toHaveClass(
      'hidden'
    )
  })
})
