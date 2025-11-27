#!/bin/bash

# Fetch current configuration from Sanity Studio
echo "🚀 Fetching current configuration from Sanity Studio..."

# Check if .env.local exists
if [ ! -f "../.env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please make sure you have a .env.local file with your Sanity credentials."
    exit 1
fi

# Load environment variables from .env.local
set -a
source ../.env.local
set +a

# Run the fetch script
node fetch-current-config.js

echo ""
echo "✅ Done! The current configuration has been exported to current-config.js"