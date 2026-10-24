import SmartLink from '@/components/SmartLink'

/** Compact career preview from published Notion data or the demo fixture. */
export const Career = ({ page, demoContent }) => {
  const isPublishedPage =
    page?.type === 'Page' &&
    page?.status === 'Published' &&
    page?.slug === 'experience' &&
    page?.href === '/experience'
  if (!isPublishedPage && !demoContent?.timeline?.length) return null

  return (
    <section
      id='career'
      className='proxio-section-muted scroll-mt-20 py-16 sm:py-20 lg:py-24'
    >
      <div className='container mx-auto px-4'>
        <div className='grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16'>
          <div>
            <p className='text-xs font-semibold tracking-[.17em] text-blue-700 dark:text-cyan-300'>
              EXPERIENCE
            </p>
            <h2 className='mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl'>
              职业经历摘要
            </h2>
            <p className='mt-4 max-w-md leading-7 text-slate-600 dark:text-dark-6'>
              {isPublishedPage
                ? page.summary
                : '从内容产品到企业平台、IoT 与 AI 产品，在不同业务阶段持续推进产品定义、团队协作与交付落地。'}
            </p>
            <SmartLink
              href={isPublishedPage ? page.href : '/experience'}
              className='mt-6 inline-flex min-h-10 items-center font-semibold text-blue-700 hover:text-blue-900 dark:text-cyan-300'
            >
              查看完整经历{' '}
              <span className='ml-2' aria-hidden='true'>
                ↗
              </span>
            </SmartLink>
          </div>
          {demoContent?.timeline?.length ? (
            <ol className='relative space-y-0 border-l border-slate-200 pl-6 dark:border-dark-3'>
              {demoContent.timeline.slice(0, 3).map((item, index) => (
                <li
                  key={`${item.period}-${item.title}`}
                  className='relative pb-7 last:pb-0'
                >
                  <span
                    aria-hidden='true'
                    className='absolute -left-[1.94rem] top-1.5 h-3 w-3 rounded-full border-[3px] border-blue-600 bg-white shadow-[0_0_0_4px_rgba(67,97,238,.1)] dark:border-cyan-300 dark:bg-dark'
                  />
                  <div className='flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between'>
                    <h3 className='font-semibold text-slate-950 dark:text-white'>
                      {item.title}
                    </h3>
                    <span className='font-mono text-xs text-slate-500 dark:text-dark-6'>
                      {item.period}
                    </span>
                  </div>
                  <p className='mt-1 text-sm text-slate-600 dark:text-dark-6'>
                    {item.company}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6'>
                    {item.focus}
                  </p>
                </li>
              ))}
              <li className='mt-5 rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-xs leading-5 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200'>
                以上职业信息属于演示资料，任职公司与时间均为虚构示例。
              </li>
            </ol>
          ) : (
            <div className='rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-3 dark:bg-dark-2'>
              <h3 className='text-xl font-semibold text-slate-950 dark:text-white'>
                {page.title}
              </h3>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
