exports.up = async (knex) => {
  const tableAlreadyExists = await knex.schema.hasTable('user')
  if (tableAlreadyExists) {
    return
  }

  await knex.schema
    .createTable('user', (table) => {
      table
        .uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))

      table
        .string('username')
        .notNullable()
        .unique()

      table
        .timestamps(true, true)
    })
}


exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('user')
}
