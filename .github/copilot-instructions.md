# GitHub Copilot Instructions

## Project Overview

This is a **Payload CMS 3.x** application using:

- Next.js 15
- React 19
- PostgreSQL (via Drizzle ORM)
- TypeScript
- Mantine UI library

Payload provides:

- Admin panel at `/admin`
- REST and GraphQL APIs
- Collections and authentication

## Tech Stack

- **CMS**: Payload CMS 3.x
- **Framework**: Next.js 15 (App Router)
- **UI**: Mantine 7.x
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Testing**: Vitest (integration), Playwright (e2e)
- **Package Manager**: pnpm

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Public website routes
│   │   ├── (auth)/          # Auth pages (login, register)
│   │   ├── components/      # Frontend React components
│   │   └── e/, events/      # Event pages
│   └── (payload)/           # Admin panel and API routes
│       └── admin/           # Payload admin customization
├── collections/             # Payload collection configs
│   ├── Events.ts
│   ├── EventParticipations.ts
│   ├── Users.ts
│   └── Media.ts
├── migrations/              # Database migrations
├── payload.config.ts        # Main Payload config
└── payload-types.ts         # Auto-generated types (DO NOT EDIT)

tests/
├── e2e/                     # Playwright tests (*.e2e.spec.ts)
└── int/                     # Vitest tests (*.int.spec.ts)
```

## Key Commands

```bash
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm generate:types         # Regenerate Payload types (run after schema changes)
pnpm generate:importmap     # Regenerate component import map
pnpm payload migrate:create # Create migration after schema changes
tsc --noEmit               # Validate TypeScript
```

## Critical Patterns

### 1. Local API Access Control

When using Payload's Local API with a user, ALWAYS set `overrideAccess: false`:

```typescript
// ❌ WRONG - bypasses access control
await payload.find({ collection: 'posts', user: someUser })

// ✅ CORRECT - enforces permissions
await payload.find({ collection: 'posts', user: someUser, overrideAccess: false })
```

### 2. Transaction Safety in Hooks

ALWAYS pass `req` to nested Payload operations to maintain transaction atomicity:

```typescript
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req, // Required for atomicity
      })
    },
  ],
}
```

### 3. Prevent Infinite Hook Loops

Use context flags to prevent hooks from triggering themselves:

```typescript
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      if (context.skipHooks) return
      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        context: { skipHooks: true },
        req,
      })
    },
  ],
}
```

## Payload CMS Patterns

### Getting Payload Instance

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

// In API routes or Server Components
const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'posts' })
```

### Collection Definition

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

### Auth Collection with RBAC

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
      saveToJWT: true, // Fast access checks
    },
  ],
}
```

### Access Control Patterns

```typescript
import type { Access } from 'payload'

// Anyone can access
export const anyone: Access = () => true

// Authenticated users only
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Admin only
export const adminOnly: Access = ({ req: { user } }) => user?.roles?.includes('admin')

// Row-level security (query constraint)
export const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('admin')) return true
  return { author: { equals: user.id } }
}
```

### Hooks

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    // Before validation - format data
    beforeValidate: [
      async ({ data, operation }) => {
        if (operation === 'create') data.slug = slugify(data.title)
        return data
      },
    ],

    // Before save - business logic
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'update' && data.status === 'published') {
          data.publishedAt = new Date()
        }
        return data
      },
    ],

    // After save - side effects (always pass req!)
    afterChange: [
      async ({ doc, req, context }) => {
        if (context.skipNotification) return
        if (operation === 'create') await sendNotification(doc)
      },
    ],
  },
}
```

### Queries

```typescript
// Find with query
const posts = await payload.find({
  collection: 'posts',
  where: {
    and: [
      { status: { equals: 'published' } },
      { 'author.name': { contains: 'john' } },
    ],
  },
  depth: 2,
  limit: 10,
  sort: '-createdAt',
})

// Common operators
{ status: { equals: 'published' } }
{ price: { greater_than: 100 } }
{ title: { contains: 'payload' } }
{ category: { in: ['tech', 'news'] } }
{ image: { exists: true } }
```

### Custom Endpoints

⚠️ Custom endpoints are **not authenticated by default**. Always check `req.user`.

```typescript
import type { Endpoint } from 'payload'
import { APIError } from 'payload'

export const myEndpoint: Endpoint = {
  path: '/:id/tracking',
  method: 'get',
  handler: async (req) => {
    if (!req.user) throw new APIError('Unauthorized', 401)
    const { id } = req.routeParams
    const data = await getTrackingInfo(id)
    return Response.json(data)
  },
}
```

