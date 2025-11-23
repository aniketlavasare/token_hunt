import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6fuVjXrGN0yQ@ep-lingering-queen-ahg1n35x-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.POSTGRES_URL = DATABASE_URL;

// Initialize database tables on first request
let dbInitialized = false;

async function ensureTablesExist() {
  if (dbInitialized) return;

  try {
    // Create hunts table first
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

    dbInitialized = true;
    console.log('✅ Hunts and rewards tables ready with CASCADE delete');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

// GET - Fetch all hunts
export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist();

    const result = await sql`
      SELECT 
        hunt_id as "huntId",
        lat,
        lng,
        radius_meters as "radiusMeters",
        reward_token as "rewardToken",
        reward_amount as "rewardAmount",
        max_claims as "maxClaims",
        campaign_name as "campaignName",
        description,
        sponsor_wallet as "sponsorWallet",
        claimed_count as "claimedCount",
        created_at as "createdAt"
      FROM hunts
      ORDER BY created_at DESC
    `;

    // Convert numeric values from strings
    const hunts = result.rows.map(hunt => ({
      ...hunt,
      lat: parseFloat(hunt.lat as string),
      lng: parseFloat(hunt.lng as string),
      radiusMeters: parseInt(hunt.radiusMeters as string),
      rewardAmount: parseFloat(hunt.rewardAmount as string),
      maxClaims: parseInt(hunt.maxClaims as string),
      claimedCount: parseInt(hunt.claimedCount as string),
    }));

    console.log(`📦 Fetched ${hunts.length} hunts from database`);
    return NextResponse.json({ hunts });
  } catch (error) {
    console.error('Error fetching hunts:', error);
    return NextResponse.json({ hunts: [], error: 'Failed to fetch hunts' }, { status: 500 });
  }
}

// POST - Create a new hunt
export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist();

    const hunt = await req.json();

    await sql`
      INSERT INTO hunts (
        hunt_id, lat, lng, radius_meters, reward_token, reward_amount,
        max_claims, campaign_name, description, sponsor_wallet, 
        claimed_count, created_at
      ) VALUES (
        ${hunt.huntId},
        ${hunt.lat},
        ${hunt.lng},
        ${hunt.radiusMeters},
        ${hunt.rewardToken || 'WLD'},
        ${hunt.rewardAmount},
        ${hunt.maxClaims},
        ${hunt.campaignName},
        ${hunt.description || null},
        ${hunt.sponsorWallet},
        ${hunt.claimedCount || 0},
        ${hunt.createdAt}
      )
    `;

    console.log(`✅ Hunt created in database: ${hunt.huntId}`);
    return NextResponse.json({ success: true, huntId: hunt.huntId });
  } catch (error) {
    console.error('Error creating hunt:', error);
    return NextResponse.json({ success: false, error: 'Failed to create hunt' }, { status: 500 });
  }
}

// DELETE - Clear all hunts (and associated rewards via CASCADE)
export async function DELETE(req: NextRequest) {
  try {
    await ensureTablesExist();

    // Get count before deletion
    const rewardsCount = await sql`SELECT COUNT(*) as count FROM rewards`;
    const huntsCount = await sql`SELECT COUNT(*) as count FROM hunts`;
    
    // Delete all hunts (CASCADE will automatically delete associated rewards)
    const result = await sql`DELETE FROM hunts`;

    console.log(`🗑️ Cleared ${huntsCount.rows[0].count} hunts and ${rewardsCount.rows[0].count} rewards from database`);
    return NextResponse.json({ 
      success: true,
      deletedHunts: parseInt(huntsCount.rows[0].count as string),
      deletedRewards: parseInt(rewardsCount.rows[0].count as string)
    });
  } catch (error) {
    console.error('Error clearing hunts:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear hunts' }, { status: 500 });
  }
}
