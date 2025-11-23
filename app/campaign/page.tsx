'use client'

import Link from "next/link"
import Image from "next/image"

export default function CampaignPage() {
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
            🚀 Create Your Campaign
          </h1>

          <p className="max-w-md text-base sm:text-lg leading-6 sm:leading-8 text-zinc-600 dark:text-zinc-400 px-2">
            Launch location-based token hunts and engage your community like never before
          </p>
        </div>

        {/* Marketing Content */}
        <div className="w-full space-y-4 px-4 sm:px-0">
          {/* Hero Section */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 sm:p-8 shadow-sm border border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">
              Turn Any Location Into a Treasure Hunt
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed">
              Create immersive experiences that bring people together. Whether you're promoting a business, 
              hosting an event, or building community engagement, Token Hunt makes it easy to reward real-world exploration.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                Location-Based Rewards
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Set precise GPS coordinates and claim radius for your token drops
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg p-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                Verified Participants
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                World ID ensures only verified humans can claim your rewards
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg p-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                Custom Token Rewards
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Distribute your own tokens or crypto rewards to successful hunters
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg p-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                Real-Time Analytics
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Track engagement and see who's participating in your campaigns
              </p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
              Perfect For
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-black dark:text-white">Retail & Local Business</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Drive foot traffic with location-based promotions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-black dark:text-white">Events & Conferences</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Gamify attendee engagement and exploration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-black dark:text-white">Community Building</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Reward members for participating in local activities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg mt-0.5">✓</span>
                <div>
                  <p className="font-medium text-black dark:text-white">Tourism & Attractions</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Create interactive treasure hunts across multiple locations</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-6 sm:p-8 shadow-sm border border-purple-200 dark:border-purple-800 text-center">
            <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">
              Ready to Get Started?
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 text-base mb-4">
              Campaign creation tools coming soon. Join the waitlist to be notified when we launch!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="flex h-12 items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-6 sm:px-8 text-white dark:text-black transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200">
                Join Waitlist
              </button>
              <Link href="/hunt">
                <button className="flex h-12 items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-6 sm:px-8 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]">
                  Start Hunting Instead
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Button */}
        <div className="flex w-full justify-center px-4 sm:px-0">
          <Link href="/" className="w-full sm:w-auto">
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-6 sm:px-8 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]">
              ← Back to Home
            </button>
          </Link>
        </div>
      </main>
    </div>
  )
}
