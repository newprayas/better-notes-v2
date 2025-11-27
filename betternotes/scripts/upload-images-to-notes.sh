#!/bin/bash

# Upload images from folder structure to corresponding notes in Sanity Studio
echo "🚀 Uploading images from folder structure to Sanity Studio notes..."

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

# Check if SANITY_API_TOKEN is set
if [ -z "$SANITY_API_TOKEN" ]; then
    echo "❌ Error: SANITY_API_TOKEN not found in .env.local!"
    echo "Please add SANITY_API_TOKEN to your .env.local file."
    exit 1
fi

# Run the upload script
node upload-images-to-notes.js

echo ""
echo "✅ Image upload process completed!"