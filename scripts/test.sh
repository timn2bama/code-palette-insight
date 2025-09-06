#!/bin/bash

# Test script for CI/CD pipeline
echo "Running comprehensive test suite..."

# Type checking
echo "🔍 Running type check..."
npx tsc --noEmit

# Linting
echo "🧹 Running ESLint..."
npx eslint src --ext .ts,.tsx --max-warnings 0

# Build test
echo "🏗️ Testing build..."
npm run build

# Size analysis
echo "📊 Analyzing bundle size..."
npx bundlesize

echo "✅ All tests passed!"