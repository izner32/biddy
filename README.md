# Biddy - Smart Bidding Platform

A bidding platform built with Next.js 15, PostgreSQL, and TypeScript.

## Demo

![Biddy Demo](./Biddy.mp4)

---

## How to Run the Code (Quickstart)

### Prerequisites
- Node.js 18 or higher
- pnpm (or npm)
- Docker Desktop

### Setup Instructions

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd biddy
pnpm install

# 2. Check if you have PostgreSQL installed
# Windows: netstat -ano | findstr :5432
# Mac/Linux: lsof -i :5432

# If NO output (no PostgreSQL installed):
#   - Edit docker-compose.yml line 14: change '5433:5432' to '5432:5432'
#   - Create .env.local:
cat > .env.local << EOF
DATABASE_URL=postgresql://biddy:biddy_password@localhost:5432/biddy_db
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
EOF

# If you SEE output (PostgreSQL is running):
#   - Keep docker-compose.yml as-is (port 5433)
#   - Create .env.local:
cat > .env.local << EOF
DATABASE_URL=postgresql://biddy:biddy_password@localhost:5433/biddy_db
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
EOF

# 4. Start PostgreSQL and run the app
pnpm docker:up
pnpm db:push && pnpm db:seed
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

**Note:** Clerk authentication works in development mode without requiring API keys.

---

## How to Shutdown

```bash
# Stop the Next.js development server
# Press Ctrl+C in the terminal running pnpm dev

# Stop and remove the PostgreSQL Docker container
pnpm docker:down

# (Optional) Kill specific Node.js processes if port conflicts occur
# Windows:
tasklist | findstr node
taskkill /F /PID <process_id>

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

---

## How to Monitor the Application

### 1. **Application Health**
- **Development Server Logs:** Monitor the terminal running `pnpm dev` for compilation errors, request logs, and runtime errors
- **Browser Console:** Check for client-side errors, failed API calls, and React warnings
- **Network Tab:** Inspect Server Action calls (POST requests to current page URL)

### 2. **Database Monitoring**
```bash
# View Docker container logs
pnpm docker:logs

