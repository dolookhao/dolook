import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { DynamicLayout } from '@/themes/theme'

export default function BlogIndex(props) {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutPostList' {...props} />
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({ from: 'portfolio-blog', locale })
  props.posts = (props.allPages || []).filter(page =>
    page?.type === 'Post' && page?.status === 'Published' &&
    (Array.isArray(page.category) ? page.category : String(page.category || '').split(',')).includes('图文文章')
  )
  props.postCount = props.posts.length
  props.category = '图文文章'
  delete props.allPages
  return { props, revalidate: process.env.EXPORT ? undefined : siteConfig('NEXT_REVALIDATE_SECOND', BLOG.NEXT_REVALIDATE_SECOND, props.NOTION_CONFIG) }
}
