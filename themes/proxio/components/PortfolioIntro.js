import SmartLink from '@/components/SmartLink'

const strengths = [
  '产品战略与路线规划',
  'AI / Agent 产品实践',
  'SaaS、IoT 与智能硬件',
  '从需求到上线的完整交付',
  '跨团队协作与团队管理'
]

/** HR-first introduction based on the résumé evidence, without private details. */
export const PortfolioIntro = () => (
  <section className='relative overflow-hidden bg-slate-950 pb-16 pt-16 text-white sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24'>
    <div className='pointer-events-none absolute inset-0 opacity-40' aria-hidden='true'>
      <div className='absolute -right-24 -top-32 h-96 w-96 rounded-full bg-blue-600 blur-3xl' />
      <div className='absolute -bottom-48 left-1/4 h-96 w-96 rounded-full bg-cyan-500 blur-3xl' />
      <div className='absolute inset-0 bg-[linear-gradient(rgba(148,163,184,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.07)_1px,transparent_1px)] bg-[size:42px_42px]' />
    </div>
    <div className='container relative mx-auto px-4'>
      <div className='max-w-4xl'>
        <span className='inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-cyan-200'>
          PRODUCT LEADERSHIP · AI · DIGITAL PRODUCTS
        </span>
        <h1 className='mt-7 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl'>
          产品经理 <span className='text-cyan-300'>·</span> 产品负责人
        </h1>
        <p className='mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9'>
          聚焦 AI 应用与企业数字化产品，擅长把复杂业务问题转化为清晰的产品方案，推动产品从规划、设计到研发交付与持续迭代。
        </p>

        <div className='mt-8 flex flex-wrap gap-2' aria-label='核心能力'>
          {strengths.map(item => (
            <span key={item} className='rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-slate-200'>
              {item}
            </span>
          ))}
        </div>

        <div className='mt-10 flex flex-col gap-3 sm:flex-row'>
          <a href='#projects' className='inline-flex min-h-12 items-center justify-center rounded-lg bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200'>
            查看作品 <span className='ml-2' aria-hidden='true'>↓</span>
          </a>
          <SmartLink href='/resume' className='inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 px-6 py-3 font-semibold text-white transition hover:border-white/60 hover:bg-white/10'>
            查看简历
          </SmartLink>
          <a href='#contact' className='inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 font-semibold text-cyan-200 transition hover:bg-white/10'>
            联系我 <span className='ml-2' aria-hidden='true'>↗</span>
          </a>
        </div>
        <p className='mt-8 text-sm text-slate-400'>产品规划 · 业务建模 · 体验设计 · 研发交付 · 运营迭代</p>
      </div>
    </div>
  </section>
)