# Open Drizzle Studio (visual database browser)
pnpm db:studio
# Access at http://localhost:4983 to view tables, run queries, and inspect data
```

### 3. **Key Metrics to Watch**
- **Response Times:** Server Actions should complete within 200-500ms for simple queries
- **Database Connections:** Monitor active connections (should not exceed pool limit)
- **Memory Usage:** Watch Node.js heap usage in production
- **Error Rates:** Track failed transactions via toast notifications and server logs

### 4. **Production Monitoring (Recommended)**
For production deployments, implement:
- **APM Tools:** Sentry for error tracking, New Relic or Datadog for performance
- **Database Monitoring:** PostgreSQL slow query logs, connection pool metrics
- **Logging:** Structured logging with Winston or Pino
- **Uptime Monitoring:** External services like Pingdom or UptimeRobot

---

## How to Address Scalability and Performance

### Current Implementation

#### Database Layer
- **Drizzle ORM** with prepared statements prevents SQL injection
- **Indexes** on foreign keys (ownerId, userId, collectionId) for fast lookups
- **Connection pooling** via Drizzle's built-in pooling
- **Server Actions** batch data fetching (parallel Promise.all for collections + user)

#### Frontend Performance
- **Next.js App Router** with automatic code splitting
- **Server Components** for initial render (zero client-side JS for static content)
- **React Server Actions** eliminate need for separate API routes (reduced latency)
- **Optimistic UI patterns** (state lifting) for instant perceived performance
- **Skeleton loaders** during data fetches

### Scalability Strategies

#### Short-term (Current Scale: <10k users)
1. **Caching Layer**
   - Add Redis for session storage and frequently accessed data
   - Implement React Query or SWR for client-side cache with stale-while-revalidate
   - Cache collection listings with 30-second TTL

2. **Database Optimization**
   - Add composite indexes for common filter combinations (status + ownerId)
   - Implement pagination (currently loads all collections)
   - Use database views for complex aggregations

3. **API Optimization**
   - Add rate limiting with middleware
   - Implement debouncing on search inputs
   - Use WebSockets for real-time bid updates (replace polling)

#### Long-term (Scale: >100k users)
1. **Horizontal Scaling**
   - Deploy multiple Next.js instances behind load balancer (Vercel auto-scales)
   - Read replicas for PostgreSQL (separate read/write databases)
   - CDN for static assets (Vercel Edge Network)

2. **Microservices Architecture**
   - Separate bid processing into dedicated service with queue
   - Event-driven architecture (Kafka/RabbitMQ) for bid notifications
   - Dedicated search service (Elasticsearch) for advanced filtering

3. **Database Sharding**
   - Shard collections by geographic region or hash(collectionId)
   - Use TimescaleDB for bid history/analytics

---

## Trade-offs and What I Would Do Different

### Time Constraints (What's Missing)

#### 1. **Real-time Updates**

**Current:** Manual refresh via button or after actions

**Ideal:** WebSocket connections for live bid updates

**Why skipped:** Next.js Server Actions don't natively support WebSockets; would require Socket.io or Pusher integration

**Impact:** Users must refresh to see others' bids

#### 2. **Comprehensive Testing**

**Current:** Manual testing only

**Ideal:**
- Unit tests (Vitest/Jest) for business logic
- Integration tests (Playwright) for critical user flows
- E2E tests for bid acceptance workflow

**Why skipped:** Time constraints

**Impact:** Potential regression bugs during refactoring

#### 3. **Advanced Filtering & Search**

**Current:** Client-side filtering, loads all data

**Ideal:**
- Server-side filtering with cursor pagination
- Full-text search with PostgreSQL tsvector or Elasticsearch
- Saved filters/search preferences

**Why skipped:** Complexity vs MVP requirements

**Impact:** Performance degrades with >1000 collections

#### 4. **Bid Notifications**

**Current:** Toast notifications only

**Ideal:**
- Email notifications on bid acceptance/rejection
- In-app notification center
- Push notifications for mobile

**Why skipped:** Requires email service setup (SendGrid/Resend)

**Impact:** Users may miss important updates

#### 5. **Audit Logging**

**Current:** No history tracking

**Ideal:**
- Complete audit trail (who did what, when)
- Bid history with timestamps
- Rollback capabilities

**Why skipped:** Additional database schema required

**Impact:** No accountability or debugging trail

#### 6. **Image Uploads**

**Current:** No images for collections

**Ideal:**
- Upload to S3/Cloudinary
- Image optimization and CDN delivery
- Gallery view

**Why skipped:** File upload infrastructure

**Impact:** Less engaging UX

### Architectural Choices

#### What I Chose
- **Server Actions over REST API:** Simpler, less boilerplate, automatic type safety
- **Drizzle ORM over Prisma:** Lighter, better TypeScript inference, SQL-like syntax
- **shadcn/ui over MUI:** Copy-paste components, full customization, smaller bundle
- **State Lifting over Context API:** Simpler for this scale, easier to debug
- **Docker PostgreSQL over Supabase:** No vendor lock-in, works offline, free

#### What I Would Choose with More Time
- **tRPC or GraphQL:** Better type safety across client-server boundary than Server Actions
- **React Query:** Built-in caching, optimistic updates, background refetching
- **Zustand:** Global state management instead of prop drilling
- **Turborepo monorepo:** Separate apps for admin panel, mobile app
- **Feature flags:** LaunchDarkly for gradual rollouts
- **Comprehensive error boundaries:** Better error recovery and user feedback

---

## Tech Stack Summary

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js Server Actions, Drizzle ORM, PostgreSQL
- **Auth:** Clerk (development mode)
- **Validation:** Zod, React Hook Form
- **Deployment:** Vercel (recommended), Docker for local development
