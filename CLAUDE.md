# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Payload CMS 3.x application using Next.js 15, React 19, PostgreSQL, and TypeScript. Payload is a headless CMS that provides an admin panel at `/admin` and a REST/GraphQL API.

The frontend uses [Mantine](https://mantine.dev/) as the UI component library.

## Dev Container Setup

The project includes a dev container configuration with PostgreSQL. To use it:

1. Open in VS Code with the Dev Containers extension, or use GitHub Codespaces
2. The container automatically runs `pnpm install` on creation
3. Copy `.env.example` to `.env` (the DATABASE_URL is pre-configured for the container's PostgreSQL)
4. Run `pnpm dev` to start the development server

The PostgreSQL database runs on `db:5432` within the container network with:
- User: `payload`
- Password: `payload`
- Database: `payload`

For local development outside the container, update DATABASE_URL to point to your own PostgreSQL instance.

## Commands

```bash
# Development
pnpm dev                    # Start development server (http://localhost:3000)
pnpm devsafe                # Clean .next cache and start dev server

# Build & Production
pnpm build                  # Build for production
pnpm start                  # Start production server

# Type Generation (run after schema changes)
pnpm generate:types         # Regenerate payload-types.ts
pnpm generate:importmap     # Regenerate import map for custom components

# Linting & Type Checking
pnpm lint                   # Run ESLint
tsc --noEmit                # Validate TypeScript without building

# Testing
pnpm test                   # Run all tests (integration + e2e)
pnpm test:int               # Run integration tests only (vitest)
pnpm test:e2e               # Run e2e tests only (playwright)

# Run a single integration test
pnpm exec vitest run tests/int/api.int.spec.ts

# Run a single e2e test
pnpm exec playwright test tests/e2e/frontend.e2e.spec.ts
```

## Project Structure

```
.claude/commands/            # Custom Claude Code slash commands
.devcontainer/               # Dev container config with PostgreSQL
src/
├── app/
│   ├── (frontend)/          # Frontend routes (public website)
│   └── (payload)/           # Payload admin routes and API
├── collections/             # Payload collection configs
├── payload.config.ts        # Main Payload configuration
└── payload-types.ts         # Auto-generated types (do not edit)
tests/
├── e2e/                     # Playwright e2e tests (*.e2e.spec.ts)
└── int/                     # Vitest integration tests (*.int.spec.ts)
```

## Critical Security Patterns

### 1. Local API Access Control
When passing `user` to Local API operations, ALWAYS set `overrideAccess: false`:
```typescript
// ❌ WRONG - access control bypassed
await payload.find({ collection: 'posts', user: someUser })

// ✅ CORRECT - enforces permissions
await payload.find({ collection: 'posts', user: someUser, overrideAccess: false })
```

### 2. Transaction Safety in Hooks
ALWAYS pass `req` to nested operations to maintain transaction atomicity:
```typescript
hooks: {
  afterChange: [async ({ doc, req }) => {
    await req.payload.create({
      collection: 'audit-log',
      data: { docId: doc.id },
      req, // Required for atomicity
    })
  }]
}
```

### 3. Prevent Infinite Hook Loops
Use context flags when hooks trigger operations on the same collection:
```typescript
hooks: {
  afterChange: [async ({ doc, req, context }) => {
    if (context.skipHooks) return
    await req.payload.update({
      collection: 'posts',
      id: doc.id,
      data: { views: doc.views + 1 },
      context: { skipHooks: true },
      req,
    })
  }]
}
```

## Development Workflow

1. After modifying collection schemas: run `pnpm generate:types`
2. After creating/modifying custom components: run `pnpm generate:importmap`
3. Use `tsc --noEmit` to validate TypeScript after code changes
4. Component paths in config are file paths (not imports) relative to `src/`

## PostgreSQL Migration Workflow

Payload uses Drizzle ORM with PostgreSQL. In development, schema changes are automatically pushed to the database. For production, migrations must be created and committed.

### Migration Commands

```bash
pnpm payload migrate              # Run pending migrations
pnpm payload migrate:create       # Create migration from schema diff
pnpm payload migrate:status       # Check migration status
pnpm payload migrate:down         # Roll back last batch
pnpm payload migrate:refresh      # Roll back all and re-run
pnpm payload migrate:reset        # Roll back all migrations
pnpm payload migrate:fresh        # Drop all tables and re-run migrations
```

### Development Mode (Push)

During development, Payload automatically syncs schema changes to the database using Drizzle's "push" mode. No manual migration steps needed while developing locally.

### Creating Migrations Before Committing

**IMPORTANT**: When you modify collection schemas (add/remove/change fields, create new collections, etc.), you MUST create a migration before committing:

1. **Make schema changes** in collection configs
2. **Run `pnpm generate:types`** to update TypeScript types
3. **Run `pnpm payload migrate:create`** to generate migration file
4. **Review the generated migration** in `src/migrations/`
5. **Commit both** the schema changes AND the migration file together

```bash
# Example workflow after adding a field to Posts collection
pnpm generate:types
pnpm payload migrate:create
# Review src/migrations/YYYYMMDD_HHMMSS_migration.ts
git add src/collections/Posts.ts src/migrations/ src/payload-types.ts
git commit -m "feat(posts): add featured image field"
```

### Migration File Location

Migrations are stored in `src/migrations/`. Each migration has:
- `up()` function: Applied when migrating forward
- `down()` function: Applied when rolling back

### Production Deployment

In production, migrations run automatically on startup or via CI:
```bash
# In CI/CD pipeline or Dockerfile
pnpm payload migrate && pnpm build
```

### Rules for Claude

When implementing changes that modify the database schema:
1. Always create a migration with `pnpm payload migrate:create` after schema changes
2. Include migration files in the same commit as the schema changes
3. Never mix push mode and migrations on the same database
4. Review generated SQL in migration files before committing

## Git Commit Guidelines

Use `/commit` command to automatically commit all changes following these rules.

Follow [Conventional Commits](https://www.conventionalcommits.org/) standard. Commits should be **granular** - one logical change per commit.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                                      |
|------------|--------------------------------------------------|
| `feat`     | New feature                                      |
| `fix`      | Bug fix                                          |
| `docs`     | Documentation only                               |
| `style`    | Formatting, missing semicolons (no code change)  |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                          |
| `test`     | Adding or updating tests                         |
| `chore`    | Build process, dependencies, tooling             |
| `ci`       | CI/CD configuration                              |
| `revert`   | Revert a previous commit                         |

### Scope (optional)

Use the affected area: `auth`, `posts`, `media`, `admin`, `api`, `config`, `deps`, etc.

### Examples

```bash
feat(auth): add password reset functionality
fix(posts): resolve slug generation for unicode titles
docs: update README with dev container instructions
refactor(collections): extract common field patterns
test(api): add integration tests for user endpoints
chore(deps): upgrade payload to 3.72.0
```

### Breaking Changes

Add `!` after type/scope and include `BREAKING CHANGE:` in footer:
```bash
feat(api)!: change authentication response format

BREAKING CHANGE: login endpoint now returns { user, token } instead of { data: { user, token } }
```

### Granularity Rules

- **One logical change per commit** - don't mix unrelated changes
- **Separate refactoring from features** - refactor first, then add feature in next commit
- **Split large features** - break into smaller, reviewable commits
- **Keep tests with implementation** - test changes can be in same commit as the code they test

### Bad vs Good Examples

```bash
# ❌ BAD - multiple unrelated changes
git commit -m "fix login bug and add new post fields and update deps"

# ✅ GOOD - separate commits
git commit -m "fix(auth): handle expired token refresh"
git commit -m "feat(posts): add featured image field"
git commit -m "chore(deps): update payload to 3.72.0"
```

### Committing Workflow for Claude

When asked to commit changes, follow this process:

1. **Run `git status`** to see all changed files
2. **Group related changes** - identify which files belong to the same logical change
3. **Stage and commit each group separately** using granular commits:
   ```bash
   # Stage specific files for first logical change
   git add src/collections/Posts.ts src/collections/Posts.test.ts
   git commit -m "feat(posts): add excerpt field with character limit"

   # Stage next group
   git add src/access/adminOnly.ts
   git commit -m "refactor(access): extract admin check to reusable function"
   ```
4. **Use `git add -p`** when a single file contains multiple unrelated changes (interactive staging)
5. **Verify with `git log --oneline -5`** after committing

**Quick commit for single logical change:**
```bash
git add -A && git commit -m "type(scope): description"
```

**Never use `git add -A` followed by a single commit when there are multiple unrelated changes.**

---

## Payload CMS Patterns

### Getting Payload Instance

```typescript
// In API routes or Server Components
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'posts' })
```

### Collections

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'createdAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    { name: 'content', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
  timestamps: true,
}
```

#### Auth Collection with RBAC

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor', 'user'],
      defaultValue: ['user'],
      required: true,
      saveToJWT: true, // Include in JWT for fast access checks
      access: {
        update: ({ req: { user } }) => user?.roles?.includes('admin'),
      },
    },
  ],
}
```

#### Versioning & Drafts

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
      validate: false, // Don't validate drafts
    },
    maxPerDoc: 100,
  },
}
```

### Authentication

Payload provides built-in authentication using HTTP-only cookies and JWT tokens. Enable auth on any collection with `auth: true`.

#### Auth Configuration Options

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200,        // Session duration in seconds (2 hours)
    verify: true,                  // Require email verification
    maxLoginAttempts: 5,          // Lock account after 5 failed attempts
    lockTime: 600000,             // Lock duration in ms (10 minutes)
    useAPIKey: true,              // Enable API key authentication
    loginWithUsername: true,      // Allow username login (in addition to email)
  },
  fields: [/* ... */],
}
```

