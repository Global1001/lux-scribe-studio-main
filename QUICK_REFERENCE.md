# Quick Reference Guide

## Supabase Setup

### Getting Supabase Credentials

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.io/)
   - Click "New Project"
   - Fill in project details and create

2. **Find Your Credentials**:
   - In your project dashboard, go to Settings > API
   - You'll need:
     - **Project URL**: `https://[your-project-id].supabase.co`
     - **anon/public key**: For frontend authentication
     - **service_role key**: For backend admin operations (keep secure!)

3. **Set Up Environment Variables**:
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit with your credentials
   nano .env
   ```

4. **Configure CORS for Your Domain**:
   - In Supabase Dashboard: Settings > API > CORS
   - Add your domain(s) to the allowed origins

### Testing Supabase Connection

```bash
# Test backend connection
cd backend
python -m app.scripts.test_supabase_connection

# Test frontend connection
# Check browser console after running:
npm run dev
```

## Other Quick References

## 🚨 Emergency Fixes

### CORS Errors
```bash
# 1. Check if backend is running
curl http://localhost:8000/health

# 2. Test CORS endpoint
curl http://localhost:8000/test-cors

# 3. Restart backend with proper CORS
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Port Conflicts
```bash
# Windows - Kill all Python/Node processes
taskkill /f /im python.exe
taskkill /f /im node.exe

# Linux/Mac - Kill processes on specific ports
lsof -ti:8000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

### Module Import Errors
```bash
# Wrong: Running from root directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Correct: Running from backend directory
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔧 Startup Commands

### Using Scripts (Recommended)
```bash
# Windows
.\start-dev.ps1 -KillExisting

# Linux/Mac
./start-dev.sh --kill-existing
```

### Manual Startup
```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
npm run dev
```

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:8080 | Main application |
| Backend | http://localhost:8000 | API server |
| API Docs | http://localhost:8000/docs | Swagger documentation |
| Health Check | http://localhost:8000/health | Service status |
| CORS Test | http://localhost:8000/test-cors | CORS verification |

## 🔍 Debugging Checklist

1. **Services Running?**
   - Backend: `curl http://localhost:8000/health`
   - Frontend: Check browser console for Vite message

2. **Ports Available?**
   - Backend: 8000
   - Frontend: 8080 (or 8081)

3. **CORS Configured?**
   - Health check shows `cors_origins`
   - Test endpoint: `curl http://localhost:8000/test-cors`

4. **Configuration Loaded?**
   - Backend: `backend/app/config/environment.py`
   - Frontend: `src/lib/config.ts`

## 🐛 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ModuleNotFoundError: No module named 'app'` | Wrong directory | Run from `backend/` directory |
| `Access to fetch has been blocked by CORS policy` | CORS not configured | Restart backend, check origins |
| `Port 8000 is already in use` | Multiple instances | Kill existing processes |
| `PowerShell: && is not a valid statement separator` | Wrong syntax | Use `;` instead of `&&` |

## 📞 Quick Commands

```bash
# Check what's using a port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Kill process by PID
taskkill /f /pid <PID>        # Windows
kill -9 <PID>                 # Linux/Mac

# Test API endpoints
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "max_results": 5}'

# Browser console test
fetch('http://localhost:8000/test-cors')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## 🎯 Configuration Files

| File | Purpose | Key Settings |
|------|---------|--------------|
| `backend/app/config/environment.py` | Backend config | HOST, PORT, CORS origins |
| `src/lib/config.ts` | Frontend config | API URLs, ports |
| `.env` | Environment vars | Copy from `env.example` |
| `backend/app/main.py` | FastAPI app | CORS middleware |

## 🚀 Production Checklist

- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=false`
- [ ] Configure `ALLOWED_ORIGINS` for your domain
- [ ] Set secure database URLs
- [ ] Configure API keys
- [ ] Set `FRONTEND_PROTOCOL=https`
- [ ] Update CORS origins for production domain

---

**Need more help?** Check the full [Troubleshooting Guide](TROUBLESHOOTING.md) 