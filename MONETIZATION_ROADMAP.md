# ChemLab: store monetization and release plan

## Implemented in the current web version
118 research unlocks; a periodic map with actual positions and atomic numbers; fictional pair recipes; reactor explosions, one-sort-move reactor freeze, gold/crystal rewards, deterministic artifacts; repeat-claim protection per campaign level; three upgrade tracks with five stages; three daily quests rotating by UTC date; cosmetic themes purchased with earned crystals. No real-money purchase, ad SDK, account, cloud save or native store build is implemented.

Core save `chemlab_v50` remains compatible. `chemlab_world_v1` stores expansion state. New discovered symbols use the same array field and extended symbol whitelist. Existing discoveries are preserved. Old automatic discovery is replaced by explicit research claims: level and cumulative reactions must both meet the quest target. Active puzzle colors rotate among discoveries and include the latest element.

Reaction effects operate on a separate sample reactor. Samples never consume puzzle tokens or mutate the certified solution. Freeze locks the reactor, not the sorting board, until one successful sorting move. Undo does not restore reactor claims, rewards, daily progress or cooldown; replay cannot duplicate a claim. A new campaign level renews charges. Every fifth reaction grants the next unowned artifact; artifact recipes give their named artifact deterministically. No paid randomness.

## Commercial direction — hypotheses to validate
Free core campaign. Sell visual identity and optional convenience after players understand the game. Initial offers to test (not live products or confirmed prices):
- Permanent themed laboratory plus matching glass and VFX: localized price hypothesis US$2.99–4.99.
- Optional rewarded ad after a win: double the base gold reward, capped and credited only after the provider's verified reward callback.
- Cosmetic seasonal collection after retention evidence; do not build a subscription or season pass before demonstrating return play.
- Avoid forced ads during puzzles, purchasable mastery, paywalls on discoveries, and paid randomized artifacts.

These are design hypotheses, not forecasts. Revenue depends on actual player cohorts and acquisition costs.

## Store implementation still required
1. Create native iOS/Android packages, developer-owned signing and Store listings; run device and TestFlight/Play closed testing.
2. Integrate StoreKit / Google Play Billing, localized product information, restore purchases, transaction verification, refunds/revocations and idempotent grants in an authoritative backend. Do not use browser localStorage as the source of truth for paid balances or entitlements.
3. Add account/recovery design, consent and privacy disclosures as required by selected SDKs and audience; determine target age before choosing ad SDK settings.
4. Add rewarded-ad SDK with consent, offline/no-fill/error handling and server-side verification. A dismissed or failed ad must never spend currency or block free play.
5. Add analytics with the chosen consent/retention settings: first session, level start/end/loss/retry, reaction, research claim, daily claim, upgrade, offer impression, purchase success/refund, rewarded-ad completed. Use server timestamps for paid grants and daily eligibility. Current local UTC dates are not anti-cheat security.
6. Close cross-key persistence risk: progression writes currently use separate localStorage keys and are not crash-atomic. Paid rewards require database transactions and event IDs before release.

## First product experiment
Run a measured playtest; segment new and returning players. Inspect tutorial completion, first-session wins, time to first reaction/research, losses per tier, next-day and seventh-day return, session length and ad opt-in. Compare acquisition cost with observed net cohort revenue before paid scaling. No current retention, conversion or revenue data has been collected.

## Official references checked 2026-09-09
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple In-App Purchase setup: https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/
- Google Play Payments policy (includes applicable regional/program exceptions): https://support.google.com/googleplay/android-developer/answer/9858738?hl=en
- Google Play Billing architecture and server integration: https://developer.android.com/google/play/billing
