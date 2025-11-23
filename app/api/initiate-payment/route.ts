import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for payment references (for hackathon/demo)
// In production, use a database
const paymentReferences = new Map<string, { amount: string; timestamp: number }>();

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    
    const uuid = crypto.randomUUID().replace(/-/g, '');
    
    // Store reference with amount and timestamp
    paymentReferences.set(uuid, {
      amount,
      timestamp: Date.now()
    });
    
    console.log(`💳 Payment initiated - Reference: ${uuid}, Amount: ${amount} WLD`);
    
    return NextResponse.json({ id: uuid });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}

// Helper function to get reference (for confirm-payment)
export function getPaymentReference(id: string) {
  return paymentReferences.get(id);
}

// Helper function to delete used reference
export function deletePaymentReference(id: string) {
  paymentReferences.delete(id);
}

