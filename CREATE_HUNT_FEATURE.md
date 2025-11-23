# Create Hunt Flow - Implementation Summary

## ✅ What's Been Built

### 1. **Files Created**

#### **`lib/hunts.ts`** - Data Layer
- Hunt interface with full schema
- localStorage CRUD operations:
  - `getHunts()` - Fetch all hunts
  - `saveHunt(hunt)` - Save new hunt
  - `getHuntById(id)` - Get specific hunt
  - `deleteHunt(id)` - Remove hunt
  - `claimHunt(id, wallet)` - Increment claim count
  - `generateHuntId()` - UUID generator
- Key: `"token_hunt_hunts"`
- SSR-safe (checks for browser environment)

#### **`components/CreateHuntMap.tsx`** - Interactive Map
- Mapbox GL integration
- Click to drop pin (📍 emoji marker)
- Draggable marker for refinement
- Circle radius overlay (blue, 20% opacity)
- Auto-centers to user's GPS or Buenos Aires fallback
- Real-time coordinate display
- 250px (mobile) / 300px (desktop) height
- Instruction overlay when no pin

#### **`app/create-hunt/page.tsx`** - Main Creation Page
- Full form with validation
- shadcn components (Card, Input, Textarea, Slider, Badge)
- Fields:
  - Campaign Name (required)
  - Reward Amount (required, WLD)
  - Max Claims (required)
  - Description (optional)
  - Sponsor Wallet (auto-filled from URL/session, displayed as badge)
- Radius slider: 5m → 500m (5m steps)
- Collapsible JSON preview panel
- Error handling with red alert box
- Mobile responsive
- Navigation: Cancel → /hunt | Create → saves and redirects to /hunt

#### **`app/hunt/page.tsx`** - Updated Hunt Listing
- Loads hunts from localStorage
- Hunt cards showing:
  - Campaign name
  - Reward amount (WLD)
  - Claims progress (X / Y)
  - Radius
  - Distance from user (live calculation)
  - Description (if present)
  - Sponsor wallet (truncated)
- Dynamic claim button:
  - Green "Claim Reward" if in range
  - Disabled "Move Xm closer" if out of range
  - Disabled "Hunt Completed" if max claims reached
- Stats card (total claims, completed hunts)
- "+ Create" button in header
- Empty state with CTA

#### **Updated `app/page.tsx`**
- Changed "Create Campaign" button to "Create Hunt"
- Links to `/create-hunt?wallet={walletAddress}`

---

## 🎯 Key Features

### Map Interaction
✅ Click to drop pin  
✅ Drag to refine location  
✅ Radius visualization (circle overlay)  
✅ GPS-based centering (with fallback)  
✅ Real-time coordinate display  

### Form & Validation
✅ Required field checks  
✅ Number validation (positive values)  
✅ Pin location required  
✅ Error messages displayed  
✅ JSON preview (collapsible)  

### Data Persistence
✅ localStorage with structured schema  
✅ Hunt ID generation (UUID)  
✅ Timestamp tracking (createdAt)  
✅ Claim counter (starts at 0)  

### Hunt Display
✅ Distance calculation (Haversine formula)  
✅ In-range detection  
✅ Claim status (Active/Completed)  
✅ Real-time location tracking  
✅ Responsive hunt cards  

---

## 📱 Mobile Responsive Features

- Smaller map on mobile (200px vs 300px)
- Stacked form layout
- Full-width buttons on mobile → inline on desktop
- Touch-optimized slider
- Readable text sizes (responsive scaling)
- No horizontal scrolling

---

## 🚀 Usage Flow

1. **From Homepage**
   - Click "Create Hunt" button
   - Wallet address passed via URL param

2. **Create Hunt Page**
   - Map loads with user's GPS
   - Click map to drop pin
   - Drag pin to refine
   - Adjust radius slider (see circle update)
   - Fill campaign details
   - Optional: Click "Preview JSON"
   - Click "Create Hunt"

3. **Validation**
   - Check pin is dropped
   - Check campaign name filled
   - Check reward amount > 0
   - Check max claims > 0
   - Show errors if invalid

4. **Save & Navigate**
   - Generate UUID for hunt
   - Add timestamp
   - Save to localStorage
   - Navigate to `/hunt`

5. **Hunt Page**
   - See new hunt in list
   - Distance calculated from user location
   - Can claim if in range
   - Can create more hunts via "+ Create" button

---

## 🎨 UI Components Used

- **shadcn Card** - Hunt cards, form sections
- **shadcn Input** - Text/number fields
- **shadcn Textarea** - Description
- **shadcn Slider** - Radius selector
- **shadcn Badge** - Wallet address, status, etc.
- **Mapbox GL** - Interactive map
- **Next.js Link** - Client-side navigation

---

## 💾 Hunt Schema

```typescript
{
  huntId: string,              // UUID v4
  lat: number,                 // Decimal degrees
  lng: number,                 // Decimal degrees
  radiusMeters: number,        // 5-500m
  rewardToken: "WLD",          // Fixed for now
  rewardAmount: number,        // Positive number
  maxClaims: number,           // Positive integer
  campaignName: string,        // Display name
  description?: string,        // Optional notes
  sponsorWallet: string,       // From session
  claimedCount: number,        // Starts at 0
  createdAt: string,           // ISO timestamp
  startTime?: string,          // Future feature
  endTime?: string             // Future feature
}
```

---

## 🔧 localStorage Key

**Key:** `"token_hunt_hunts"`  
**Value:** Array of Hunt objects  
**Operations:** Read on mount, write on save, persist across sessions

---

## ⚡ Performance Optimizations

- Dynamic import for map (SSR disabled)
- Distance calculation cached per hunt
- localStorage operations batched
- Form validation on submit (not on every keystroke)

---

## 🚧 Future Enhancements

- [ ] Edit existing hunts
- [ ] Delete hunts
- [ ] Hunt expiration (startTime/endTime)
- [ ] Multi-token support (not just WLD)
- [ ] Image upload for campaign
- [ ] Social sharing
- [ ] Claim history per user
- [ ] On-chain integration (smart contracts)
- [ ] Backend sync (API + database)

---

## 📝 Notes

- Wallet address passed via URL (`?wallet=...`) and stored in sessionStorage
- Fallback location: Buenos Aires (-34.6037, -58.3816)
- Map token hardcoded in CreateHuntMap.tsx
- No authentication required for hunt creation (hackathon scope)
- Claims are currently UI-only (no smart contract integration)

---

## 🎉 Ready to Use!

All components are fully functional and mobile-responsive. The Create Hunt flow is production-ready for hackathon demo.

