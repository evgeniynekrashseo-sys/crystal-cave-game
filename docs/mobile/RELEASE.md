# ChemLab 1.1 — native release handoff

Source: the same `dist/` shipped on GitHub Pages. Package ID: `com.digitaldavinci.chemlab` (confirm ownership before first store submission; never change once registered). No account, ads, purchases or analytics SDKs.

## Reproducible preparation

Node 22+; `npm ci`, `npm test`, `npm run qa:swarm`, `npm run native:sync`.

Android project: `android/`; Java 21, Android SDK 36. `cd android && ./gradlew assembleDebug bundleRelease`. CI uploads the debug APK and **unsigned** release AAB. Debug APK is for device testing only. Configure the owner's upload keystore in Android Studio or protected CI secrets; no secrets are in this repository. A signed AAB is required for Play Console.

iOS project: `ios/App/App.xcodeproj`. Open with Xcode on macOS, select the owner's Apple Developer team and signing profile, then Archive → Distribute App. CI validates an **unsigned simulator build**, not an App Store IPA. This Linux environment cannot compile an iOS archive. Verify the accepted SDK/Xcode requirement in App Store Connect on submission day.

`native-build.yml` runs on native source/dependency changes and supports manual dispatch. Simulator artifacts and debug APKs are not store submissions. Physical iPhone and Android QA is still required (background/resume, memory, audio, rotation, import/export, offline start, safe areas).

## Store assets and copy

- App icon: `dist/icons/app-1024.png`, plus Android density icons and iOS asset catalog.
- Privacy/support page: https://evgeniynekrashseo-sys.github.io/crystal-cave-game/privacy.html
- Support: https://github.com/evgeniynekrashseo-sys/crystal-cave-game/issues
- Title: ChemLab
- Subtitle: Формули, відкриття та живе місто
- Short description: Збирай формули, відкривай артефакти й розвивай власну долину відкриттів.
- Description: Поринь у ChemLab: сортуй елементи в пробірках, розв’язуй задачі на склад речовин і обирай режими реактора. Відкривай нові рівні, допомагай мешканцям долини та шукай шість прихованих артефактів. Обери шлях науки, природи або морської торгівлі. Дванадцять сюжетних завдань пов’язують лабораторію з містом. Хочеш лише головоломки? Вимкни місто — його прогрес залишиться. Гра працює з локальним збереженням і підтримує експорт резервної копії. Формули та ефекти є навчальною ігровою моделлю, а не інструкціями для реальних дослідів.
- Keywords draft (iOS): хімія,головоломка,формули,лабораторія,місто,дослідження,офлайн
- Release notes: Хроніки долини: персонажі, сюжетні завдання, артефакти, нові будівлі та формули. Додано перемикач міста, резервні копії й спокійну анімацію.

Fill store age/content questionnaires from the actual build; no official rating is claimed. Declare no developer-collected data only after verifying the release has no additional SDKs or telemetry. Review hosting logs separately for web support. Screenshots must come from the real native build/device; do not use concept atlas imagery as app screenshots. Owner must supply store accounts, signing, final seller identity, declarations and review submission.

Progress is per installation/origin. Export a JSON backup from GitHub Pages and import it in the native app to transfer progress. There is no automatic cross-device cloud sync.
