#!/bin/bash
# OCLA Development Server - Mac/Linux
# Usage: ./scripts/dev.sh

set -e

echo "🔧 OCLA Development Server"
echo "=========================="

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to project root (one level up from scripts)
cd "$(dirname "$0")/.."

echo "📁 Working directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local found. Creating from example..."
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "✅ Created .env.local from example"
    else
        echo "DATABASE_URL=" > .env.local
        echo "✅ Created empty .env.local"
    fi
    echo ""
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate
echo ""

# Start development server
echo "🚀 Starting development server..."
echo "   Open http://localhost:3000 in your browser"
echo ""
npm run dev
