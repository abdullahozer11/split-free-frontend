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
