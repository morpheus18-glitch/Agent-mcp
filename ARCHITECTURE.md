# Architecture Decision Record (ADR)

## ADR-001: Backend Architecture Decision Needed

**Status**: Proposed  
**Date**: 2025-11-12  
**Decision Maker**: Team Decision Required

### Context

The codebase currently contains two incomplete backend implementations:

1. **Next.js API Routes** (TypeScript)
   - Functional and actively used
   - Handles authentication, conversations, deals, templates, users
   - Well-integrated with frontend
   - Uses Neon PostgreSQL directly

2. **Django REST Framework** (Python)
   - Partially configured but incomplete
   - Missing `manage.py`
   - Missing most Django apps (only users and vector_store exist)
   - References non-existent apps in settings
   - Cannot be run in current state

### Problem

Having two incomplete backend systems creates:
- Maintenance overhead
- Deployment complexity  
- Code duplication concerns
- Unclear ownership of features
- Confusion for new developers

### Options

#### Option 1: Next.js Only (Recommended)

**Description**: Remove Django entirely, consolidate all backend logic in Next.js API routes.

**Pros**:
- ✅ Simpler architecture
- ✅ Single runtime (Node.js)
- ✅ Better TypeScript integration across stack
- ✅ Easier deployment (single service)
- ✅ Current code already works
- ✅ Better for serverless deployment
- ✅ Fewer dependencies to manage

**Cons**:
- ❌ Lose Python ML libraries advantage
- ❌ Need to reimplement some Python logic in TypeScript
- ❌ Less suitable for heavy data processing
- ❌ No Celery for background jobs (need alternatives)

**Impact**:
- Remove: `requirements.txt`, `llm_sandbox/`, `users/`, `vector_store/`
- Add: Background job solution (BullMQ, Inngest, or Vercel Queues)
- Add: ML service integration (if needed)
- Effort: 1-2 days cleanup

**When to Choose**:
- If you're deploying to Vercel or similar
- If team is primarily TypeScript/JavaScript
- If you want faster iteration
- If workload is mainly CRUD and API logic

#### Option 2: Complete Django Implementation

**Description**: Make Django the primary backend, Next.js becomes pure frontend.

**Pros**:
- ✅ Better for ML/data science workloads
- ✅ Django admin panel
- ✅ Celery for background jobs
- ✅ Django Channels for WebSockets (Unity client needs this)
- ✅ Robust ORM and migration system
- ✅ Large ecosystem for data processing

**Cons**:
- ❌ Need to create all missing Django apps
- ❌ Duplicate existing Next.js API logic
- ❌ More complex deployment
- ❌ Two separate runtimes
- ❌ Requires Python expertise
- ❌ More infrastructure (Redis, Celery workers)

**Impact**:
- Create: `manage.py`, all Django apps, migrations
- Migrate: All Next.js API routes to Django REST endpoints
- Setup: Redis, Celery, Django Channels
- Effort: 2-4 weeks

**When to Choose**:
- If you need heavy ML/data processing
- If team has strong Python expertise
- If you need WebSocket support (Unity client)
- If you need Celery for complex background tasks

#### Option 3: Hybrid (Most Complex)

**Description**: Keep both, define clear boundaries.

**Division of Responsibilities**:
```
Next.js:
- All UI/frontend
- User-facing API routes (auth, CRUD)
- Real-time SSR/streaming
- Light data transformation

Django:
- Heavy ML model training
- Data pipeline processing
- Celery background jobs
- WebSocket server
- Vector embedding generation
```

**Pros**:
- ✅ Use best tool for each job
- ✅ Can leverage both ecosystems
- ✅ Better performance for specialized tasks

**Cons**:
- ❌ Most complex architecture
- ❌ Harder to maintain
- ❌ More deployment complexity
- ❌ Need expertise in both stacks
- ❌ Data synchronization challenges
- ❌ More infrastructure cost

