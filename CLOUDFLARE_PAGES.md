# Cloudflare Pages deployment settings

This project is configured for a Next.js static export. The expected Cloudflare Pages settings are:

- Build command: `yarn export`
- Build output directory: `out`
- Production branch: the repository branch selected in the Pages project
- Build environment variables:
  - `NOTION_PAGE_ID`: the root page ID of the user's own NotionNext copy
  - `NEXT_PUBLIC_LINK`: `https://dolookhao.bid`
  - `NEXT_PUBLIC_THEME`: `proxio`

Do not commit `.env.local`, Notion tokens, OAuth secrets, or other environment values. Configure required values in the Cloudflare Pages dashboard. The source Notion content must be accessible to the build process; the static export does not embed a private API token.

## Current verification status

The local `yarn export` command is configured, but the latest build did not complete because this environment could not resolve `app.notion.com`. No `out` directory was produced, so this repository is **not yet verified as deployable**. Resolve Notion build access and complete an artifact scan before selecting a production branch in Cloudflare Pages.

The optional blog advertising endpoint is a Cloudflare Pages Function at `functions/api/blog-ads.js`. Ads are disabled when its optional `BLOG_ADS_CONFIG` binding is absent or invalid. The Pages Function runtime and binding have not been verified in a deployed Pages project.
