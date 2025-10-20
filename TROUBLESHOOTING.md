# Troubleshooting Guide

This guide covers common issues and their solutions based on real debugging experiences.

## Table of Contents

1. [CORS Issues](#cors-issues)
2. [Server Startup Problems](#server-startup-problems)
3. [Configuration Issues](#configuration-issues)
4. [API Connection Problems](#api-connection-problems)
5. [Development Environment Setup](#development-environment-setup)

## Supabase Connection Issues

### Common Supabase Connection Problems

1. **Missing Environment Variables**
   - **Symptoms**: Console errors about missing Supabase URL or key, authentication failures
   - **Solution**: 
     - Check that you've created a `.env` file in the project root
     - Verify that all required Supabase variables are set (see README.md)
     - Run `cat .env | grep SUPABASE` to verify your variables are set correctly

2. **Invalid Supabase Credentials**
   - **Symptoms**: Authentication errors, "Invalid API key" errors
   - **Solution**:
     - Verify your Supabase URL and keys in the Supabase dashboard
     - Make sure you're using the correct key type (anon key for frontend, service key for backend)
     - Check for extra spaces or characters in your environment variables

3. **CORS Issues**
   - **Symptoms**: Console errors about CORS policy, blocked by CORS
   - **Solution**:
     - Check that your application's URL is added to the allowed origins in Supabase dashboard
     - Verify that your environment variables match the URL you're accessing the app from

4. **Testing Supabase Connection**
   - You can test your Supabase connection by running:
     ```bash
     cd backend
     python -m app.scripts.test_supabase_connection
     ```
   - This script will verify if your Supabase credentials are working correctly

5. **Environment Variable Loading**
   - **Symptoms**: Changes to `.env` file not taking effect
   - **Solution**:
     - Restart your development servers after changing environment variables
     - For frontend: `npm run dev`
     - For backend: restart the uvicorn server

## CORS Issues

### Symptoms
- Browser console shows: `Access to fetch at 'http://localhost:8000/api/v1/search' from origin 'http://localhost:8080' has been blocked by CORS policy`
- Network tab shows failed requests with CORS errors
- Frontend can't communicate with backend

### Solutions

#### 1. Verify Backend CORS Configuration
```bash
# Check if backend is running and CORS is configured
curl http://localhost:8000/health
```

Expected response should include `cors_origins` field:
```json
{
  "status": "healthy",
  "service": "deep-legal-research",
  "version": "0.1.0",
  "cors_origins": ["http://localhost:8080", "http://localhost:8081", "http://localhost:3000"],
  "debug": true
}
```

#### 2. Test CORS Endpoint
```bash
# Test the CORS endpoint directly
curl http://localhost:8000/test-cors
```

#### 3. Check Frontend Port
The frontend may run on different ports:
- Port 8080 (default)
- Port 8081 (if 8080 is in use)
- Port 3000 (alternative)

Check the console output when starting the frontend:
```
VITE v5.4.10  ready in 426 ms
➜  Local:   http://localhost:8080/
```

#### 4. Update CORS Configuration
If the frontend is running on a different port, update the backend configuration:

**Option A: Environment Variables**
```bash
# Set environment variables
export FRONTEND_PORT=8081  # or whatever port your frontend is using
```

**Option B: Direct Configuration**
Edit `backend/app/config/environment.py`:
```python
@property
def allowed_origins(self) -> List[str]:
    """Get allowed CORS origins based on environment."""
    if self.ENVIRONMENT == "development":
        return [
            self.frontend_url,
            "http://localhost:3000",
            "http://localhost:8080",
            "http://localhost:8081",  # Add your frontend port
        ]
```

#### 5. Restart Backend Server
After configuration changes:
```bash
# Stop the backend (Ctrl+C)
# Then restart
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Server Startup Problems

### Symptoms
- `ModuleNotFoundError: No module named 'app'`
- PowerShell syntax errors
- Port already in use errors

### Solutions

#### 1. PowerShell Command Syntax
**Wrong:**
```powershell
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Correct:**
```powershell
cd backend; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Module Import Errors
**Problem:** Running uvicorn from wrong directory
```bash
# Wrong - running from root directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Solution:** Run from backend directory
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Port Conflicts
**Problem:** Multiple server instances running

**Solution:** Stop all Python processes
```bash
# Windows PowerShell
taskkill /f /im python.exe
taskkill /f /im uvicorn.exe

# Then restart
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Configuration Issues

### Symptoms
- Hardcoded URLs in code
- Inconsistent environment variable handling
- Configuration not loading properly

### Solutions

#### 1. Use Centralized Configuration
Always use the centralized config files:
- Frontend: `src/lib/config.ts`
- Backend: `backend/app/config/environment.py`

#### 2. Environment Variables
Create a `.env` file in the root directory:
```env
# Backend Configuration
HOST=0.0.0.0
PORT=8000
FRONTEND_HOST=localhost
FRONTEND_PORT=8080
DEBUG=true

# Frontend Configuration
VITE_BACKEND_HOST=localhost
VITE_BACKEND_PORT=8000
VITE_FRONTEND_PORT=8080
```

#### 3. Validate Configuration
Check if configuration is loading correctly:
```bash
# Backend health check
curl http://localhost:8000/health

# Should return configuration info
```

## API Connection Problems

### Symptoms
- Frontend can't reach backend API
- Network errors in browser console
- 404 errors on API endpoints

### Solutions

#### 1. Verify Backend is Running
```bash
# Check if backend is accessible
curl http://localhost:8000/health
```

#### 2. Check API Endpoints
```bash
# Test specific endpoints
curl http://localhost:8000/api/v1/search
curl http://localhost:8000/test-cors
```

#### 3. Verify Frontend Configuration
Check `src/lib/config.ts`:
```typescript
// Make sure these match your backend
backend: {
  port: 8000,
  host: 'localhost',
  protocol: 'http',
}
```

#### 4. Browser Console Testing
Open browser console and test:
```javascript
// Test CORS endpoint
fetch('http://localhost:8000/test-cors')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Test search endpoint
fetch('http://localhost:8000/api/v1/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'test query',
    max_results: 5
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Development Environment Setup

### Prerequisites
1. Python 3.11+ with virtual environment
2. Node.js 18+ with npm
3. Git

### Setup Steps

#### 1. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Install dependencies
cd backend
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start frontend server
npm run dev
```

#### 3. Verify Setup
1. Backend should be running on http://localhost:8000
2. Frontend should be running on http://localhost:8080 (or 8081)
3. Health check should work: http://localhost:8000/health
4. API docs should be available: http://localhost:8000/docs

### Common Setup Issues

#### 1. Virtual Environment Issues
```bash
# If you get "python not found" errors
python --version  # Check if Python is installed
python -m venv .venv  # Create virtual environment
.venv\Scripts\activate  # Activate (Windows)
```

#### 2. Port Conflicts
```bash
# Check what's using the ports
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Linux/Mac

# Kill processes if needed
taskkill /f /pid <PID>  # Windows
kill -9 <PID>  # Linux/Mac
```

#### 3. Dependencies Issues
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For Python
pip uninstall -r requirements.txt
pip install -r requirements.txt
```

## Debugging Checklist

When encountering issues, follow this checklist:

1. **Check if services are running**
   - Backend: `curl http://localhost:8000/health`
   - Frontend: Check browser console for Vite startup message

2. **Verify ports**
   - Backend: 8000
   - Frontend: 8080 or 8081

3. **Check CORS configuration**
   - Backend health check should show `cors_origins`
   - Test CORS endpoint: `curl http://localhost:8000/test-cors`

4. **Verify configuration**
   - Check environment variables
   - Validate config files are loading

5. **Test API endpoints**
   - Use browser console to test fetch requests
   - Check network tab for failed requests

6. **Check logs**
   - Backend logs should show startup information
   - Frontend console should show no errors

## Getting Help

If you're still experiencing issues:

1. Check the logs for specific error messages
2. Verify all prerequisites are installed
3. Try the debugging checklist above
4. Check if the issue is documented in this guide
5. Create a new issue with:
   - Error messages
   - Steps to reproduce
   - Environment details (OS, Python version, Node version)
   - Logs from both frontend and backend

## Prevention Tips

1. **Always use centralized configuration** - Don't hardcode URLs or ports
2. **Test endpoints regularly** - Use the health check and CORS test endpoints
3. **Monitor logs** - Check both frontend and backend logs for errors
4. **Use environment variables** - Configure ports and hosts via environment
5. **Document changes** - Update this guide when you encounter new issues 