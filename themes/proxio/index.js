/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

'use client'
import Loading from '@/components/Loading'
import NotionPage from '@/components/NotionPage'
import { siteConfig } from '@/lib/config'
import { isBrowser } from '@/lib/utils'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Career } from './components/Career'
import { PortfolioIntro } from './components/PortfolioIntro'
import { BackToTopButton } from './components/BackToTopButton'
import { Blog } from './components/Blog'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Pricing } from './components/Pricing'
import CONFIG from './config'
import { Style } from './style'
// import { MadeWithButton } from './components/MadeWithButton'
import Comment from '@/components/Comment'
import Catalog from './components/Catalog'
import MobileCatalog from './components/MobileCatalog'
import replaceSearchResult from '@/components/Mark'
import ShareBar from '@/components/ShareBar'
import DashboardBody from '@/components/ui/dashboard/DashboardBody'
import DashboardHeader from '@/components/ui/dashboard/DashboardHeader'
import { useGlobal } from '@/lib/global'
import { loadWowJS } from '@/lib/plugins/wow'
import { SignIn, SignUp } from '@clerk/nextjs'
import SmartLink from '@/components/SmartLink'
import { ArticleLock } from './components/ArticleLock'
import { Banner } from './components/Banner'
import SearchInput from './components/SearchInput'
import { SignInForm } from './components/SignInForm'
import { SignUpForm } from './components/SignUpForm'
import { SVG404 } from './components/svg/SVG404'
import Lenis from '@/components/Lenis'
import CursorDot from '@/components/CursorDot'
import { FeaturedProjects } from './components/FeaturedProjects'
import { ContactSection } from './components/ContactSection'
import { ProjectPortfolioList } from './components/ProjectPortfolioList'
import { ProjectCaseHeader } from './components/ProjectCaseHeader'
import { isProjectCasePost } from './utils/projectCases'
import ArticleList from './components/ArticleList'
import {
  getNotionCategoryNames,
  getPublishedBlogPosts,
  getPublishedPosts
} from './utils/blogPosts'
import BlogAdSlot from '@/components/BlogAdSlot'
import DemoMarkdown from './components/DemoMarkdown'
import DemoExperienceTimeline from './components/DemoExperienceTimeline'

/**
 * 布局框架
 * Landing-2 主题用作产品落地页展示
 * 结合Stripe或者lemonsqueezy插件可以成为saas支付订阅
 * https://play-tailwind.tailgrids.com/
 * @param {*} props
 * @returns
 */
const LayoutBase = props => {
  const { children } = props

  // 加载wow动画
  useEffect(() => {
    loadWowJS()
  }, [])

  return (
    <div
      id='theme-proxio'
      className={`${siteConfig('FONT_STYLE')} min-h-screen flex flex-col dark:bg-dark scroll-smooth`}
    >
      <Style />
      {/* 页头 */}
      <Header {...props} />

      <div id='main-wrapper' className='grow'>
        {children}
      </div>

      {/* 页脚 */}
      <Footer {...props} />

      {/* 悬浮按钮 */}
      <BackToTopButton />

      {/* 鼠标阻尼动画 */}
      <Lenis />
      {/* 鼠标跟随动画 */}
      <CursorDot />
      {/* <MadeWithButton/> */}
    </div>
  )
}

/**
 * 首页布局
 * @param {*} props
 * @returns
 */
const LayoutIndex = props => {
  const count = siteConfig('PROXIO_BLOG_COUNT', 4, CONFIG)
  const allPublishedPosts = getPublishedPosts(props?.allNavPages)
  const projects = allPublishedPosts
    .filter(post => getNotionCategoryNames(post?.category).includes('项目案例'))
    .slice(0, count)
  const articles = getPublishedBlogPosts(allPublishedPosts)
    .sort((left, right) => {
      const leftDate =
        Date.parse(left?.publishDate || left?.publishDay || '') || 0
      const rightDate =
        Date.parse(right?.publishDate || right?.publishDay || '') || 0
      return rightDate - leftDate
    })
    .slice(0, 3)
  return (
    <>
      <PortfolioIntro
        content={props?.demoContent}
        featuredProject={projects[0]}
      />
      <FeaturedProjects posts={projects} />
      <Career
        page={(props?.portfolioPages || []).find(
          page => page?.slug === 'experience'
        )}
        demoContent={props?.demoContent}
      />
      {siteConfig('PROXIO_BLOG_ENABLE', true, CONFIG) && (
        <ArticleList
          posts={articles}
          title='图文博客'
          moreHref={props?.demoPreview ? '/blog' : '/category/图文文章'}
          moreText='浏览全部文章'
          compact
          demoPreview={props?.demoPreview}
        />
      )}
      <ContactSection demoContent={props?.demoContent} />
    </>
  )
}

