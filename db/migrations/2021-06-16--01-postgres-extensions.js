exports.up = async (knex) => {
  /* Used for `knex.raw('uuid_generate_v4()')` */
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
}


exports.down = async (knex) => {
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"')
}
