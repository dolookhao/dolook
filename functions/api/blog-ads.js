import {
  getDisabledBlogAdsConfig,
  toPublicBlogAdsConfig
} from '../../lib/ads/blogAdsConfig'

export async function onRequestGet({ env }) {
  let rawConfig = null

  try {
    if (env.BLOG_ADS_CONFIG) {
      rawConfig = await env.BLOG_ADS_CONFIG.get('public-config', { type: 'json' })
    }
  } catch {
    // A missing or unreadable KV setting must never turn ads on.
  }

  const responseConfig = rawConfig
    ? toPublicBlogAdsConfig(rawConfig)
    : getDisabledBlogAdsConfig()

  return Response.json(responseConfig, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=60',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}
