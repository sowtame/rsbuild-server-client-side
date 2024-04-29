import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginAssets } from './rsbuild/plugins/asset-plugin'

export default defineConfig({
  plugins: [pluginReact(), pluginAssets()],
  source: {
    entry({ target }) {
      if (target === 'web') {
        return {
          index: './src/index',
        }
      }
      if (target === 'node') {
        return {
          index: './src/server/index',
          serverRender: './src/server/plugins/server-render-route/server-render',
        }
      }
    },
  },
  html: {
    template: './template.html',
  },
  output: {
    targets: ['web', 'node'],
  },
  tools: {
    htmlPlugin: false,
  },
  dev: {
    writeToDisk: (file) => !file.includes('.hot-update.'),
  },
})
