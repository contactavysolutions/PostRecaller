# PostRecaller — Mobile Application

The native Android and iOS client for PostRecaller. Built with **React Native 0.79**, **Expo SDK 54**, and **Expo Router**.

---

## Native Android Share Intent (`ACTION_SEND`)

PostRecaller integrates directly with the Android system Share Sheet:
1. When browsing Instagram, TikTok, YouTube, Reddit, X, or Chrome, tap **Share**.
2. Select **PostRecaller** from the app list.
3. PostRecaller captures the intent via [`plugins/withShareIntent.js`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/frontend/plugins/withShareIntent.js), launches the fast share overlay [`app/share.tsx`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/frontend/app/share.tsx), strips tracking parameters, saves the item into your vault, and initiates AI enrichment seamlessly.

---

## Branding & Assets

- **App Icon**: Approved **Option A: Gold Luxe Vault** (3D burnished gold lock-crest on a dark emerald brushed leather background).
- **Adaptive Android Icons**: Located in `assets/images/adaptive-icon.png` (432x432 foreground with matching monochrome vector).
- **Splash Screen**: Located in `assets/images/splash-icon.png`.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Expo Metro bundler with clean cache
npx expo start -c

# 3. Press 'a' to run on connected Android device/emulator
```

---

## Building Production Android APK with EAS

```bash
# 1. Ensure EAS CLI is installed and logged in
npm install -g eas-cli
eas login

# 2. Trigger cloud preview APK build (uses https://postrecaller.com backend)
eas build -p android --profile preview

# 3. Download the compiled .apk to install directly on any Android device
```
