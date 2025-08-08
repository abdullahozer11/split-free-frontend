#!/bin/bash
# File: supabase-env-info.sh
# Run: chmod +x supabase-env-info.sh && ./supabase-env-info.sh

echo "Supabase Environment Info"
echo "========================="
echo "Project: split-free-frontend"
echo ""

# Supabase CLI Version
echo "Supabase CLI Version:"
supabase --version
echo ""

# Local PostgreSQL Version (from config.toml)
echo "Local PostgreSQL Version (config.toml):"
grep 'image' supabase/config.toml || echo "Not specified in config.toml"
echo ""

# Local PostgreSQL Version (from Docker images)
echo "Local PostgreSQL Docker Images:"
docker images | grep supabase/postgres || echo "No supabase/postgres images found"
echo ""

# Remote PostgreSQL Version (requires DB URL or manual check)
echo "Remote PostgreSQL Version:"
echo "Run 'psql -d <your-remote-db-url> -c \"SELECT version();\"' in terminal or check in Supabase Studio"
echo "Example: psql -d postgresql://postgres:<password>@db.<project-id>.supabase.co:5432/postgres -c \"SELECT version();\""
echo ""

# Docker Volumes
echo "Docker Volumes (Database Data):"
docker volume ls --filter label=com.supabase.cli.project=split-free-frontend
echo ""

# Running Containers
echo "Running Supabase Containers:"
docker ps -a --filter "label=com.supabase.cli.project=split-free-frontend" --format '{{.Names}} {{.Image}}'
echo ""

# Supabase Status
echo "Supabase Local Status:"
supabase status
