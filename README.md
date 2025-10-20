# LuxScribe Studio - Architecture Documentation

## Overview

LuxScribe Studio is a React-based document editor with AI chat integration and legal research capabilities. The application uses a client-server architecture with a Vite React frontend and FastAPI Python backend.

## Environment Setup

### Setting Up Environment Variables

1. **Copy the example environment file**:
   ```bash
   cp env.example .env
   ```

2. **Update the environment variables** in the `.env` file with your actual credentials:
   - Replace `your_supabase_url_here` with your actual Supabase URL
   - Replace `your_supabase_anon_key_here` with your Supabase anonymous key
   - Replace other placeholder values as needed

3. **Important security notes**:
   - Never commit your `.env` file to version control
   - The `.env` file is already added to `.gitignore`
   - For production deployment, use secure environment variable management

4. **Required variables for frontend**:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_BACKEND_HOST`: Backend API host (default: localhost)
   - `VITE_BACKEND_PORT`: Backend API port (default: 8001)
   - `VITE_FRONTEND_PORT`: Frontend port (default: 8082)

5. **Required variables for backend**:
   - `SUPABASE_URL`: Same as frontend Supabase URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key (different from anon key)
   - `DATABASE_URL`: Your database connection string

## Architecture Overview

### Frontend Architecture (React + Vite)

The frontend is built with React 18, TypeScript, and Vite, using a component-based architecture with the following structure:

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Main layout components
│   ├── chat/           # Chat interface components
│   ├── document/       # Document editing components
│   ├── auth/           # Authentication components
│   └── ui/             # Base UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── pages/              # Route-level components
├── lib/                # Utility libraries and configurations
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── integrations/       # External service integrations
```

### Backend Architecture (FastAPI)

The backend is built with FastAPI and follows a modular structure:

```
backend/
├── app/
│   ├── api/            # API route definitions
│   │   └── v1/
│   │       └── endpoints/  # Individual API endpoints
│   ├── config/         # Configuration management
│   ├── services/       # Business logic services
│   └── main.py         # FastAPI application entry point
├── requirements.txt    # Python dependencies
└── tests/             # Backend tests
```

## Core Modules

### Frontend Modules

#### 1. Authentication System (`src/hooks/useAuth.ts`, `src/components/auth/`)
- **Purpose**: Manages user authentication state and Supabase integration
- **Key Components**: 
  - `ProtectedRoute`: Wraps authenticated routes
  - `useAuth`: Custom hook for auth state management
- **Dependencies**: Supabase client
- **Status**: ✅ Active

#### 2. Document Editor (`src/components/layout/DocumentEditor.tsx`)
- **Purpose**: Main document editing interface
- **Key Features**:
  - Multi-tab document management
  - TipTap-based rich text editor
  - File state tracking (dirty/clean)
- **Dependencies**: TipTap editor, React state management
- **Status**: ✅ Active

#### 3. File Management (`src/components/layout/FilesExplorer.tsx`)
- **Purpose**: Hierarchical file browser and management
- **Key Features**:
  - Folder/file tree navigation
  - File operations (create, delete, rename)
  - Search functionality
- **Dependencies**: Supabase storage, file operations hooks
- **Status**: ✅ Active

#### 4. Chat System (`src/components/chat/`)
- **Purpose**: AI chat interface with thread management
- **Key Components**:
  - `ChatPanel`: Main chat interface
  - `ChatMessages`: Message display
  - `MessageInput`: Chat input with tools
- **Dependencies**: Chat hooks, message management
- **Status**: ✅ Active

#### 5. Layout Management (`src/components/layout/EditorLayout.tsx`)
- **Purpose**: Main application layout with resizable panels
- **Key Features**:
  - Resizable sidebar panels
  - Responsive layout management
  - Keyboard shortcut handling
- **Dependencies**: Resizable panels library
- **Status**: ✅ Active

### Backend Modules

#### 1. API Router (`backend/app/api/v1/router.py`)
- **Purpose**: Central API route registration
- **Endpoints**: Health, search, research, upload, convert
- **Status**: ✅ Active

#### 2. Search Service (`backend/app/api/v1/endpoints/search.py`)
- **Purpose**: Legal research and search functionality
- **Features**:
  - CourtListener API integration
  - Citation expansion
  - Mock legal database
- **Dependencies**: External APIs, citation handling
- **Status**: ✅ Active

#### 3. File Upload (`backend/app/api/v1/endpoints/local_upload.py`)
- **Purpose**: File upload and management
- **Features**: File storage, metadata handling
- **Dependencies**: File system operations
- **Status**: ✅ Active

#### 4. Configuration (`backend/app/config/`)
- **Purpose**: Application configuration management
- **Components**: Environment settings, CORS configuration
- **Status**: ✅ Active

## Data Flow

