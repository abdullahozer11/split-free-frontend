.PHONY: build preview production clean update doctor run start submit clean-supabase

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
	npm install --legacy-peer-deps

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

# Supabase cleanup
clean-supabase:
	@echo "Supabase Cleanup for split-free-frontend"
	@echo "======================================="
	@echo "Stopping Supabase..."
	supabase stop || true
	@echo ""

	@echo "Listing Supabase Volumes:"
	docker volume ls --filter label=com.supabase.cli.project=split-free-frontend || true
	@echo ""

	@echo "Removing Supabase Volumes..."
	docker volume rm $$(docker volume ls -q --filter label=com.supabase.cli.project=split-free-frontend) || true
	@echo ""

	@echo "Listing Supabase Images:"
	docker images | grep supabase || true
	@echo ""

	@echo "Removing Supabase Images..."
	docker rmi $$(docker images | grep supabase | awk '{print $$1":"$$2}' | sort -u) || true
	@echo ""

	@echo "Verifying supabase/config.toml:"
	grep 'image' supabase/config.toml || echo "No image specified in config.toml"
	@echo ""

	@echo "Cleanup complete. Update supabase/config.toml if needed and run 'supabase start'."

