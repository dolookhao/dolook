# Demo preview data source

The portfolio demo fixtures are loaded only when all of these build-time values match:

```text
DEMO_PREVIEW=true
NEXT_PUBLIC_DEMO_PREVIEW=true
CF_PAGES_BRANCH=portfolio/demo-preview
NEXT_PUBLIC_LINK=https://<the-Cloudflare-branch-preview-host>
```

The site URL must be HTTPS and must not be `dolookhao.bid` or `www.dolookhao.bid`. `next.config.js` rejects an incomplete or production-domain configuration. A normal production build uses the existing Notion CMS preflight and Notion data source.

For a local static export, set the same variables explicitly for the command and use a temporary `pages.dev` preview hostname; do not put Notion credentials in the local command. Example:

```sh
DEMO_PREVIEW=true NEXT_PUBLIC_DEMO_PREVIEW=true CF_PAGES_BRANCH=portfolio/demo-preview NEXT_PUBLIC_LINK=https://demo-preview.example.pages.dev yarn export
```

Cloudflare Pages Preview must receive the two demo flags only in its Preview environment. Keep them unset in Production. Set `NEXT_PUBLIC_LINK` in Preview to the branch preview URL shown by Cloudflare. The adapter never calls or writes to Notion. The public CMS and all private drafts remain unchanged.

The structured source is `demo-preview-data/content/site-data.json`. Full project and article bodies come from the matching Markdown files; each list/detail cover resolves to the matching SVG in `demo-preview-data/assets`. The SVGs preserve their DEMO marks. About, experience, and contact are exposed as `/about`, `/experience`, and `/contact`; projects and articles use `/projects`, `/blog`, `/projects/<slug>`, and `/blog/<slug>`.

All fixture text is fictional. The demo build adds `noindex,nofollow,noarchive` and blocks crawling in `robots.txt`; this does not restrict visitor access. The Cloudflare Preview URL remains public unless Cloudflare Access is separately enabled.