### Custom Components

Components are defined using **file paths** (not imports):

```typescript
export default buildConfig({
  admin: {
    components: {
      graphics: {
        Logo: '/components/Logo', // Default export
        Icon: '/components/Icon#MyIcon', // Named export
      },
    },
  },
})
```

**Client Components** need `'use client'` directive:

```tsx
'use client'
import { useAuth, useField } from '@payloadcms/ui'

export function MyComponent() {
  const { user } = useAuth()
  const { value, setValue } = useField({ path: 'status' })
  return <div>Hello {user?.email}</div>
}
```

## Authentication

Payload uses HTTP-only cookies and JWT tokens.

```typescript
// Login
const { user, token } = await payload.login({
  collection: 'users',
  data: { email: 'user@example.com', password: 'password' },
})

// Get current user (in Server Components)
import { headers } from 'next/headers'
const { user } = await payload.auth({ headers: await headers() })

// Frontend fetch (include credentials for cookies)
const res = await fetch('/api/posts', {
  credentials: 'include', // Required for HTTP-only cookies
})
```

## Database Migrations

### Development Workflow

Schema changes are automatically pushed in development. Before committing:

1. Make schema changes in collection configs
2. Run `pnpm generate:types` to update TypeScript types
3. Run `pnpm payload migrate:create` to generate migration
4. Review migration in `src/migrations/`
5. Commit schema changes AND migration together

```bash
# After modifying a collection
pnpm generate:types
pnpm payload migrate:create
git add src/collections/ src/migrations/ src/payload-types.ts
git commit -m "feat: add new field"
```

### Migration Commands

```bash
pnpm payload migrate              # Run pending migrations
pnpm payload migrate:create       # Create migration from schema diff
pnpm payload migrate:status       # Check migration status
pnpm payload migrate:down         # Roll back last batch
```

## Mantine UI

Frontend uses Mantine 7.x for UI components.

```tsx
import { Button, TextInput, Stack } from '@mantine/core'

export function MyForm() {
  return (
    <Stack>
      <TextInput label="Name" required />
      <Button type="submit">Submit</Button>
    </Stack>
  )
}
```

- Docs: https://mantine.dev/
- PostCSS config: `postcss.config.mjs`
- Theme: `src/app/(frontend)/providers.tsx`

## Git Commit Guidelines

Follow Conventional Commits standard:

```
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Examples**:

```bash
feat(auth): add password reset functionality
fix(posts): resolve slug generation for unicode titles
refactor(collections): extract common field patterns
chore(deps): upgrade payload to 3.72.0
```

## Development Workflow

1. After modifying schemas: `pnpm generate:types`
2. After creating/modifying components: `pnpm generate:importmap`
3. Before committing schema changes: `pnpm payload migrate:create`
4. Validate TypeScript: `tsc --noEmit`

## Testing

```bash
pnpm test               # Run all tests
pnpm test:int           # Integration tests (vitest)
pnpm test:e2e          # E2E tests (playwright)

# Run single test
pnpm exec vitest run tests/int/api.int.spec.ts
pnpm exec playwright test tests/e2e/frontend.e2e.spec.ts
```

## Security Checklist

- [ ] Set `overrideAccess: false` when passing `user` to Local API
- [ ] Pass `req` to nested operations in hooks
- [ ] Check for infinite hook loops (use context flags)
- [ ] Verify custom endpoints check `req.user` for authentication
- [ ] Field-level access returns boolean only (no query constraints)

## Quick Reference

| Task                | Solution                             |
| ------------------- | ------------------------------------ |
| Auto-generate slugs | `slugField({ fieldToUse: 'title' })` |
| Restrict by user    | Access control with query constraint |
| Draft/publish       | `versions: { drafts: true }`         |
| Computed fields     | `virtual: true` with afterRead hook  |
| Conditional fields  | `admin.condition`                    |
| Prevent hook loops  | Context flag check                   |
| Cascading deletes   | beforeDelete hook                    |
| Transactions        | Pass `req` to nested operations      |

## Resources

- Payload Docs: https://payloadcms.com/docs
- Payload LLM Context: https://payloadcms.com/llms-full.txt
- Mantine Docs: https://mantine.dev/
- Mantine LLM Context: https://mantine.dev/llms-full.txt
