# Development Startup Script for LuxScribe Studio
# This script helps avoid common startup issues and ensures proper configuration

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$KillExisting
)

Write-Host "🚀 LuxScribe Studio Development Startup Script" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Function to kill processes on specific ports
function Stop-PortProcesses {
    param([int[]]$Ports)
    foreach ($port in $Ports) {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
                    Select-Object -ExpandProperty OwningProcess | 
                    ForEach-Object { Get-Process -Id $_ -ErrorAction SilentlyContinue }
        
        foreach ($process in $processes) {
            Write-Host "Stopping process $($process.ProcessName) (PID: $($process.Id)) on port $port" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
}

# Function to start backend server
function Start-Backend {
    Write-Host "`n🔧 Starting Backend Server..." -ForegroundColor Cyan
    
    # Check if virtual environment exists
    if (-not (Test-Path ".venv")) {
        Write-Host "❌ Virtual environment not found. Creating one..." -ForegroundColor Red
        python -m venv .venv
    }
    
    # Activate virtual environment
    Write-Host "📦 Activating virtual environment..." -ForegroundColor Yellow
    & ".venv\Scripts\Activate.ps1"
    
    # Check if backend directory exists
    if (-not (Test-Path "backend")) {
        Write-Host "❌ Backend directory not found!" -ForegroundColor Red
        exit 1
    }
    
    # Change to backend directory
    Set-Location backend
    
    # Check if requirements are installed
    if (-not (Test-Path "requirements.txt")) {
        Write-Host "❌ requirements.txt not found in backend directory!" -ForegroundColor Red
        exit 1
    }
    
    # Install dependencies if needed
    Write-Host "📦 Installing/updating Python dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    
    # Check if port 8000 is available
    if (Test-Port 8000) {
        Write-Host "⚠️  Port 8000 is already in use!" -ForegroundColor Yellow
        if ($KillExisting) {
            Stop-PortProcesses @(8000)
        } else {
            Write-Host "Use -KillExisting flag to stop existing processes" -ForegroundColor Yellow
            exit 1
        }
    }
    
    Write-Host "🚀 Starting backend server on http://localhost:8000" -ForegroundColor Green
    Write-Host "📚 API docs will be available at http://localhost:8000/docs" -ForegroundColor Green
    Write-Host "🏥 Health check at http://localhost:8000/health" -ForegroundColor Green
    
    # Start the backend server
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

# Function to start frontend server
function Start-Frontend {
    Write-Host "`n🎨 Starting Frontend Server..." -ForegroundColor Cyan
    
    # Check if package.json exists
    if (-not (Test-Path "package.json")) {
        Write-Host "❌ package.json not found!" -ForegroundColor Red
        exit 1
    }
    
    # Install dependencies if node_modules doesn't exist
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
        pnpm install
    }
    
    # Check if port 8080 is available
    if (Test-Port 8080) {
        Write-Host "⚠️  Port 8080 is already in use!" -ForegroundColor Yellow
        if ($KillExisting) {
            Stop-PortProcesses @(8080)
        } else {
            Write-Host "Use -KillExisting flag to stop existing processes" -ForegroundColor Yellow
            exit 1
        }
    }
    
    Write-Host "🚀 Starting frontend server..." -ForegroundColor Green
    Write-Host "🌐 Frontend will be available at http://localhost:8080 (or 8081 if 8080 is busy)" -ForegroundColor Green
    
    # Start the frontend server
    pnpm run dev
}

# Main script logic
try {
    # Kill existing processes if requested
    if ($KillExisting) {
        Write-Host "🔄 Stopping existing processes..." -ForegroundColor Yellow
        Stop-PortProcesses @(8000, 8080, 8081)
        Start-Sleep -Seconds 2
    }
    
    # Determine what to start
    if ($BackendOnly) {
        Start-Backend
    } elseif ($FrontendOnly) {
        Start-Frontend
    } else {
        # Start both servers in separate windows
        Write-Host "🔄 Starting both backend and frontend servers..." -ForegroundColor Green
        
        # Start backend in a new PowerShell window
        $currentDir = Get-Location
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentDir'; .\start-dev.ps1 -BackendOnly"
        
        # Wait a moment for backend to start
        Start-Sleep -Seconds 3
        
        # Start frontend in current window
        Start-Frontend
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
} 