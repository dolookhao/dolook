import { siteConfig } from '@/lib/config'
import { resolveContactEmail } from '@/lib/plugins/mailEncrypt'
import SmartLink from '@/components/SmartLink'

export const ContactSection = ({ demoContent }) => {
  if (demoContent) {
    return (
      <section id='contact' className='scroll-mt-16 bg-slate-950 py-16 text-white sm:py-20 lg:py-24'>
        <div className='container mx-auto px-4'><div className='mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center sm:p-10'>
          <span className='text-xs font-semibold tracking-[0.18em] text-cyan-300'>CONTACT · DEMO</span>
          <h2 className='mt-4 text-3xl font-semibold sm:text-4xl'>{demoContent.contact.title}</h2>
          <p className='mx-auto mt-4 max-w-xl leading-7 text-slate-300'>{demoContent.contact.description}</p>
          <p className='mt-6 text-sm text-amber-200'>演示联系信息均为待替换占位内容，不提供真实联系渠道。</p>
          <SmartLink href='/contact' className='mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-200'>查看联系页面</SmartLink>
        </div></div>
      </section>
    )
  }
  const email = resolveContactEmail(siteConfig('CONTACT_EMAIL'))
  const linkedIn = siteConfig('CONTACT_LINKEDIN')
  const github = siteConfig('CONTACT_GITHUB')
  const channels = [
    email && { label: '发送邮件', href: `mailto:${email}` },
    linkedIn && { label: 'LinkedIn', href: linkedIn },
    github && { label: 'GitHub', href: github }
  ].filter(Boolean)

  return (
    <section id='contact' className='scroll-mt-16 bg-slate-950 py-16 text-white sm:py-20 lg:py-24'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center sm:p-10'>
          <span className='text-xs font-semibold tracking-[0.18em] text-cyan-300'>CONTACT</span>
          <h2 className='mt-4 text-3xl font-semibold sm:text-4xl'>联系我</h2>
          <p className='mx-auto mt-4 max-w-xl leading-7 text-slate-300'>
            欢迎就产品岗位、产品实践与合作机会交流。
          </p>
          {channels.length > 0 ? (
            <div className='mt-7 flex flex-wrap justify-center gap-3'>
              {channels.map(channel => (
                <a key={channel.label} href={channel.href} target={channel.href.startsWith('mailto:') ? undefined : '_blank'} rel={channel.href.startsWith('mailto:') ? undefined : 'noreferrer'} className='inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-200'>
                  {channel.label} <span className='ml-2' aria-hidden='true'>↗</span>
                </a>
              ))}
            </div>
          ) : (
            <p className='mt-7 text-sm text-slate-400'>公开联系渠道尚未配置。</p>
          )}
        </div>
      </div>
    </section>
  )
}
