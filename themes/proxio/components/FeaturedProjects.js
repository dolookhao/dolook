import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'

export const FeaturedProjects = ({ posts = [] }) => {
  const publishedProjects = posts
    .filter(post => post?.type === 'Post' && post?.status === 'Published')
    .slice(0, 3)

  return (
    <section
      id='projects'
      className='scroll-mt-16 bg-white py-16 sm:py-20 lg:py-24 dark:bg-dark'
    >
      <div className='container mx-auto px-4'>
        <header className='mb-9 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-xs font-semibold tracking-[.17em] text-blue-700 dark:text-cyan-300'>
              SELECTED WORK · 01—03
            </p>
            <h2 className='mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl'>
              精选项目
            </h2>
            <p className='mt-3 max-w-2xl leading-7 text-slate-500 dark:text-dark-6'>
              围绕 AI 应用、智能体、IoT
              与平台产品，呈现问题拆解、方案设计和交付思路。
            </p>
          </div>
          <SmartLink
            href='/projects'
            className='inline-flex min-h-10 items-center font-semibold text-blue-700 hover:text-blue-900 dark:text-cyan-300'
          >
            查看全部项目{' '}
            <span className='ml-2' aria-hidden='true'>
              ↗
            </span>
          </SmartLink>
        </header>
        {publishedProjects.length ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {publishedProjects.map((post, index) => {
              const caseHref = post.href || (post.slug ? `/projects/${post.slug}` : '/projects')

              return (
              <article
                key={post.id || post.href || index}
                className={`group flex min-h-full flex-col overflow-hidden rounded-[1.4rem] border border-slate-200 bg-[#f8fafc] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_55px_rgba(17,39,74,.12)] dark:border-dark-3 dark:bg-dark-2 ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <SmartLink
                  href={caseHref}
                  className='relative block overflow-hidden bg-slate-100 dark:bg-dark-3'
                >
                  {post.pageCoverThumbnail ? (
                    <LazyImage
                      src={post.pageCoverThumbnail}
                      alt={`${post.title} 项目配图`}
                      className='aspect-[1.58] w-full object-cover transition duration-500 group-hover:scale-[1.035]'
                    />
                  ) : (
                    <div className='aspect-[1.58] bg-[radial-gradient(ellipse_at_75%_15%,rgba(93,210,235,.28),transparent_34%),linear-gradient(145deg,#172a47,#0c1729)]' />
                  )}
                  <span className='absolute left-4 top-4 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur'>
                    {post.category || '产品案例'}
                  </span>
                </SmartLink>
                <div className='flex grow flex-col p-5 sm:p-6'>
                  <div className='flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-dark-6'>
                    <span>{post.publishDay || '产品案例'}</span>
                    <span>0{index + 1} / 03</span>
                  </div>
                  <h3 className='mt-3 text-xl font-semibold leading-7 tracking-tight text-slate-950 dark:text-white'>
                    <SmartLink
                      href={caseHref}
                      className='transition-colors group-hover:text-blue-700 dark:group-hover:text-cyan-300'
                    >
                      {post.title}
                    </SmartLink>
                  </h3>
                  {post.summary && (
                    <p className='mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-dark-6'>
                      {post.summary}
                    </p>
                  )}
                  <SmartLink
                    href={caseHref}
                    className='mt-auto inline-flex min-h-10 items-end pt-5 text-sm font-semibold text-blue-700 dark:text-cyan-300'
                  >
                    查看案例{' '}
                    <span
                      className='ml-2 transition-transform group-hover:translate-x-1'
                      aria-hidden='true'
                    >
                      →
                    </span>
                  </SmartLink>
                </div>
              </article>
              )
            })}
          </div>
        ) : (
          <div className='rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-dark-3'>
            <h3 className='font-semibold text-slate-900 dark:text-white'>
              暂无已发布的项目案例
            </h3>
            <p className='mt-2 text-sm text-slate-500 dark:text-dark-6'>
              Notion 中发布的项目案例会显示在这里。
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
