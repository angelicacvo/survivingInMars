// Database configuration: PostgreSQL with auto-SSL for Supabase/RDS

import { Sequelize } from "sequelize"
import 'dotenv/config'

// Load database connection parameters from environment variables
const DB_NAME = process.env.DB_NAME || 'postgres'
const DB_USER = process.env.DB_USER || 'postgres'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = Number(process.env.DB_PORT) || 5432

// Auto-detect if SSL should be used based on host or explicit configuration
const useSsl = process.env.DB_SSL === 'true' || DB_HOST.includes('supabase') || DB_HOST.includes('rds')

/**
 * Sequelize instance configured for PostgreSQL
 * Used by all models to connect to the database
 */

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'postgres',
        logging: false,
        ...(useSsl
            ? {
                    dialectOptions: {
                        ssl: {
                            require: true,
                            // Allow self-signed / managed certs (common in cloud providers)
                            rejectUnauthorized: false,
                        },
                    },
                }
            : {}),
})