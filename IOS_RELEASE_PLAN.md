# FHM Church: iOS App Store Implementation Plan

To transform the current web application into a native iOS app for the Apple App Store, we will use **Capacitor**. This allows us to maintain the existing code while giving users the native iPhone experience.

## 🚀 Phase 1: Preparation (The "Core" Transition)
Since this is a Next.js app, we need to adapt it for a bundled environment.

### 1. Static Export Configuration
Apple requires the app's code to be bundled. We will configure Next.js for "Static Exports" (`output: 'export'`).
- **Action**: Update `next.config.js`.
- **Note**: Server-side logic (Prisma) must move to API routes on your live server, and the app will fetch data from there.

### 2. Install Capacitor
Integrate the Capacitor bridge into the existing project.
```powershell
npm install @capacitor/core @capacitor/cli
npx cap init FHMChurch com.savankajo.fhm
npm install @capacitor/ios
npx cap add ios
```

## 🎨 Phase 2: Native Polish (User Experience)
To get approved by Apple, the app must feel indistinguishable from a native app.

### 1. Safe Area Insets
Ensure the UI doesn't clash with the iPhone "Notch" or the Home Indicator.
- We will use CSS variables like `env(safe-area-inset-top)` to handle padding at the top and bottom.

### 2. Splash Screens & Icons
Generate all required sizes:
- **App Icon**: 1024x1024px.
- **Splash Screen**: 2732x2732px (Auto-scaled for all iPhones).

### 3. Native Features
Add native haptic feedback (vibrations) when users tap buttons or "Like" a verse to give it that premium iPhone feel.

## 🚢 Phase 3: Deployment (To the App Store)

### 1. Xcode Setup
Sync the builds to Xcode (Apple's developer tool).
```powershell
npm run build
npx cap sync ios
npx cap open ios
```

### 2. App Store Connect Requirements
Before pressing "Submit," we need:
- **Developer Account**: You’ll need an Apple Developer Program membership ($99/year).
- **Privacy Policy**: A simple hosting page.
- **Screenshots**: High-resolution captures of the Home, Media, and Teams pages.

---

## 🛠️ Next Steps for the Assistant:
1. [ ] Create a dedicated `ios/` configuration.
2. [ ] Modify `next.config.js` to support static exports.
3. [ ] Generate the `FHM_IOS_ASSETS` folder placeholder.
4. [ ] Refactor navigation to handle the bottom "Home Indicator" padding.

Would you like me to start the technical setup (installing Capacitor) now?
