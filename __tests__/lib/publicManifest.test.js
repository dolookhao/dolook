import fs from 'node:fs'
import path from 'node:path'

describe('public PWA manifest', () => {
  it('uses portfolio copy and points to existing icon assets', () => {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

    expect(manifest.name).toBe('产品经理个人作品集')
    expect(manifest.short_name).toBe('产品作品集')
    expect(JSON.stringify(manifest)).not.toMatch(/NotionNext Blog|A blog powered by NotionNext/)
    manifest.icons.forEach(icon => {
      expect(fs.existsSync(path.join(process.cwd(), 'public', icon.src.slice(1)))).toBe(true)
    })
  })
})
