// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const config = {
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
}

module.exports = config
