import { isExport } from '@/lib/utils/buildMode'

/** Resolve dynamic route behavior without shipping placeholder paths in exports. */
export function getStaticPathsForBuild(paths, runtimeFallback) {
  if (isExport()) return { paths: [], fallback: false }
  return { paths, fallback: runtimeFallback }
}
