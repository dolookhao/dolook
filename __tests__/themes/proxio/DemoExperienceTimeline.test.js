import { render, screen, within } from '@testing-library/react'
import DemoExperienceTimeline from '@/themes/proxio/components/DemoExperienceTimeline'

jest.mock('@/components/SmartLink', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

const content = {
  publication_warning: '此页面是演示资料。',
  timeline: [
    {
      period: '2025—2026（演示）',
      title: 'AI 产品负责人',
      company: '星河数智实验室（虚构示例）',
      focus: 'AI 应用矩阵与智能体平台'
    },
    {
      period: '2023—2025（演示）',
      title: '产品 / 项目负责人',
      company: '云泉互联（虚构示例）',
      focus: 'IoT 智能终端、运营 SaaS 与广告业务'
    },
    {
      period: '2021—2023（演示）',
      title: '平台产品经理',
      company: 'Pulse 数字系统（虚构示例）',
      focus: 'B2B 业务中台与多组织协作'
    },
    {
      period: '2019—2021（演示）',
      title: '软硬件产品经理',
      company: '启学科技工作室（虚构示例）',
      focus: '智能硬件从设计验证到量产协作'
    },
    {
      period: '2017—2019（演示）',
      title: '产品策划与运营',
      company: 'Orbit 内容创新（虚构示例）',
      focus: '内容产品、运营分析与用户增长'
    }
  ]
}

describe('DemoExperienceTimeline', () => {
  it('renders all five demo stages, focus areas, and a link to project cases', () => {
    render(<DemoExperienceTimeline content={content} />)

    const timeline = screen.getByRole('list', { name: '职业经历时间线' })
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('AI 应用矩阵与智能体平台')).toBeInTheDocument()
    expect(screen.getByText('内容产品、运营分析与用户增长')).toBeInTheDocument()
    expect(screen.getByText(/此页面是演示资料/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '查看项目案例' })).toHaveAttribute(
      'href',
      '/projects'
    )
  })
})
