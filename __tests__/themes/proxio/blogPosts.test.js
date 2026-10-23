import {
  getPublishedBlogPosts,
  getBlogTagOptions,
  getPublishedPosts
} from '@/themes/proxio/utils/blogPosts'

const posts = [
  {
    title: 'Published article',
    type: 'Post',
    status: 'Published',
    category: '图文文章',
    tags: ['产品思考', { name: 'AI' }]
  },
  {
    title: 'Draft article',
    type: 'Post',
    status: 'Draft',
    category: '图文文章',
    tags: ['Hidden tag']
  },
  {
    title: 'Invisible article',
    type: 'Post',
    status: 'Invisible',
    category: '图文文章'
  },
  {
    title: 'Published project',
    type: 'Post',
    status: 'Published',
    category: '项目案例'
  }
]

describe('Proxio published blog articles', () => {
  it('only returns published posts in the article category', () => {
    expect(getPublishedBlogPosts(posts).map(post => post.title)).toEqual([
      'Published article'
    ])
  })

  it('only derives tag navigation from published blog articles', () => {
    expect(getBlogTagOptions(posts)).toEqual(['产品思考', 'AI'])
  })

  it('requires explicit Published status on compact Notion page records', () => {
    expect(getPublishedPosts(posts).map(post => post.title)).toEqual([
      'Published article',
      'Published project'
    ])
  })
})
