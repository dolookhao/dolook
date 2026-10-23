import SmartLink from '@/components/SmartLink'

/** Compact home page preview for an explicitly published Notion Page. */
export const PageSummary = ({ page, label, action }) => {
  if (
    page?.type !== 'Page' ||
    page?.status !== 'Published' ||
    page?.slug !== 'about' ||
    page?.href !== '/about'
  ) {
    return null
  }

  return (
    <section id='about' className='proxio-section py-12 lg:py-16'>
      <div className='container mx-auto px-4'>
        <div className='proxio-card rounded-2xl border p-6 sm:p-8 lg:p-10'>
          <span className='proxio-pill rounded-2xl border px-3 py-0.5'>
            {label || '关于我'}
          </span>
          <h2 className='mt-6 text-2xl font-semibold text-dark dark:text-white sm:text-3xl'>
            {page.title}
          </h2>
          {page.summary && (
            <p className='mt-4 max-w-3xl leading-8 text-body-color dark:text-dark-6'>
              {page.summary}
            </p>
          )}
          <SmartLink href={page.href} className='mt-6 inline-block text-primary underline'>
            {action || '了解更多'}
          </SmartLink>
        </div>
      </div>
    </section>
  )
}