#### How Auth Works

1. **Login**: User submits credentials → Payload validates → Returns JWT token + sets HTTP-only cookie
2. **Subsequent requests**: Browser automatically sends HTTP-only cookie → Payload validates → `req.user` is populated
3. **Logout**: Must use logout endpoint (HTTP-only cookies can't be cleared by JavaScript)

HTTP-only cookies are protected from XSS attacks and cannot be read by JavaScript in the browser.

#### Auth Operations

**Login** - Authenticate and receive token:
```typescript
// Local API
const { user, token } = await payload.login({
  collection: 'users',
  data: { email: 'user@example.com', password: 'password' },
})

// REST API: POST /api/users/login
// GraphQL: mutation { loginUser(email: "...", password: "...") { user token } }
```

**Logout** - End session (required because HTTP-only cookies can't be cleared by JS):
```typescript
// Local API
await payload.logout({ collection: 'users' })

// End ALL sessions for this user
await payload.logout({ collection: 'users', allSessions: true })

// REST API: POST /api/users/logout
```

**Me** - Get current authenticated user:
```typescript
// Local API
const { user } = await payload.auth({ headers: req.headers })

// REST API: GET /api/users/me
// GraphQL: query { meUser { user { email } } }
```

**Refresh Token** - Get new JWT before expiration:
```typescript
// REST API: POST /api/users/refresh-token
// GraphQL: mutation { refreshTokenUser { refreshedToken } }
```

**Forgot Password** - Send reset email:
```typescript
// Local API
const token = await payload.forgotPassword({
  collection: 'users',
  data: { email: 'user@example.com' },
})

// REST API: POST /api/users/forgot-password
```

**Reset Password** - Complete password reset:
```typescript
// Local API
await payload.resetPassword({
  collection: 'users',
  data: { token: 'RESET_TOKEN', password: 'new-password' },
})

// REST API: POST /api/users/reset-password
```

**Verify Email** - Confirm email address:
```typescript
// Local API
await payload.verifyEmail({
  collection: 'users',
  token: 'VERIFICATION_TOKEN',
})

// REST API: POST /api/users/verify/TOKEN
```

**Unlock** - Unlock account after max login attempts:
```typescript
// Local API
await payload.unlock({ collection: 'users', data: { email: 'user@example.com' } })

// REST API: POST /api/users/unlock
```

#### Using Auth in Frontend (fetch with credentials)

When using fetch to call Payload API, include credentials to send cookies:
```typescript
const res = await fetch('http://localhost:3000/api/posts', {
  credentials: 'include', // Required to send HTTP-only cookies
})
```

#### Getting User in Server Components / API Routes

```typescript
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import config from '@payload-config'

export default async function Page() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return <div>Please log in</div>
  }

  return <div>Welcome {user.email}</div>
}
```

### Access Control

#### Collection-Level Access

```typescript
import type { Access } from 'payload'

// Common patterns
export const anyone: Access = () => true
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
export const adminOnly: Access = ({ req: { user } }) => user?.roles?.includes('admin')

// Row-level security with query constraint
export const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('admin')) return true
  return { author: { equals: user.id } }
}

// Async access check
export const projectMemberAccess: Access = async ({ req, id }) => {
  const { user, payload } = req
  if (!user) return false
  if (user.roles?.includes('admin')) return true
  const project = await payload.findByID({ collection: 'projects', id: id as string, depth: 0 })
  return project.members?.includes(user.id)
}
```

#### Field-Level Access (boolean only, no query constraints)

```typescript
{
  name: 'salary',
  type: 'number',
  access: {
    read: ({ req: { user }, doc }) => user?.id === doc?.id || user?.roles?.includes('admin'),
    update: ({ req: { user } }) => user?.roles?.includes('admin'),
  },
}
```

### Hooks

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    // Before validation - format data
    beforeValidate: [async ({ data, operation }) => {
      if (operation === 'create') data.slug = slugify(data.title)
      return data
    }],

    // Before save - business logic
    beforeChange: [async ({ data, req, operation }) => {
      if (operation === 'update' && data.status === 'published') {
        data.publishedAt = new Date()
      }
      return data
    }],

    // After save - side effects (always pass req!)
    afterChange: [async ({ doc, req, operation, context }) => {
      if (context.skipNotification) return
      if (operation === 'create') await sendNotification(doc)
      return doc
    }],

    // After read - computed fields
    afterRead: [async ({ doc, req }) => {
      doc.viewCount = await getViewCount(doc.id)
      return doc
    }],

    // Before delete - cascading deletes
    beforeDelete: [async ({ req, id }) => {
      await req.payload.delete({
        collection: 'comments',
        where: { post: { equals: id } },
        req, // Important for transaction
      })
    }],
  },
}
```

### Queries (Local API)

```typescript
// Find with complex query
const posts = await payload.find({
  collection: 'posts',
  where: {
    and: [
      { status: { equals: 'published' } },
      { 'author.name': { contains: 'john' } }
    ],
  },
  depth: 2,      // Populate relationships
  limit: 10,
  sort: '-createdAt',
  select: { title: true, author: true },
})

