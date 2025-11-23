# 💳 Payment Integration for Hunt Creation

## ✅ Implementation Complete!

### **Overview**
Hunt creators must pay upfront to fund the reward pool. Payment is processed through Worldcoin MiniKit before the hunt is created.

---

## 🏗️ **Architecture**

### **Flow Diagram**
```
User fills form → Clicks "Pay & Create Hunt"
    ↓
Calculate total cost (rewardAmount × maxClaims)
    ↓
POST /api/initiate-payment → Generate payment reference
    ↓
MiniKit.pay() → User approves payment in World App
    ↓
POST /api/confirm-payment → Verify with Worldcoin API
    ↓
Payment confirmed → Create hunt via POST /api/hunts
    ↓
Navigate to /hunt → See new hunt!
```

---

## 📦 **New Files Created**

### **1. `/api/initiate-payment/route.ts`**
- Generates UUID payment reference
- Stores reference in memory (Map)
- Returns reference ID to frontend

### **2. `/api/confirm-payment/route.ts`**
- Receives payment payload from MiniKit
- Verifies transaction with Worldcoin API
- Confirms payment status
- Returns success/failure

### **3. Updated: `/app/create-hunt/page.tsx`**
- Added MiniKit payment integration
- Cost calculation: `rewardAmount × maxClaims`
- Payment status UI
- Cost summary card
- Updated button with cost display

---

## 💰 **Payment Details**

### **Recipient Address**
```
0x67568fc3909c150df04fe916e9b7f52333b51a21
```

### **Token**
- **WLD only** (Worldcoin)
- Uses `tokenToDecimals()` for proper precision

### **Cost Calculation**
```typescript
totalCost = rewardAmount × maxClaims

Example:
- Reward: 10 WLD
- Max Claims: 5
- Total Cost: 50 WLD
```

---

## 🔐 **Environment Variables Required**

Add to `.env.local`:

```env
APP_ID=app_fe620d4e7852aa0594383b4398935191
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiYW5pa2V0YXZhc2FyZTQyMCIsImEiOiJjbWlhbjRmcDMwejNqMmxvZ2x3bmZ1Y2duIn0.QAG-0y4eiR1quyf7XJoV4A
DEV_PORTAL_API_KEY=your_dev_portal_api_key_here
```

**NEW:** `DEV_PORTAL_API_KEY` - Get this from your Worldcoin Developer Portal

---

## 🎯 **User Experience**

### **Cost Display**
Shows before payment:
```
Reward per claim: 10 WLD
×
Max claims: 5
=
Total: 50 WLD
```

### **Payment States**
1. **"Initiating payment..."** - Generating reference
2. **"Opening payment dialog..."** - MiniKit launching
3. **"Waiting for payment confirmation..."** - User approving
4. **"Verifying payment..."** - Backend verification
5. **"Payment successful! Creating hunt..."** - Hunt creation
6. **Redirect to /hunt** - Done!

### **Button States**
- **Normal:** "💳 Pay 50 WLD & Create Hunt"
- **Processing:** "Processing..." (with spinner, disabled)

---

## 🔄 **API Endpoints**

### **POST `/api/initiate-payment`**
**Request:**
```json
{
  "amount": "50"
}
```

**Response:**
```json
{
  "id": "abc123def456..."
}
```

### **POST `/api/confirm-payment`**
**Request:**
```json
{
  "payload": {
    "transaction_id": "tx_123...",
    "reference": "abc123def456...",
    "status": "success"
  }
}
```

**Response:**
```json
{
  "success": true,
  "transaction": { ... }
}
```

---

## 🧪 **Testing Flow**

### **Test Scenario 1: Successful Payment**
```
1. Fill form: Reward=1, Claims=1
2. Click "Pay 1 WLD & Create Hunt"
3. Approve payment in World App
4. See "Payment successful!"
5. Hunt created ✅
```

### **Test Scenario 2: Payment Cancelled**
```
1. Fill form
2. Click payment button
3. Cancel in World App
4. Error: "Payment was cancelled or failed"
5. Hunt NOT created ❌
```

