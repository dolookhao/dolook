import fs from 'node:fs'
import { generateRobotsTxt } from '@/lib/utils/robots.txt'

describe('static robots.txt', () => {
  afterEach(() => jest.restoreAllMocks())

  it('references the canonical HTTPS sitemap and omits the unsupported Host directive', () => {
    const write = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {})

    generateRobotsTxt({ siteInfo: { link: 'https://dolookhao.bid' } })

    const [, content] = write.mock.calls[0]
    expect(content).toContain('Sitemap: https://dolookhao.bid/sitemap.xml')
    expect(content).not.toMatch(/^\s*Host:/m)
  })
})
