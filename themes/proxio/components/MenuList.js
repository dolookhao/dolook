import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { MenuItem } from './MenuItem'

/**
 * 响应式 折叠菜单
 */
export const MenuList = () => {
  const [showMenu, setShowMenu] = useState(false) // 控制菜单展开/收起状态
  const [openSubMenuIdx, setOpenSubMenuIdx] = useState(null) // 控制哪个子菜单处于展开状态
  const router = useRouter()
  const menuRef = useRef(null) // 监听点击外部区域

  const portfolioLinks = [
    { name: '首页', href: '/' },
    { name: '项目作品', href: '/#projects' },
    { name: '图文博客', href: '/category/图文文章' },
    { name: '经历摘要', href: '/#career' },
    { name: '简历', href: '/resume' },
    { name: '联系我', href: '/#contact' }
  ]

  const links = portfolioLinks

  const toggleMenu = () => {
    setShowMenu(!showMenu) // 切换菜单状态
  }

  useEffect(() => {
    setShowMenu(false)
    setOpenSubMenuIdx(null)
  }, [router])

  // 监听点击外部区域，收起子菜单
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenSubMenuIdx(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!links || links.length === 0) {
    return null
  }

  return (
    <div ref={menuRef}>
      {/* 移动端菜单切换按钮 */}
      <button
        id='navbarToggler'
        type='button'
        aria-label={showMenu ? '关闭导航菜单' : '打开导航菜单'}
        aria-expanded={showMenu}
        aria-controls='navbarCollapse'
        onClick={toggleMenu}
        className={`absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden ${
          showMenu ? 'navbarTogglerActive' : ''
        }`}
      >
        <span className='relative my-[6px] block h-[2px] w-[30px] bg-gray-900 duration-200 transition-all dark:bg-white'></span>
        <span className='relative my-[6px] block h-[2px] w-[30px] bg-gray-900 duration-200 transition-all dark:bg-white'></span>
        <span className='relative my-[6px] block h-[2px] w-[30px] bg-gray-900 duration-200 transition-all dark:bg-white'></span>
      </button>

      <nav
        id='navbarCollapse'
        aria-label='主导航'
        className={`proxio-navbar-panel absolute right-4 top-full w-full max-w-[250px] rounded-lg py-5 lg:static lg:block lg:w-full lg:max-w-full lg:px-4 lg:py-0 xl:px-6 ${
          showMenu ? '' : 'hidden'
        }`}
      >
        <ul className='blcok lg:flex 2xl:ml-20'>
          {links?.map((link, index) => (
            <MenuItem
              key={index}
              link={link}
              isOpen={openSubMenuIdx === index}
              toggleOpen={() =>
                setOpenSubMenuIdx(openSubMenuIdx === index ? null : index)
              }
            />
          ))}
        </ul>
      </nav>
    </div>
  )
}
