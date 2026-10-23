import { toPublicBlogAdsConfig } from '@/lib/ads/blogAdsConfig'

describe('runtime blog ad configuration', () => {
  it('is disabled when the runtime setting is missing', () => {
    expect(toPublicBlogAdsConfig(null)).toEqual({
      enabled: false,
      provider: null,
      clientId: null,
      slots: { archive: null, article: null }
    })
  })

  it('accepts only the explicit Google provider and public ad identifiers', () => {
    expect(toPublicBlogAdsConfig({
      enabled: true,
      provider: 'google-adsense',
      clientId: 'ca-pub-1234567890123456',
      slots: { archive: '12345678', article: '87654321' }
    })).toEqual({
      enabled: true,
      provider: 'google-adsense',
      clientId: 'ca-pub-1234567890123456',
      slots: { archive: '12345678', article: '87654321' }
    })
  })

  it('fails closed for invalid provider credentials or slot values', () => {
    expect(toPublicBlogAdsConfig({
      enabled: true,
      provider: 'other-provider',
      clientId: 'not-a-publisher-id',
      slots: { archive: '<script>', article: '1234' }
    })).toEqual({
      enabled: false,
      provider: null,
      clientId: null,
      slots: { archive: null, article: null }
    })
  })
})
