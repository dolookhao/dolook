import SmartLink from '@/components/SmartLink'

export const Footer = () => (
  <footer id='footer-bottom' className='border-t border-slate-200 bg-white py-6 dark:border-dark-3 dark:bg-dark'>
    <div className='container mx-auto flex flex-col gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-dark-6'>
      <p>产品经理个人作品集 · © {new Date().getFullYear()}</p>
      <nav aria-label='页脚导航' className='flex flex-wrap gap-x-5 gap-y-2'>
        <SmartLink href='/#projects' className='hover:text-primary'>项目作品</SmartLink>
        <SmartLink href='/resume' className='hover:text-primary'>简历</SmartLink>
        <SmartLink href='/#contact' className='hover:text-primary'>联系我</SmartLink>
      </nav>
    </div>
  </footer>
)
