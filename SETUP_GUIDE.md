# Development Setup Guide

This guide will help you set up the LLM Sandbox development environment.

## Prerequisites

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **Package Manager**: npm, pnpm, or yarn
- **PostgreSQL Database**: Neon account ([Sign up](https://neon.tech/)) or local PostgreSQL
- **API Keys**:
  - Groq API key ([Get one](https://console.groq.com/))
  - Upstash Vector token (optional) ([Get one](https://console.upstash.com/))

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/morpheus18-glitch/Agent-mcp.git
cd Agent-mcp
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using pnpm (recommended):
```bash
pnpm install
```

Using yarn:
```bash
yarn install
```

### 3. Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

```env
# Required
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters-long
DATABASE_URL=postgres://user:password@hostname:5432/database
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional
UPSTASH_VECTOR_REST_URL=https://your-vector-store.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your-upstash-token-here
```

#### Generate NEXTAUTH_SECRET

```bash
# On Linux/macOS:
openssl rand -base64 32

# Or using Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Set Up the Database

Run the database setup script:

```bash
npm run setup-db
```

This will:
- Create all necessary tables
- Set up indexes
- Enable required extensions

To verify the connection:
```bash
npm run test-db
```

### 5. Seed Development Data (Optional)

Create an admin user:
```bash
npm run seed-admin
```

Default credentials:
- Email: `admin@example.com`
- Password: `admin123`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Features

### Development Mode Authentication

In development mode (`NODE_ENV=development`), you can use these mock users:

**Regular User**:
- Email: `user@example.com`
- Password: `password`

**Admin User**:
- Email: `admin@example.com`
- Password: `admin`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run setup` | Interactive setup wizard |
| `npm run setup-db` | Setup database tables |
| `npm run test-db` | Test database connection |
| `npm run check-env` | Validate environment variables |
| `npm run seed-admin` | Create admin user |

## Project Structure

```
Agent-mcp/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── conversations/ # Conversation endpoints
│   │   ├── deals/        # Deal management endpoints
│   │   ├── templates/    # Template endpoints
│   │   └── users/        # User endpoints
│   ├── deals/            # Deal pages
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── ...               # Feature components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database helpers
│   ├── llm-service.ts    # LLM integration
│   └── ...               # Other utilities
├── public/                # Static files
├── scripts/               # Setup and utility scripts
├── types/                 # TypeScript type definitions
├── Unity/                 # Unity 3D client (optional)
└── [config files]         # Various configuration files
```

## Database Schema

The application uses PostgreSQL with the following main tables:

### Core Tables
- `users` - User accounts
- `user_profiles` - Extended user information
- `agents` - AI agent configurations
- `conversations` - Multi-agent conversations
- `conversation_messages` - Message history
- `templates` - Conversation templates

### Deal Management
- `stores` - Store information
- `customers` - Customer records
- `deals` - Vehicle deals
- `deal_scenarios` - Financing scenarios
- `deal_documents` - Generated documents

### Analytics
- `sentiment_analysis` - Message sentiment
- `conversation_analysis` - Conversation metrics
- `system_metrics` - Performance metrics

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Auth encryption key | Generate with `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection | `postgres://user:pass@host/db` |
| `GROQ_API_KEY` | Groq API key | `gsk_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `UPSTASH_VECTOR_REST_URL` | Vector DB URL | None |
| `UPSTASH_VECTOR_REST_TOKEN` | Vector DB token | None |
| `NODE_ENV` | Environment | `development` |

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Find the process
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 npm run dev
```

### Database Connection Issues

1. **Check DATABASE_URL format**:
   ```
   postgres://username:password@hostname:port/database
   ```

2. **Verify Neon dashboard**:
   - Ensure database is active
   - Check connection string is correct
   - Verify IP allowlist if configured

3. **Test connection**:
   ```bash
   npm run test-db
   ```

### NextAuth Errors

1. **Make sure NEXTAUTH_SECRET is set** (minimum 32 characters)
2. **Verify NEXTAUTH_URL matches your dev URL**
3. **Clear browser cookies** if getting session errors

### Build Errors

1. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Clear node_modules**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Module Resolution Errors

The project uses path aliases:
- `@/*` → Root directory

Ensure `tsconfig.json` is properly configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Test locally**:
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier (configured in ESLint)

Run linter:
```bash
npm run lint
```

### Database Migrations

When you modify the database schema:

1. **Update the schema** in `scripts/setup-database.ts`
2. **Test locally**:
   ```bash
   npm run setup-db
   ```
3. **Document changes** in migration notes
4. **Coordinate with team** before deploying

## Testing

### Manual Testing

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Test authentication**:
   - Visit http://localhost:3000
   - Try logging in with dev credentials
   - Check protected routes

3. **Test API endpoints**:
   ```bash
   # Example: Test conversations endpoint
   curl http://localhost:3000/api/conversations
   ```

### Database Testing

```bash
# Test connection
npm run test-db

# Reset database (destructive!)
npm run setup-db
```

## Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Docker

1. **Build image**:
   ```bash
   docker build -t llm-sandbox .
   ```

2. **Run container**:
   ```bash
   docker run -p 3000:3000 --env-file .env.local llm-sandbox
   ```

### Manual Deployment

1. **Build application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

## Getting Help

- **Check CODEBASE_ANALYSIS.md** for architecture details
- **Check ARCHITECTURE.md** for design decisions
- **Review README.md** for feature overview
- **Open an issue** on GitHub for bugs
- **Check existing issues** before creating new ones

## Next Steps

After setup:

1. **Explore the application**:
   - Create a user account
   - Try creating a conversation
   - Test deal management features

2. **Read the documentation**:
   - `CODEBASE_ANALYSIS.md` - Detailed code analysis
   - `ARCHITECTURE.md` - Architecture decisions
   - `README.md` - Feature overview

3. **Set up your IDE**:
   - Install ESLint extension
   - Install Prettier extension
   - Configure TypeScript support

4. **Join the development**:
   - Check open issues
   - Review the roadmap
   - Start contributing!

## Common Development Tasks

### Adding a New API Route

1. Create file in `app/api/your-route/route.ts`:
   ```typescript
   import { NextResponse } from "next/server"
   
   export async function GET() {
     return NextResponse.json({ message: "Hello" })
   }
   ```

2. Access at `http://localhost:3000/api/your-route`

### Adding a New Page

1. Create file in `app/your-page/page.tsx`:
   ```typescript
   export default function YourPage() {
     return <div>Your Page</div>
   }
   ```

2. Access at `http://localhost:3000/your-page`

### Adding a New Component

1. Create file in `components/your-component.tsx`:
   ```typescript
   export function YourComponent() {
     return <div>Your Component</div>
   }
   ```

2. Import and use:
   ```typescript
   import { YourComponent } from "@/components/your-component"
   ```

### Working with the Database

```typescript
import { query } from "@/lib/db"

// SELECT
const results = await query("SELECT * FROM users WHERE id = $1", [userId])

// INSERT
await query(
  "INSERT INTO users (email, name) VALUES ($1, $2)",
  [email, name]
)

// UPDATE
await query(
  "UPDATE users SET name = $1 WHERE id = $2",
  [newName, userId]
)
```

---

**Happy coding! 🚀**
