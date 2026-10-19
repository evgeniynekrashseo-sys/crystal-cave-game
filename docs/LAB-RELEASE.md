# ChemLab Laboratory — release candidate 1.2.1

The first store edition contains tube sorting, formula missions, reactions, the periodic table, daily quests, laboratory modules, cosmetics and local backups. City simulation and assets are excluded. The city web game continues independently at the root URL.

## Reproducible builds

- `npm run build:lab` produces the independent web app in `dist/lab/`.
- `npm ci && npm run native:lab -- android` copies this edition into Android.
- `npm ci && npm run native:lab -- ios` copies this edition into iOS.
- Default `npm run native:sync` still packages the city edition; do not use it for this release.
- The native CI workflow packages the laboratory edition. Android output is an unsigned release AAB and a debug APK. iOS CI output is a simulator app, not an App Store archive.

App identity stays `com.digitaldavinci.chemlab`: this is the first release of ChemLab, not a duplicate store listing. Native version is 1.2.1 / build 5. Confirm that build 5 has not already been uploaded before submission.

## Isolation and compatibility

The web edition uses `chemlab_lab_` storage keys and its own service worker/cache. It does not overwrite city progress. It does not automatically import the other edition's backups. Both editions retain their own export/import. Core puzzle code and approved tube art are copied from the same sources; build transformations fail if expected integration anchors change.

## Submission still required

This source candidate is not a signed store release. Android release signing, the publisher's Play Console setup and required testing must be completed. For iOS, select the Apple development team in Xcode, archive for a physical-device target and upload through Organizer. Simulator artifacts cannot be uploaded to App Store Connect.

Before submission, verify on physical Android and iPhone devices, complete store screenshots/description, age rating and privacy disclosures against the shipped app, and verify the support link. Do not advertise a city in this edition. The app currently has no integrated purchase or ad SDK; do not claim monetization is active.
