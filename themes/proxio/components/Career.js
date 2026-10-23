import SmartLink from '@/components/SmartLink'

/** Render the career summary only when its Notion page is explicitly Published. */
export const Career = ({ page }) => {
  if (
    page?.type !== 'Page' ||
    page?.status !== 'Published' ||
    page?.slug !== 'experience' ||
    page?.href !== '/experience'
  ) {
    return null
  }

  return (
    <section
      id='career'
      className='proxio-section-muted scroll-mt-20 py-16 sm:py-20 lg:py-24'
    >
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-3xl'>
          <span className='proxio-pill rounded-2xl border px-3 py-1'>
            职业经历
          </span>
          <h2 className='mt-5 text-3xl font-semibold tracking-tight text-dark dark:text-white sm:text-4xl'>
            {page.title}
          </h2>
          {page.summary && (
            <p className='mt-4 leading-7 text-body-color dark:text-dark-6'>
              {page.summary}
            </p>
          )}
          <SmartLink
            href={page.href}
            className='mt-6 inline-flex items-center font-semibold text-primary hover:underline'
          >
            查看完整经历
          </SmartLink>
        </div>
      </div>
    </section>
  )
}
