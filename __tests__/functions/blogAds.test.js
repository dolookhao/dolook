/** @jest-environment node */
import { onRequestGet } from '@/optional-pages-functions/api/blog-ads'

describe('Cloudflare blog ad config endpoint', () => {
  it('returns a disabled config when the KV binding is unavailable', async () => {
    const response = await onRequestGet({ env: {} })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      enabled: false,
      provider: null,
      clientId: null,
      slots: { archive: null, article: null }
    })
  })

  it('fails closed when KV contains invalid data', async () => {
    const response = await onRequestGet({
      env: { BLOG_ADS_CONFIG: { get: async () => ({ enabled: true, provider: 'unknown' }) } }
    })

    expect(await response.json()).toMatchObject({ enabled: false, clientId: null })
  })
})
