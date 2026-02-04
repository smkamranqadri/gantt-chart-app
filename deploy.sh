#!/bin/bash
set -e

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create one based on .env.example"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Validate required variables
if [ -z "$CAPROVER_HOST" ] || [ -z "$CAPROVER_PASSWORD" ] || [ -z "$CAPROVER_APP_NAME" ]; then
    echo "Error: Required deployment variables (CAPROVER_HOST, CAPROVER_PASSWORD, CAPROVER_APP_NAME) are not set in .env"
    exit 1
fi

echo "Building Vite static site..."
npm run build

echo "Preparing deployment bundle..."
cp nginx.conf captain-definition Dockerfile dist/

echo "Deploying to CapRover..."
cd dist
git init
git add .
git commit -m "deploy" || true
caprover deploy -h "$CAPROVER_HOST" -p "$CAPROVER_PASSWORD" -a "$CAPROVER_APP_NAME" -b "${CAPROVER_BRANCH:-main}"
cd ..

echo "Deployment complete!"
