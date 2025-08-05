.PHONY: build preview production clean update doctor run start submit

# Development Commands
start:
	npx expo start

run:
	npx expo run:android

# Quick build using EAS (managed workflow)
build:
	eas build --platform android --profile development --local

# Cleanup
clean:
	npx expo prebuild --clean
	rm -rf node_modules
	rm package-lock.json
	npm install

# EAS Update Commands (for OTA updates)
update:
	eas update --branch preview --platform android

# Project Health Checks
doctor:
	npx expo install --check
	npx expo-doctor

# Submit to Play Store
submit:
	eas submit --platform android --profile production

# Preview build (AAB for testing)
preview: clean
	eas build --platform android --profile preview --local
	@echo "✅ Preview AAB completed"

# Quick build using EAS (managed workflow)
development:
	eas build --platform android --profile development --local

# Production build (AAB for Play Store)
production: clean
	eas build --platform android --profile production --local
	@echo "✅ Production AAB completed"

# Full release workflow (for production)
release: clean production
	@echo "✅ Full release build completed!"
	@echo "🚀 Ready to upload to Google Play Console"
