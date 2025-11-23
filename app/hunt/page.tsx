'use client'

import Link from "next/link"
import Image from "next/image"
import LocationTracker from "@/components/LocationTracker"

export default function HuntPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-3 sm:p-4">
      <main className="flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-8 py-6 sm:py-12">
        <div className="flex w-full flex-col items-center gap-4 sm:gap-6 text-center px-4">
          <Link href="/">
            <Image
              className="dark:invert cursor-pointer"
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority
            />
          </Link>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            🏹 Hunt Tokens
          </h1>

          <p className="max-w-md text-base sm:text-lg leading-6 sm:leading-8 text-zinc-600 dark:text-zinc-400 px-2">
            Your live location is being tracked. Find tokens near you!
          </p>
        </div>

        {/* Location Map */}
        <div className="w-full px-2 sm:px-0">
          <LocationTracker />
        </div>

        {/* Available Hunts Section */}
        <div className="w-full space-y-4 px-4 sm:px-0">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
              Available Hunts Nearby
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Token hunts will be displayed here based on your current location. Move around to discover new opportunities!
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
              Your Stats
            </h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-black dark:text-white">0</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Tokens Found</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-black dark:text-white">0</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Hunts Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex w-full flex-col gap-3 sm:gap-4 text-base font-medium sm:flex-row sm:justify-center px-4 sm:px-0">
          <Link href="/" className="w-full sm:w-auto">
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-6 sm:px-8 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]">
              ← Back to Home
            </button>
          </Link>
          <Link href="/campaign" className="w-full sm:w-auto">
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-6 sm:px-8 text-white dark:text-black transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200">
              🚀 Create Campaign
            </button>
          </Link>
        </div>
      </main>
    </div>
  )
}
