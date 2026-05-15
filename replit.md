# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## User preferences

- Do NOT rebuild the entire project
- Do NOT remove existing features when making changes

## SaluraCare Mobile App

### Key Components
- `SOSButton` - Floating emergency button (legacy, kept for modal use)
- `HealthCard` - Gradient cards for health tracking
- `MedicineCard` - Medicine reminder cards with take action
- `ServiceProviderCard` - Healthcare provider booking cards
- `SearchBar` - Reusable search input with filter button
- `CategoryChip` - Filter chip for category selection
- `EmptyState` - Empty state illustration component

### Data Libraries
- `artifacts/saluracare/lib/labTests.ts` - 12 lab tests with pricing, descriptions, time slots
- `artifacts/saluracare/lib/vaccines.ts` - 10 vaccines with recommended age, dose schedule

### Design System
- **Primary Color**: Teal (#00B5A5)
- **Secondary Color**: Navy Blue (#1A3A52)
- **Error/SOS Color**: Red (#E53935)
- **Card-based UI** with soft shadows
- **Light & Dark mode** support

## Authentication Architecture

### Auth Flow
- `app/_layout.tsx` uses `useSegments` + `useRouter` from expo-router to redirect unauthenticated users to `/login`
- `AuthContext` provides login/logout/refreshUser and persists token via AsyncStorage
- Token expiry handled with scheduled logout timer
- 401 responses auto-logout via `setUnauthorizedHandler`

## Development Notes
- The app uses local state for data persistence (MVP)
- All screens have proper safe area handling with transparent tab bar
- Empty states and loading states handled throughout
- Haptic feedback on key interactions
- Animated press effects on all interactive cards
- Demo credentials: demo@saluracare.com / Demo1234!
