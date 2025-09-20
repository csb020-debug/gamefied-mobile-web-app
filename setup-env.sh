#!/bin/bash

# Environment Setup Script for EcoQuest
# This script helps set up the Supabase environment variables

echo "🔧 EcoQuest Environment Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file already exists"
    echo "Current content:"
    cat .env.local
    echo ""
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "📝 Creating .env.local file..."
echo ""

# Get Supabase URL
echo "Enter your Supabase Project URL:"
echo "Example: https://abcdefghijklmnop.supabase.co"
read -p "URL: " supabase_url

# Validate URL format
if [[ ! $supabase_url =~ ^https://.*\.supabase\.co$ ]]; then
    echo "❌ Invalid URL format. Must be: https://your-project.supabase.co"
    exit 1
fi

# Get Supabase Key
echo ""
echo "Enter your Supabase anon/public key:"
echo "Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
read -p "Key: " supabase_key

# Validate key format
if [[ ! $supabase_key =~ ^eyJ ]]; then
    echo "❌ Invalid key format. Must start with 'eyJ'"
    exit 1
fi

# Create .env.local file
cat > .env.local << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$supabase_url
VITE_SUPABASE_ANON_KEY=$supabase_key
EOF

echo ""
echo "✅ .env.local file created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your development server"
echo "2. Refresh the page"
echo "3. Run the Integration Test Suite"
echo ""
echo "🚀 To restart the server:"
echo "   npm run dev"
echo "   # or"
echo "   yarn dev"
echo "   # or"
echo "   bun dev"
