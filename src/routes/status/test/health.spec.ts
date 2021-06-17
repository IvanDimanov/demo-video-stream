import fastifyModule from 'fastify'
import 'fastify-swagger' // Importing Swagger here so we have the correct types installed
import { expect } from 'chai'

import { addRoute } from '../health'


describe('Route GET /api/status/health', () => {
  let fastifyServer

  beforeEach(() => {
    const fastify = fastifyModule()
    fastifyServer = addRoute(fastify)
  })

  afterEach(() => {
    fastifyServer.close()
  })


  it('Verify response types', async () => {
    const response = await fastifyServer.inject({
      method: 'GET',
      url: '/api/status/health',
    })

    const body = response.json()

    expect(response.statusCode).to.equal(200)
    expect(body).to.be.an('object')
    expect(body.serverTime).to.be.a('string')
  })
})
