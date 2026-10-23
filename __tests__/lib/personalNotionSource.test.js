const { assertPersonalNotionSource } = require('@/lib/build/personalNotionSource')

describe('personal Notion source preflight', () => {
  it('rejects a missing page ID and both upstream demo roots', () => {
    expect(() => assertPersonalNotionSource('')).toThrow(/NOTION_PAGE_ID/)
    expect(() => assertPersonalNotionSource('02ab3b8678004aa69e9e415905ef32a5')).toThrow(/demo/i)
    expect(() => assertPersonalNotionSource('7c1d570661754c8fbc568e00a01fd70e')).toThrow(/demo/i)
  })

  it('accepts a user-owned root ID in compact or UUID form', () => {
    expect(() => assertPersonalNotionSource('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).not.toThrow()
    expect(() => assertPersonalNotionSource('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')).not.toThrow()
  })

  it('rejects invalid and mixed demo IDs before a multi-language export', () => {
    expect(() => assertPersonalNotionSource('not-a-notion-id')).toThrow(/invalid/i)
    expect(() => assertPersonalNotionSource('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,en:02ab3b8678004aa69e9e415905ef32a5')).toThrow(/demo/i)
  })

  it('does not silently use the demo source when the env var is missing', () => {
    const before = process.env.NOTION_PAGE_ID
    delete process.env.NOTION_PAGE_ID
    try {
      jest.isolateModules(() => {
        expect(require('@/blog.config').NOTION_PAGE_ID).toBe('')
      })
    } finally {
      if (before === undefined) delete process.env.NOTION_PAGE_ID
      else process.env.NOTION_PAGE_ID = before
    }
  })
})
