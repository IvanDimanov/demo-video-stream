import { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'
import { v4 as uuidV4 } from 'uuid'

import UserModel from '@src/dbModels/UserModel'
import AddressModel from '@src/dbModels/AddressModel'


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


const bodySchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      zip: {
        type: 'string',
        description: 'Address ZIP code',
        pattern: '^[0-9a-zA-Z-]{3,50}$',
        example: '120001',
      },
    },
    required: ['zip'],
    additionalProperties: false,
  },
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
        example: '120001',
      },
    },
    required: ['id', 'zip'],
    additionalProperties: false,
  },
  additionalProperties: false,
} as const


const routeOptions: RouteShorthandOptions = {
  schema: {
    summary: 'Set User Addresses',
    description: 'Saves a list of new User Addresses while deactivating no longer used Addresses',
    tags: ['User'],

    params: paramsSchema,
    body: bodySchema,

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
  fastify.post<{
    Params: FromSchema<typeof paramsSchema>,
    Body: FromSchema<typeof bodySchema>,
  }>(
    '/api/users/:username/addresses',
    routeOptions,
    async ({ params, body }, reply): Promise<FromSchema<typeof responseSchema> | undefined> => {
      const { username } = params

      const user = await fastify.dbModels.UserModel
        .query()
        .withGraphFetched('[addresses]')
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


      /* Make sure we use unique list of ZIP codes */
      const requestedZipCodes = body
        .map(({ zip }) => zip)
        .filter((zip, index, zips) => zips.indexOf(zip) === index)


      /**
       * If User requests new ZIP codes
       * we'll create them as `active` Address DB entities
       */
      const existingZipCodes = user.addresses.map(({ zip }) => zip)
      const newZipCodes = requestedZipCodes.filter((zip) => !existingZipCodes.includes(zip))

      if (newZipCodes.length) {
        await (fastify.dbModels.AddressModel as typeof AddressModel)
          .query()
          .insert(newZipCodes.map((zip) => ({
            zip,
            userId: user.id,
            status: 'active',
          })))
      }


      /**
       * We'll deactivate any Address
       * which User does not want to be related any more
       */
      const inactiveAddresses = user.addresses.filter(({ zip }) => !requestedZipCodes.includes(zip))

      if (inactiveAddresses.length) {
        await (fastify.dbModels.AddressModel as typeof AddressModel)
          .query()
          .patch({ status: 'inactive' })
          .whereIn('id', inactiveAddresses.map(({ id }) => id))
      }


      /**
       * Check if User wants to use a ZIP code
       * from previously deactivated address
       */
      const reactivatedAddresses = user.addresses.filter(({ zip, status }) => (
        status === 'inactive' &&
        requestedZipCodes.includes(zip)
      ))

      if (reactivatedAddresses.length) {
        await (fastify.dbModels.AddressModel as typeof AddressModel)
          .query()
          .patch({ status: 'active' })
          .whereIn('id', reactivatedAddresses.map(({ id }) => id))
      }


      /* Return the latest list of updated User addresses */
      const savedAddresses = await fastify.dbModels.AddressModel
        .query()
        .where('userId', user.id)
        .where('status', 'active')
        .orderBy('createdAt', 'desc') as AddressModel[]


      return savedAddresses.map(({ id, zip }) => ({ id, zip }))
    }
  )

  return fastify
}
