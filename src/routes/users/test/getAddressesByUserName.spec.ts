import fastifyModule from 'fastify'
import 'fastify-swagger' // Importing Swagger here so we have the correct types installed
import chai, { expect } from 'chai'
import chaiString from 'chai-string'
import sinon from 'sinon'

import getMockedObjectionsDbModel from '@src/test/getMockedObjectionsDbModel'

import { addRoute } from '../getAddressesByUserName'

chai.use(chaiString)


describe('Route GET /api/users/:username/addresses', () => {
  let fastifyServer
  let userModelFindOneResolves

  beforeEach(() => {
    const UserModel = sinon.stub(getMockedObjectionsDbModel())
    UserModel.query.returnsThis()
    UserModel.withGraphFetched.returnsThis()
    UserModel.modifiers.returnsThis()
    UserModel.findOne = () => Promise.resolve(userModelFindOneResolves)

    const fastify = fastifyModule()
    fastify.dbModels = {
      UserModel,
    }

    fastifyServer = addRoute(fastify)
  })

  afterEach(() => {
    userModelFindOneResolves = undefined
    fastifyServer.close()
  })


  describe('Validate `username`', () => {
    it('Should throw when called with invalid `username`', async () => {
      const username = '--invalid user name--'
      const response = await fastifyServer.inject({
        method: 'GET',
        url: `/api/users/${username}/addresses`,
      })

      const body = response.json()

      expect(response.statusCode).to.equal(400)
      expect(body.message).to.be.a('string')
      expect(body.message).to.startsWith('params.username')
    })


    it('Should throw when called with `username` that does not exist in DB', async () => {
      const username = 'TestUser'
      const response = await fastifyServer.inject({
        method: 'GET',
        url: `/api/users/${username}/addresses`,
      })

      const body = response.json()

      expect(response.statusCode).to.equal(404)
      expect(body.id).to.be.a('string')

      expect(body.code).to.be.a('string')
      expect(body.code).to.equal('USER_NAME_NOT_FOUND')

      expect(body.message).to.be.a('string')
      expect(body.message).to.includes(username)
    })
  })


  describe('Validate User addresses', () => {
    it('Should return empty list of User addresses when user has no saved addresses in DB', async () => {
      const username = 'TestUser'
      userModelFindOneResolves = {
        id: '155e0134-dbcf-4e65-acc4-fd32050c4c72',
        username,
        addresses: [],
      }
      const response = await fastifyServer.inject({
        method: 'GET',
        url: `/api/users/${username}/addresses`,
      })

      const body = response.json()

      expect(response.statusCode).to.equal(200)
      expect(body).to.be.an('array')
      expect(body).to.deep.equal([])
    })


    it('Should return User addresses when when user has some addresses saved in DB', async () => {
      const username = 'TestUser'
      userModelFindOneResolves = {
        id: '155e0134-dbcf-4e65-acc4-fd32050c4c72',
        username,
        addresses: [{
          id: 'e1cf299c-38c5-48bc-98d7-0dae4af2d919',
          zip: '120001',
          createdAt: '2021-06-16T09:45:00.000Z',
        }, {
          id: 'f1cf0d51-8c13-4eec-b13f-b06958e9f0fa',
          zip: '120002',
          createdAt: '2021-06-16T09:45:00.000Z',
        }],
      }
      const response = await fastifyServer.inject({
        method: 'GET',
        url: `/api/users/${username}/addresses`,
      })

      const body = response.json()

      expect(response.statusCode).to.equal(200)
      expect(body).to.be.an('array')
      expect(body).to.deep.equal(userModelFindOneResolves.addresses.map(({ id, zip }) => ({ id, zip })))
    })
  })
})
