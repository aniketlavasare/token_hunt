import { NextRequest, NextResponse } from 'next/server'
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload
}

export async function POST(req: NextRequest) {
  try {
    const { payload } = (await req.json()) as IRequestPayload
    
    console.log('💰 Confirming payment:', payload);

    // For hackathon: simplified verification
    // In production: fetch reference from database and do full validation
    
    const reference = payload.reference;
    
    if (!reference) {
      console.error('No reference provided');
      return NextResponse.json({ success: false, error: 'No reference' }, { status: 400 });
    }

    // Verify transaction with Worldcoin API
    const apiUrl = `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=app_fe620d4e7852aa0594383b4398935191`;
    console.log('🔍 Calling Worldcoin API:', apiUrl);
    console.log('🔑 Using APP_ID:', process.env.APP_ID);
    console.log('🔑 API Key present:', !!process.env.DEV_PORTAL_API_KEY);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer api_a2V5X2EwNGQ2OTFiYzhhODVhZjA0ZjczMWEwMDIzODFiZTA2OnNrX2NlMjc5YTU4Yzc1YTA3N2U3NWMyYWIwMDM1MzBlOWQxYTM1MDQwMWYxOTM3YmMxMQ',
      },
    });

    console.log('📡 Worldcoin API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Worldcoin API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Parsed Error JSON:', errorJson);
      } catch (e) {
        console.error('❌ Could not parse error as JSON');
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Verification failed',
        details: errorText,
        status: response.status 
      }, { status: 500 });
    }

    const transaction = await response.json();
    console.log('✅ Transaction verification response:', transaction);

    // Optimistically confirm the transaction
    // Check that reference matches and transaction didn't fail
    if (transaction.reference === reference && transaction.status !== 'failed') {
      console.log('✅ Payment confirmed successfully!');
      return NextResponse.json({ success: true, transaction });
    } else {
      console.error('Payment verification failed:', transaction);
      return NextResponse.json({ 
        success: false, 
        error: 'Payment verification failed',
        transaction 
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to confirm payment' 
    }, { status: 500 });
  }
}

