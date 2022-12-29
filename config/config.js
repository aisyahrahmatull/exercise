require('dotenv').config()
const { DB_USER ,
    DB_PASS ,
    DB_NAME ,
    DB_HOST,
    DB_PORT} = process.env
const config = {
    development: {
        username: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
    },
    test: {
        username: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
    },
    production: {
        username: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
    },
}

module.exports = config