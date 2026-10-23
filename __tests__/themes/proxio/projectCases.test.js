import {
  filterProjectsByTag,
  getProjectTagOptions,
  getPublicProjectPosts,
  isProjectCasePost
} from '@/themes/proxio/utils/projectCases'

const rows = [
  {
    type: 'Post',
    status: 'Published',
    category: '项目案例',
    title: 'AI 应用',
    tags: ['AI', 'Agent']
  },
  {
    type: 'Post',
    status: 'Published',
    category: '项目案例',
    title: 'IoT 产品',
    tags: ['IoT', 'AI']
  },
  {
    type: 'Post',
    status: 'Draft',
    category: '项目案例',
    title: '私人草稿',
    tags: ['AI']
  },
  {
    type: 'Post',
    status: 'Published',
    category: '图文文章',
    title: '文章',
    tags: ['AI']
  }
]

describe('Notion project cases', () => {
  it('includes only published project posts', () => {
    expect(getPublicProjectPosts(rows).map(row => row.title)).toEqual([
      'AI 应用',
      'IoT 产品'
    ])
  })

  it('builds sorted unique tag filters from published projects only', () => {
    expect(getProjectTagOptions(rows)).toEqual(['Agent', 'AI', 'IoT'])
  })

  it('filters by selected tag and supports all projects', () => {
    expect(filterProjectsByTag(rows, 'IoT').map(row => row.title)).toEqual([
      'IoT 产品'
    ])
    expect(filterProjectsByTag(rows, '全部')).toHaveLength(2)
  })

  it('handles missing posts, tags, and cover metadata', () => {
    expect(getPublicProjectPosts(null)).toEqual([])
    const noTags = [{ ...rows[0], tags: null }]
    expect(getProjectTagOptions(noTags)).toEqual([])
    expect(filterProjectsByTag(noTags, '全部')).toHaveLength(1)
  })

  it('recognizes project posts without matching ordinary blog articles', () => {
    expect(isProjectCasePost(rows[0])).toBe(true)
    expect(isProjectCasePost(rows[3])).toBe(false)
  })
})
