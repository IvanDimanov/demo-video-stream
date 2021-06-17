import { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'
import { v4 as uuidV4 } from 'uuid'

import UserModel from '@src/dbModels/UserModel'


const paramsSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      pattern: '^[0-9a-zA-Z]{1,10}$',
      description: 'Unique user name',
      example: 'JohnDoe',
    },
  },
  required: ['username'],
  additionalProperties: false,
} as const


const responseSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        description: 'Address UUIDv4',
      },
      zip: {
        type: 'string',
        description: 'Address ZIP code',
      },
    },
    required: ['id', 'zip'],
    additionalProperties: false,
  },
  additionalProperties: false,
} as const


const routeOptions: RouteShorthandOptions = {
  schema: {
    summary: 'Get User Addresses',
    description: 'Returns a list of all `active` addresses related to a user name',
    tags: ['User'],

    params: paramsSchema,

    response: {
      200: responseSchema,

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
            example: 'USER_NAME_NOT_FOUND',
          },
          message: {
            type: 'string',
            description: 'Human readable error description',
            example: 'We cannot find that user at the moment. Please try again later',
          },
        },
      },
    },
  },
}


export const addRoute = (fastify: FastifyInstance): FastifyInstance => {
  fastify.get<{
    Params: FromSchema<typeof paramsSchema>,
  }>(
    '/api/users/:username/addresses',
    routeOptions,
    async ({ params }, reply): Promise<FromSchema<typeof responseSchema> | undefined> => {
      const { username } = params

      const user = await fastify.dbModels.UserModel
        .query()
        .withGraphFetched('[addresses(selectAddresses)]')
        .modifiers({
          selectAddresses(builder) {
            builder
              .where('status', 'active')
              .orderBy('createdAt', 'desc')
          },
        })
        .findOne({ username }) as UserModel

      if (!user) {
        reply
          .code(404)
          .send({
            id: uuidV4(),
            code: 'USER_NAME_NOT_FOUND',
            message: `We cannot find user with user name = "${username}" at the moment. Please try again later`,
          })
          return
      }

      return user.addresses.map(({ id, zip }) => ({ id, zip }))
    }
  )

  return fastify
}
