#!/bin/bash

# LuxScribe Studio - Script Utilities
# Consolidated script runner for common development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

show_help() {
    echo -e "${GREEN}LuxScribe Studio - Script Utilities${NC}"
    echo -e "${GREEN}====================================${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC} $0 <command> [options]"
    echo ""
    echo -e "${CYAN}Available commands:${NC}"
    echo -e "  ${YELLOW}dev${NC}              Start development servers"
    echo -e "  ${YELLOW}dev --frontend${NC}   Start only frontend"
    echo -e "  ${YELLOW}dev --backend${NC}    Start only backend"
    echo -e "  ${YELLOW}dev --kill${NC}       Kill existing processes and start"
    echo -e "  ${YELLOW}test${NC}             Run conversion tests"
    echo -e "  ${YELLOW}debug${NC}            Run debug conversion script"
    echo -e "  ${YELLOW}deploy${NC}           Deploy to production"
    echo -e "  ${YELLOW}setup-cron${NC}       Setup automatic deployment"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  $0 dev                 # Start both frontend and backend"
    echo -e "  $0 dev --frontend      # Start only frontend"
    echo -e "  $0 test                # Run conversion tests"
    echo -e "  $0 deploy              # Deploy to production"
}

run_dev() {
    if command -v pwsh &> /dev/null; then
        pwsh "$SCRIPT_DIR/dev/start-dev.ps1" "$@"
    else
        bash "$SCRIPT_DIR/dev/start-dev.sh" "$@"
    fi
}

run_test() {
    cd "$PROJECT_ROOT"
    echo -e "${GREEN}Running PDF conversion tests...${NC}"
    python3 "$SCRIPT_DIR/test/test_pdf_conversion.py"
}

run_debug() {
    cd "$PROJECT_ROOT"
    echo -e "${GREEN}Running debug conversion script...${NC}"
    python3 "$SCRIPT_DIR/test/debug_conversion.py"
}

run_deploy() {
    echo -e "${GREEN}Running deployment script...${NC}"
    bash "$SCRIPT_DIR/deploy/deploy.sh"
}

run_setup_cron() {
    echo -e "${GREEN}Setting up cron job for automatic deployment...${NC}"
    bash "$SCRIPT_DIR/deploy/setup-cron.sh"
}

# Main command handling
case "${1:-}" in
    dev)
        shift
        run_dev "$@"
        ;;
    test)
        run_test
        ;;
    debug)
        run_debug
        ;;
    deploy)
        run_deploy
        ;;
    setup-cron)
        run_setup_cron
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo -e "${RED}Error: Unknown command '${1}'${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
