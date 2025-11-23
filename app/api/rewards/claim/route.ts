import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6fuVjXrGN0yQ@ep-lingering-queen-ahg1n35x-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.POSTGRES_URL = DATABASE_URL;

// POST - Claim a reward
export async function POST(req: NextRequest) {
  try {
    const { rewardId } = await req.json();
    
    if (!rewardId) {
      return NextResponse.json({ success: false, error: 'rewardId is required' }, { status: 400 });
    }

    // Check if reward exists and is not already claimed
    const checkResult = await sql`
      SELECT 
        reward_id as "rewardId",
        hunt_id as "huntId",
        lat,
        lng,
        amount,
        claimed,
        created_at as "createdAt"
      FROM rewards 
      WHERE reward_id = ${rewardId}
    `;

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Reward not found' }, { status: 404 });
    }

    const reward = checkResult.rows[0];

    if (reward.claimed) {
      return NextResponse.json({ success: false, error: 'Reward already claimed' }, { status: 400 });
    }

    // Mark reward as claimed
    await sql`
      UPDATE rewards 
      SET claimed = TRUE 
      WHERE reward_id = ${rewardId}
    `;

    console.log(`🎯 Reward ${rewardId} claimed successfully`);
    
    return NextResponse.json({ 
      success: true, 
      reward: {
        ...reward,
        lat: parseFloat(reward.lat as string),
        lng: parseFloat(reward.lng as string),
        amount: parseFloat(reward.amount as string),
        claimed: true
      }
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to claim reward' 
    }, { status: 500 });
  }
}
