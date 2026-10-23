import { Logo } from './Logo'
import { MenuList } from './MenuList'

export const Header = () => (
  <header className='relative z-40 w-full border-b border-slate-100 bg-white dark:border-dark-3 dark:bg-dark'>
    <div className='container mx-auto'>
      <div className='relative flex items-center justify-between'>
        <Logo />
        <div className='flex items-center justify-end pr-16 lg:pr-0'>
          <MenuList />
        </div>
      </div>
    </div>
  </header>
)
