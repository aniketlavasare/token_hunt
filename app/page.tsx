'use client'

import { useState } from "react"
import Image from "next/image"
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult, MiniAppWalletAuthSuccessPayload } from '@worldcoin/minikit-js'
import LocationTracker from "@/components/LocationTracker"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [isVerified, setIsVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
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

  const signInWithWallet = async () => {
    if (!MiniKit.isInstalled()) {
      setError('MiniKit is not installed')
      return
    }

    setIsConnectingWallet(true)
    setError(null)

    try {
      // Fetch nonce from backend
      const res = await fetch(`/api/nonce`)
      const { nonce } = await res.json()
      console.log('Received nonce:', nonce)

      // Request wallet authentication
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: '0',
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: 'Sign in to Token Hunt to start your adventure!',
      })

      console.log('Wallet Auth Response:', finalPayload)

      if (finalPayload.status === 'error') {
        console.log('Wallet auth error:', finalPayload)
        setError('Wallet authentication failed')
        setIsConnectingWallet(false)
        return
      }

      // Verify SIWE message in backend
      const response = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload as MiniAppWalletAuthSuccessPayload,
          nonce,
        }),
      })

      const result = await response.json()
      console.log('SIWE Verification Result:', result)

      if (result.status === 'success' && result.isValid) {
        console.log('Wallet connected:', result.address)
        setWalletAddress(result.address)
      } else {
        setError('Wallet verification failed')
      }
    } catch (err) {
      console.error('Wallet authentication error:', err)
      setError('An error occurred during wallet authentication')
    } finally {
      setIsConnectingWallet(false)
    }
  }

  // Show verification screen if not verified
  if (!isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
        <main className="flex flex-col items-center justify-center gap-6 sm:gap-8 py-8 px-4 sm:py-32 sm:px-16 bg-white dark:bg-black rounded-lg shadow-lg max-w-md w-full">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={24}
            priority
          />
          <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold leading-8 sm:leading-10 tracking-tight text-black dark:text-zinc-50">
              Welcome to Token Hunt
            </h1>
            <p className="text-base sm:text-lg leading-6 sm:leading-8 text-zinc-600 dark:text-zinc-400 px-2">
              Verify your identity with World ID to continue
            </p>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg w-full">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-6 sm:px-8 text-white dark:text-black font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : '🌐 Verify with World ID'}
          </button>
        </main>
      </div>
    )
  }

  // Show wallet connection screen if verified but wallet not connected
  if (!walletAddress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
        <main className="flex flex-col items-center justify-center gap-6 sm:gap-8 py-8 px-4 sm:py-32 sm:px-16 bg-white dark:bg-black rounded-lg shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">World ID Verified</p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold leading-8 sm:leading-10 tracking-tight text-black dark:text-zinc-50">
              Connect Your Wallet
            </h1>
            <p className="text-base sm:text-lg leading-6 sm:leading-8 text-zinc-600 dark:text-zinc-400 px-2">
              Sign in with your wallet to start the hunt
            </p>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg w-full">
              {error}
            </div>
          )}

          <button
            onClick={signInWithWallet}
            disabled={isConnectingWallet}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-6 sm:px-8 text-white dark:text-black font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnectingWallet ? 'Connecting...' : '👛 Connect Wallet'}
          </button>
        </main>
      </div>
    )
  }

  // Show homepage after verification and wallet connection
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-3 sm:p-4">
      <main className="flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-8 py-6 sm:py-12">
        <div className="flex w-full flex-col items-center gap-4 sm:gap-6 text-center px-4">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            🎯 Token Hunt
          </h1>
          
          {/* Wallet Badge */}
          <div className="flex flex-col items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm font-mono">
              {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </Badge>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Connected Wallet</p>
          </div>

          <p className="max-w-md text-base sm:text-lg leading-6 sm:leading-8 text-zinc-600 dark:text-zinc-400 px-2">
            Your live coordinates are being tracked. Start hunting for tokens!
          </p>
        </div>

        <div className="w-full px-2 sm:px-0">
          <LocationTracker />
        </div>

        <div className="flex w-full flex-col gap-3 sm:gap-4 text-base font-medium sm:flex-row sm:justify-center px-4 sm:px-0">
          <button
            className="flex h-12 sm:h-12 w-full items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-6 sm:px-8 text-white dark:text-black transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 sm:w-auto"
          >
            🏹 Start Hunt
          </button>
          <button
            className="flex h-12 sm:h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-6 sm:px-8 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] sm:w-auto"
          >
            💰 View Tokens
          </button>
        </div>
      </main>
    </div>
  )
}
