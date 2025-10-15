#!/bin/bash

# CRM Mobile App Setup Script

echo "🚀 Setting up CRM Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install iOS dependencies (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Installing iOS dependencies..."
    cd ios && pod install && cd ..
    echo "✅ iOS dependencies installed"
else
    echo "ℹ️  Skipping iOS dependencies (not on macOS)"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p src/__tests__
mkdir -p src/components
mkdir -p src/contexts
mkdir -p src/navigation
mkdir -p src/screens/auth
mkdir -p src/screens/customers
mkdir -p src/screens/leads
mkdir -p src/screens/main
mkdir -p src/services
mkdir -p src/store/slices
mkdir -p src/theme
mkdir -p src/utils
mkdir -p src/types

echo "✅ Directories created"

# Set up git hooks (optional)
if [ -d ".git" ]; then
    echo "🔧 Setting up git hooks..."
    # Add pre-commit hook for linting
    echo '#!/bin/sh
npm run lint
npm run test' > .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo "✅ Git hooks set up"
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Metro bundler: npm start"
echo "2. Run on Android: npm run android"
echo "3. Run on iOS: npm run ios (macOS only)"
echo "4. Run tests: npm test"
echo ""
echo "Happy coding! 🚀"
