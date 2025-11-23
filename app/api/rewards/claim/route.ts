import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const REWARDS_FILE = path.join(process.cwd(), 'data', 'rewards.json');

// POST - Claim a reward
export async function POST(req: NextRequest) {
  try {
    const { rewardId } = await req.json();
    
    if (!rewardId) {
      return NextResponse.json({ success: false, error: 'rewardId is required' }, { status: 400 });
    }

    // Read current rewards
    const fileContent = await readFile(REWARDS_FILE, 'utf-8');
    const rewards = JSON.parse(fileContent);

    // Find and claim the reward
    const rewardIndex = rewards.findIndex((r: any) => r.rewardId === rewardId);
    
    if (rewardIndex === -1) {
      return NextResponse.json({ success: false, error: 'Reward not found' }, { status: 404 });
    }

    if (rewards[rewardIndex].claimed) {
      return NextResponse.json({ success: false, error: 'Reward already claimed' }, { status: 400 });
    }

    // Mark as claimed
    rewards[rewardIndex].claimed = true;

    // Save back
    await writeFile(REWARDS_FILE, JSON.stringify(rewards, null, 2), 'utf-8');
    
    console.log(`🎯 Reward ${rewardId} claimed successfully`);
    
    return NextResponse.json({ success: true, reward: rewards[rewardIndex] });
  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json({ success: false, error: 'Failed to claim reward' }, { status: 500 });
  }
}

