import { act, render, screen, waitFor } from '@testing-library/react'
import BlogAdSlot from '@/components/BlogAdSlot'

jest.mock('@/components/GoogleAdsense', () => ({
  initGoogleAdsense: jest.fn()
}))

const validConfig = {
  enabled: true,
  provider: 'google-adsense',
  clientId: 'ca-pub-1234567890123456',
  slots: { archive: '12345678', article: '87654321' }
}

describe('BlogAdSlot', () => {
  afterEach(() => jest.restoreAllMocks())

  it('does not render an ad or load third-party code when runtime config is off', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ enabled: false }) })
    const { container } = render(<BlogAdSlot placement='archive' />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/blog-ads', expect.any(Object)))

    expect(container.querySelector('ins.adsbygoogle')).toBeNull()
    expect(require('@/components/GoogleAdsense').initGoogleAdsense).not.toHaveBeenCalled()
  })

  it('renders only the requested blog slot after explicit runtime enablement', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => validConfig })
    render(<BlogAdSlot placement='article' />)

    const slot = await screen.findByTestId('blog-ad-slot')
    expect(slot).toHaveAttribute('data-ad-client', validConfig.clientId)
    expect(slot).toHaveAttribute('data-ad-slot', validConfig.slots.article)
    await waitFor(() => expect(require('@/components/GoogleAdsense').initGoogleAdsense).toHaveBeenCalledWith(validConfig.clientId))
  })
})
