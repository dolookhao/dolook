import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(__dirname, '..')

describe('Cloudflare Pages static-only deployment', () => {
  it('does not expose a root Functions directory to Cloudflare Pages', () => {
    expect(fs.existsSync(path.join(repoRoot, 'functions'))).toBe(false)
  })
})
