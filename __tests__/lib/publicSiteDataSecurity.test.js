import { redactSiteData } from '@/lib/utils/publicPost'

describe('public site data credential redaction', () => {
  it('removes credential-like Notion config keys recursively while preserving public settings', () => {
    const data = {
      NOTION_CONFIG: {
        THEME: 'proxio',
        NOTION_TOKEN_V2: 'secret-notion-value',
        AI_SUMMARY_KEY: 'secret-ai-value',
        INLINE_CONFIG: {
          DIFY_CHATBOT_TOKEN: 'secret-dify-value',
          OAUTH_CLIENT_SECRET: 'secret-oauth-value'
        },
        ALGOLIA_SEARCH_ONLY_APP_KEY: 'public-search-key'
      }
    }

    redactSiteData(data)

    const serialized = JSON.stringify(data)
    expect(serialized).not.toContain('secret-notion-value')
    expect(serialized).not.toContain('secret-ai-value')
    expect(serialized).not.toContain('secret-dify-value')
    expect(serialized).not.toContain('secret-oauth-value')
    expect(data.NOTION_CONFIG.THEME).toBe('proxio')
    expect(data.NOTION_CONFIG.ALGOLIA_SEARCH_ONLY_APP_KEY).toBe('public-search-key')
  })
})
