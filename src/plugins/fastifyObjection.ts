/**
 * `pg` module experience difficulties using BigInt values:
 * https://github.com/knex/knex/issues/387#issuecomment-51554522
 * https://github.com/sequelize/sequelize/issues/1774#issuecomment-44318978
 * so we need to set custom parsers for all "out of range" values
 * otherwise the values will be converted to {String}
 */
import pg from 'pg'

/**
 * List of all codes can be found here:
 * https://github.com/brianc/node-pg-types/blob/master/lib/builtins.js#L12
 */
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number.parseInt(value, 10))
pg.types.setTypeParser(pg.types.builtins.INT2, (value) => Number.parseInt(value, 10))
pg.types.setTypeParser(pg.types.builtins.INT4, (value) => Number.parseInt(value, 10))
pg.types.setTypeParser(pg.types.builtins.FLOAT4, Number.parseFloat)
pg.types.setTypeParser(pg.types.builtins.FLOAT8, Number.parseFloat)
pg.types.setTypeParser(pg.types.builtins.NUMERIC, Number.parseFloat)
pg.types.setTypeParser(pg.types.builtins.OID, (value) => value)

import fs from 'fs'
import path from 'path'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import fastifyObjection from 'fastify-objectionjs'

import { FromSchema } from 'json-schema-to-ts'
import { envVarSchema, envConfigKey } from '@src/plugins/fastifyEnv'


/* Make sure that all DB Models in folder `basePath` are available as `fastify.dbModels.{DB Model file name}` */
const dbModels = {}

const basePath = path.join(__dirname, '../dbModels')
fs.readdirSync(basePath, { withFileTypes: true }).forEach((itemPath) => {
  const { name } = itemPath
  /* Ignore test files and folders */
  if (name === 'test' || name.includes('.spec.') || name.includes('.test.')) {
    return
  }

  const dbModelPath = path.join(basePath, name)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: dbModel } = require(dbModelPath)
  const dbModelName = name.split('.')[0]
  dbModels[dbModelName] = dbModel
})


const plugin = fastifyPlugin(async (
  fastify: FastifyInstance,
  options,
  done: () => void,
) => {
  const {
    DB_URL,
    DB_CONNECTION_POOL_MIN,
    DB_CONNECTION_POOL_MAX,
    DB_LOGGING,
  } = (fastify as unknown as { [envConfigKey]: FromSchema<typeof envVarSchema> })[envConfigKey]

  await fastify.register(
    fastifyObjection, {
      knexConfig: {
        client: 'pg',
        connection: DB_URL,
        pool: {
          min: DB_CONNECTION_POOL_MIN,
          max: DB_CONNECTION_POOL_MAX,
        },
        debug: DB_LOGGING,
      },
    })

  fastify.decorate('dbModels', dbModels)

  done()
})

export default plugin
