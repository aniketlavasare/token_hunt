import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6fuVjXrGN0yQ@ep-lingering-queen-ahg1n35x-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.POSTGRES_URL = DATABASE_URL;

// Initialize database tables on first request
let dbInitialized = false;

async function ensureTablesExist() {
  if (dbInitialized) return;

  try {
    // Ensure hunts table exists first
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

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_rewards_hunt_id ON rewards(hunt_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rewards_claimed ON rewards(claimed)`;

    dbInitialized = true;
    console.log('✅ Rewards table ready');
  } catch (error) {
    console.error('❌ Error creating rewards table:', error);
  }
}

// GET - Fetch all rewards
export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist();

    const result = await sql`
      SELECT 
        reward_id as "rewardId",
        hunt_id as "huntId",
        lat,
        lng,
        amount,
        claimed,
        created_at as "createdAt"
      FROM rewards
      ORDER BY created_at DESC
    `;

    // Convert numeric values from strings
    const rewards = result.rows.map(reward => ({
      ...reward,
      lat: parseFloat(reward.lat as string),
      lng: parseFloat(reward.lng as string),
      amount: parseFloat(reward.amount as string),
    }));

    console.log(`🪙 Fetched ${rewards.length} rewards from database`);
    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json({ rewards: [], error: 'Failed to fetch rewards' }, { status: 500 });
  }
}

// POST - Save rewards (batch insert)
export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist();

    const { rewards } = await req.json();

    if (!Array.isArray(rewards) || rewards.length === 0) {
      return NextResponse.json({ success: true, message: 'No rewards to save' });
    }

    // Batch insert rewards
    for (const reward of rewards) {
      await sql`
        INSERT INTO rewards (
          reward_id, hunt_id, lat, lng, amount, claimed, created_at
        ) VALUES (
          ${reward.rewardId},
          ${reward.huntId},
          ${reward.lat},
          ${reward.lng},
          ${reward.amount},
          ${reward.claimed || false},
          ${reward.createdAt}
        )
        ON CONFLICT (reward_id) DO NOTHING
      `;
    }

    console.log(`💾 Saved ${rewards.length} rewards to database`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving rewards:', error);
    return NextResponse.json({ success: false, error: 'Failed to save rewards' }, { status: 500 });
  }
}

// DELETE - Clear all rewards
export async function DELETE(req: NextRequest) {
  try {
    await ensureTablesExist();

    const result = await sql`DELETE FROM rewards`;

    console.log(`🗑️ Cleared all rewards from database (${result.rowCount} rows)`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing rewards:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear rewards' }, { status: 500 });
  }
}
