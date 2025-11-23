import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6fuVjXrGN0yQ@ep-lingering-queen-ahg1n35x-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.POSTGRES_URL = DATABASE_URL;

/**
 * Initialize database schema
 * This endpoint creates all necessary tables and indexes
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔧 Initializing database schema...');

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
    console.log('✅ Hunts table created');

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
    console.log('✅ Rewards table created with CASCADE delete');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_rewards_hunt_id ON rewards(hunt_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rewards_claimed ON rewards(claimed)`;
    console.log('✅ Indexes created');

    // Test connection
    const testResult = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection test:', testResult.rows[0]);

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully',
      timestamp: testResult.rows[0].current_time
    });
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

