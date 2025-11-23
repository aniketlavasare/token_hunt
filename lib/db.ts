/**
 * Database connection and initialization
 * Using Vercel Postgres (Neon)
 */

import { sql } from '@vercel/postgres';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6fuVjXrGN0yQ@ep-lingering-queen-ahg1n35x-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Override the connection string
process.env.POSTGRES_URL = DATABASE_URL;

/**
 * Initialize database tables
 * Creates hunts and rewards tables if they don't exist
 */
export async function initDatabase() {
  try {
    // Create hunts table
    await sql`
      CREATE TABLE IF NOT EXISTS hunts (
        hunt_id VARCHAR(255) PRIMARY KEY,
        lat DECIMAL(10, 8) NOT NULL,
        lng DECIMAL(11, 8) NOT NULL,
        radius_meters INTEGER NOT NULL,
        reward_token VARCHAR(10) NOT NULL DEFAULT 'WLD',
        reward_amount DECIMAL(20, 10) NOT NULL,
        max_claims INTEGER NOT NULL,
        campaign_name VARCHAR(255) NOT NULL,
        description TEXT,
        sponsor_wallet VARCHAR(255) NOT NULL,
        claimed_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create rewards table with CASCADE delete
    await sql`
      CREATE TABLE IF NOT EXISTS rewards (
        reward_id VARCHAR(255) PRIMARY KEY,
        hunt_id VARCHAR(255) NOT NULL REFERENCES hunts(hunt_id) ON DELETE CASCADE,
        lat DECIMAL(10, 8) NOT NULL,
        lng DECIMAL(11, 8) NOT NULL,
        amount DECIMAL(20, 10) NOT NULL,
        claimed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create index on hunt_id for faster reward lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_rewards_hunt_id ON rewards(hunt_id)
    `;

    // Create index on claimed status for faster filtering
    await sql`
      CREATE INDEX IF NOT EXISTS idx_rewards_claimed ON rewards(claimed)
    `;

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
}

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

