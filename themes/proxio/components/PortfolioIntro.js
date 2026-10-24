import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'

/** HR-first homepage introduction driven by the demo fixture when enabled. */
export const PortfolioIntro = ({ content, featuredProject }) => {
  const identity = content?.identity || {}
  const hero = content?.hero || {}
  const skills = content?.skills || [
    {
      title: '产品战略与规划',
      desc: '市场研究、用户洞察、路线图、业务模型与 MVP'
    },
    {
      title: 'AI 与智能体产品',
      desc: '工作流编排、模型能力产品化、评估与人机协作'
    },
    {
      title: '平台与商业化',
      desc: '多租户、权限、支付订阅、增长漏斗与数据分析'
    },
    {
      title: 'IoT 与软硬件协同',
      desc: '设备生命周期、EVT / DVT / PVT、App 与云端联动'
    }
  ]
  const title = content
    ? `${identity.displayName} · ${identity.headline}`
    : '产品经理 · 产品负责人'

  return (
    <>
      <section className='relative isolate overflow-hidden bg-[#091426] text-white'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'
        >
          <div className='absolute -right-32 -top-44 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[110px]' />
          <div className='absolute -bottom-64 left-[20%] h-[34rem] w-[34rem] rounded-full bg-cyan-400/10 blur-[120px]' />
          <div className='absolute inset-0 bg-[linear-gradient(rgba(148,163,184,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]' />
        </div>
        <div className='container mx-auto px-4 pb-14 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24'>
          <div className='grid items-center gap-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-16'>
            <div>
              <div className='inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-100/[0.07] px-3.5 py-2 text-[11px] font-semibold tracking-[.18em] text-cyan-100'>
                <span className='h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,.9)]' />
                {hero.eyebrow || 'PRODUCT LEADERSHIP · AI · DIGITAL PRODUCTS'}
              </div>
              <h1 className='mt-7 max-w-3xl text-[2.55rem] font-semibold leading-[1.13] tracking-[-.045em] sm:text-5xl lg:text-[3.65rem]'>
                {title}
              </h1>
              <p className='mt-5 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9'>
                {content ? (
                  <>
                    <span className='font-medium text-white'>{hero.title}</span>{' '}
                    {hero.description}
                  </>
                ) : (
                  '聚焦 AI 应用与企业数字化产品，擅长把复杂业务问题转化为清晰方案，推动产品从规划、设计到研发交付与持续迭代。'
                )}
              </p>
              <div
                className='mt-8 flex flex-wrap gap-2'
                aria-label='核心能力关键词'
              >
                {skills.map(skill => (
                  <span
                    key={skill.title}
                    className='rounded-full border border-white/10 bg-white/[.055] px-3 py-1.5 text-sm text-slate-200'
                  >
                    {skill.title}
                  </span>
                ))}
              </div>
              <div className='mt-9 flex flex-col gap-3 sm:flex-row'>
                <SmartLink
                  href={hero.primaryButton?.href || '#projects'}
                  className='inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200'
                >
                  {hero.primaryButton?.text || '查看精选项目'}{' '}
                  <span aria-hidden='true'>↗</span>
                </SmartLink>
                <SmartLink
                  href='/resume'
                  className='inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[.04] px-5 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10'
                >
                  查看简历 <span aria-hidden='true'>↗</span>
                </SmartLink>
                <SmartLink
                  href='/contact'
                  className='inline-flex min-h-12 items-center justify-center px-3 py-3 font-semibold text-cyan-100 transition hover:text-white'
                >
                  联系我{' '}
                  <span className='ml-2' aria-hidden='true'>
                    →
                  </span>
                </SmartLink>
              </div>
              <p className='mt-6 text-sm text-slate-400'>
                {content
                  ? `${identity.subtitle} · ${identity.availability}`
                  : '产品规划 · 业务建模 · 体验设计 · 研发交付 · 运营迭代'}
              </p>
            </div>

            <div className='relative mx-auto w-full max-w-[34rem] lg:ml-auto'>
              <div
                className='absolute -inset-5 rounded-[2rem] border border-cyan-100/10'
                aria-hidden='true'
              />
              <div className='relative overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#101f36]/90 p-3 shadow-[0_30px_100px_rgba(0,0,0,.32)] backdrop-blur'>
                {featuredProject?.pageCoverThumbnail ? (
                  <LazyImage
                    src={featuredProject.pageCoverThumbnail}
                    alt={`${featuredProject.title} 项目视觉`}
                    className='aspect-[16/9] w-full rounded-[1.15rem] object-cover'
                  />
                ) : (
                  <div className='aspect-[1.45] rounded-[1.15rem] bg-[radial-gradient(ellipse_at_75%_15%,rgba(93,210,235,.3),transparent_34%),linear-gradient(145deg,#172a47,#0c1729)]' />
                )}
                <div className='flex items-center justify-between gap-4 px-3 pb-2 pt-5'>
                  <div className='min-w-0'>
                    <p className='text-[10px] font-semibold tracking-[.18em] text-cyan-200/80'>
                      FEATURED CASE · DEMO
                    </p>
                    <h2 className='mt-2 truncate text-lg font-semibold text-white sm:text-xl'>
                      {featuredProject?.title || 'AI 产品 · 平台化实践'}
                    </h2>
                    <p className='mt-1 text-sm text-slate-400'>
                      {featuredProject?.summary || '从产品策略到完整交付'}
                    </p>
                  </div>
                  <SmartLink
                    href={featuredProject?.href || '/projects'}
                    aria-label='查看精选项目'
                    className='grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 text-xl text-cyan-100 transition hover:-translate-y-0.5 hover:bg-white/10'
                  >
                    ↗
                  </SmartLink>
                </div>
              </div>
              {content?.publication_warning && (
                <div className='mt-4 rounded-xl border border-amber-200/20 bg-amber-100/[.06] px-4 py-3 text-xs leading-5 text-amber-100/90'>
                  演示资料提示 ·{' '}
                  {hero.disclaimer || content.publication_warning}
                </div>
              )}
            </div>
          </div>
          {content?.stats?.length > 0 && (
            <dl className='mt-14 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3 sm:gap-5 lg:mt-16'>
              {content.stats.map(item => (
                <div
                  key={item.label}
                  className='flex items-center justify-between gap-4 rounded-xl border border-white/[.08] bg-white/[.035] px-5 py-4 sm:block sm:border-0 sm:bg-transparent sm:px-0 sm:py-2'
                >
                  <dt className='text-sm text-slate-400'>{item.label}</dt>
                  <dd className='text-3xl font-semibold tracking-tight text-white sm:mt-2 sm:text-4xl'>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section
        className='bg-[#f5f8fc] py-12 sm:py-16 dark:bg-dark'
        aria-labelledby='capabilities-title'
      >
        <div className='container mx-auto px-4'>
          <div className='mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <p className='text-xs font-semibold tracking-[.17em] text-blue-700 dark:text-cyan-300'>
                CAPABILITIES
              </p>
              <h2
                id='capabilities-title'
                className='mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl'
              >
                从判断方向，到推动落地
              </h2>
            </div>
            <p className='max-w-lg text-sm leading-6 text-slate-500 dark:text-dark-6'>
              覆盖业务探索、产品定义、跨职能交付与数据复盘，形成从机会识别到持续迭代的工作闭环。
            </p>
          </div>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {skills.map((skill, index) => (
              <article
                key={skill.title}
                className='group rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_40px_rgba(15,40,75,.08)] dark:border-dark-3 dark:bg-dark-2'
              >
                <span className='font-mono text-xs text-blue-600 dark:text-cyan-300'>
                  0{index + 1}
                </span>
                <h3 className='mt-4 text-lg font-semibold text-slate-950 dark:text-white'>
                  {skill.title}
                </h3>
                <p className='mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6'>
                  {skill.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
