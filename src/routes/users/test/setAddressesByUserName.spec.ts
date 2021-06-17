import fastifyModule from 'fastify'
import 'fastify-swagger' // Importing Swagger here so we have the correct types installed
import chai, { expect } from 'chai'
import chaiString from 'chai-string'
import sinon from 'sinon'

import getMockedObjectionsDbModel from '@src/test/getMockedObjectionsDbModel'

import { addRoute } from '../setAddressesByUserName'

chai.use(chaiString)


describe('Route POST /api/users/:username/addresses', () => {
  let fastifyServer
  let userModelFindOneResolves
  let addressModelOrderByResolves: any = []

  beforeEach(() => {
    const UserModel = sinon.stub(getMockedObjectionsDbModel())
    UserModel.query.returnsThis()
    UserModel.withGraphFetched.returnsThis()
    UserModel.findOne = () => Promise.resolve(userModelFindOneResolves)

    const AddressModel = sinon.stub(getMockedObjectionsDbModel())
    AddressModel.query.returnsThis()
    AddressModel.patch.returnsThis()
    AddressModel.insert.returnsThis()
    AddressModel.where.returnsThis()
    AddressModel.orderBy = () => Promise.resolve(addressModelOrderByResolves)

    const fastify = fastifyModule()
    fastify.dbModels = {
      UserModel,
      AddressModel,
    }

    fastifyServer = addRoute(fastify)
  })

  afterEach(() => {
    userModelFindOneResolves = undefined
    addressModelOrderByResolves = []
    fastifyServer.close()
  })


  describe('Validate `username`', () => {
    it('Should throw when called with invalid `username`', async () => {
      const username = '--invalid user name--'
      const response = await fastifyServer.inject({
        method: 'POST',
        url: `/api/users/${username}/addresses`,
        body: [],
      })

      const body = response.json()

      expect(response.statusCode).to.equal(400)
      expect(body.message).to.be.a('string')
      expect(body.message).to.startsWith('params.username')
    })


    it('Should throw when called with `username` that does not exist in DB', async () => {
      const username = 'TestUser'
      const response = await fastifyServer.inject({
        method: 'POST',
        url: `/api/users/${username}/addresses`,
        body: [],
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


  describe('Validate request `body`', () => {
    it('Should throw when called no request `body`', async () => {
      const username = 'TestUser'
      const response = await fastifyServer.inject({
        method: 'POST',
        url: `/api/users/${username}/addresses`,
      })

      const body = response.json()

      expect(response.statusCode).to.equal(400)
      expect(body.message).to.be.a('string')
      expect(body.message).to.equal('body should be array')
    })


    it('Should throw when called invalid `body` type', async () => {
      const username = 'TestUser'
      const response = await fastifyServer.inject({
        method: 'POST',
        url: `/api/users/${username}/addresses`,
        body: 'invalid body',
      })

      const body = response.json()

      expect(response.statusCode).to.equal(415)
      expect(body.code).to.be.a('string')
      expect(body.code).to.equal('FST_ERR_CTP_INVALID_MEDIA_TYPE')
    })


    it('Should throw when request `body` is an array but have invalid array items', async () => {
      const username = 'TestUser'
      const response = await fastifyServer.inject({
        method: 'POST',
        url: `/api/users/${username}/addresses`,
        body: ['test'],
      })

      const body = response.json()

      expect(response.statusCode).to.equal(400)
      expect(body.message).to.be.a('string')
      expect(body.message).to.equal('body[0] should be object')
    })


    it('Should throw when request `body` is an array but array items have invalid props', async () => {
      const username = 'TestUser'
      const response = await fastifyServer.inject({
        method: 'POST',
        url: `/api/users/${username}/addresses`,
        body: [{
          test: 11,
        }],
      })

      const body = response.json()

      expect(response.statusCode).to.equal(400)
      expect(body.message).to.be.a('string')
      expect(body.message).to.equal(`body[0] should have required property 'zip'`)
    })
  })


  describe('Validate User addresses', () => {
    it('Should return empty list of User addresses when user sends an empty list of addresses and ' +
      'has no saved addresses in DB',
    async () => {
      const username = 'TestUser'
      userModelFindOneResolves = {
        id: '155e0134-dbcf-4e65-acc4-fd32050c4c72',
        username,
        addresses: [],
      }
      addressModelOrderByResolves = []

      const response = await fastifyServer.inject({
        method: 'POST',
        url: `/api/users/${username}/addresses`,
        body: [],
      })

      const body = response.json()

      expect(response.statusCode).to.equal(200)
      expect(body).to.be.an('array')
      expect(body).to.deep.equal([])
    })


    it('Should return empty list of User addresses when user sends an empty list of addresses and ' +
      'has some addresses saved in DB',
    async () => {
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
      addressModelOrderByResolves = []

      const response = await fastifyServer.inject({
        method: 'POST',
        url: `/api/users/${username}/addresses`,
        body: [],
      })

      const body = response.json()

      expect(response.statusCode).to.equal(200)
      expect(body).to.be.an('array')
      expect(body).to.deep.equal([])
    })


    it('Should return updated list of User addresses when user sends a list of addresses and ' +
      'has some addresses saved in DB',
    async () => {
      const username = 'TestUser'
      userModelFindOneResolves = {
        id: '155e0134-dbcf-4e65-acc4-fd32050c4c72',
        username,
        addresses: [{
          id: 'e1cf299c-38c5-48bc-98d7-0dae4af2d919',
          zip: '120001',
          createdAt: '2021-06-16T09:45:00.000Z',
        }],
      }
      addressModelOrderByResolves = [{
        id: 'e1cf299c-38c5-48bc-98d7-0dae4af2d919',
        zip: '120001',
        createdAt: '2021-06-16T09:45:00.000Z',
      }, {
        id: 'f1cf0d51-8c13-4eec-b13f-b06958e9f0fa',
        zip: '120002',
        createdAt: '2021-06-16T09:45:00.000Z',
      }]

      const response = await fastifyServer.inject({
        method: 'POST',
        url: `/api/users/${username}/addresses`,
        body: [{
          zip: '120001',
        }, {
          zip: '120002',
        }],
      })

      const body = response.json()

      expect(response.statusCode).to.equal(200)
      expect(body).to.be.an('array')
      expect(body).to.deep.equal(addressModelOrderByResolves.map(({ id, zip }) => ({ id, zip })))
    })
  })
})
