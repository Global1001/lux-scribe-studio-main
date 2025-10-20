#!/bin/bash

# LuxScribe Studio Auto-Deploy Script
# This script pulls the latest changes from GitHub and restarts the applications

cd /home/ec2-user/lux-scribe-studio

# Pull latest changes from GitHub
echo "$(date): Checking for updates..."
git fetch origin

# Check if there are new changes
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
    echo "$(date): New changes detected, deploying..."
    
    # Pull the changes
    git pull origin main
    
    # Install dependencies if package.json changed
    if git diff --name-only HEAD~1 HEAD | grep -q "package.json"; then
        echo "$(date): Installing dependencies..."
        pnpm install
    fi
    
    # Install backend dependencies if requirements.txt changed
    if git diff --name-only HEAD~1 HEAD | grep -q "requirements.txt"; then
        echo "$(date): Installing backend dependencies..."
        cd backend
        pip3 install -r requirements.txt
        cd ..
    fi
    
    # Restart applications
    echo "$(date): Restarting applications..."
    pm2 restart all
    
    echo "$(date): Deployment complete!"
else
    echo "$(date): No new changes"
fi 