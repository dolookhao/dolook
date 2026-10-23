import { Blog } from './Blog'

export const FeaturedProjects = ({ posts = [] }) => {
  const publishedProjects = posts
    .filter(post => post?.type === 'Post' && post?.status === 'Published')
    .slice(0, 3)

  if (publishedProjects.length) {
    return (
      <div id='projects' className='scroll-mt-16'>
        <Blog
          posts={publishedProjects}
          title='精选项目'
          headline='从业务问题到产品交付'
          moreHref='/category/项目案例'
          moreText='浏览项目归档'
        />
      </div>
    )
  }

  return (
    <section
      id='projects'
      className='proxio-section scroll-mt-16 py-16 sm:py-20 lg:py-24'
    >
      <div className='container mx-auto px-4'>
        <div className='mx-auto mb-10 max-w-2xl text-center'>
          <span className='proxio-pill rounded-2xl border px-3 py-1'>
            精选项目
          </span>
          <h2 className='mt-5 text-3xl font-semibold tracking-tight text-dark dark:text-white sm:text-4xl'>
            从业务问题到产品交付
          </h2>
          <p className='mt-4 leading-7 text-body-color dark:text-dark-6'>
            暂无已发布的项目案例。项目内容发布到 Notion 后会显示在这里。
          </p>
        </div>
      </div>
    </section>
  )
}
