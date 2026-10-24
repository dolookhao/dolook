import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { DynamicLayout } from '@/themes/theme'
import Link from 'next/link'

/**
 * 404
 * @param {*} props
 * @returns
 */
const NoFound = props => {
  if (props.demoPreview) {
    return (
      <main className='container mx-auto flex grow items-center px-4 py-16 sm:py-24'>
        <section className='mx-auto grid w-full max-w-5xl items-center gap-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-12 md:grid-cols-[.8fr_1.2fr] dark:border-dark-3 dark:bg-dark-2'>
          <div className='text-center' aria-hidden='true'>
            <div className='mx-auto grid aspect-square max-h-64 w-full max-w-64 place-items-center rounded-[2rem] bg-[radial-gradient(circle_at_35%_30%,rgba(103,232,249,.3),transparent_38%),linear-gradient(145deg,#0f1d33,#172d4c)] shadow-inner'>
              <span className='font-mono text-7xl font-bold tracking-[-.08em] text-white sm:text-8xl'>404</span>
            </div>
            <p className='mt-3 font-mono text-sm font-semibold tracking-[.24em] text-cyan-700 dark:text-cyan-300'>DEMO SITE · 404</p>
          </div>
          <div>
            <p className='text-xs font-semibold tracking-[.18em] text-blue-700 dark:text-cyan-300'>页面导航</p>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl'>找不到页面</h1>
            <p className='mt-4 max-w-xl leading-7 text-slate-600 dark:text-dark-6'>这个演示站点中没有对应地址，页面可能已移动或链接不完整。你可以返回首页，或继续浏览项目案例。</p>
            <div className='mt-7 flex flex-wrap gap-3'>
              <Link href='/' className='inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 dark:bg-cyan-300 dark:text-slate-950'>回到首页</Link>
              <Link href='/projects' className='inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-blue-500 hover:text-blue-700 dark:border-dark-3 dark:text-white'>浏览项目作品</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='Layout404' {...props} />
}

export async function getStaticProps(req) {
  const { locale } = req

  const props = (await fetchGlobalAllData({ from: '404', locale })) || {}
  delete props.allPages
  return { props }
}

export default NoFound
