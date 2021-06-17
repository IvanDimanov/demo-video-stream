import { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'


const getStatusHealthResponseSchema = {
  type: 'object',
  properties: {
    serverTime: {
      type: 'string',
      format: 'date-time',
      description: 'Server ISO time',
      example: '2019-09-24T17:43:21.142Z',
    },
  },
  required: ['serverTime'],
  additionalProperties: false,
} as const


const routeOptions: RouteShorthandOptions = {
  schema: {
    summary: 'Health check',
    description: 'Common ping test to check if server is still alive.',
    tags: ['Status'],

    response: {
      200: getStatusHealthResponseSchema,
    },
  },
}


export const addRoute = (fastify: FastifyInstance): FastifyInstance => {
  fastify.get(
    '/api/status/health',
    routeOptions,
    async (): Promise<FromSchema<typeof getStatusHealthResponseSchema>> => ({
      serverTime: new Date().toISOString(),
    })
  )

  return fastify
}
