import fs from 'fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { createRsbuild, logger } from '@rsbuild/core'
import { loadConfig } from '@rsbuild/core'

const require = createRequire(import.meta.url)

let mappedSize = {}

export const startServer = (params) => {
  const remotesPath = path.join(process.cwd(), `./dist/server/index.js`)

  const importedApp = require(remotesPath)

  return importedApp.start(params)
}

const cleanSSRCache = (serverStats) => {
  const data = serverStats.toJson({
    all: false,
    assets: true,
    outputPath: true,
  })

  const assetsFiltered = data.assets.filter((asset) => !asset.name.endsWith('.map'))
  const changedBy = onUpdateServer(assetsFiltered)

  const bundles = assetsFiltered.map((asset) => path.join(data.outputPath, asset.name))

  bundles.forEach((filepath) => {
    if (require.cache[filepath]) {
      delete require.cache[filepath]
    }
  })

  return changedBy
}

const onUpdateServer = (assets) => {
  let changedBy

  const newMappedSize = assets.reduce((acc, item) => {
    acc[item.name] = item.size

    return acc
  }, {})
  if (mappedSize['serverRender.js'] !== newMappedSize['serverRender.js']) {
    changedBy = 'client'
  }
  if (mappedSize['index.js'] !== newMappedSize['index.js']) {
    changedBy = 'server'
  }

  mappedSize = newMappedSize

  return changedBy
}

async function startProdServer({ rsbuildServer }) {
  const fastify = await startServer({ logger, middlewares: rsbuildServer.middlewares, port: rsbuildServer.port })

  await rsbuildServer.afterListen()

  fastify.server.on('upgrade', rsbuildServer.onHTTPUpgrade)

  return fastify
}
async function startDevServer() {
  const { content } = await loadConfig({})

  const rsbuild = await createRsbuild({
    rsbuildConfig: content,
  })

  let fastify

  const rsbuildServer = await rsbuild.createDevServer()

  rsbuild.onDevCompileDone(async ({ stats }) => {
    const serverStats = stats.stats.filter((s) => s.compilation.name === 'Server')[0]

    const changedBy = cleanSSRCache(serverStats)

    if (changedBy === 'server') {
      if (fastify?.close) {
        await fastify.close()
      }

      fastify = await startProdServer({ rsbuildServer })
    }
  })

  return {
    close: async () => {
      await rsbuildServer.close()
      fastify?.close()
    },
  }
}

startDevServer()
