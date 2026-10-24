import React from 'react'
import LazyImage from '@/components/LazyImage'

function renderInline(text, keyPrefix) {
  const tokens = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean)
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`
    if (token.startsWith('**') && token.endsWith('**')) return <strong key={key}>{token.slice(2, -2)}</strong>
    if (token.startsWith('`') && token.endsWith('`')) return <code key={key} className='rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] dark:bg-dark-3'>{token.slice(1, -1)}</code>
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const [, label, href] = link
      if (href.startsWith('/') || /^https?:\/\//i.test(href)) {
        return <a key={key} href={href} className='text-primary underline underline-offset-2'>{label}</a>
      }
      return label
    }
    return token
  })
}

/** Small, dependency-free renderer for the controlled Markdown demo bundle. */
export default function DemoMarkdown({ markdown = '', title, cover }) {
  const sourceLines = String(markdown).replace(/\r/g, '').split('\n')
  const firstHeading = sourceLines.findIndex(line => /^#\s+/.test(line))
  if (firstHeading >= 0) {
    sourceLines.splice(firstHeading, 1)
  }

  const blocks = []
  let index = 0
  while (index < sourceLines.length) {
    const line = sourceLines[index].trim()
    if (!line) { index++; continue }
    if (/^#{2,4}\s+/.test(line)) {
      const level = Math.min(line.match(/^#+/)[0].length, 4)
      const Heading = `h${level}`
      blocks.push(<Heading key={`heading-${index}`} className='mb-4 mt-10 text-2xl font-semibold tracking-tight text-dark dark:text-white'>{renderInline(line.replace(/^#{2,4}\s+/, ''), `heading-${index}`)}</Heading>)
      index++
      continue
    }
    if (/^>\s?/.test(line)) {
      blocks.push(<blockquote key={`quote-${index}`} className='my-6 border-l-4 border-cyan-400 pl-5 text-slate-600 dark:text-dark-6'>{renderInline(line.replace(/^>\s?/, ''), `quote-${index}`)}</blockquote>)
      index++
      continue
    }
    if (/^(?:[-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\d+\./.test(line)
      const items = []
      while (index < sourceLines.length && /^(?:\s*)(?:[-*]|\d+\.)\s+/.test(sourceLines[index].trim())) {
        items.push(sourceLines[index].trim().replace(/^(?:[-*]|\d+\.)\s+/, ''))
        index++
      }
      const List = ordered ? 'ol' : 'ul'
      blocks.push(<List key={`list-${index}`} className={`my-5 space-y-2 pl-6 leading-7 text-slate-700 dark:text-dark-6 ${ordered ? 'list-decimal' : 'list-disc'}`}>{items.map((item, itemIndex) => <li key={`item-${itemIndex}`}>{renderInline(item, `item-${index}-${itemIndex}`)}</li>)}</List>)
      continue
    }

    const paragraphs = [line]
    index++
    while (index < sourceLines.length && sourceLines[index].trim() && !/^(?:#{2,4}\s+|>|(?:[-*]|\d+\.)\s+)/.test(sourceLines[index].trim())) {
      paragraphs.push(sourceLines[index].trim())
      index++
    }
    blocks.push(<p key={`paragraph-${index}`} className='my-5 text-base leading-8 text-slate-700 dark:text-dark-6'>{renderInline(paragraphs.join(' '), `paragraph-${index}`)}</p>)
  }

  return (
    <article className='mx-auto max-w-4xl px-4 py-10 sm:py-14'>
      <div className='mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'>演示资料｜姓名、公司、项目、经历、日期与指标均为虚构示例，不代表真实履历或业绩。</div>
      {cover && <LazyImage src={cover} alt={`${title || '演示内容'}配图`} className='mb-8 max-h-[460px] w-full rounded-2xl border border-slate-200 object-cover dark:border-dark-3' />}
      <div className='demo-markdown-content'>{blocks}</div>
    </article>
  )
}