### Authentication Flow
1. User visits protected route
2. `ProtectedRoute` checks auth state via `useAuth`
3. If not authenticated, redirects to `/auth`
4. Supabase handles authentication
5. User state updates trigger re-renders

### Document Editing Flow
1. User opens document from FilesExplorer
2. DocumentEditor loads content via file operations
3. TipTap editor renders content
4. Changes tracked via dirty state management
5. Auto-save triggers file operations

### Chat Flow
1. User opens chat panel
2. Chat thread management via chat hooks
3. Messages sent to backend API
4. AI responses processed and displayed
5. Context files integrated for document-aware assistance

### Research Flow
1. User selects "External Research" in chat
2. Query sent to backend search endpoint
3. Backend queries CourtListener API
4. Results processed and formatted
5. New document created with research results

## External Dependencies

### Frontend Dependencies
- **React 18**: Core framework
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **TipTap**: Rich text editor
- **Supabase**: Backend-as-a-Service
- **React Query**: Data fetching and caching
- **shadcn/ui**: UI component library

### Backend Dependencies
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **Supabase**: Database and storage
- **CourtListener API**: Legal research data
- **Structlog**: Structured logging

## Configuration

### Environment Variables
- **Frontend**: Vite environment variables (VITE_*)
- **Backend**: Python environment variables via Pydantic settings
- **Database**: Supabase connection strings
- **API Keys**: External service credentials

### CORS Configuration
- Backend configured for development and production origins
- Cookie handling with date format fixes
- Proper headers for cross-origin requests

## Potential Unused Code Areas

### Frontend
1. **`frontend/` directory**: Contains a Next.js placeholder app that is not used
   - **Files**: `frontend/app/page.tsx`, `frontend/package.json`
   - **Status**: ❌ Unused - can be removed
   - **Impact**: Confusion about which frontend to run

2. **Unused UI Components**: Some shadcn/ui components may not be used
   - **Location**: `src/components/ui/`
   - **Recommendation**: Audit and remove unused components

3. **Unused Hooks**: Some custom hooks may be redundant
   - **Location**: `src/hooks/`
   - **Recommendation**: Review usage and remove unused hooks

### Backend
1. **Unused Services**: Some service files may not be implemented
   - **Location**: `backend/app/services/`
   - **Recommendation**: Review and remove unused service files

2. **Test Files**: Some test files may be outdated
   - **Location**: `backend/tests/`
   - **Recommendation**: Update or remove outdated tests

## Development Workflow

### Quick Start with Scripts

We have consolidated all utility scripts into the `scripts/` directory for better organization:

**Windows (PowerShell):**
```powershell
# Start both frontend and backend
.\scripts\run.ps1 dev

# Start only frontend  
.\scripts\run.ps1 dev -Frontend

# Run tests
.\scripts\run.ps1 test
```

**Linux/macOS (Bash):**
```bash
# Start both frontend and backend
./scripts/run.sh dev

# Start only frontend
./scripts/run.sh dev --frontend  

# Run tests
./scripts/run.sh test
```

### Manual Development Setup

If you prefer to run services individually:

#### Local Development
1. **Frontend**: `pnpm run dev` (Vite dev server on port 8080)
2. **Backend**: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
3. **Database**: Supabase local development (if needed)

### Script Organization

All scripts have been moved to `scripts/` directory:
- `scripts/dev/` - Development server scripts
- `scripts/deploy/` - Production deployment scripts  
- `scripts/test/` - Testing and debugging scripts

See `scripts/README.md` for detailed documentation.

### Production Deployment
1. **Frontend**: Build with `pnpm run build`, serve static files
2. **Backend**: Run with PM2 process manager (`pm2 start ecosystem.config.cjs`)
3. **Database**: Supabase production instance
4. **Reverse Proxy**: Nginx for clean URLs (optional)
5. **Auto-deployment**: Use `scripts/deploy/setup-cron.sh` for automatic updates

## Monitoring and Logging

### Frontend
- Console logging for debugging
- Error boundaries for crash handling
- React Query dev tools for data management

### Backend
- Structured logging with Structlog
- Health check endpoints
- Error handling middleware
- Request/response logging

## Security Considerations

1. **Authentication**: Supabase Row Level Security
2. **CORS**: Properly configured origins
3. **API Keys**: Environment variable management
4. **File Upload**: Validation and sanitization
5. **Input Validation**: Pydantic models for API validation

## Performance Optimizations

1. **Frontend**: Vite for fast builds, React Query for caching
2. **Backend**: FastAPI async handling, connection pooling
3. **Database**: Supabase optimizations, proper indexing
4. **Assets**: Static file serving, CDN integration

## Future Improvements

1. **Remove unused code**: Clean up placeholder and unused components
2. **Add comprehensive testing**: Unit and integration tests
3. **Implement caching**: Redis for session and data caching
4. **Add monitoring**: Application performance monitoring
5. **Optimize bundle size**: Tree shaking and code splitting
