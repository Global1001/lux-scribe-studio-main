#!/bin/bash

# Development Startup Script for LuxScribe Studio
# This script helps avoid common startup issues and ensures proper configuration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parse command line arguments
BACKEND_ONLY=false
FRONTEND_ONLY=false
KILL_EXISTING=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        --kill-existing)
            KILL_EXISTING=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--backend-only] [--frontend-only] [--kill-existing]"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}🚀 LuxScribe Studio Development Startup Script${NC}"
echo -e "${GREEN}================================================${NC}"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific ports
kill_port_processes() {
    local ports=("$@")
    for port in "${ports[@]}"; do
        if check_port $port; then
            echo -e "${YELLOW}Stopping processes on port $port...${NC}"
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
}

# Function to start backend server
start_backend() {
    echo -e "\n${CYAN}🔧 Starting Backend Server...${NC}"
    
    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        echo -e "${RED}❌ Virtual environment not found. Creating one...${NC}"
        python3 -m venv .venv
    fi
    
    # Activate virtual environment
    echo -e "${YELLOW}📦 Activating virtual environment...${NC}"
    source .venv/bin/activate
    
    # Check if backend directory exists
    if [ ! -d "backend" ]; then
        echo -e "${RED}❌ Backend directory not found!${NC}"
        exit 1
    fi
    
    # Change to backend directory
    cd backend
    
    # Check if requirements are installed
    if [ ! -f "requirements.txt" ]; then
        echo -e "${RED}❌ requirements.txt not found in backend directory!${NC}"
        exit 1
    fi
    
    # Install dependencies if needed
    echo -e "${YELLOW}📦 Installing/updating Python dependencies...${NC}"
    pip install -r requirements.txt
    
    # Check if port 8000 is available
    if check_port 8000; then
        echo -e "${YELLOW}⚠️  Port 8000 is already in use!${NC}"
        if [ "$KILL_EXISTING" = true ]; then
            kill_port_processes 8000
        else
            echo -e "${YELLOW}Use --kill-existing flag to stop existing processes${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}🚀 Starting backend server on http://localhost:8000${NC}"
    echo -e "${GREEN}📚 API docs will be available at http://localhost:8000/docs${NC}"
    echo -e "${GREEN}🏥 Health check at http://localhost:8000/health${NC}"
    
    # Start the backend server
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

# Function to start frontend server
start_frontend() {
    echo -e "\n${CYAN}🎨 Starting Frontend Server...${NC}"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json not found!${NC}"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
        pnpm install
    fi
    
    # Check if port 8080 is available
    if check_port 8080; then
        echo -e "${YELLOW}⚠️  Port 8080 is already in use!${NC}"
        if [ "$KILL_EXISTING" = true ]; then
            kill_port_processes 8080
        else
            echo -e "${YELLOW}Use --kill-existing flag to stop existing processes${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}🚀 Starting frontend server...${NC}"
    echo -e "${GREEN}🌐 Frontend will be available at http://localhost:8080 (or 8081 if 8080 is busy)${NC}"
    
    # Start the frontend server
    pnpm run dev
}

# Main script logic
main() {
    # Kill existing processes if requested
    if [ "$KILL_EXISTING" = true ]; then
        echo -e "${YELLOW}🔄 Stopping existing processes...${NC}"
        kill_port_processes 8000 8080 8081
        sleep 2
    fi
    
    # Determine what to start
    if [ "$BACKEND_ONLY" = true ]; then
        start_backend
    elif [ "$FRONTEND_ONLY" = true ]; then
        start_frontend
    else
        # Start both servers
        echo -e "${GREEN}🔄 Starting both backend and frontend servers...${NC}"
        
        # Start backend in background
        start_backend &
        BACKEND_PID=$!
        
        # Wait a moment for backend to start
        sleep 3
        
        # Start frontend in foreground
        start_frontend
        
        # If frontend exits, kill backend
        kill $BACKEND_PID 2>/dev/null || true
    fi
}

# Run main function
main "$@" 