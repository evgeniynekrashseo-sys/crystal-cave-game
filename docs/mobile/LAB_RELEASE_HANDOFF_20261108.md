# ChemLab Laboratory — store release handoff (2026-11-08)

## Scope and verified facts
- Standalone **no-city** game built by `npm run build:lab`, source `dist/`, output `dist/lab/`.
- Existing approved lab tube/liquid assets and city renderer were not edited by the web-beta release.
- Web-beta integration merged to `main`: commit `d57d06b7f996c439125fb52831193931c2298ffc`. Deployment workflow now builds `dist/lab` at `/crystal-cave-game/lab/`. Live HTTP response **not independently verified**.
- At least one Android and iOS simulator CI run passed on the release branch: GitHub Actions run 42372355366. New runs on 2026-11-08 were blocked by GitHub release download 504 for Gradle / Capacitor binaries; JavaScript/HTML no-city validation and npm tests completed.
- Existing mobile package ID `com.digitaldavinci.chemlab`, Android version code 5, app version 1.2.1. Verify ID isn't already reserved elsewhere before the first Play release.
- UI locale selector: 16 languages but only 28 main strings translated; not full localization. 17 regional store listing drafts at `docs/mobile/lab-store-listings.json`.
- AdMob SDK, real rewarded ads, consent management, ad units, purchase system, analytics: **not implemented**. Store materials must not claim ads are live or that the game is fully localized.

## Google Play — fastest responsible route
1. Confirm Play Console developer account and create **ChemLab** app with package `com.digitaldavinci.chemlab`. Initial Play app registration and first upload need Play Console UI; the GitHub Play uploader cannot register an app that doesn't yet exist.
2. Complete account trader declaration, app content, Data Safety, privacy policy, target audience, ad declaration (current build: no ads), content rating, countries, pricing (free), listing icons, actual device screenshots. Current lab privacy page: `/crystal-cave-game/lab/privacy.html`.
3. Securely generate/locate developer-owned **upload keystore**. Keep encrypted owner backup outside repository. Never put signing files or API JSON in Git.
4. Configure GitHub Actions secrets for the repo: `CHEMLAB_UPLOAD_KEYSTORE_B64`, `CHEMLAB_UPLOAD_STORE_PASSWORD`, `CHEMLAB_UPLOAD_KEY_ALIAS`, `CHEMLAB_UPLOAD_KEY_PASSWORD`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`. The Play service account needs least-privilege permissions for this app. Never paste these secrets into chat.
5. The **manual** `.github/workflows/play-internal.yml` action builds only the no-city lab, signs its AAB with `jarsigner`, verifies signature, and uploads to **internal** testing track when run with input `UPLOAD-INTERNAL`. First upload through console may be needed beforehand.
6. Run physical Android QA, invite testers, gather feedback, and fix crashes before production. Personal Play developer accounts created after Nov 13, 2023 may need 12 continuously opted-in closed testers for 14 days before applying for production access.
7. Only after full localization, verified app compliance, and QA: promote to Production in Play Console. Do not use Play internal testing as evidence of live public distribution.

## iOS / App Store
1. Confirm active Apple Developer Program, signing Team, Bundle ID `com.digitaldavinci.chemlab`, and App Store Connect application.
2. Apple signing certificate and provisioning profile (or equivalent automated signing) are required. The GitHub macOS simulator CI is **unsigned**, not an App Store IPA. Archive and validate the **city-free** target on macOS with Xcode compatible with current App Store requirements.
3. Complete store metadata, ratings, privacy declarations and real iPhone screenshots; upload build to App Store Connect, verify on TestFlight, submit to App Review, then publish only after approval.
4. The storefront listing text is a draft; proofread native language names, check claims/limits and use actual running app screenshots.

## Advertising launch gate
- Register an AdMob app, obtain Android/iOS **app IDs and rewarded ad unit IDs** for this exact package.
- Integrate an actively maintained Capacitor 8 compatible Google Mobile Ads plugin and Google's UMP consent flow. Request consent status at app launch; request ads only when allowed.
- Add reliable reward-on-verification behavior, limits and duplicate protection. Do not credit rewards when ad loading/show fails.
- Update `lab/privacy.html`, Google Play Data Safety, App Store privacy labels and each store's advertising declarations BEFORE enabling ads.
- Verify ad monetization with test ad units on physical iPhone/Android and only then switch to production ad units.

## Release status
**Web beta:** GitHub commit + deploy workflow confirmed; external HTTP/load check pending.
**Google Play internal:** pipeline added in `release/google-play-internal-20261108`; no confirmed Play upload.
**Google Play production / iOS App Store:** not submitted, not approved, not downloadable.
**Ads:** not live.
