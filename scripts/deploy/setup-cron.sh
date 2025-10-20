#!/bin/bash

# Setup script for automatic deployment cron job

# Make the deploy script executable
chmod +x /home/ec2-user/lux-scribe-studio/scripts/deploy/deploy.sh

# Add cron job to check for updates every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/ec2-user/lux-scribe-studio/scripts/deploy/deploy.sh >> /home/ec2-user/lux-scribe-studio/deploy.log 2>&1") | crontab -

echo "Cron job set up successfully!"
echo "The deployment script will run every 5 minutes"
echo "Logs will be saved to /home/ec2-user/lux-scribe-studio/deploy.log" 