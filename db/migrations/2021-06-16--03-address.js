exports.up = async (knex) => {
  const tableAlreadyExists = await knex.schema.hasTable('address')
  if (tableAlreadyExists) {
    return
  }

  await knex.schema
    .createTable('address', (table) => {
      table
        .uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))

      table
        .uuid('user_id')
        .notNullable()
      table
        .foreign('user_id')
        .references('id')
        .inTable('user')

      table
        .enu(
          'status',
          [
            'active',
            'inactive',
          ],
          {
            useNative: true,
            enumName: 'address_status_type',
          })
        .notNullable()
        .defaultTo('active')

      table
        .string('zip')
        .notNullable()

      table
        .timestamps(true, true)
    })
}


exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('address')
  await knex.raw('DROP TYPE address_status_type')
}
