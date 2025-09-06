#!/bin/bash

# Performance testing script
echo "🚀 Running performance tests..."

# Build the project
npm run build

# Start preview server in background
npm run preview &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Run Lighthouse performance audit
npx lighthouse http://localhost:4173 \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html \
  --output-path=./performance-report.html \
  --chrome-flags="--headless --no-sandbox"

# Kill the server
kill $SERVER_PID

echo "✅ Performance test completed! Check performance-report.html"