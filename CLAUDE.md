# GymBag - Personal Training Management Platform

## Project Overview

**GymBag** is a comprehensive business management platform designed specifically for personal trainers. It provides tools for client management, session scheduling, payment processing, and lead conversion in a single, integrated application.

### Key Features
- **Client Management** - Track client progress, manage packages, and maintain detailed profiles
- **Session Scheduling** - Booking system with calendar integration and automated reminders
- **Payment Processing** - Secure payment handling with automated invoicing and financial tracking
- **Lead Management** - Convert prospects to clients with streamlined workflows
- **Multi-tenant Architecture** - Each trainer sees only their own data

### Tech Stack
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS 4.x with shadcn/ui components (Radix UI)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with email/password
- **Deployment**: Vercel-optimized
- **Package Manager**: pnpm (required >=9.0.0)

## Quick Start

### Prerequisites
- Node.js >=20.0.0
- pnpm >=9.0.0
- Supabase account and project

### Environment Setup
Create `.env.local` with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard  # Optional
```

### Installation & Development
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Start production server
pnpm start
```

Access the application at `http://localhost:3000`

## Architecture

### Authentication Flow
1. **Frontend Form** (`app/auth/login/page.tsx`) - Email/password input
2. **Supabase Client** (`lib/supabase/client.ts`) - Browser authentication
3. **Supabase Auth API** - Validates credentials against `auth.users`
4. **JWT Cookies** - Secure session management
5. **Middleware** (`middleware.ts`) - Route protection and session validation
6. **Database Trigger** - Auto-creates profile in `public.profiles`

### Database Design
- **Multi-tenant**: Each trainer's data isolated via Row Level Security (RLS)
- **Core Tables**: `profiles`, `clients`, `sessions`, `packages`, `payments`, `leads`
- **Security**: All tables use `auth.uid() = trainer_id` policies
- **Auto-triggers**: Profile creation on user signup

### App Structure
```
app/
├── auth/                 # Authentication pages
│   ├── login/
│   ├── signup/
│   └── signup-success/
├── dashboard/            # Main dashboard
├── clients/              # Client management
├── leads/                # Lead management
├── sessions/             # Session scheduling
├── packages/             # Package management
├── payments/             # Payment processing
└── layout.tsx            # Root layout
```

## Development Guide

### Project Structure
```
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── ui/              # shadcn/ui base components
│   ├── clients/         # Client-specific components
│   ├── sessions/        # Session-specific components
│   └── [feature]/       # Feature-based organization
├── lib/                  # Utilities and configurations
│   └── supabase/        # Database client utilities
├── scripts/              # Database setup scripts
├── styles/               # Global styles
└── public/               # Static assets
```

### Key Components
- **Client Management**: `components/clients/` - Client profiles, progress tracking
- **Session Scheduling**: `components/sessions/` - Booking system, calendar integration
- **UI Components**: `components/ui/` - Reusable shadcn/ui components
- **Theme Provider**: `components/theme-provider.tsx` - Dark/light mode support

### Conventions
- **File Naming**: kebab-case for files, PascalCase for components
- **Component Structure**: One component per file, co-located with related files
- **Styling**: Tailwind utility classes, component variants with `class-variance-authority`
- **TypeScript**: Strict mode enabled, path aliases with `@/*`

### Configuration Notes
- **Build Settings**: ESLint and TypeScript errors ignored during builds (`next.config.mjs`)
- **Image Optimization**: Disabled for Vercel deployment compatibility
- **Path Aliases**: `@/*` maps to project root directory

## Database

### Schema Overview
```sql
-- Core Tables
profiles          # Trainer profiles (1:1 with auth.users)
clients           # Client information
sessions          # Training sessions
packages          # Service packages
client_packages   # Client-package relationships
payments          # Payment records
leads             # Prospective clients
```

### Row Level Security (RLS)
All tables implement trainer-specific access control:
```sql
-- Example policy (applies to all tables)
CREATE POLICY "table_select_own" ON table_name
FOR SELECT USING (auth.uid() = trainer_id);
```

### Setup Scripts
- **`scripts/001_setup_rls_policies.sql`** - Creates RLS policies for all tables
- **`scripts/002_create_profile_trigger.sql`** - Auto-creates profiles on user signup

### Database Client Usage
```typescript
// Client-side (browser)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server-side (API routes, server components)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

## Deployment

### Environment Variables
Required for production:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key

### Vercel Deployment
The project is optimized for Vercel deployment:
- Static assets are unoptimized for compatibility
- Server-side rendering with edge runtime support
- Automatic deployments from git pushes

### Database Setup
1. Create Supabase project
2. Run setup scripts in order:
   ```sql
   -- 1. Setup RLS policies
   \i scripts/001_setup_rls_policies.sql

   -- 2. Create profile triggers
   \i scripts/002_create_profile_trigger.sql
   ```

## Common Tasks

### Adding New Features
1. Create page in `app/[feature]/page.tsx`
2. Add components in `components/[feature]/`
3. Update navigation if needed
4. Add database tables with RLS policies
5. Test authentication and data isolation

### Modifying Authentication
- **Client-side auth**: Modify `app/auth/` pages
- **Session handling**: Update `lib/supabase/middleware.ts`
- **Route protection**: Configure `middleware.ts` matcher

### Database Changes
1. Create new migration scripts in `scripts/`
2. Follow naming convention: `00X_description.sql`
3. Include RLS policies for new tables
4. Test multi-tenant data isolation

### Adding UI Components
1. Use shadcn/ui CLI: `pnpm dlx shadcn-ui@latest add [component]`
2. Customize in `components/ui/`
3. Follow existing patterns for variants and styling

### Debugging
- **Authentication issues**: Check middleware logs and cookie handling
- **Database access**: Verify RLS policies with `auth.uid()`
- **Build errors**: Check `next.config.mjs` for ignored errors
- **Styling**: Ensure Tailwind classes are properly applied