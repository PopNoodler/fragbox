# FragBox — Monetization (dormant, ready to switch on)

Everything below is **built and testable today** behind a simulated provider
(`Monetize.provider = 'sim'` in `index.html`). Flipping to real revenue means wiring one
SDK into the `Monetize` object — the placements, reward flows, and UI already exist.

## Built placements

| Placement | Where | Status |
|---|---|---|
| Rewarded: **2× match XP** | Match-end screen, "▶ AD — 2× XP (+N)" button; grants exactly once per match, restores button on no-fill | ✅ live (simulated 2s ad) |
| Premium **class** (Phantom) | Class pickers show ★ PREMIUM card; clicking calls `Monetize.buyPremium()` | 🟡 stub ("coming soon" callout) |
| Premium **skin** (Rose) | Skin locker ★ swatch; same `buyPremium()` route | 🟡 stub |

Natural next placements (not yet built, cheap to add): rewarded "instant respawn skip",
rewarded "try premium class for one match", interstitial every N solo matches.

## How to go live

### Ads (fastest path: a game portal, no AdSense approval needed)
1. Upload the portal build (`node tools/build-portal.mjs` → `dist/`) to CrazyGames /
   Poki / GameMonetize — **requires the user to create the portal developer account**.
2. Add their SDK `<script>` to index.html and map it inside `Monetize.showRewarded`:
   call their rewarded-ad API, invoke `onReward()` on their success callback and
   `onFail()` on error/no-fill. Set `Monetize.provider = 'crazygames'` (any non-'sim' key).
3. Audit rule (playbook §7): reward must fire exactly once; success and error paths must
   be mutually exclusive; never leave the screen frozen on ad error.

### Premium (IAP)
- Needs a payment rail (Stripe account, or the portal's IAP if supported) — **user's
  identity/banking, cannot be created by the agent**.
- When available: implement `Monetize.buyPremium()` → payment flow → on success set
  `localStorage.kh_premium = 1` and change `classUnlocked`/`skinUnlocked` premium gates to
  honor it (single `if` each, both marked with `premium` flags already).
- Price the premium bundle (Phantom class + Rose skin + future drops) as a one-time
  "Supporter Pack" — best first-purchase converter per playbook §7.

## What the agent cannot do alone
- Create portal/ad-network/payment accounts (identity + banking).
- Accept each platform's developer terms.

Everything else — SDK wiring, QA of reward paths, packaging — can be done in the loop
once account credentials/SDK keys exist.
