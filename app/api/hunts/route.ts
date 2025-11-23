import { NextRequest, NextResponse } from 'next/server'
import { Hunt } from '@/lib/hunts'
import fs from 'fs'
import path from 'path'

// Path to store hunts (in production, use a database)
const HUNTS_FILE = path.join(process.cwd(), 'data', 'hunts.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Read all hunts from file
function readHunts(): Hunt[] {
  ensureDataDir()
  try {
    if (fs.existsSync(HUNTS_FILE)) {
      const data = fs.readFileSync(HUNTS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading hunts:', error)
  }
  return []
}

// Write hunts to file
function writeHunts(hunts: Hunt[]) {
  ensureDataDir()
  try {
    fs.writeFileSync(HUNTS_FILE, JSON.stringify(hunts, null, 2))
  } catch (error) {
    console.error('Error writing hunts:', error)
    throw error
  }
}

// GET - Fetch all hunts
export async function GET(req: NextRequest) {
  try {
    const hunts = readHunts()
    console.log(`📥 GET /api/hunts - Returning ${hunts.length} hunts`)
    return NextResponse.json({ hunts, count: hunts.length })
  } catch (error) {
    console.error('Error fetching hunts:', error)
    return NextResponse.json({ error: 'Failed to fetch hunts' }, { status: 500 })
  }
}

// POST - Create a new hunt
export async function POST(req: NextRequest) {
  try {
    const hunt: Hunt = await req.json()
    
    // Validate hunt
    if (!hunt.huntId || !hunt.lat || !hunt.lng || !hunt.sponsorWallet) {
      return NextResponse.json({ error: 'Invalid hunt data' }, { status: 400 })
    }

    const hunts = readHunts()
    hunts.push(hunt)
    writeHunts(hunts)

    console.log(`📝 POST /api/hunts - Created hunt: ${hunt.huntId} by ${hunt.sponsorWallet}`)
    return NextResponse.json({ success: true, hunt }, { status: 201 })
  } catch (error) {
    console.error('Error creating hunt:', error)
    return NextResponse.json({ error: 'Failed to create hunt' }, { status: 500 })
  }
}

// DELETE - Clear all hunts (for testing)
export async function DELETE(req: NextRequest) {
  try {
    writeHunts([])
    console.log('🗑️ DELETE /api/hunts - Cleared all hunts')
    return NextResponse.json({ success: true, message: 'All hunts cleared' })
  } catch (error) {
    console.error('Error clearing hunts:', error)
    return NextResponse.json({ error: 'Failed to clear hunts' }, { status: 500 })
  }
}

