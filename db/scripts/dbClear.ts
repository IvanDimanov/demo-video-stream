import knexModule from 'knex'

const knex = knexModule({
  client: 'pg',
  connection: process.env.DB_URL,
  migrations: {
    directory: './db/migrations',
    tableName: 'migrations',
  },
  seeds: {
    directory: './db/seed',
  },
  debug: process.env.DB_LOGGING === 'true',
})

;(async () => {
  /* Delete main tables to prevent deadlock */
  // await knex.raw('DROP TABLE IF EXISTS "user" CASCADE')
  // await knex.raw('DROP TABLE IF EXISTS "store" CASCADE')
  // await knex.raw('DROP TABLE IF EXISTS "collection" CASCADE')
  // await knex.raw('DROP TABLE IF EXISTS "shipment" CASCADE')


  /* Get the names of all Tables */
  const tableNames = await knex('pg_tables').where({ schemaname: 'public' })

  /* Drop tables in sequence to prevent deadlock */
  // eslint-disable-next-line no-restricted-syntax
  for (const { tablename } of tableNames) {
    // eslint-disable-next-line no-await-in-loop
    await knex.raw(`DROP TABLE IF EXISTS "${tablename}" CASCADE`)
  }


  /* Delete all enums */
  const enumNames = await knex
    .select('pg_type.typname as enumName')
    .from('pg_type')
    .join('pg_enum', function join() {
      this.on('pg_enum.enumtypid', '=', 'pg_type.oid')
    })
    .join('pg_catalog.pg_namespace', function join() {
      this.on('pg_catalog.pg_namespace.oid', '=', 'pg_type.typnamespace')
    })
    .groupBy('pg_type.typname')
    .limit(1000)

  await Promise.all(enumNames.map(({ enumName }) => knex.raw(`DROP TYPE ${enumName}`)))
})()

.catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
})

.finally(async() => {
  await knex.destroy()
  process.exit()
})
