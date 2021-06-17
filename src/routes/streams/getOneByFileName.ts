import fs from 'fs'
import path from 'path'

import { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

import { v4 as uuidV4 } from 'uuid'
import mimeTypesModule from 'mime-types'

import { envVarSchema, envConfigKey } from '@src/plugins/fastifyEnv'


const paramsSchema = {
  type: 'object',
  properties: {
    fileName: {
      type: 'string',
      pattern: '^[0-9a-zA-Z]{1,50}\\.[0-9a-zA-Z]{1,10}$',
      description: 'File name we want to stream from',
      example: 'video.mp4',
    },
  },
  required: ['fileName'],
  additionalProperties: false,
} as const


const headersSchema = {
  type: 'object',
  properties: {
    range: {
      type: 'string',
      pattern: '^bytes=[0-9]+-[0-9]*$',
      description: 'File name we want to stream from',
      example: 'video.mp4',
    },
  },
  additionalProperties: true,
} as const


const routeOptions: RouteShorthandOptions = {
  schema: {
    summary: 'Get stream by a "fileName"',
    description: 'Return a stream flow for based on a given "fileName"',
    tags: ['Stream'],

    params: paramsSchema,
    headers: headersSchema,

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
            example: 'We cannot find stream file "test.mp3" at the moment. Please try again later',
          },
        },
      },

      416: {
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
            example: 'OUT_OF_RANGE',
          },
          message: {
            type: 'string',
            description: 'Human readable error description',
            example: 'Requested range not satisfiable 5000 >= 4500',
          },
        },
      },
    },
  },
}


export const addRoute = (fastify: FastifyInstance): FastifyInstance => {
  const {
    STREAMS_FOLDER_LOCATION,
  } = (fastify as unknown as { [envConfigKey]: FromSchema<typeof envVarSchema> })[envConfigKey]

  fastify.get<{
    Params: FromSchema<typeof paramsSchema>,
    Headers: FromSchema<typeof headersSchema>,
  }>(
  '/api/streams/:fileName',
  routeOptions,
  async ({ params, headers }, reply) => {
    const { fileName } = params

    try {
      const filePath = path.resolve(__dirname, '../../../', STREAMS_FOLDER_LOCATION, fileName)
      const fileStats = fs.statSync(filePath)
      const fileMimeType = mimeTypesModule.lookup(filePath)

      const { range } = headers

      if (!range) {
        reply
          .code(200)
          .headers({
            'Content-Length': fileStats.size,
            'Content-Type': fileMimeType,
          })
          .send(fs.createReadStream(filePath))
          return
      }

      const rangeParts = range.replace('bytes=', '').split('-')
      const start = parseInt(rangeParts[0], 10)
      const end = rangeParts[1]
        ? parseInt(rangeParts[1], 10)
        : fileStats.size - 1

      if (start >= fileStats.size) {
        reply
          .code(416)
          .send({
            id: uuidV4(),
            code: 'OUT_OF_RANGE',
            message: `Requested range not satisfiable ${start} >= ${fileStats.size}`,
          })
        return
      }

      const chunkSize = end - start + 1
      reply
        .code(206)
        .headers({
          'Content-Range': `bytes ${start}-${end}/${fileStats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': fileMimeType,
        })
        .send(fs.createReadStream(filePath, { start, end }))
    } catch (error) {
      if (error.code === 'ENOENT') {
        reply
          .code(404)
          .send({
            id: uuidV4(),
            code: 'FILE_NOT_FOUND',
            message: `We cannot find stream file "${fileName}" at the moment. Please try again later`,
          })
      }

      throw error
    }
  })

  return fastify
}
