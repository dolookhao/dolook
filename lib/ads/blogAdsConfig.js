const DISABLED_CONFIG = Object.freeze({
  enabled: false,
  provider: null,
  clientId: null,
  slots: Object.freeze({ archive: null, article: null })
})

const isPublisherId = value =>
  typeof value === 'string' && /^ca-pub-\d{8,32}$/.test(value)

const isSlotId = value =>
  typeof value === 'string' && /^\d{4,20}$/.test(value)

/** Return only public, allowlisted ad settings. Invalid input fails closed. */
export function toPublicBlogAdsConfig(value) {
  if (
    !value ||
    value.enabled !== true ||
    value.provider !== 'google-adsense' ||
    !isPublisherId(value.clientId)
  ) {
    return DISABLED_CONFIG
  }

  const slots = {
    archive: isSlotId(value.slots?.archive) ? value.slots.archive : null,
    article: isSlotId(value.slots?.article) ? value.slots.article : null
  }

  if (!slots.archive && !slots.article) return DISABLED_CONFIG

  return {
    enabled: true,
    provider: 'google-adsense',
    clientId: value.clientId,
    slots
  }
}

export function getDisabledBlogAdsConfig() {
  return {
    ...DISABLED_CONFIG,
    slots: { ...DISABLED_CONFIG.slots }
  }
}
