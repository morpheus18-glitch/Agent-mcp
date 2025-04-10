#!/bin/sh

# Print environment info
echo "Starting LLM Sandbox..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Environment: $NODE_ENV"

# Check required environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "ERROR: NEXTAUTH_SECRET is not set"
  exit 1
fi

if [ -z "$NEXTAUTH_URL" ]; then
  echo "ERROR: NEXTAUTH_URL is not set"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_GROQ_API_KEY" ]; then
  echo "WARNING: NEXT_PUBLIC_GROQ_API_KEY is not set. LLM functionality will be limited."
fi

# Start the Next.js application
echo "Starting Next.js application..."
exec npm start
