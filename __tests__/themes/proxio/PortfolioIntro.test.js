import { render, screen } from '@testing-library/react'
import { PortfolioIntro } from '@/themes/proxio/components/PortfolioIntro'

describe('PortfolioIntro featured artwork', () => {
  it('preserves the full 16:9 cover instead of cropping demo artwork', () => {
    render(
      <PortfolioIntro
        content={{
          identity: { displayName: '演示姓名', headline: '产品经理' },
          hero: { eyebrow: 'DEMO', title: '演示首页', description: '首页说明' },
          skills: []
        }}
        featuredProject={{
          title: 'AlphaLab 智能策略分析台',
          summary: '演示案例',
          href: '/projects/ai-analytics',
          pageCoverThumbnail: '/demo-preview-assets/project-08.svg'
        }}
      />
    )

    expect(screen.getByRole('img', { name: 'AlphaLab 智能策略分析台 项目视觉' }))
      .toHaveClass('aspect-[16/9]')
  })
})
