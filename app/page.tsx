'use client'

import { useState } from "react"
import Image from "next/image"
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'
import LocationTracker from "@/components/LocationTracker"

export default function Home() {
  const [isVerified, setIsVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyPayload: VerifyCommandInput = {
    action: 'hunt',
    verification_level: VerificationLevel.Device,
  }

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      setError('MiniKit is not installed')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)
      console.log('MiniKit Verify Response:', finalPayload)
      
      if (finalPayload.status === 'error') {
        console.log('Error payload', finalPayload)
        setError('Verification failed')
        setIsVerifying(false)
        return
      }

      // Verify the proof in the backend
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: 'hunt',
        }),
      })

      const verifyResponseJson = await verifyResponse.json()
      console.log('Verification Response:', verifyResponseJson)
      
      if (verifyResponseJson.status === 200) {
        console.log('Verification success!')
        console.log('Verify Result:', verifyResponseJson.verifyRes)
        setIsVerified(true)
      } else {
        console.log('Verification failed:', verifyResponseJson)
        setError('Verification failed on server')
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError('An error occurred during verification')
    } finally {
      setIsVerifying(false)
    }
  }

  // Show verification screen if not verified
  if (!isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black rounded-lg shadow-lg max-w-md">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={150}
            height={30}
            priority
          />
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Hello there, Verify with World ID
            </h1>
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Please verify your identity to access Token Hunt
            </p>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-8 text-white dark:text-black font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : 'Verify with World ID'}
          </button>
        </main>
      </div>
    )
  }

  // Show homepage after verification
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 py-12">
        <div className="flex w-full flex-col items-center gap-6 text-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={24}
            priority
          />
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            🎯 Token Hunt
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            You have been successfully verified! Your live coordinates are being tracked.
          </p>
        </div>

        <div className="w-full">
          <LocationTracker />
        </div>

        <div className="flex w-full flex-col gap-4 text-base font-medium sm:flex-row sm:justify-center">
          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-8 text-white dark:text-black transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 sm:w-auto"
          >
            🏹 Start Hunt
          </button>
          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-8 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] sm:w-auto"
          >
            💰 View Tokens
          </button>
        </div>
      </main>
    </div>
  )
}
