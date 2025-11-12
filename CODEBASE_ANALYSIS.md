# Codebase Analysis Report

## Executive Summary

This repository contains **Agent-MCP** (LLM Sandbox), a comprehensive multi-agent conversational AI platform with deal management capabilities, vector database integration, and 3D visualization features. The codebase combines Next.js for the frontend with planned Django backend integration for advanced features.

**Status**: Functional but with several critical issues and incomplete components.

---

## What This Codebase Is

### Core Purpose
A production-ready platform for:
- Multi-agent LLM conversations with different AI models
- Deal management system (automotive/sales focused)
- Real-time conversation monitoring and analysis
- 3D visualization of agent interactions (Unity client)
- Vector database integration for semantic search
- Model training data collection
- User management with role-based access control

### Technology Stack

#### Frontend (Next.js)
- **Framework**: Next.js 15.2.4 (App Router)
- **React**: Version 19 (latest)
- **UI Library**: Radix UI components with Tailwind CSS
- **Authentication**: NextAuth.js v4
- **State Management**: React hooks
- **TypeScript**: Full type safety

#### Backend (Hybrid Architecture)
- **Primary**: Next.js API routes (TypeScript)
- **Secondary**: Django REST Framework (Python) - **INCOMPLETE**
- **Database**: PostgreSQL (Neon serverless)
- **Vector Store**: Upstash Vector
- **Real-time**: Planned WebSocket support via Django Channels

#### Additional Components
- **Unity Client**: 3D visualization (minimal setup)
- **Monitoring**: Prometheus metrics
- **ML/AI**: TensorFlow integration, sentiment analysis
- **Task Queue**: Celery (Django component) - **NOT CONFIGURED**

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│                    Unity 3D Client                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Next.js Application (Port 3000)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Pages/UI    │  │  API Routes  │  │  Middleware  │      │
│  │  Components  │  │  (TypeScript)│  │  Auth Guard  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  PostgreSQL      │    │  Django Backend  │
│  (Neon DB)       │    │  (INCOMPLETE)    │
│  - Users         │    │  - Celery        │
│  - Conversations │    │  - Channels      │
│  - Deals         │    │  - REST API      │
│  - Agents        │    └──────────────────┘
└──────────────────┘              │
        │                         ▼
        │              ┌──────────────────┐
        │              │  Upstash Vector  │
        │              │  Redis/Celery    │
        └──────────────┴──────────────────┘
```

### Key Workflows

#### 1. User Authentication
- NextAuth.js handles session management
- JWT strategy with 30-day sessions
- Development mode has mock users
- Production uses PostgreSQL user table with bcrypt passwords

#### 2. Multi-Agent Conversations
- Users create conversations with specific agents
- LLM service handles model interactions (Groq API)
- Messages stored in PostgreSQL
- Vector embeddings for semantic search
- Real-time updates planned via WebSocket

#### 3. Deal Management
- Store and customer management
- Vehicle deal calculations (purchase, lease, financing)
- PDF document generation
- Scenario comparison
- Preset templates for quick setup

#### 4. Vector Analysis
- Embeddings for semantic search
- Conversation clustering
- Sentiment analysis
- Meta-cognitive analysis dimensions

---

## Critical Issues Found

### 1. **Dependency Conflicts** 🔴 HIGH PRIORITY

**Problem**: React 19 incompatibility
```
react-day-picker@8.10.1 requires react ^16.8.0 || ^17.0.0 || ^18.0.0
Current version: react@19.2.0
```

**Impact**: Requires `--legacy-peer-deps` to install, potential runtime issues

**Fix Required**:
- Upgrade to react-day-picker v9.x (supports React 19)
- OR downgrade React to v18

### 2. **Security Vulnerabilities** 🔴 HIGH PRIORITY

**Next.js Issues** (3 moderate severity):
1. Cache Key Confusion for Image Optimization API Routes
2. Content Injection Vulnerability for Image Optimization  
3. Improper Middleware Redirect Handling Leads to SSRF

**Current Version**: 15.2.4  
**Fix Available**: 15.5.6+

**Action Required**: 
```bash
npm audit fix --force
```

### 3. **Missing Django Backend Structure** 🟡 MEDIUM PRIORITY

**Found Issues**:
- ❌ No `manage.py` file
- ❌ Missing Django apps: `agents`, `conversations`, `analytics`, `training`
- ❌ Only `users` and `vector_store` apps exist
- ❌ No database migrations directory
- ❌ Settings reference non-existent apps

**Impact**: Django backend cannot be initialized or run

**Files that Reference Django**:
- `requirements.txt` - Has all Django dependencies
- `llm_sandbox/settings.py` - References missing apps
- `llm_sandbox/urls.py` - Has routing structure
- `Unity/README.md` - References Django WebSocket endpoint

### 4. **Missing Environment Configuration** 🟡 MEDIUM PRIORITY

**No `.env.example` file exists**

Should include:
```env
# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Database
DATABASE_URL=

