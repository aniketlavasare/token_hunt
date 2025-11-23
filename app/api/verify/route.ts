import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, IVerifyResponse, ISuccessResult } from '@worldcoin/minikit-js'


interface IRequestPayload {
	payload: ISuccessResult
	action: string
	signal: string | undefined
}

export async function POST(req: NextRequest) {
	const { payload, action, signal } = (await req.json()) as IRequestPayload
	console.log('Received verification request:', { action, signal, payload })
	
	const app_id = 'app_fe620d4e7852aa0594383b4398935191' as `app_${string}`
	console.log('Using APP_ID:', app_id)
	
	const verifyRes = (await verifyCloudProof(payload, app_id, action, signal)) as IVerifyResponse
	console.log('World ID Verification Result:', verifyRes)

	if (verifyRes.success) {
		// This is where you should perform backend actions if the verification succeeds
		// Such as, setting a user as "verified" in a database
		console.log('✅ Verification successful!')
		return NextResponse.json({ verifyRes, status: 200 })
	} else {
		// This is where you should handle errors from the World ID /verify endpoint.
		// Usually these errors are due to a user having already verified.
		console.log('❌ Verification failed:', verifyRes)
		return NextResponse.json({ verifyRes, status: 400 })
	}
}