/** Static résumé page with only verified, non-sensitive information. */
const LayoutResume = () => (
  <main className='container mx-auto grow px-4 py-12 sm:py-16'>
    <div className='mx-auto max-w-4xl'>
      <SmartLink
        href='/'
        className='text-sm font-medium text-primary hover:underline'
      >
        ← 返回首页
      </SmartLink>
      <header className='mt-7 border-b border-slate-200 pb-8 dark:border-dark-3'>
        <p className='text-sm font-semibold tracking-[0.16em] text-primary'>
          PRODUCT MANAGER · PRODUCT LEAD
        </p>
        <h1 className='mt-3 text-4xl font-semibold tracking-tight text-dark dark:text-white'>
          产品经理 / 产品负责人
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-body-color dark:text-dark-6'>
          聚焦 AI 应用、企业数字化、SaaS、IoT
          与智能硬件产品。具备从产品规划、需求与交互设计，到研发协作、测试验收、发布和运营迭代的完整交付经验。
        </p>
      </header>

      <section className='border-b border-slate-200 py-8 dark:border-dark-3'>
        <h2 className='text-xl font-semibold text-dark dark:text-white'>
          核心能力
        </h2>
        <ul className='mt-5 grid gap-3 sm:grid-cols-2'>
          {[
            '产品战略、路线规划、PRD、原型与交互设计',
            'AI 应用、AI Agent、LLM 配置与应用工作流',
            'SaaS、多租户、CRM、ERP、B2B 与供应链产品',
            'IoT、智能硬件与软硬件协同交付',
            '支付、金融科技与区块链产品经验',
            '跨团队协作、团队管理与项目交付'
          ].map(item => (
            <li
              key={item}
              className='rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:bg-dark-2 dark:text-dark-6'
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className='border-b border-slate-200 py-8 dark:border-dark-3'>
        <h2 className='text-xl font-semibold text-dark dark:text-white'>
          职业经历摘要
        </h2>
        <p className='mt-4 leading-7 text-body-color dark:text-dark-6'>
          简历记录的职业经历包含产品经理、产品总监及产品副总监岗位，涉及互联网内容与社区、支付与金融科技、教育产品、智能硬件、企业数字化及
          AI
          应用。出于公开范围审慎考虑，此页暂不展示公司名称、精确任职时间和未审核的业绩指标。
        </p>
      </section>

      <section className='py-8'>
        <h2 className='text-xl font-semibold text-dark dark:text-white'>
          项目方向
        </h2>
        <p className='mt-4 leading-7 text-body-color dark:text-dark-6'>
          海外 AI 应用与内容生成、SaaS + IoT 服务体系、B2B / ERP / CRM
          企业产品，以及智能学习软硬件和内容生态。具体项目案例正在按可公开范围整理。
        </p>
      </section>

      <div className='mt-3 flex flex-wrap gap-3'>
        <SmartLink
          href='/#projects'
          className='inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:opacity-90'
        >
          查看项目作品
        </SmartLink>
        <SmartLink
          href='/#contact'
          className='inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-dark hover:bg-slate-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2'
        >
          联系我
        </SmartLink>
      </div>
    </div>
  </main>
)

/**
 * 文章详情页布局
 * @param {*} props
 * @returns
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  if (props?.demoPreview && post?.slug === 'experience') {
    return <DemoExperienceTimeline content={props.demoContent} />
  }
  const demoProject = Boolean(post?.demoFixture && isProjectCasePost(post))
  const demoArticle = Boolean(post?.demoFixture && post?.type === 'Post')
  const isProjectCase = !lock && isProjectCasePost(post)
  const isBlogArticle =
    !lock &&
    post?.type === 'Post' &&
    post?.status === 'Published' &&
    getNotionCategoryNames(post?.category).includes('图文文章')

  // 如果 是 /article/[slug] 的文章路径则視情況进行重定向到另一个域名
  if (
    !post &&
    siteConfig('PROXIO_POST_REDIRECT_ENABLE') &&
    isBrowser &&
    router.route === '/[prefix]/[slug]'
  ) {
    const redirectUrl =
      siteConfig('PROXIO_POST_REDIRECT_URL') +
      router.asPath.replace('?theme=landing', '')
    router.push(redirectUrl)
    return (
      <div id='theme-proxio'>
        <Loading />
      </div>
    )
  }

  // 锁定态不显示目录；博客文章单独使用博客目录开关，其他文章沿用主题开关。
  const showCatalog =
    !lock &&
    (isBlogArticle
      ? siteConfig('PROXIO_BLOG_TOC_ENABLE', true, CONFIG)
      : siteConfig('PROXIO_POST_CATALOG_ENABLE', false, CONFIG)) &&
    (post?.toc?.length ?? 0) > 0

  return (
    <>
      {isProjectCase ? (
        <ProjectCaseHeader post={post} />
      ) : (
        <Banner
          title={post?.title}
          description={post?.summary}
          cover={isBlogArticle ? post?.pageCoverThumbnail : undefined}
        />
      )}
      <div className='container grow'>
        <div className='flex flex-wrap justify-center -mx-4'>
          <div
            id='container-inner'
            className={
              'w-full p-4' + (showCatalog ? ' xl:w-[calc(100%-16rem)]' : '')
            }
          >
            {lock && <ArticleLock validPassword={validPassword} />}

            {!lock && post && (
              <div id='article-wrapper' className='mx-auto'>
                {isBlogArticle && (
                  <nav
                    aria-label='文章导航'
                    className='mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 text-sm dark:border-dark-3'
                  >
                    <SmartLink
                      href={demoArticle ? '/blog' : '/category/图文文章'}
                      className='font-medium text-primary hover:underline'
                    >
                      ← 返回图文博客
                    </SmartLink>
                    <div className='flex flex-wrap gap-2'>
                      {(Array.isArray(post.tags) ? post.tags : [])
                        .map(tag => (typeof tag === 'string' ? tag : tag?.name))
                        .filter(Boolean)
                        .map(tag => (
                          <SmartLink
                            key={tag}
                            href={`/tag/${encodeURIComponent(tag)}`}
                            className='rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:text-primary dark:bg-dark-3 dark:text-dark-6'
                          >
                            #{tag}
                          </SmartLink>
                        ))}
                    </div>
                  </nav>
                )}
                {post?.demoContentMarkdown ? (
                  <DemoMarkdown
                    markdown={post.demoContentMarkdown}
                    title={post.title}
                    cover={isProjectCase ? post.pageCoverThumbnail : undefined}
                  />
                ) : (
                  <NotionPage
                    {...props}
                    className={
                      isBlogArticle
                        ? 'proxio-blog-article mx-auto max-w-4xl'
                        : undefined
                    }
                    allowEmbeddedAds={false}
                  />
                )}
                {isBlogArticle && <BlogAdSlot placement='article' />}
                {isProjectCase && (
                  <div className='border-t border-slate-200 py-8 dark:border-dark-3'>
                    <SmartLink
                      href={demoProject ? '/projects' : '/category/项目案例'}
                      className='inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white'
                    >
                      ← 返回项目作品
                    </SmartLink>
                  </div>
                )}
                {isBlogArticle && (
                  <div className='mx-auto max-w-4xl border-t border-slate-200 py-8 dark:border-dark-3'>
                    <SmartLink
                      href={demoArticle ? '/blog' : '/category/图文文章'}
                      className='inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white'
                    >
                      ← 返回图文博客
                    </SmartLink>
                  </div>
                )}
                {!isProjectCase && <Comment frontMatter={post} />}
                <ShareBar post={post} />
              </div>
            )}
          </div>
          {/* 桌面端文章目录（仅 xl 及以上显示） */}
          {showCatalog && (
            <aside
              id='proxio-post-catalog'
              className='hidden xl:block xl:flex-shrink-0 xl:w-60 p-4'
              style={{
                position: 'sticky',
                top: '6rem',
                alignSelf: 'flex-start'
              }}
            >
              <div
                className='max-h-[calc(100vh-8rem)] overflow-y-auto'
                style={{ position: 'relative' }}
              >
                <Catalog post={post} />
              </div>
            </aside>
          )}
        </div>
      </div>
      {/* 移动端悬浮目录入口 */}
      {showCatalog && <MobileCatalog post={post} />}
    </>
  )
}

