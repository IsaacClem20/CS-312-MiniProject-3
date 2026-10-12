// loads the .env settings
require('dotenv').config();
// connects to PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});
// allows other files to use the database connection
module.exports = pool;