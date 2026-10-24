import SmartLink from '@/components/SmartLink'
import { getProjectTagNames } from '../utils/projectCases'

export const ProjectCaseHeader = ({ post }) => {
  const tags = getProjectTagNames(post)
  const projectListHref = post?.demoFixture ? '/projects' : '/category/项目案例'

  return (
    <header className='border-b border-slate-200 bg-slate-50 py-10 dark:border-dark-3 dark:bg-dark-2 sm:py-14'>
      <div className='container mx-auto px-4'>
        <SmartLink
          href={projectListHref}
          className='inline-flex items-center text-sm font-medium text-primary hover:underline'
        >
          <span className='mr-2' aria-hidden='true'>
            ←
          </span>{' '}
          返回项目作品
        </SmartLink>
        <p className='mt-7 text-xs font-semibold tracking-[0.16em] text-primary'>
          {post?.demoFixture ? 'PROJECT CASE · DEMO' : 'PROJECT CASE'}
        </p>
        <h1 className='mt-3 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-dark dark:text-white sm:text-4xl lg:text-5xl'>
          {post?.title}
        </h1>
        {post?.summary && (
          <p className='mt-5 max-w-3xl text-base leading-7 text-body-color dark:text-dark-6 sm:text-lg'>
            {post.summary}
          </p>
        )}
        <div className='mt-5 flex flex-wrap items-center gap-2'>
          {post?.demoFixture && (
            <span className='mr-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'>
              演示案例
            </span>
          )}
          {post?.publishDay && (
            <time className='mr-2 text-sm text-slate-500 dark:text-dark-6'>
              {post.publishDay}
            </time>
          )}
          {tags.map(tag => (
            <span
              key={tag}
              className='rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 dark:border-dark-3 dark:text-dark-6'
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}
