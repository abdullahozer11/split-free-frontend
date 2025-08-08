#!/bin/bash
# File: supabase-cleanup.sh
# Purpose: List and remove Supabase Docker volumes and images for split-free-frontend
# Run: chmod +x supabase-cleanup.sh && ./supabase-cleanup.sh

echo "Supabase Cleanup for split-free-frontend"
echo "======================================="

# Stop Supabase
echo "Stopping Supabase..."
supabase stop
echo ""

# List volumes
echo "Listing Supabase Volumes:"
docker volume ls --filter label=com.supabase.cli.project=split-free-frontend
echo ""

# Remove volumes
echo "Removing Supabase Volumes..."
docker volume rm $(docker volume ls -q --filter label=com.supabase.cli.project=split-free-frontend)
echo ""

# List Supabase images
echo "Listing Supabase Images:"
docker images | grep supabase
echo ""

# Remove Supabase images
echo "Removing Supabase Images..."
docker rmi $(docker images | grep supabase | awk '{print $1":"$2}' | sort -u)
echo ""

# Verify config.toml
echo "Verifying supabase/config.toml:"
grep 'image' supabase/config.toml || echo "No image specified in config.toml"
echo ""

echo "Cleanup complete. Update supabase/config.toml if needed and run 'supabase start'."
