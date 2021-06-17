// eslint-disable-next-line @typescript-eslint/no-var-requires
const { users } = require('./01-users')

/* Make sure that 1st test user is related to all test addresses */
const addresses = [
  {
    id: '00000000-2000-4000-a000-000000000001',
    user_id: users[0].id,
    zip: '120001',
  },
  {
    id: '00000000-2000-4000-a000-000000000002',
    user_id: users[0].id,
    zip: '120002',
  },
  {
    id: '00000000-2000-4000-a000-000000000003',
    user_id: users[0].id,
    zip: '120003',
  },
  {
    id: '00000000-2000-4000-a000-000000000004',
    user_id: users[0].id,
    zip: '120004',
  },
]

/**
 * Insert test addresses
 *
 * @param {Knex} knex DB connection instance
 * @return {undefined}
 */
async function seed(knex) {
  return knex('address').insert(addresses)
}

module.exports = { seed }
