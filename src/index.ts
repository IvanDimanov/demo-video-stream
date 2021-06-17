import fastifyModule, { FastifyInstance } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

import pluginFastifyEnv, { envVarSchema, envConfigKey } from '@src/plugins/fastifyEnv'
import pluginFastifyHelmet from '@src/plugins/fastifyHelmet'
import pluginFastifyCors from '@src/plugins/fastifyCors'
import pluginJson5 from '@src/plugins/json5'
import pluginFastifySwagger from '@src/plugins/fastifySwagger'
import pluginFastifyObjection from '@src/plugins/fastifyObjection'

import addAllRoutes from '@src/utils/addAllRoutes'

const start = async () => {
  try {
    const fastify: FastifyInstance = fastifyModule({
      logger: true,
    })

    await fastify.register(pluginFastifyEnv)
    await fastify.register(pluginFastifyHelmet)
    await fastify.register(pluginFastifyCors)
    await fastify.register(pluginJson5)
    await fastify.register(pluginFastifySwagger)
    await fastify.register(pluginFastifyObjection)

    addAllRoutes(fastify)

    const { PORT, HOST } = (fastify as unknown as { [envConfigKey]: FromSchema<typeof envVarSchema> })[envConfigKey]
    await fastify.listen(PORT, HOST)
  } catch (error) {
    process.stderr.write(error.stack)
    process.exit(1)
  }
}

start()
