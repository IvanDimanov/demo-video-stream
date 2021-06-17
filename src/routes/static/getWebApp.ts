import fs from 'fs'
import path from 'path'

import { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

import { v4 as uuidV4 } from 'uuid'

import { envVarSchema, envConfigKey } from '@src/plugins/fastifyEnv'


const routeOptions: RouteShorthandOptions = {
  schema: {
    summary: 'Get web app',
    description: 'Return static HTML that represents a demo Web app',
    tags: ['Static'],

    response: {
      404: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            description: 'Error UUIDv4',
          },
          code: {
            type: 'string',
            pattern: '^[0-9A-Z-]{100}$',
            description: 'Code that identifies this type of error',
            example: 'FILE_NOT_FOUND',
          },
          message: {
            type: 'string',
            description: 'Human readable error description',
            example: 'We cannot find Web App content files at the moment. Please try again later',
          },
        },
      },
    },
  },
}


export const addRoute = (fastify: FastifyInstance): FastifyInstance => {
  const {
    WEB_APP_FOLDER_LOCATION,
  } = (fastify as unknown as { [envConfigKey]: FromSchema<typeof envVarSchema> })[envConfigKey]

  fastify.get(
  '/app',
  routeOptions,
  async (request, reply) => {
    try {
      const filePath = path.resolve(__dirname, '../../../', WEB_APP_FOLDER_LOCATION, 'index.html')
      reply
        .code(200)
        .type('text/html')
        .send(fs.createReadStream(filePath))
    } catch (error) {
      if (error.code === 'ENOENT') {
        reply
          .code(404)
          .send({
            id: uuidV4(),
            code: 'FILE_NOT_FOUND',
            message: 'We cannot find Web App content files at the moment. Please try again later',
          })
      }

      throw error
    }
  })

  return fastify
}
