import 'fastify'
import { Model } from 'objection'

declare module 'fastify' {
  interface FastifyInstance {
    dbModels: {
      [key: string]: typeof Model
    }
  }
}
