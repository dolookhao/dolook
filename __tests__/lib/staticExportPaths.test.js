jest.mock('@/lib/utils/buildMode', () => ({ isExport: jest.fn() }))

import { isExport } from '@/lib/utils/buildMode'
import { getStaticPathsForBuild } from '@/lib/build/staticExportPaths'

describe('static-export route paths', () => {
  it('omits request-driven dynamic routes from static exports', () => {
    isExport.mockReturnValue(true)

    expect(getStaticPathsForBuild([{ params: { keyword: 'NotionNext' } }], true)).toEqual({
      paths: [],
      fallback: false
    })
  })

  it('keeps the route behavior for non-export hosting', () => {
    const paths = [{ params: { keyword: 'example' } }]
    isExport.mockReturnValue(false)

    expect(getStaticPathsForBuild(paths, 'blocking')).toEqual({ paths, fallback: 'blocking' })
  })
})
