// Cloudflare Pages static exports cannot serve a request-time OAuth callback.
// The supported Notion OAuth callback is the API route under /api/auth/callback/notion.
export async function getStaticProps() {
  return { notFound: true }
}

export default function NotionOAuthRedirect() {
  return null
}