// Query operators
{ status: { equals: 'published' } }
{ status: { not_equals: 'draft' } }
{ price: { greater_than: 100 } }
{ title: { contains: 'payload' } }      // Case-insensitive
{ category: { in: ['tech', 'news'] } }
{ image: { exists: true } }
{ location: { near: [10, 20, 5000] } }  // [lng, lat, maxDistance]
```

### Custom Endpoints

Custom endpoints are **not authenticated by default**. Always check `req.user`.

```typescript
import { APIError } from 'payload'
import type { Endpoint } from 'payload'

// Collection endpoint: /api/orders/:id/tracking
export const Orders: CollectionConfig = {
  slug: 'orders',
  endpoints: [{
    path: '/:id/tracking',
    method: 'get',
    handler: async (req) => {
      if (!req.user) throw new APIError('Unauthorized', 401)
      const { id } = req.routeParams
      const tracking = await getTrackingInfo(id)
      return Response.json(tracking)
    },
  }],
}

// Root endpoint: /api/hello
export default buildConfig({
  endpoints: [{
    path: '/hello',
    method: 'get',
    handler: () => Response.json({ message: 'Hello!' }),
  }],
})
```

### Custom Components

Components are defined using file paths (not imports). All components are React Server Components by default.

```typescript
export default buildConfig({
  admin: {
    components: {
      graphics: {
        Logo: '/components/Logo',           // Default export
        Icon: '/components/Icon#MyIcon',    // Named export
      },
      actions: ['/components/ClearCache'],
      beforeDashboard: ['/components/Welcome'],
    },
  },
})
```

#### Client Components (need `'use client'` directive)

```tsx
'use client'
import { useAuth, useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'

export function MyComponent({ path }) {
  const { user } = useAuth()
  const { id, collection } = useDocumentInfo()
  const { value, setValue } = useField({ path })

  // Optimized: only re-renders when specific field changes
  const otherValue = useFormFields(([fields]) => fields.otherField?.value)

  return <div>Hello {user?.email}</div>
}
```

#### Field Components

```typescript
{
  name: 'status',
  type: 'select',
  options: ['draft', 'published'],
  admin: {
    components: {
      Field: '/components/StatusField',  // Edit view
      Cell: '/components/StatusCell',    // List view
    },
  },
}
```

### Field Type Guards

```typescript
import { fieldAffectsData, fieldHasSubFields, fieldIsArrayType, fieldIsBlockType } from 'payload'

function processField(field: Field) {
  if (fieldAffectsData(field)) {
    console.log(field.name) // Safe to access
  }
  if (fieldHasSubFields(field)) {
    field.fields.forEach(processField) // Safe to recurse
  }
}
```

### Plugins

```typescript
import type { Config, Plugin } from 'payload'

export const myPlugin = (options: { collections?: string[] }): Plugin =>
  (config: Config): Config => ({
    ...config,
    collections: config.collections?.map((collection) => {
      if (options.collections?.includes(collection.slug)) {
        return {
          ...collection,
          fields: [...collection.fields, { name: 'pluginField', type: 'text' }],
        }
      }
      return collection
    }),
  })
```

### Quick Reference

| Task                  | Solution                                    |
|-----------------------|---------------------------------------------|
| Auto-generate slugs   | `slugField({ fieldToUse: 'title' })`        |
| Restrict by user      | Access control with query constraint        |
| Local API user ops    | `user` + `overrideAccess: false`            |
| Draft/publish         | `versions: { drafts: true }`                |
| Computed fields       | `virtual: true` with afterRead hook         |
| Conditional fields    | `admin.condition`                           |
| Filter relationships  | `filterOptions` on field                    |
| Prevent hook loops    | `context` flag check                        |
| Cascading deletes     | beforeDelete hook                           |
| Transactions          | Pass `req` to nested operations             |

### Resources

- Docs: https://payloadcms.com/docs
- LLM Context: https://payloadcms.com/llms-full.txt
- GitHub: https://github.com/payloadcms/payload
- Examples: https://github.com/payloadcms/payload/tree/main/examples

---

## Mantine UI

The frontend uses Mantine for UI components. Mantine is configured in:
- `postcss.config.mjs` - PostCSS configuration with Mantine preset
- `src/app/(frontend)/providers.tsx` - MantineProvider with theme configuration
- `src/app/(frontend)/layout.tsx` - Imports Mantine CSS and wraps app in providers

### Resources

- Docs: https://mantine.dev/
- LLM Context: https://mantine.dev/llms-full.txt
