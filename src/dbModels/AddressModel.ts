import BaseModel from './Base'
import { FromSchema } from 'json-schema-to-ts'

import UserModel from './UserModel'

export const schema = {
  description: `\`AddressModel\` is used to determine geo location of a User.`,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Unique Address ID',
      example: 'd628c599-6282-4e35-b05b-4a6990e678fa',
    },
    userId: {
      type: 'string',
      format: 'uuid',
      description: 'Unique User ID who is related to this Address',
      example: 'd628c599-6282-4e35-b05b-4a6990e678fa',
    },
    status: {
      type: 'string',
      description: 'Is this Address currently used by the related User.',
      enum: ['active', 'inactive'],
      default: 'active',
    },
    zip: {
      type: 'string',
      description: 'A ZIP Code is a postal code used by the United States Postal Service.',
      example: '120001',
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
interface AddressModel extends FromSchema<typeof schema> {}

/**
 * User DB Entity
 */
class AddressModel extends BaseModel {
  static tableName = 'address'

  id!: string
  userId!: string
  type!: 'active' | 'inactive'
  zip!: string
  user!: UserModel

  static relationMappings = {
    users: {
      relation: BaseModel.HasOneRelation,
      modelClass: 'UserModel',
      join: {
        from: 'address.userId',
        to: 'user.id',
      },
    },
  }
}


export default AddressModel
