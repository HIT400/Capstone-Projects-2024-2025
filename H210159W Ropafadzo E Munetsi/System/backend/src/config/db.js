import pkg from "pg";
import dotenv from "dotenv";
const {Pool} = pkg;
dotenv.config()

const pool = new Pool ({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000, // Only defined once
    statement_timeout: 60000,
    query_timeout: 60000
});

pool.on("connect", () => {
    console.log("Connection pool established with Database")
});

export default pool;