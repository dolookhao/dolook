import { useMemo, useState } from 'react'
import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'
import {
  filterProjectsByTag,
  getProjectTagOptions,
  getPublicProjectPosts,
  getProjectTagNames
} from '../utils/projectCases'

export const ProjectPortfolioList = ({ posts = [] }) => {
  const [selectedTag, setSelectedTag] = useState('全部')
  const publicPosts = useMemo(() => getPublicProjectPosts(posts), [posts])
  const tags = useMemo(() => getProjectTagOptions(publicPosts), [publicPosts])
  const visiblePosts = useMemo(
    () => filterProjectsByTag(publicPosts, selectedTag),
    [publicPosts, selectedTag]
  )

  return (
    <section className='bg-white pb-16 pt-12 dark:bg-dark sm:pb-20 sm:pt-16 lg:pb-24'>
      <div className='container mx-auto px-4'>
        <div className='mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <SmartLink href='/' className='text-sm font-medium text-primary hover:underline'>← 返回首页</SmartLink>
            <p className='mt-5 text-xs font-semibold tracking-[0.16em] text-primary'>PROJECT PORTFOLIO</p>
            <h1 className='mt-2 text-3xl font-semibold tracking-tight text-dark dark:text-white sm:text-4xl'>项目作品</h1>
            <p className='mt-3 max-w-2xl text-sm leading-6 text-body-color dark:text-dark-6'>按项目标签浏览已公开案例。</p>
          </div>
          <span className='text-sm text-body-color dark:text-dark-6'>共 {visiblePosts.length} 个案例</span>
        </div>

        {tags.length > 0 && (
          <div className='mb-8 flex flex-wrap gap-2' role='group' aria-label='项目分类筛选'>
            {['全部', ...tags].map(tag => (
              <button
                key={tag}
                type='button'
                aria-pressed={selectedTag === tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selectedTag === tag ? 'border-slate-950 bg-slate-950 text-white dark:border-cyan-300 dark:bg-cyan-300 dark:text-slate-950' : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-dark-3 dark:text-dark-6'}`}>
                {tag}
              </button>
            ))}
          </div>
        )}

        {visiblePosts.length > 0 ? (
          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {visiblePosts.map((post, index) => {
              const postTags = getProjectTagNames(post)
              return (
                <article key={post.id || post.href || post.slug || index} className='group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-dark-3 dark:bg-dark-2'>
                  <SmartLink href={post.href} className='block overflow-hidden'>
                    {post.pageCoverThumbnail ? (
                      <LazyImage src={post.pageCoverThumbnail} alt={`${post.title} 项目截图`} className='h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]' />
                    ) : (
                      <div className='flex h-52 items-end bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-200 via-blue-100 to-slate-100 p-5 dark:from-cyan-950 dark:via-blue-950 dark:to-dark-3'>
                        <span className='rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur dark:border-white/10 dark:bg-dark/70 dark:text-dark-6'>项目案例</span>
                      </div>
                    )}
                  </SmartLink>
                  <div className='flex grow flex-col p-5'>
                    {post.publishDay && <time className='text-xs text-slate-500 dark:text-dark-6'>{post.publishDay}</time>}
                    <h2 className='mt-2 text-xl font-semibold leading-7 text-dark dark:text-white'>
                      <SmartLink href={post.href} className='hover:text-primary'>{post.title}</SmartLink>
                    </h2>
                    {post.summary && <p className='mt-3 line-clamp-3 text-sm leading-6 text-body-color dark:text-dark-6'>{post.summary}</p>}
                    {postTags.length > 0 && (
                      <ul className='mt-4 flex flex-wrap gap-2' aria-label='项目标签'>
                        {postTags.map(tag => <li key={tag} className='rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-dark-3 dark:text-dark-6'>{tag}</li>)}
                      </ul>
                    )}
                    <SmartLink href={post.href} className='mt-auto inline-flex pt-5 text-sm font-semibold text-primary hover:underline'>
                      查看案例 <span className='ml-2' aria-hidden='true'>→</span>
                    </SmartLink>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className='rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-dark-3'>
            <h2 className='text-lg font-semibold text-dark dark:text-white'>暂无已发布的项目案例</h2>
            <p className='mt-2 text-sm text-body-color dark:text-dark-6'>Notion 中状态为 Published 且分类为“项目案例”的内容会显示在这里。</p>
          </div>
        )}
      </div>
    </section>
  )
}
