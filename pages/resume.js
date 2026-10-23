import Head from 'next/head'
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { DynamicLayout } from '@/themes/theme'

const Resume = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return (
    <>
      <Head>
        <title>简历｜产品经理个人作品集</title>
        <meta name='description' content='产品经理 / 产品负责人简历摘要：AI 应用、企业数字化、SaaS、IoT 与智能硬件产品经验。' />
      </Head>
      <DynamicLayout theme={theme} layoutName='LayoutResume' {...props} />
    </>
  )
}

export default Resume
