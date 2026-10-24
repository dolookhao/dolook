import SmartLink from '@/components/SmartLink'

export default function DemoExperienceTimeline({ content }) {
  const roles = Array.isArray(content?.timeline) ? content.timeline : []
  if (!roles.length) return null

  return (
    <main className='bg-[#f5f8fc] pb-16 pt-10 dark:bg-dark sm:pb-24 sm:pt-14'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-5xl'>
          <SmartLink
            href='/'
            className='inline-flex min-h-10 items-center text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-cyan-300'
          >
            ← 返回首页
          </SmartLink>
          <header className='mt-8 max-w-3xl'>
            <p className='text-xs font-semibold tracking-[.18em] text-blue-700 dark:text-cyan-300'>
              CAREER TIMELINE · DEMO
            </p>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl'>
              职业经历时间线
            </h1>
            <p className='mt-4 text-base leading-7 text-slate-600 dark:text-dark-6 sm:text-lg'>
              按职业阶段展示岗位方向与业务重点，帮助招聘方快速了解经历脉络。
            </p>
          </header>

          <div className='mt-8 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100'>
            演示资料｜
            {content.publication_warning ||
              '公司、任职时间与工作经历均为虚构示例，不代表真实履历。'}
          </div>

          <ol
            aria-label='职业经历时间线'
            className='relative mt-10 space-y-5 before:absolute before:bottom-8 before:left-[7px] before:top-5 before:w-px before:bg-gradient-to-b before:from-blue-500/60 before:via-cyan-400/40 before:to-transparent sm:mt-12 sm:space-y-6'
          >
            {roles.map((role, index) => (
              <li
                key={`${role.period}-${role.title}`}
                className='relative grid gap-3 pl-8 sm:grid-cols-[180px_1fr] sm:gap-7 sm:pl-0'
              >
                <span
                  aria-hidden='true'
                  className='absolute left-0 top-5 h-4 w-4 rounded-full border-[4px] border-blue-600 bg-[#f5f8fc] ring-4 ring-blue-600/10 dark:border-cyan-300 dark:bg-dark dark:ring-cyan-300/10 sm:left-[180px] sm:top-6 sm:-translate-x-1/2'
                />
                <div className='pt-2 text-sm font-medium text-slate-500 dark:text-dark-6 sm:pt-6 sm:text-right'>
                  {role.period}
                </div>
                <article className='rounded-[1.5rem] border border-white bg-white p-1.5 ring-1 ring-slate-200/70 dark:border-dark-2 dark:bg-dark-2 dark:ring-dark-3'>
                  <div className='rounded-[1.1rem] bg-gradient-to-br from-white to-slate-50 p-5 dark:from-dark-2 dark:to-dark sm:p-6'>
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                      <div>
                        <p className='text-[10px] font-semibold tracking-[.16em] text-blue-700 dark:text-cyan-300'>
                          STAGE 0{index + 1}
                        </p>
                        <h2 className='mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl'>
                          {role.title}
                        </h2>
                        <p className='mt-1 text-sm text-slate-500 dark:text-dark-6'>
                          {role.company}
                        </p>
                      </div>
                      <span className='rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200'>
                        演示经历
                      </span>
                    </div>
                    <div className='mt-5 border-t border-slate-200/80 pt-4 dark:border-dark-3'>
                      <p className='text-xs font-semibold tracking-wide text-slate-500 dark:text-dark-6'>
                        业务重点
                      </p>
                      <p className='mt-2 text-sm leading-6 text-slate-700 dark:text-dark-6 sm:text-base'>
                        {role.focus}
                      </p>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>

          <div className='mt-10 flex flex-col gap-3 rounded-2xl bg-[#0b1830] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8'>
            <div>
              <p className='text-xs font-semibold tracking-[.16em] text-cyan-200'>
                NEXT · PROJECTS
              </p>
              <h2 className='mt-2 text-xl font-semibold'>继续查看项目实践</h2>
              <p className='mt-2 text-sm leading-6 text-slate-300'>
                所有案例同样带有演示标识，展示产品方案与内容结构。
              </p>
            </div>
            <SmartLink
              href='/projects'
              className='inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-full bg-cyan-300 px-5 py-2.5 font-semibold text-slate-950 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-cyan-200'
            >
              查看项目案例 <span aria-hidden='true'>↗</span>
            </SmartLink>
          </div>
        </div>
      </div>
    </main>
  )
}