/**
 * 仪表盘
 * @param {*} props
 * @returns
 */
const LayoutDashboard = props => {
  const { post } = props

  return (
    <>
      <div className='container grow'>
        <div className='flex flex-wrap justify-center -mx-4'>
          <div id='container-inner' className='w-full p-4'>
            {post && (
              <div id='article-wrapper' className='mx-auto'>
                <NotionPage {...props} />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 仪表盘 */}
      <DashboardHeader />
      <DashboardBody />
    </>
  )
}

/**
 * 搜索
 * @param {*} props
 * @returns
 */
const LayoutSearch = props => {
  const { keyword } = props
  const router = useRouter()
  const currentSearch = keyword || router?.query?.s

  useEffect(() => {
    if (isBrowser) {
      replaceSearchResult({
        doms: document.getElementById('posts-wrapper'),
        search: keyword,
        target: {
          element: 'span',
          className: 'text-red-500 border-b border-dashed'
        }
      })
    }
  }, [])
  return (
    <>
      <section className='max-w-7xl mx-auto bg-white pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]'>
        <SearchInput {...props} />
        {currentSearch && <Blog {...props} />}
      </section>
    </>
  )
}

/**
 * 文章归档
 * @param {*} props
 * @returns
 */
const LayoutArchive = props => (
  <>
    {/* 博文列表 */}
    <Blog {...props} />
  </>
)

/**
 * 404页面
 * @param {*} props
 * @returns
 */
const Layout404 = props => {
  return (
    <>
      {/* <!-- ====== 404 Section Start --> */}
      <section className='bg-white py-20 dark:bg-dark-2 lg:py-[110px]'>
        <div className='container mx-auto'>
          <div className='flex flex-wrap items-center -mx-4'>
            <div className='w-full px-4 md:w-5/12 lg:w-6/12'>
              <div className='text-center'>
                <img
                  src='/images/starter/404.svg'
                  alt='image'
                  className='max-w-full mx-auto'
                />
              </div>
            </div>
            <div className='w-full px-4 md:w-7/12 lg:w-6/12 xl:w-5/12'>
              <div>
                <div className='mb-8'>
                  <SVG404 />
                </div>
                <h3 className='mb-5 text-2xl font-semibold text-dark dark:text-white'>
                  {siteConfig('PROXIO_404_TITLE')}
                </h3>
                <p className='mb-8 text-base text-body-color dark:text-dark-6'>
                  {siteConfig('PROXIO_404_TEXT')}
                </p>
                <SmartLink
                  href='/'
                  className='py-3 text-base font-medium text-white transition rounded-md bg-dark px-7 hover:bg-primary'
                >
                  {siteConfig('PROXIO_404_BACK')}
                </SmartLink>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ====== 404 Section End --> */}
    </>
  )
}

