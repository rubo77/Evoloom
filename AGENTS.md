# Evoloom Agent Guide

## Build and verify

- `npm run build` bundles `src/main.ts` and `src/physics-worker.ts` into `dist/`.
- `npm test` runs the Node smoke tests (Capacitor asset sync checks).
- `bash run.sh` builds and serves the app on http://localhost:9131/.

## Android / mobile

- After changes that mainly affect Android (or web assets shipped to the
  app), always run `./mobile-build.sh` — it rebuilds `www/`, runs
  `npx cap sync`, and verifies with `gradlew assembleDebug`.

## Releases

- Version lives in `package.json` (single source; injected into the app
  via esbuild `--define:APP_VERSION`). Keep `versionName`/
  `MARKETING_VERSION` in the Android/iOS projects in sync; bump
  `versionCode`/`CURRENT_PROJECT_VERSION` per release.
- `bash dev/add_changelog.sh` writes release notes into `CHANGELOG.md`,
  `CHANGELOG_de.md` and `fastlane/metadata/android/**` — edit the
  `DE_CHANGES`/`EN_CHANGES` blocks in the script before running.
