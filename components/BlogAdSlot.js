import { useEffect, useState } from 'react'

const BlogAdSlot = ({ placement }) => {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    let active = true
    fetch('/api/blog-ads', {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { accept: 'application/json' }
    })
      .then(response => (response.ok ? response.json() : null))
      .then(value => {
        const slot = value?.slots?.[placement]
        if (
          active &&
          value?.enabled === true &&
          value?.provider === 'google-adsense' &&
          /^ca-pub-\d{8,32}$/.test(value?.clientId || '') &&
          typeof slot === 'string' &&
          /^\d{4,20}$/.test(slot)
        ) {
          setConfig({ clientId: value.clientId, slot })
        }
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [placement])

  useEffect(() => {
    if (!config) return
    import('@/components/GoogleAdsense').then(({ initGoogleAdsense }) => {
      initGoogleAdsense(config.clientId)
    })
  }, [config])

  if (!config) return null

  return (
    <div className='my-8 min-h-[90px]' aria-label='广告' data-ad-placement={placement}>
      <ins
        data-testid='blog-ad-slot'
        className='adsbygoogle'
        style={{ display: 'block', textAlign: 'center', minHeight: '90px' }}
        data-ad-client={config.clientId}
        data-ad-slot={config.slot}
        data-ad-format='auto'
        data-full-width-responsive='true'
      />
    </div>
  )
}

export default BlogAdSlot
