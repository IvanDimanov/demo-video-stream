import BaseModel from './Base'
import { FromSchema } from 'json-schema-to-ts'

import AddressModel from './AddressModel'


export const schema = {
  description: `\`UserModel\` is the base of all actors for our system.`,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Unique User ID',
      example: 'd628c599-6282-4e35-b05b-4a6990e678fa',
    },
    username: {
      type: 'string',
      description: 'Short UI description of the User. Must be unique for all users.',
      example: 'JohnDoe',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      readOnly: true,
      description: 'DateTime indicating when that User was created',
      example: '2020-04-30T00:00:00.000Z',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      readOnly: true,
      description: 'DateTime indicating when that User was lastly updated',
      example: '2020-05-10T00:00:00.000Z',
    },
  },
} as const

/**
 * https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
 */
interface UserModel extends FromSchema<typeof schema> {}

/**
 * User DB Entity
 */
class UserModel extends BaseModel {
  static tableName = 'user'

  id!: string
  username!: string
  addresses!: AddressModel[]

  static relationMappings = {
    addresses: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'AddressModel',
      join: {
        from: 'user.id',
        to: 'address.userId',
      },
    },
  }
}


export default UserModel
