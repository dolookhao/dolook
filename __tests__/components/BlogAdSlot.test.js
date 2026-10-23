import { render, screen, waitFor } from '@testing-library/react'
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
  afterEach(() => {
    jest.restoreAllMocks()
    delete process.env.NEXT_PUBLIC_BLOG_ADS_RUNTIME
  })

  it('does not contact a dynamic endpoint when the static ad runtime is off', () => {
    const fetch = jest.spyOn(global, 'fetch')
    const { container } = render(<BlogAdSlot placement='archive' />)

    expect(fetch).not.toHaveBeenCalled()
    expect(container.querySelector('ins.adsbygoogle')).toBeNull()
    expect(require('@/components/GoogleAdsense').initGoogleAdsense).not.toHaveBeenCalled()
  })

  it('renders only the requested blog slot after explicit runtime enablement', async () => {
    process.env.NEXT_PUBLIC_BLOG_ADS_RUNTIME = 'true'
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => validConfig })
    render(<BlogAdSlot placement='article' />)

    const slot = await screen.findByTestId('blog-ad-slot')
    expect(slot).toHaveAttribute('data-ad-client', validConfig.clientId)
    expect(slot).toHaveAttribute('data-ad-slot', validConfig.slots.article)
    await waitFor(() => expect(require('@/components/GoogleAdsense').initGoogleAdsense).toHaveBeenCalledWith(validConfig.clientId))
  })
})
