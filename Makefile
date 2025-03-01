.PHONY: build install preview production clean update doctor run logs devices submit prebuild start

# EAS Build Commands
build:
	eas build

install:
	npm install

preview:
	eas build --profile preview --platform android

production:
	eas build --profile production --platform android

# Cleanup and Prebuild
clean:
	expo prebuild --clean
	cd android && ./gradlew clean && cd ..

# EAS Update Commands
update:
	eas update --branch preview --platform android

# Project Health Checks
doctor:
	npx expo install --check
	npx expo-doctor
	depcheck

# Run App on Android
run:
	expo run:android

# Debugging
logs:
	npx react-native log-android

devices:
	adb devices

submit:
	eas submit --platform android --profile production

prebuild:
	npx expo prebuild --platform android

start:
	npm start
