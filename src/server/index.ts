import Fastify from 'fastify'
import middie from '@fastify/middie'
import serverRoutePlugin from './plugins/server-render-route/plugin'

export const start = async ({ logger, middlewares, port }: any) => {
  const fastify = Fastify()

  await fastify.register(middie)
  await fastify.register(serverRoutePlugin, { logger })

  fastify.use(middlewares)

  await fastify.listen({ port })

  return fastify
}
