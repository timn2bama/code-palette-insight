#!/bin/bash

# Security scanning script
echo "🔒 Running security scans..."

# Audit npm packages
echo "📦 Auditing npm packages..."
npm audit --audit-level moderate

# Check for security vulnerabilities in code
echo "🔍 Scanning for security vulnerabilities..."
npx eslint src --ext .ts,.tsx --config .eslintrc-security.js

# Check for secrets in code
echo "🔐 Checking for exposed secrets..."
grep -r "sk_" src/ && echo "⚠️ Potential secret found!" || echo "✅ No secrets detected"
grep -r "pk_" src/ && echo "⚠️ Potential public key found!" || echo "✅ No public keys detected"

echo "✅ Security scan completed!"