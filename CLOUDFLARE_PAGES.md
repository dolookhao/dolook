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

## Static-only deployment

Keep a top-level `functions/` directory out of the deployment branch. Cloudflare Pages automatically detects it and uploads its contents as Pages Functions. Optional AI chat, docs chat, and blog ad handlers are preserved under `optional-pages-functions/` for a future deployment that explicitly enables dynamic functions. The static build leaves `NEXT_PUBLIC_BLOG_ADS_RUNTIME` unset, so blog ad slots make no API request and render no ads.

To enable those handlers later, deliberately move the required handler(s) into a top-level `functions/` directory and configure the matching secrets and bindings. That changes the deployment from static-only and requires a new build/deployment.

The first Cloudflare build failed because the private Notion CMS was inaccessible. A structure-only public CMS was created with zero records; the subsequent static export completed, but Cloudflare also detected the repository's top-level `functions/` directory and uploaded a Pages Functions deployment. The directory is now moved out of the recognized location. Trigger and verify a fresh build to confirm the deployment contains only static assets.
