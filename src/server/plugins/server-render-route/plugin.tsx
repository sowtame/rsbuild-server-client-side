import React from 'react'
import { AppManifest } from '../../../../rsbuild/plugins/asset-plugin'
import { createRequire } from 'node:module'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const require = createRequire(import.meta.url)

const importRoute = async (req: FastifyRequest, res: FastifyReply) => {
  const HotApp = await require(`${process.cwd()}/dist/server/serverRender.js`)

  return HotApp.serverRender(req, res)
}
async function routes(fastify: FastifyInstance, { logger }) {
  fastify.get('/', async (req, res) => {
    try {
      return importRoute(req, res)
    } catch (err) {
      logger.error('ssr render error', err)
    }
  })
}

export default routes
