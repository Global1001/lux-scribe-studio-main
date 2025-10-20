# LuxScribe Studio - Script Utilities (PowerShell)
# Consolidated script runner for common development tasks

param(
    [Parameter(Position=0)]
    [string]$Command,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

# Get script locations
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

function Show-Help {
    Write-Host "LuxScribe Studio - Script Utilities" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\run.ps1 <command> [options]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Cyan
    Write-Host "  dev              Start development servers" -ForegroundColor Yellow
    Write-Host "  dev -Frontend    Start only frontend" -ForegroundColor Yellow
    Write-Host "  dev -Backend     Start only backend" -ForegroundColor Yellow
    Write-Host "  dev -Kill        Kill existing processes and start" -ForegroundColor Yellow
    Write-Host "  test             Run conversion tests" -ForegroundColor Yellow
    Write-Host "  debug            Run debug conversion script" -ForegroundColor Yellow
    Write-Host "  deploy           Deploy to production" -ForegroundColor Yellow
    Write-Host "  setup-cron       Setup automatic deployment" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\run.ps1 dev                 # Start both frontend and backend"
    Write-Host "  .\run.ps1 dev -Frontend       # Start only frontend"
    Write-Host "  .\run.ps1 test                # Run conversion tests"
    Write-Host "  .\run.ps1 deploy              # Deploy to production"
}

function Invoke-Dev {
    param([string[]]$Arguments)
    
    # Convert bash-style arguments to PowerShell parameters
    $PSArgs = @()
    foreach ($arg in $Arguments) {
        switch ($arg) {
            "--frontend" { $PSArgs += "-FrontendOnly" }
            "--backend" { $PSArgs += "-BackendOnly" }
            "--kill" { $PSArgs += "-KillExisting" }
        }
    }
    
    & "$ScriptDir\dev\start-dev.ps1" @PSArgs
}

function Invoke-Test {
    Set-Location $ProjectRoot
    Write-Host "Running PDF conversion tests..." -ForegroundColor Green
    python "$ScriptDir\test\test_pdf_conversion.py"
}

function Invoke-Debug {
    Set-Location $ProjectRoot
    Write-Host "Running debug conversion script..." -ForegroundColor Green
    python "$ScriptDir\test\debug_conversion.py"
}

function Invoke-Deploy {
    Write-Host "Running deployment script..." -ForegroundColor Green
    bash "$ScriptDir\deploy\deploy.sh"
}

function Invoke-SetupCron {
    Write-Host "Setting up cron job for automatic deployment..." -ForegroundColor Green
    bash "$ScriptDir\deploy\setup-cron.sh"
}

# Main command handling
switch ($Command) {
    "dev" {
        Invoke-Dev $Args
    }
    "test" {
        Invoke-Test
    }
    "debug" {
        Invoke-Debug
    }
    "deploy" {
        Invoke-Deploy
    }
    "setup-cron" {
        Invoke-SetupCron
    }
    { $_ -in @("help", "--help", "-h") } {
        Show-Help
    }
    { [string]::IsNullOrEmpty($_) } {
        Show-Help
    }
    default {
        Write-Host "Error: Unknown command '$Command'" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
}
