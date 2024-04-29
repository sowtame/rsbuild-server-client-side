import { RsbuildPlugin } from '@rsbuild/core'
import fs from 'fs'
import { getParsedAssets } from './utils/get-parsed-assets'

export * from './utils/get-parsed-assets'

const writeAssetsFile = (outputFile: string, manifest: string) => {
  try {
    fs.mkdirSync(outputFile, { recursive: true })
    fs.writeFileSync(`${outputFile}/app-manifest.json`, manifest)
  } catch (error) {
    console.log('🚀 ~ writeAssetsFile ~ error:', error)
  }
}

export const pluginAssets = (): RsbuildPlugin => ({
  name: 'sowtame:plugin-upload-dist',

  setup(api) {
    api.onDevCompileDone(({ stats }) => {
      const bothAssets = stats.toJson({ all: false, entrypoints: true, outputPath: true }).children

      const clientData = bothAssets && bothAssets[0]

      if (clientData && clientData.entrypoints) {
        const clientAssets = clientData.entrypoints['index'].assets

        writeAssetsFile(`${clientData.outputPath}/static`, JSON.stringify(getParsedAssets(clientAssets)))
      }
    })
  },
})
