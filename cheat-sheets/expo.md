# Expo Cheat Sheet

## 🔧 Environment Info
Check your current development environment:
```bash
npx expo-env-info
```

## 🚀 Project Commands

### Create a new project
```bash
npx create-expo-app my-app
```

### Start development server
```bash
npx expo start
```

### Run on Android device/emulator
```bash
npx expo run:android
```

### Run on iOS simulator (Mac only)
```bash
npx expo run:ios
```

### Build app (EAS)
```bash
eas build --platform android
eas build --platform ios
```

### Preview build
```bash
eas build --profile preview --platform android
```

### Preview APK from GitHub Actions (rare / testers)
Do **not** add this to pull-request CI. Use the manual **Preview APK** workflow:

1. Repo **Settings → Secrets and variables → Actions**: `EXPO_TOKEN`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
2. If Android credentials do not exist yet, run one interactive `eas build --profile preview --platform android` locally so EAS can create the keystore.
3. **Actions → Preview APK → Run workflow** and pick the branch (often `master`).
4. The job only *submits* `eas build --profile preview --platform android`. Wait on the EAS URL in the log, then download the APK and sideload it.

`.env` is gitignored, so the workflow writes those public Supabase values into the `preview` profile `env` for that run only.

## 🧪 Testing

### Install Expo Go-compatible packages
```bash
npx expo install <package-name>
```

### Clean build cache
```bash
expo prebuild --clean
```

## 📦 Update Expo SDK
```bash
npx expo upgrade
```

---

Keep this sheet nearby while working with Expo projects!