### **Test Scenario 3: Verification Failed**
```
1. Payment goes through
2. Backend verification fails
3. Error: "Payment verification failed"
4. Hunt NOT created ❌
5. User should contact support
```

---

## 📊 **Payment Verification**

### **Worldcoin API Call**
```typescript
GET https://developer.worldcoin.org/api/v2/minikit/transaction/{txId}?app_id={APP_ID}
Headers: Authorization: Bearer {DEV_PORTAL_API_KEY}
```

### **Verification Checks**
1. ✅ Transaction ID matches
2. ✅ Reference matches
3. ✅ Status !== 'failed'
4. ✅ Optimistic confirmation (don't wait for mining)

---

## 🚨 **Error Handling**

### **Common Errors**
| Error | Cause | Solution |
|-------|-------|----------|
| MiniKit not installed | Not in World App | Run in World App MiniApp |
| Payment cancelled | User declined | Try again |
| Verification failed | API error | Check DEV_PORTAL_API_KEY |
| Invalid amount | Form validation | Fix form inputs |

### **Error Messages Shown**
- "MiniKit is not installed"
- "Payment was cancelled or failed"
- "Payment verification failed. Please try again."
- "Failed to save hunt to server. Please contact support."

---

## 💾 **Payment Reference Storage**

### **Current: In-Memory Map**
```typescript
paymentReferences = new Map<string, { amount, timestamp }>()
```

**Limitations:**
- ❌ Lost on server restart
- ❌ Not shared across instances
- ✅ Perfect for hackathon/demo

### **Production: Use Database**
```typescript
// Store in PostgreSQL/MongoDB
await db.paymentReferences.create({
  id: uuid,
  amount: totalCost,
  status: 'pending',
  createdAt: new Date()
})
```

---

## 🎨 **UI Components**

### **Cost Summary Card**
- Blue border to highlight payment
- Shows calculation breakdown
- Info message about reward pool
- Mobile responsive

### **Payment Status Alert**
- Blue background
- Spinner animation
- Real-time status updates
- Auto-dismiss on success

### **Submit Button**
- Shows cost in button text
- Disabled during processing
- Spinner when active
- Clear call-to-action

---

## 📝 **Code Snippets**

### **Calculate Total Cost**
```typescript
const calculateTotalCost = (): number => {
  const reward = parseFloat(rewardAmount) || 0;
  const claims = parseInt(maxClaims) || 0;
  return reward * claims;
};
```

### **Payment Payload**
```typescript
const payload: PayCommandInput = {
  reference: id,
  to: '0x67568fc3909c150df04fe916e9b7f52333b51a21',
  tokens: [{
    symbol: Tokens.WLD,
    token_amount: tokenToDecimals(totalCost, Tokens.WLD).toString(),
  }],
  description: `Token Hunt: ${campaignName} - ${totalCost} WLD`,
};
```

---

## ✅ **Benefits**

1. **Upfront Funding** - Hunt creator pays before hunt is live
2. **Secure** - Verified through Worldcoin API
3. **Transparent** - User sees exact cost before paying
4. **Non-refundable** - Payment completes before hunt creation
5. **Simple** - Only WLD supported (no complexity)

---

## 🚀 **Next Steps (Future)**

- [ ] Support multiple tokens (USDC, ETH)
- [ ] Add refund mechanism if hunt creation fails
- [ ] Store payment history per user
- [ ] Admin panel to view payments
- [ ] Automatic payout to claimers
- [ ] Smart contract integration
- [ ] Escrow system

---

## 🎉 **Status: FULLY IMPLEMENTED!**

Payment integration is complete and ready for testing. Users must pay the full reward pool cost (rewardAmount × maxClaims) in WLD before creating a hunt.

**Payment Flow:** ✅  
**API Endpoints:** ✅  
**UI Integration:** ✅  
**Error Handling:** ✅  
**Verification:** ✅  

Ready for demo! 🚀