/**
 * 博客列表
 */
const LayoutPostList = props => {
  const { posts, category, tag } = props
  const slotTitle = category || tag

  if (category === '项目案例') {
    return <ProjectPortfolioList posts={posts} />
  }

  const publishedPosts = getPublishedPosts(posts)
  if (category === '图文文章') {
    return (
      <ArticleList
        posts={getPublishedBlogPosts(publishedPosts)}
        category={category}
        baseHref={props?.demoPreview ? '/blog' : '/category/图文文章'}
        currentPage={props.page || 1}
        pageSize={siteConfig('POSTS_PER_PAGE', 12, props.NOTION_CONFIG)}
        postCount={props.postCount || 0}
        allowAds
      />
    )
  }
  if (tag) {
    return (
      <ArticleList
        posts={publishedPosts}
        tag={tag}
        baseHref={`/tag/${encodeURIComponent(tag)}`}
        currentPage={props.page || 1}
        pageSize={siteConfig('POSTS_PER_PAGE', 12, props.NOTION_CONFIG)}
        postCount={props.postCount || 0}
      />
    )
  }

  return (
    <>
      {/* <!-- ====== Blog Section Start --> */}
      <section className='bg-white pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]'>
        <div className='container mx-auto'>
          {/* 区块标题文字 */}
          <div className='-mx-4 flex flex-wrap justify-center'>
            <div className='w-full px-4'>
              <div className='mx-auto mb-[60px] max-w-[485px] text-center'>
                {slotTitle && (
                  <h2 className='mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
                    {slotTitle}
                  </h2>
                )}

                {!slotTitle && (
                  <>
                    <span className='mb-2 block text-lg font-semibold text-primary'>
                      {siteConfig('PROXIO_BLOG_TITLE')}
                    </span>
                    <h2 className='mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
                      {siteConfig('PROXIO_BLOG_TEXT_1')}
                    </h2>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* 博客列表 此处优先展示4篇文章 */}
          <div className='-mx-4 flex flex-wrap'>
            {posts?.map((item, index) => {
              return (
                <div key={index} className='w-full px-4 md:w-1/2 lg:w-1/3'>
                  <div
                    className='wow fadeInUp group mb-10'
                    data-wow-delay='.1s'
                  >
                    <div className='mb-8 overflow-hidden rounded-[5px]'>
                      <SmartLink href={item?.href} className='block'>
                        <img
                          src={item.pageCoverThumbnail}
                          alt={item.title}
                          className='w-full transition group-hover:rotate-6 group-hover:scale-125'
                        />
                      </SmartLink>
                    </div>
                    <div>
                      <span className='mb-6 inline-block rounded-[5px] bg-primary px-4 py-0.5 text-center text-xs font-medium leading-loose text-white'>
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
                      <p className='max-w-[370px] text-base text-body-color dark:text-dark-6'>
                        {item.summary}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      {/* <!-- ====== Blog Section End --> */}
    </>
  )
}
/**
 * 分类列表
 * @param {*} props
 * @returns
 */
const LayoutCategoryIndex = props => {
  const { categoryOptions } = props
  const { locale } = useGlobal()
  return (
    <section className='bg-white pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]'>
      <div className='container mx-auto  min-h-96'>
        <span className='mb-2 text-lg font-semibold text-primary flex justify-center items-center '>
          {locale.COMMON.CATEGORY}
        </span>
        <div
          id='category-list'
          className='duration-200 flex flex-wrap justify-center items-center '
        >
          {categoryOptions?.map(category => {
            return (
              <SmartLink
                key={category.name}
                href={`/category/${category.name}`}
                passHref
                legacyBehavior
              >
                <h2
                  className={
                    'hover:text-black text-2xl font-semibold text-dark sm:text-4xl md:text-[40px] md:leading-[1.2] dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600 px-5 cursor-pointer py-2 hover:bg-gray-100'
                  }
                >
                  <i className='mr-4 fas fa-folder' />
                  {category.name}({category.count})
                </h2>
              </SmartLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/**
 * 标签列表
 * @param {*} props
 * @returns
 */
const LayoutTagIndex = props => {
  const { tagOptions } = props
  const { locale } = useGlobal()
  return (
    <section className='bg-white pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]'>
      <div className='container mx-auto  min-h-96'>
        <span className='mb-2 text-lg font-semibold text-primary flex justify-center items-center '>
          {locale.COMMON.TAGS}
        </span>
        <div
          id='tags-list'
          className='duration-200 flex flex-wrap justify-center items-center'
        >
          {tagOptions.map(tag => {
            return (
              <div key={tag.name} className='p-2'>
                <SmartLink
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag.name)}`}
                  passHref
                  className={`cursor-pointer inline-block rounded hover:bg-gray-500 hover:text-white duration-200  mr-2 py-1 px-2 text-md whitespace-nowrap dark:hover:text-white text-gray-600 hover:shadow-xl dark:border-gray-400 notion-${tag.color}_background dark:bg-gray-800`}
                >
                  <div className='font-light dark:text-gray-400'>
                    <i className='mr-1 fas fa-tag' />{' '}
                    {tag.name + (tag.count ? `(${tag.count})` : '')}{' '}
                  </div>
                </SmartLink>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
/**
 * 登录页面
 * @param {*} props
 * @returns
 */
const LayoutSignIn = props => {
  const enableClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const title = siteConfig('PROXIO_SIGNIN', '登录')
  const description = siteConfig('PROXIO_SIGNIN_DESCRITION', '登录功能未启用')
  return (
    <>
      <div className='grow mt-20'>
        <Banner title={title} description={description} />
        {/* clerk预置表单 */}
        {enableClerk && (
          <div className='flex justify-center py-6'>
            <SignIn />
          </div>
        )}

        {/* 自定义登录表单 */}
        {!enableClerk && <SignInForm />}
      </div>
    </>
  )
}

/**
 * 注册页面
 * @param {*} props
 * @returns
 */
const LayoutSignUp = props => {
  const enableClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  const title = siteConfig('PROXIO_SIGNIN', '注册')
  const description = siteConfig('PROXIO_SIGNIN_DESCRITION', '注册功能未启用')
  return (
    <>
      <div className='grow mt-20'>
        <Banner title={title} description={description} />

        {/* clerk预置表单 */}
        {enableClerk && (
          <div className='flex justify-center py-6'>
            <SignUp />
          </div>
        )}

        {/* 自定义登录表单 */}
        {!enableClerk && <SignUpForm />}
      </div>
    </>
  )
}

export {
  Layout404,
  LayoutArchive,
  LayoutBase,
  LayoutCategoryIndex,
  LayoutDashboard,
  LayoutIndex,
  LayoutPostList,
  LayoutResume,
  LayoutSearch,
  LayoutSignIn,
  LayoutSignUp,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG
}
