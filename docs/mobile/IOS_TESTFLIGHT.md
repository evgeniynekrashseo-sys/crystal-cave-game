# ChemLab: Element Sort — iOS TestFlight release

Status checked on 2026-11-14: the App Store Connect record and signing assets exist. An iOS build has **not** yet been uploaded to TestFlight.

## Verified Apple identity

- App Store Connect app: **ChemLab: Element Sort**
- Apple app ID: `6834574635`
- Bundle identifier: `com.digitaldavinci.chemlab`
- Developer Team ID: `QX87B6Q3N7`
- Intended mobile release: **city-free laboratory**, produced by `npm run native:lab -- ios`
- Apple Distribution certificate and App Store Connect provisioning profile created for this app
- Provisioning profile name: `ChemLab_AppStore_2026`
- [TestFlight overview](https://appstoreconnect.apple.com/teams/e927b1ec-06be-4ade-b87f-06445d062e0a/apps/6834574635/testflight)

## GitHub Actions release workflow

[.github/workflows/ios-testflight.yml](../../.github/workflows/ios-testflight.yml) has a **manual workflow_dispatch** trigger only. It:
1. Checks out the repository and runs tests.
2. Builds and synchronizes the native iOS **city-free** variant.
3. Imports distribution signing materials on a disposable macOS runner.
4. Archives and exports the signed IPA.
5. Uploads it to App Store Connect, where it can become a TestFlight build after processing.

It does **not** publish the app publicly to the App Store.

### Required repository secrets

Store all signing and API credentials in **Settings → Secrets and variables → Actions**, never in source control:

- `CHEMLAB_IOS_DISTRIBUTION_P12_B64` — base64 contents of the distribution `.p12` certificate archive
- `CHEMLAB_IOS_P12_PASSWORD` — password protecting that archive
- `CHEMLAB_IOS_PROFILE_B64` — base64 contents of `ChemLab_AppStore_2026.mobileprovision`
- `CHEMLAB_ASC_API_KEY_P8_B64` — base64 contents of the App Store Connect team API key `.p8`
- `CHEMLAB_ASC_KEY_ID` — matching API key identifier
- `CHEMLAB_ASC_ISSUER_ID` — App Store Connect API issuer UUID

The signing files live **only** in an access-controlled local signing directory on Helen Core. Do not upload them to GitHub files, issues, Actions artifacts, or chat attachments. The CI runner deletes temporary private keys after execution.

## Execution and verification

1. Confirm all six Actions secrets are configured.
2. On GitHub, navigate to **Actions → ChemLab iOS - TestFlight release → Run workflow**, selecting `main`.
3. Open the run logs and confirm successful archive, IPA export, and Apple upload.
4. In App Store Connect, wait for build processing, answer export-compliance questions if required, and add an internal tester.
5. Install through the **TestFlight** app on an invited iPhone.

**QA acceptance checks:** launch/resume, tutorial, move validation, winning and next-level progression, hint/undo, localization, audio/mute, offline relaunch, safe area on iPhone, and device performance.

## Notes

- The current macOS CI workflow `native-build.yml` proves only unsigned **iOS Simulator** compilation; it is not a TestFlight build.
- TestFlight processing status and successful installation on a real iPhone must be checked separately.
- A browser gameplay video demonstrates mechanics, but App Review may require footage from the actual native iPhone build.

## Local preflight QA — 2026-11-14

- Cloned the latest `main` to an isolated Helen Core build directory.
- `npm ci --no-audit --no-fund`: **passed** (99 packages installed).
- Full `npm test`: **148/148 passing** after normalizing CRLF line endings in the isolated Windows checkout. The tracked source was not altered by the newline workaround; CI macOS checkouts use LF.
- `npm run native:lab -- ios`: **passed**, generated the city-free lab edition and synchronized the Capacitor iOS project.
- Apple Distribution `.p12`, App Store provisioning profile and App Store Connect upload `.p8` were generated and downloaded to the private signing folder on Helen Core. No credential material is committed to this repository.
- GitHub Actions signing secrets and TestFlight upload: **not yet performed**; requires GitHub CLI authorization by the repository owner before uploading these locally secured keys through `gh secret set`.
