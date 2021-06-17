/**
 * Clear the DB before re-seeding
 * @param {Knex} knex DB connection instance
 * @return {undefined}
 */
async function seed(knex) {
  const tables = await knex('pg_tables')
    .select('tablename')
    .where('schemaname', 'public')

  const excludedTables = ['migrations', 'migrations_lock']

  const filteredTables = tables.filter(({ tablename }) => !excludedTables.includes(tablename))

  const tableQuery = filteredTables.map(({ tablename }) => `"${tablename}"`).join(', ')

  if (tableQuery.length) {
    const truncateQuery = `TRUNCATE TABLE ${tableQuery} CASCADE`

    await knex.raw(truncateQuery)
  }
}

module.exports = { seed }
