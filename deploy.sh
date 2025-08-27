#!/bin/bash

# 🚀 AI Chatbot Deployment Script
# This script automates the deployment process

echo "🚀 Starting AI Chatbot Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_status "Creating .env file template..."
    cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI Service Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Web Search API
VITE_SERPER_API_KEY=your_serper_api_key_here
EOF
    print_warning "Please update .env file with your actual API keys before continuing!"
    exit 1
fi

# Check if git is initialized
if [ ! -d .git ]; then
    print_status "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: AI Chatbot with API"
    git branch -M main
    print_warning "Please add your GitHub remote: git remote add origin https://github.com/YOUR_USERNAME/codebrew-showcase-hub.git"
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Run type check
print_status "Running TypeScript check..."
npm run type-check

# Build the project
print_status "Building project..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed! Please check the errors above."
    exit 1
fi

# Check if remote is configured
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "GitHub remote not configured!"
    print_status "Please run: git remote add origin https://github.com/YOUR_USERNAME/codebrew-showcase-hub.git"
    print_status "Then run: git push -u origin main"
else
    # Push to GitHub
    print_status "Pushing to GitHub..."
    git add .
    git commit -m "Deploy: AI Chatbot with API endpoints"
    git push origin main
    
    if [ $? -eq 0 ]; then
        print_success "Code pushed to GitHub successfully!"
    else
        print_error "Failed to push to GitHub!"
        exit 1
    fi
fi

# Deployment instructions
echo ""
print_success "🎉 Local setup completed!"
echo ""
print_status "Next steps:"
echo "1. Go to https://vercel.com and sign in with GitHub"
echo "2. Click 'New Project' and import your repository"
echo "3. Configure environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
print_status "Your API endpoints will be available at:"
echo "  - POST https://your-project.vercel.app/api/chatbot/message"
echo "  - GET  https://your-project.vercel.app/api/chatbot/history"
echo "  - GET  https://your-project.vercel.app/api/chatbot/faq"
echo ""
print_status "For detailed instructions, see DEPLOYMENT_GUIDE.md"