# LLM APIs
GROQ_API_KEY=
NEXT_PUBLIC_GROQ_API_KEY=

# Vector Store
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=

# Django (if used)
SECRET_KEY=
DEBUG=
ALLOWED_HOSTS=
```

### 5. **Architectural Inconsistencies** 🟡 MEDIUM PRIORITY

**Mixed Backend Approach**:
- Next.js API routes handle most functionality
- Django backend partially configured but unusable
- Unclear which backend should be primary

**Concerns**:
- Duplicate functionality (both have user management, conversations)
- Deployment complexity
- Resource overhead running two backends

**Recommendation**: 
- **Option A**: Remove Django, use only Next.js API routes
- **Option B**: Complete Django setup, use Next.js only for frontend
- **Option C**: Define clear separation (Next.js = frontend APIs, Django = heavy processing)

### 6. **Incomplete Unity Integration** 🟢 LOW PRIORITY

**Issues**:
- Unity client expects WebSocket endpoint that doesn't exist
- No actual Unity scene/GameObject setup
- Only has WebSocketClient script template

**Missing**:
- Django Channels configuration
- WebSocket routing setup
- Connection authentication

### 7. **Database Schema Inconsistencies** 🟡 MEDIUM PRIORITY

**Mismatched Definitions**:
- `setup.sh` creates minimal tables (conversations, messages, vectors)
- `scripts/setup-database.ts` creates extensive schema (30+ tables)
- No migration system for schema changes

**Risk**: Schema drift between environments

### 8. **Missing Test Infrastructure** 🟢 LOW PRIORITY

**No tests found**:
- ❌ No test files (`.test.ts`, `.spec.ts`)
- ❌ No testing framework configured
- ❌ No CI/CD pipeline

### 9. **Documentation Gaps** 🟢 LOW PRIORITY

**Missing or Incomplete**:
- API documentation
- Component documentation
- Django backend setup guide
- Deployment guide
- Development workflow guide
- Architecture decision records

### 10. **Build Configuration Issues** 🟡 MEDIUM PRIORITY

**Dockerfile Issues**:
```dockerfile
COPY --from=builder --chown=nextjs:nodejs /app/scripts/start.sh ./start.sh
CMD ["pnpm", "start"]
```
- Uses pnpm but doesn't install it in runner stage
- References start.sh but doesn't use it in CMD

**Vercel Configuration**:
```json
{
  "buildCommand": "chmod +x setup.sh && ./setup.sh && pnpm exec next build"
}
```
- Runs database setup during build (should be separate)
- Uses pnpm without ensuring it's available

---

## Missing Components

### Files/Directories That Should Exist

1. **`.env.example`** - Environment variable template
2. **`manage.py`** - Django management script
3. **Django Apps**:
   - `agents/` - Full Django app structure
   - `conversations/` - Full Django app structure  
   - `analytics/` - Full Django app structure
   - `training/` - Full Django app structure
4. **Migrations**: Django migration files for all apps
5. **Tests**: Test directories and configuration
6. **`docker-compose.yml`** - Local development setup
7. **`.github/workflows/`** - CI/CD pipelines
8. **`CONTRIBUTING.md`** - Contribution guidelines
9. **API Documentation**: OpenAPI/Swagger specs

### Missing Functionality

1. **WebSocket Support**: 
   - No Django Channels configuration
   - No WebSocket routes defined
   - Unity client can't connect

2. **Email Service**: 
   - Password reset functionality incomplete
   - No email templates

3. **File Upload**: 
   - Deal documents mentioned but upload endpoint basic
   - No file storage configuration (S3, etc.)

4. **Monitoring**: 
   - Prometheus metrics defined but not exposed properly
   - No Grafana dashboards

5. **Rate Limiting**: 
   - No API rate limiting
   - No request throttling

---

## Suggested Improvements

### Immediate Actions (Critical)

1. **Fix Dependency Conflicts**
   ```bash
   npm install react-day-picker@^9.0.0
   npm install --save-dev @types/react-day-picker
   ```

2. **Update Next.js for Security**
   ```bash
   npm install next@latest
   ```

3. **Create `.env.example`**
   - Document all required environment variables
   - Include example values

4. **Decide on Backend Architecture**
   - Document decision in ADR (Architecture Decision Record)
   - Remove unused backend OR complete implementation

### Short-term Improvements (Important)

5. **Add Testing Infrastructure**
   ```bash
   npm install -D jest @testing-library/react @testing-library/jest-dom vitest
   ```

6. **Fix Dockerfile**
   - Add pnpm installation to runner stage
   - OR switch to npm entirely
   - Fix CMD to actually use start.sh if needed

7. **Create Database Migration System**
   - If keeping Next.js: Use a migration tool like `node-pg-migrate`
   - If using Django: Complete Django setup with proper migrations

8. **Add API Documentation**
   - Install and configure Swagger/OpenAPI
   - Document all API endpoints

9. **Improve Error Handling**
   - Add proper error boundaries
   - Implement centralized error logging
   - Add user-friendly error messages

10. **Add Input Validation**
    - Use Zod schemas for all API inputs
    - Add validation middleware

### Long-term Improvements (Enhancement)

11. **Complete Django Backend** (if keeping it)
    - Create all missing Django apps
    - Set up Celery and Redis
    - Implement WebSocket support
    - Create migration files

12. **Add Comprehensive Testing**
    - Unit tests for utilities
    - Integration tests for API routes
    - E2E tests for critical workflows
    - Component tests for UI

13. **Implement CI/CD**
    - GitHub Actions for tests
    - Automated security scanning
    - Automated deployments

14. **Add Monitoring and Observability**
    - Proper logging (structured logs)
    - Application Performance Monitoring (APM)
    - Error tracking (Sentry, etc.)
    - User analytics

15. **Performance Optimization**
    - Implement caching strategy
    - Optimize database queries
    - Add CDN for static assets
    - Implement code splitting

16. **Security Enhancements**
    - Add rate limiting
    - Implement CSRF protection
    - Add security headers
    - Regular dependency audits
    - Add input sanitization

17. **Developer Experience**
    - Add pre-commit hooks (Husky)
    - Add code formatting (Prettier - already installed)
    - Add commit linting
    - Improve local development setup

18. **Documentation**
    - API documentation (OpenAPI/Swagger)
    - Component storybook
    - Architecture diagrams
    - Deployment guides
    - Troubleshooting guides

---

## Code Quality Assessment

### Strengths ✅

1. **Modern Stack**: Uses latest Next.js, React 19, TypeScript
2. **Type Safety**: Good TypeScript coverage
3. **UI Components**: Well-organized Radix UI component library
4. **Database Design**: Comprehensive schema with proper relationships
5. **Modular Structure**: Good separation of concerns (lib/, components/, api/)
6. **Authentication**: Solid NextAuth.js implementation
7. **Build Success**: Project builds successfully despite issues

### Weaknesses ❌

1. **Incomplete Features**: Multiple half-implemented features
2. **No Tests**: Zero test coverage
3. **Mixed Architectures**: Unclear backend strategy
4. **Documentation**: Minimal inline documentation
5. **Error Handling**: Inconsistent error handling patterns
6. **Security**: Multiple vulnerabilities need addressing
7. **Dependencies**: Outdated/conflicting dependencies

---

## Recommendations Summary

### Priority 1 (Do Immediately)
1. ✅ Update Next.js to fix security vulnerabilities
2. ✅ Fix React/react-day-picker dependency conflict
3. ✅ Create `.env.example` file
4. ✅ Make architectural decision about Django backend

### Priority 2 (Do This Week)
5. ✅ Add basic test infrastructure
6. ✅ Fix Dockerfile and deployment configs
7. ✅ Add input validation with Zod
8. ✅ Improve error handling

### Priority 3 (Do This Month)
9. ✅ Complete chosen backend architecture
10. ✅ Add API documentation
11. ✅ Implement monitoring
12. ✅ Add CI/CD pipeline

---

## Conclusion

This is a **feature-rich but incomplete** project with a solid foundation. The Next.js frontend and basic API structure work well, but the project suffers from:

- **Architectural ambiguity** (Next.js vs Django)
- **Missing critical components** (tests, docs, proper Django setup)
- **Security and dependency issues** that need immediate attention

**Recommended Path Forward**:

1. Fix security issues immediately
2. Decide: "Next.js only" OR "Next.js + Django"
3. If Django: Complete all Django apps and migrations
4. If Next.js only: Remove Django code entirely
5. Add testing infrastructure
6. Document architecture decisions
7. Implement missing features systematically

**Estimated Effort to Production-Ready**:
- Minimal fixes: 2-3 days
- Full completion: 2-4 weeks
- Enterprise-ready: 2-3 months

The codebase shows ambition and good technical choices but needs focused effort to resolve architectural questions and complete implementations.
