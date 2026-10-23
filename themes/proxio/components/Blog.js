/* eslint-disable @next/next/no-img-element */
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'

/**
 * 博文列表
 * @param {*} param0
 * @returns
 */
export const Blog = ({ posts, title, headline, moreHref, moreText }) => {
  const enable = siteConfig('PROXIO_BLOG_ENABLE', true, CONFIG)
  const autoShowCover = siteConfig('PROXIO_BLOG_AUTO_SHOW_COVER', false, CONFIG)
  if (!enable) {
    return null
  }
  if (!Array.isArray(posts) || posts.length === 0) return null

  return (
    <>
      {/* <!-- ====== Blog Section Start --> */}
      <section className='proxio-section pt-20 lg:pt-[120px]'>
        <div className='container mx-auto'>
          {/* 区块标题文字 */}
          <div
            className='-mx-4 flex flex-wrap justify-center wow fadeInUp'
            data-wow-delay='.2s'
          >
            <div className='w-full px-4 py-4'>
              <div className='mx-auto max-w-[485px] text-center space-y-4'>
                <span className='proxio-pill px-3 py-0.5 rounded-2xl mb-2 border'>
                  {title || siteConfig('PROXIO_BLOG_TITLE')}
                </span>

                <h2 className='text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
                  {headline || siteConfig('PROXIO_BLOG_TEXT_1')}
                </h2>
              </div>
            </div>
          </div>
          {/* 博客列表 此处优先展示3片文章 */}
          <div className='-mx-4 grid md:grid-cols-2 grid-cols-1'>
            {posts.map((item, index) => {
              const showCover =
                autoShowCover && Boolean(item?.pageCoverThumbnail)
              return (
                <div key={item?.href || index} className='w-full px-4'>
                  <div
                    className='wow fadeInUp group mb-10 relative overflow-hidden blog'
                    data-wow-delay='.1s'
                  >
                    <div className='proxio-card relative rounded-xl border overflow-hidden shadow-md'>
                      <SmartLink
                        href={item?.href}
                        className={`block ${showCover ? 'opacity-0 group-hover:opacity-100' : ''}`}
                      >
                        {item.pageCoverThumbnail && (
                          // 图片半透明
                          <LazyImage
                            src={item.pageCoverThumbnail}
                            alt={item.title}
                            className='h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]'
                          />
                        )}
                        {item.pageCoverThumbnail && item.summary && (
                          <p className='absolute inset-0 flex items-center justify-center bg-white/90 px-6 py-8 text-base leading-7 text-body-color transition-opacity dark:bg-dark-2/90 dark:text-dark-6'>
                            {item.summary}
                          </p>
                        )}
                        {!item.pageCoverThumbnail && item.summary && (
                          <p className='flex min-h-40 items-center px-6 py-8 text-base leading-7 text-body-color dark:text-dark-6'>
                            {item.summary}
                          </p>
                        )}
                      </SmartLink>
                    </div>
                    {/* 内容部分 */}
                    <div className='relative z-10 p-4'>
                      <span className='inline-block text-xs font-medium leading-loose text-body-color dark:text-dark-6'>
                        {item.publishDay}
                      </span>
                      <h3>
                        <SmartLink
                          href={item?.href}
                          className='mb-4 inline-block text-xl font-semibold text-dark hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl lg:text-xl xl:text-2xl'
                        >
                          {item.title}
                        </SmartLink>
                      </h3>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {moreHref && (
            <div className='flex justify-end pb-8'>
              <SmartLink className='text-base underline' href={moreHref}>
                <span>{moreText || '查看更多'}</span>
                <i className='ml-2 fas fa-arrow-right' />
              </SmartLink>
            </div>
          )}
        </div>
      </section>
      {/* <!-- ====== Blog Section End --> */}
    </>
  )
}
