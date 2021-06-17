const users = [
  {
    id: '00000000-1000-4000-a000-000000000001',
    username: 'JohnDoe',
  },
]

/**
 * Insert test users
 *
 * @param {Knex} knex DB connection instance
 * @return {undefined}
 */
async function seed(knex) {
  return knex('user').insert(users)
}

module.exports = { seed, users }
