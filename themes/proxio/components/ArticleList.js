import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'
import BlogAdSlot from '@/components/BlogAdSlot'
import { getNotionCategoryNames, getNotionTagName } from '../utils/blogPosts'

const routeFor = (base, value) => `${base}/${encodeURIComponent(value)}`
const getDateTime = post => {
  if (post.publishDate) {
    const date = new Date(post.publishDate)
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10)
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(post.publishDay || '')
    ? post.publishDay
    : undefined
}

const ArticleList = ({
  posts = [],
  category,
  tag,
  title,
  moreHref,
  moreText,
  compact = false,
  baseHref,
  currentPage = 1,
  pageSize = 12,
  postCount = 0,
  allowAds = false
}) => {
  const rows = Array.isArray(posts) ? posts : []
  const heading = title || category || (tag ? `标签：${tag}` : '图文博客')
  const hasPosts = rows.length > 0
  const Heading = compact ? 'h2' : 'h1'
  const page = Math.max(1, Number(currentPage) || 1)
  const pageCount = Math.ceil(postCount / pageSize)
  const pageHref = number =>
    number <= 1 ? baseHref : `${baseHref}/page/${number}`

  return (
    <section className='proxio-section bg-white py-14 dark:bg-dark sm:py-16 lg:py-20'>
      <div className='container mx-auto px-4'>
        <header className='mx-auto mb-9 max-w-3xl text-center sm:mb-12'>
          <span className='proxio-pill rounded-full border px-3 py-1'>
            专业文章与产品实践
          </span>
          <Heading className='mt-5 text-3xl font-semibold tracking-tight text-dark dark:text-white sm:text-4xl'>
            {heading}
          </Heading>
          {!compact && (
            <p className='mt-4 leading-7 text-body-color dark:text-dark-6'>
              记录产品方法、业务观察与实践复盘。文章内容来自 Notion
              中已发布的图文文章。
            </p>
          )}
        </header>

        {!compact && (
          <nav
            aria-label='文章分类与标签'
            className='mb-8 flex flex-wrap justify-center gap-2'
          >
            <SmartLink
              href='/category/图文文章'
              aria-current={
                category === '图文文章' || !category ? 'page' : undefined
              }
              className='rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6'
            >
              图文文章
            </SmartLink>
            {[
              ...new Set(
                rows.flatMap(post => getNotionCategoryNames(post.category))
              )
            ]
              .filter(name => name !== '项目案例' && name !== '图文文章')
              .map(name => (
                <SmartLink
                  key={name}
                  href={routeFor('/category', name)}
                  className='rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6'
                >
                  {name}
                </SmartLink>
              ))}
            {[
              ...new Set(
                rows
                  .flatMap(post =>
                    (Array.isArray(post.tags) ? post.tags : []).map(
                      getNotionTagName
                    )
                  )
                  .filter(Boolean)
              )
            ]
              .sort((a, b) => a.localeCompare(b, 'zh-CN'))
              .map(name => (
                <SmartLink
                  key={name}
                  href={routeFor('/tag', name)}
                  className='rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600 hover:text-primary dark:bg-dark-2 dark:text-dark-6'
                >
                  #{name}
                </SmartLink>
              ))}
          </nav>
        )}

        {hasPosts ? (
          <>
            <div
              className={`grid gap-5 sm:gap-6 ${compact ? 'md:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-3'}`}
            >
              {rows.map((post, index) => (
                <article
                  key={post.id || post.href || `${post.slug}-${index}`}
                  className='group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-dark-3 dark:bg-dark-2'
                >
                  <SmartLink
                    href={post.href}
                    className='block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                    aria-label={`阅读文章：${post.title}`}
                  >
                    {post.pageCoverThumbnail ? (
                      <LazyImage
                        src={post.pageCoverThumbnail}
                        alt={post.title || ''}
                        className='h-48 w-full object-cover sm:h-56'
                      />
                    ) : (
                      <div
                        aria-hidden='true'
                        className='flex h-40 items-end bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100 p-5 dark:from-dark-3 dark:via-dark-2 dark:to-slate-800'
                      >
                        <span className='text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400'>
                          PRODUCT NOTES
                        </span>
                      </div>
                    )}
                  </SmartLink>
                  <div className='p-5 sm:p-6'>
                    <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400'>
                      {post.publishDay && (
                        <time dateTime={getDateTime(post)}>
                          {post.publishDay}
                        </time>
                      )}
                      {getNotionCategoryNames(post.category)
                        .filter(name => name !== '项目案例')
                        .map(name => (
                          <SmartLink
                            key={name}
                            href={routeFor('/category', name)}
                            className='font-medium text-primary hover:underline'
                          >
                            {name}
                          </SmartLink>
                        ))}
                    </div>
                    <h2 className='mt-3 text-xl font-semibold leading-7 text-dark dark:text-white'>
                      <SmartLink
                        href={post.href}
                        className='hover:text-primary'
                      >
                        {post.title}
                      </SmartLink>
                    </h2>
                    {post.summary && (
                      <p className='mt-3 line-clamp-3 text-sm leading-6 text-body-color dark:text-dark-6'>
                        {post.summary}
                      </p>
                    )}
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className='mt-5 flex flex-wrap gap-2'>
                        {post.tags
                          .map(getNotionTagName)
                          .filter(Boolean)
                          .map(name => (
                            <SmartLink
                              key={name}
                              href={routeFor('/tag', name)}
                              className='rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:text-primary dark:bg-dark-3 dark:text-dark-6'
                            >
                              #{name}
                            </SmartLink>
                          ))}
                      </div>
                    )}
                    <SmartLink
                      href={post.href}
                      className='mt-5 inline-flex min-h-10 items-center font-semibold text-primary hover:underline'
                    >
                      阅读全文{' '}
                      <span className='ml-2' aria-hidden='true'>
                        →
                      </span>
                    </SmartLink>
                  </div>
                </article>
              ))}
            </div>
            {allowAds && <BlogAdSlot placement='archive' />}
          </>
        ) : (
          <div className='mx-auto max-w-2xl rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-dark-3'>
            <h2 className='text-lg font-semibold text-dark dark:text-white'>
              暂无已发布文章
            </h2>
            <p className='mt-2 text-sm leading-6 text-body-color dark:text-dark-6'>
              此处只展示 Notion 中状态为 Published 的图文文章。
            </p>
          </div>
        )}
        {moreHref && hasPosts && (
          <div className='mt-8 flex justify-end'>
            <SmartLink
              href={moreHref}
              className='inline-flex min-h-10 items-center font-semibold text-primary hover:underline'
            >
              {moreText || '查看更多文章'}{' '}
              <span className='ml-2' aria-hidden='true'>
                →
              </span>
            </SmartLink>
          </div>
        )}
        {baseHref && pageCount > 1 && (
          <nav
            aria-label='文章分页'
            className='mt-10 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-dark-3'
          >
            {page > 1 ? (
              <SmartLink
                href={pageHref(page - 1)}
                className='min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-dark hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white'
              >
                ← 上一页
              </SmartLink>
            ) : (
              <span />
            )}
            <span className='text-sm text-body-color dark:text-dark-6'>
              {page} / {pageCount}
            </span>
            {page < pageCount ? (
              <SmartLink
                href={pageHref(page + 1)}
                className='min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-dark hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white'
              >
                下一页 →
              </SmartLink>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </section>
  )
}

export default ArticleList
