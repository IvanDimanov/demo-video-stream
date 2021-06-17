import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import fastifySwagger from 'fastify-swagger'

import { FromSchema } from 'json-schema-to-ts'
import { envVarSchema, envConfigKey } from '@src/plugins/fastifyEnv'


const plugin = fastifyPlugin(async (
  fastify: FastifyInstance,
  options,
  done: () => void,
) => {
  const {
    ENABLE_SWAGGER,
    SWAGGER_HOST,
    SWAGGER_DEFAULT_SCHEME,
  } = (fastify as unknown as { [envConfigKey]: FromSchema<typeof envVarSchema> })[envConfigKey]

  if (ENABLE_SWAGGER) {
    await fastify.register(
      fastifySwagger,
      {
        exposeRoute: true,
        routePrefix: '/swagger',
        swagger: {
          info: {
            title: 'Video stream',
            description: 'Demo app for video streaming',
            version: '1.0.0',
          },
          host: SWAGGER_HOST,
          schemes: SWAGGER_DEFAULT_SCHEME === 'HTTP' ? ['HTTP', 'HTTPS'] : ['HTTPS', 'HTTP'],
          consumes: ['application/json5', 'application/json'],
          produces: ['application/json'],
          tags: [
            {
              name: 'Status',
              description: 'APIs used to check server health, connection, and availability',
            },
            {
              name: 'Static',
              description: 'Returns a static HTML file used as FrontEnd for our BackEnd APIs',
            },
            {
              name: 'Stream',
              description: 'APIs used for video streaming',
            },
            {
              name: 'User',
              description: 'APIs related to User and Address DB entities',
            },
          ],
        },
      },
    )
  }

  done()
})


export default plugin
