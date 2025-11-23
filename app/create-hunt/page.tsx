"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { saveHuntToAPI, generateHuntId, type Hunt } from "@/lib/hunts";

// Dynamic import for map (client-side only)
const CreateHuntMap = dynamic(() => import("@/components/CreateHuntMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] sm:h-[300px] bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
      <p className="text-gray-600 dark:text-zinc-400">Loading map...</p>
    </div>
  ),
});

export default function CreateHuntPage() {
  const router = useRouter();
  
  // Get authenticated wallet address from session storage
  const [walletAddress] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("walletAddress") || "";
    }
    return "";
  });

  // Redirect if no wallet address (not authenticated)
  useState(() => {
    if (typeof window !== "undefined" && !walletAddress) {
      console.warn("No wallet address found, redirecting to home...");
      router.push("/");
    }
  });

  // Form state
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusMeters, setRadiusMeters] = useState<number>(50);
  const [campaignName, setCampaignName] = useState<string>("");
  const [rewardAmount, setRewardAmount] = useState<string>("");
  const [maxClaims, setMaxClaims] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Handle location change from map
  const handleLocationChange = (lat: number, lng: number) => {
    setPinLocation({ lat, lng });
    // Clear location error if it exists
    setErrors((prev) => prev.filter((e) => !e.includes("pin")));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!pinLocation) {
      newErrors.push("Please drop a pin on the map to set hunt location");
    }

    if (!campaignName.trim()) {
      newErrors.push("Campaign name is required");
    }

    const reward = parseFloat(rewardAmount);
    if (isNaN(reward) || reward <= 0) {
      newErrors.push("Reward amount must be a positive number");
    }

    const claims = parseInt(maxClaims);
    if (isNaN(claims) || claims <= 0) {
      newErrors.push("Max claims must be a positive number");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Create hunt object for preview
  const createHuntObject = (): Hunt => {
    return {
      huntId: generateHuntId(),
      lat: pinLocation?.lat || 0,
      lng: pinLocation?.lng || 0,
      radiusMeters,
      rewardToken: "WLD",
      rewardAmount: parseFloat(rewardAmount) || 0,
      maxClaims: parseInt(maxClaims) || 0,
      campaignName: campaignName.trim(),
      description: description.trim() || undefined,
      sponsorWallet: walletAddress,
      claimedCount: 0,
      createdAt: new Date().toISOString(),
    };
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const hunt = createHuntObject();
      const success = await saveHuntToAPI(hunt);
      
      if (success) {
        console.log("Hunt created successfully:", hunt.huntId);
        // Navigate to hunt page
        router.push("/hunt");
      } else {
        setErrors(["Failed to save hunt to server. Please try again."]);
      }
    } catch (error) {
      console.error("Error creating hunt:", error);
      setErrors(["Failed to save hunt. Please try again."]);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-3 sm:p-4">
      <main className="flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-8 py-6 sm:py-12">
        {/* Header */}
        <div className="flex w-full flex-col items-center gap-4 sm:gap-6 text-center px-4">
          <Link href="/hunt">
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
            🎯 Create Token Hunt
          </h1>

          <p className="max-w-md text-base sm:text-lg leading-6 sm:leading-8 text-zinc-600 dark:text-zinc-400 px-2">
            Drop a pin, set rewards, and let the hunt begin!
          </p>

          {/* Show wallet info */}
          {walletAddress && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Sponsor:</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </Badge>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="w-full px-4 sm:px-0">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="font-semibold text-red-800 dark:text-red-200 text-sm mb-2">
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="w-full space-y-6 px-4 sm:px-0">
          {/* Map Section */}
          <Card>
            <CardHeader>
              <CardTitle>📍 Hunt Location</CardTitle>
              <CardDescription>Click on the map to drop a pin, then drag to adjust</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateHuntMap
                onLocationChange={handleLocationChange}
                radiusMeters={radiusMeters}
              />
            </CardContent>
          </Card>

          {/* Radius Slider */}
          <Card>
            <CardHeader>
              <CardTitle>📏 Claim Radius</CardTitle>
              <CardDescription>
                Users must be within this radius to claim the reward
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Radius: {radiusMeters}m
                </span>
                <Badge variant="secondary">{radiusMeters < 20 ? "Precise" : radiusMeters < 100 ? "Moderate" : "Wide"}</Badge>
              </div>
              <Slider
                value={[radiusMeters]}
                onValueChange={(value) => setRadiusMeters(value[0])}
                min={5}
                max={500}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>5m</span>
                <span>500m</span>
              </div>
            </CardContent>
          </Card>

          {/* Hunt Details Form */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Hunt Details</CardTitle>
              <CardDescription>Configure your token hunt campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Campaign Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., ETHGlobal Argentina Treasure"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Reward Amount (WLD) *
                  </label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Max Claims *
                  </label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={maxClaims}
                    onChange={(e) => setMaxClaims(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description (Optional)
                </label>
                <Textarea
                  placeholder="Add any additional information about your hunt..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* JSON Preview (Collapsible) */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
            >
              <CardTitle className="flex items-center justify-between">
                <span>{showJsonPreview ? "▼" : "▶"} JSON Preview</span>
                <Badge variant="outline" className="text-xs">
                  {showJsonPreview ? "Hide" : "Show"}
                </Badge>
              </CardTitle>
            </CardHeader>
            {showJsonPreview && (
              <CardContent>
                <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(createHuntObject(), null, 2)}
                </pre>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center px-4 sm:px-0">
          <Link href="/hunt" className="w-full sm:w-auto">
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-6 sm:px-8 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]">
              Cancel
            </button>
          </Link>
          <button
            onClick={handleSubmit}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-6 sm:px-8 text-white dark:text-black transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 sm:w-auto"
          >
            🚀 Create Hunt
          </button>
        </div>
      </main>
    </div>
  );
}

