import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const REWARDS_FILE = path.join(process.cwd(), 'data', 'rewards.json');

// GET - Fetch all rewards
export async function GET(req: NextRequest) {
  try {
    const fileContent = await readFile(REWARDS_FILE, 'utf-8');
    const rewards = JSON.parse(fileContent);
    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Error reading rewards:', error);
    return NextResponse.json({ rewards: [] });
  }
}

// POST - Save rewards (full replace)
export async function POST(req: NextRequest) {
  try {
    const { rewards } = await req.json();
    await writeFile(REWARDS_FILE, JSON.stringify(rewards, null, 2), 'utf-8');
    console.log(`💾 Saved ${rewards.length} rewards to ${REWARDS_FILE}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving rewards:', error);
    return NextResponse.json({ success: false, error: 'Failed to save rewards' }, { status: 500 });
  }
}

// DELETE - Clear all rewards
export async function DELETE(req: NextRequest) {
  try {
    await writeFile(REWARDS_FILE, JSON.stringify([], null, 2), 'utf-8');
    console.log('🗑️ Cleared all rewards');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing rewards:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear rewards' }, { status: 500 });
  }
}

