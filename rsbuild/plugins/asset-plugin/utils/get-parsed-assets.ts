import { JsStatsChunkGroupAsset } from '@rspack/binding'

type AppManifestFile = {
  path: string
}
export type AppManifest = {
  css: AppManifestFile[]
  js: AppManifestFile[]
}

const domain = ''

export const getParsedAssets = (assets: JsStatsChunkGroupAsset[]) => {
  return assets.reduce<AppManifest>(
    (acc, asset) => {
      const path = `${domain}${asset.name}`
      if (asset.name.includes('css')) {
        acc.css.push({
          path,
        })
      }
      if (asset.name.includes('js')) {
        acc.js.push({
          path,
        })
      }

      return acc
    },
    {
      css: [],
      js: [],
    }
  )
}
