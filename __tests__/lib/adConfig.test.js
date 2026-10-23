describe('built-in advertising defaults', () => {
  afterEach(() => jest.resetModules())

  it('ships with no publisher id, no sample slots, and a false test flag', () => {
    jest.isolateModules(() => {
      const config = require('@/conf/ad.config')
      expect(config.ADSENSE_GOOGLE_ID).toBe('')
      expect(config.ADSENSE_GOOGLE_TEST).toBe(false)
      expect(config.ADSENSE_GOOGLE_SLOT_IN_ARTICLE).toBe('')
      expect(config.ADSENSE_GOOGLE_SLOT_FLOW).toBe('')
      expect(config.ADSENSE_GOOGLE_SLOT_NATIVE).toBe('')
      expect(config.ADSENSE_GOOGLE_SLOT_AUTO).toBe('')
      expect(config.AD_WWADS_ID).toBeNull()
      expect(config.AD_WWADS_BLOCK_DETECT).toBe(false)
    })
  })
})