**Impact**:
- Complete Django backend
- Create clear API boundaries
- Setup proper orchestration
- Effort: 3-4 weeks

**When to Choose**:
- If you have large team with both skillsets
- If workload truly needs both (proven, not assumed)
- If budget allows for complex infrastructure

### Current Recommendation

**Choose Option 1: Next.js Only**

**Reasoning**:
1. Current Next.js API routes work well
2. Team seems TypeScript-focused (based on code quality)
3. Deployment is simpler (Vercel-ready)
4. Django code is incomplete (sunk cost fallacy to complete it)
5. Can always add specialized Python services later if needed

**Migration Path**:
1. Remove all Django-related code
2. Add background job solution:
   ```bash
   npm install bullmq ioredis
   ```
3. If ML needed, create separate Python microservice (FastAPI)
4. Update README to reflect architecture

### Alternative: If WebSocket is Critical

If Unity 3D visualization is a core feature (not clear from requirements):

**Choose Option 2: Complete Django** because:
- Django Channels is mature for WebSocket
- Unity client already expects Django endpoint
- Real-time multi-agent visualization needs WebSocket

But first: **Validate that Unity visualization is actually required**.

### Decision

**Action Required**: Project owner/team must decide based on:

1. **What is the primary use case?**
   - If mostly web app → Next.js only
   - If ML/data heavy → Django primary
   - If both equally → Hybrid (reluctantly)

2. **Is Unity 3D visualization critical?**
   - Yes → Need WebSocket → Lean toward Django
   - No → Can remove Unity folder → Next.js only

3. **What is team expertise?**
   - Mostly JS/TS → Next.js only
   - Mostly Python → Django primary
   - Mixed → Consider hybrid

4. **What is infrastructure budget?**
   - Limited → Next.js only (serverless)
   - Flexible → Any option

### Consequences

**If Next.js Only**:
- Clean up: ~1-2 days
- Simpler ongoing maintenance
- Faster deployment
- May need to add ML microservice later

**If Django Primary**:
- Implementation: ~2-4 weeks
- More powerful for data/ML
- More complex deployment
- Higher infrastructure cost

**If Hybrid**:
- Implementation: ~3-4 weeks
- Most flexible but complex
- Highest maintenance burden
- Highest infrastructure cost

### Next Steps

1. Document decision in this ADR
2. Update README.md with chosen architecture
3. Create implementation tasks
4. Execute migration/cleanup
5. Update deployment documentation

---

## ADR-002: Dependency Management

**Status**: Decided  
**Date**: 2025-11-12

### Decision

Upgrade dependencies to resolve conflicts and security issues.

### Changes

1. **Next.js**: 15.2.4 → ^15.5.6 (security fixes)
2. **react-day-picker**: 8.10.1 → ^9.4.4 (React 19 compatibility)

### Rationale

- Fixes 3 moderate security vulnerabilities in Next.js
- Resolves React 19 peer dependency conflict
- Enables `npm install` without `--legacy-peer-deps`

### Implementation

Updated `package.json` with new versions.

---

## ADR-003: Environment Configuration

**Status**: Decided  
**Date**: 2025-11-12

### Decision

Create `.env.example` file with all required environment variables.

### Rationale

- New developers need to know what to configure
- Prevents "missing env var" errors
- Documents integration points

### Implementation

Created `.env.example` with:
- NextAuth configuration
- Database connection
- LLM API keys
- Optional services (Vector DB, Redis, Email, S3)

---

## Template for Future ADRs

```markdown
## ADR-XXX: [Title]

**Status**: [Proposed | Decided | Deprecated | Superseded]  
**Date**: YYYY-MM-DD

### Context
What is the issue we're trying to solve?

### Decision
What did we decide?

### Rationale
Why did we make this decision?

### Consequences
What are the implications (positive and negative)?

### Alternatives Considered
What other options did we evaluate?
```
