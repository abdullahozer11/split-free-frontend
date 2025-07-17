.PHONY: build preview production clean update doctor run logs devices submit start bump-version

# Development Commands
start:
	npx expo start

run:
	expo run:android

# Version Management
bump-version:
	npm run bump-version

# Local Build Commands
build-debug:
	cd android && ./gradlew assembleDebug

build-release:
	npm run build-android

preview: clean bump-version
	cd android && ./gradlew bundleRelease
	@echo "✅ Preview build completed: android/app/build/outputs/bundle/release/app-release.aab"

production: clean bump-version
	cd android && ./gradlew bundleRelease
	@echo "✅ Production build completed: android/app/build/outputs/bundle/release/app-release.aab"

# Quick build without cleanup (faster for testing)
build:
	npm run build-android

# APK builds (for testing/sharing)
build-apk:
	#npm run bump-version
	cd android && ./gradlew assembleRelease
	@echo "✅ APK build completed: android/app/build/outputs/apk/release/app-release.apk"

# Cleanup and Prebuild
clean:
	expo prebuild --clean
	cd android && ./gradlew clean && cd ..

# EAS Update Commands (still useful for OTA updates)
update:
	eas update --branch preview --platform android

# Project Health Checks
doctor:
	npx expo install --check
	npx expo-doctor

# Debugging
logs:
	npx react-native log-android

devices:
	adb devicese

# Submit to Play Store
submit:
	eas submit --platform android --profile production

# Advanced build commands
build-unsigned:
	cd android && ./gradlew bundleRelease -x validateSigningRelease

# Install built APK to connected device
install:
	cd android && ./gradlew installRelease

# Full release workflow
release: clean bump-version production
	@echo "✅ Full release build completed!"
	@echo "📱 AAB file: android/app/build/outputs/bundle/release/app-release.aab"
	@echo "🚀 Ready to upload to Google Play Console"
