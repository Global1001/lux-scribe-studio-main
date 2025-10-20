# Scripts Directory

This directory contains all the utility scripts for LuxScribe Studio, organized by purpose.

## Structure

```
scripts/
├── run.sh              # Main script runner (Bash)
├── run.ps1             # Main script runner (PowerShell)
├── dev/                # Development scripts
│   ├── start-dev.sh    # Development server startup (Bash)
│   └── start-dev.ps1   # Development server startup (PowerShell)
├── deploy/             # Deployment scripts
│   ├── deploy.sh       # Auto-deployment script
│   └── setup-cron.sh   # Cron job setup
└── test/               # Testing scripts
    ├── test_pdf_conversion.py  # PDF conversion tests
    └── debug_conversion.py     # Debug conversion script
```

## Usage

### Quick Start

**Bash/Linux/macOS:**
```bash
# Start development servers
./scripts/run.sh dev

# Start only frontend
./scripts/run.sh dev --frontend

# Run tests
./scripts/run.sh test
```

**PowerShell/Windows:**
```powershell
# Start development servers
.\scripts\run.ps1 dev

# Start only frontend
.\scripts\run.ps1 dev -Frontend

# Run tests
.\scripts\run.ps1 test
```

### Available Commands

- `dev` - Start development servers (both frontend and backend)
- `dev --frontend` / `dev -Frontend` - Start only frontend server
- `dev --backend` / `dev -Backend` - Start only backend server  
- `dev --kill` / `dev -Kill` - Kill existing processes and start fresh
- `test` - Run PDF conversion tests
- `debug` - Run debug conversion script
- `deploy` - Deploy to production (Linux/server only)
- `setup-cron` - Setup automatic deployment cron job (Linux/server only)

### Direct Script Access

You can also run scripts directly if needed:

```bash
# Development
./scripts/dev/start-dev.sh --frontend-only
./scripts/dev/start-dev.ps1 -FrontendOnly

# Testing
python ./scripts/test/test_pdf_conversion.py
python ./scripts/test/debug_conversion.py

# Deployment (Linux/server)
./scripts/deploy/deploy.sh
./scripts/deploy/setup-cron.sh
```

## Migration from Root Directory

The following scripts have been moved from the root directory:

- `start-dev.sh` → `scripts/dev/start-dev.sh`
- `start-dev.ps1` → `scripts/dev/start-dev.ps1`
- `deploy.sh` → `scripts/deploy/deploy.sh`
- `setup-cron.sh` → `scripts/deploy/setup-cron.sh`
- `test_pdf_conversion.py` → `scripts/test/test_pdf_conversion.py`
- `debug_conversion.py` → `scripts/test/debug_conversion.py`

## Notes

- All scripts have been updated to use `pnpm` instead of `npm`
- The main runner scripts (`run.sh` and `run.ps1`) provide a unified interface
- PM2 configuration (`ecosystem.config.cjs`) has been updated for the new structure
- All paths are automatically resolved, so scripts work from any directory
