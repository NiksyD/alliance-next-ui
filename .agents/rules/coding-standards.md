# Alliance UI — Coding Standards

These rules apply to every file in this Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 project.

## Architecture

### Folder Structure (Feature-Based)

```
app/
├── (features)/
│   └── feature-name/
│       ├── page.tsx              # Route entry (Server Component)
│       ├── layout.tsx            # Optional layout
│       ├── loading.tsx           # Suspense fallback
│       ├── error.tsx             # Error boundary
│       ├── components/           # Feature-scoped components
│       │   ├── FeatureCard.tsx
│       │   └── FeatureCard.test.tsx
│       ├── hooks/                # Feature-scoped hooks
│       ├── actions/              # Server actions
│       ├── stores/               # Zustand stores (client state)
│       ├── utils/                # Feature-scoped utilities
│       ├── types/                # Feature-scoped types
│       └── schemas/              # Zod schemas
├── globals.css
├── layout.tsx                    # Root layout
└── page.tsx                      # Home route
components/                       # Shared/reusable components
├── ui/                           # Primitives (Button, Input, Modal)
├── layout/                       # Layout components (Header, Footer, Sidebar)
└── common/                       # Domain-agnostic composed components
hooks/                            # Shared hooks
lib/                              # Shared utilities, configs, clients
├── supabase/                     # Supabase client setup
├── validations/                  # Shared Zod schemas
└── utils/                        # Pure utility functions
stores/                           # Global/cross-feature Zustand stores
types/                            # Shared TypeScript types/interfaces
```

### File Naming

- **Components**: PascalCase — `UserProfile.tsx`, `DataTable.tsx`
- **Hooks**: camelCase with `use` prefix — `useAuth.ts`, `useDebounce.ts`
- **Utilities**: camelCase — `formatDate.ts`, `parseQuery.ts`
- **Types**: camelCase — `user.ts`, `apiResponse.ts`
- **Schemas**: camelCase with `.schema` suffix — `login.schema.ts`
- **Server actions**: camelCase — `createUser.ts`, `updateProfile.ts`
- **Tests**: same name as source with `.test` suffix — `UserProfile.test.tsx`
- **Stores**: camelCase with `Store` suffix — `authStore.ts`, `cartStore.ts`
- **Constants**: camelCase file, UPPER_SNAKE_CASE values — `config.ts` → `export const API_BASE_URL = ...`

## Component Patterns

### Server Components First

Default to Server Components. Only add `'use client'` when the component genuinely needs:

- `useState`, `useReducer`, `useEffect`, `useRef` with DOM
- Event handlers (`onClick`, `onChange`, etc.)
- Browser-only APIs (`window`, `localStorage`, `IntersectionObserver`)
- Third-party client-only libraries

### Exports

- **Prefer named exports** over default exports.
- Exception: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` use default exports (Next.js requirement).

```tsx
// ✅ Good
export function UserCard({ user }: UserCardProps): React.ReactElement { ... }

// ❌ Bad
export default function UserCard({ user }: UserCardProps) { ... }
```

### Props

- Define props as a `type` (not `interface`) with `Props` suffix.
- Destructure props in the function signature.

```tsx
type UserCardProps = {
  user: User;
  onSelect?: (id: string) => void;
};

export function UserCard({ user, onSelect }: UserCardProps): React.ReactElement {
  ...
}
```

## TypeScript

- **Strict mode is enabled** — never use `any`. Prefer `unknown` and narrow.
- **Explicit return types** on all exported functions and hooks.
- Use `type` over `interface` unless extending/merging is needed.
- Use `satisfies` for const objects when type-checking is needed without widening.

## Data Fetching & Validation

### Server Actions & Route Handlers Only

- All data mutations go through **Server Actions** (`'use server'`).
- All data reads from the client go through **Route Handlers** or are fetched in Server Components directly.
- Never call Supabase or external APIs directly from client components.

### Zod Everywhere

- Validate **all** server action inputs with Zod.
- Validate **all** route handler request bodies with Zod.
- Validate **environment variables** at startup with Zod.
- Co-locate schemas in `schemas/` folder or `lib/validations/`.

```tsx
// ✅ Good — server action with Zod validation
'use server';

import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function createUser(formData: FormData): Promise<ActionResult> {
  const parsed = CreateUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  // ... proceed with validated data
}
```

## Styling

- Use **Tailwind CSS 4** for all styling.
- Extract repeated patterns into components, not `@apply` classes.
- Use CSS variables (via Tailwind theme) for design tokens.
- Responsive design: mobile-first with Tailwind breakpoint prefixes.

## Imports

- Use the `@/` path alias for absolute imports.
- Order: React/Next → external libs → `@/` internal → relative → types → styles.
- Never use barrel files (`index.ts` re-exports) — import directly from the source file.

```tsx
// ✅ Good
import { Suspense } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { UserCard } from './components/UserCard';
import type { User } from '@/types/user';
```

## Error Handling

- Use `error.tsx` boundaries per route segment.
- Server actions return `{ data, error }` result objects — never throw to the client.
- Log errors server-side, return safe messages client-side.

## Performance

- Use `React.cache()` for per-request deduplication in Server Components.
- Use `next/dynamic` for heavy client components.
- Use `Suspense` boundaries with meaningful loading states.
- Preload critical data with `Promise.all()` for parallel fetches.
- Prefer `startTransition` for non-urgent UI updates.

## State Management (Zustand)

### Store Placement

- **Feature-scoped state** → `app/(features)/feature-name/stores/featureStore.ts`
- **Cross-feature / global state** → `stores/globalStore.ts` at the project root
- Never put stores in `lib/` — they are runtime state, not utilities.

### Store Structure

Always type the full state shape explicitly. Use named exports only.

```ts
// app/(features)/auth/stores/authStore.ts
import { create } from 'zustand';
import type { User } from '@/types/user';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

const initialState = {
  user: null,
  isLoading: false,
};

export const useAuthStore = create<AuthState>()((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}));
```

### Rules

- **Zustand is client-only.** Only import stores inside `'use client'` components or client hooks. Never import in Server Components, Server Actions, or Route Handlers.
- **Named export** — `export const useXxxStore`, never default export.
- **Explicit generic** — always pass the state type: `create<MyState>()(...)`. This keeps TypeScript strict.
- **Extract initial state** as a `const` so `reset()` actions stay DRY.
- **Selectors over full store** — subscribe to slices, not the whole store, to minimize re-renders:

```tsx
// ✅ Good — only re-renders when `user` changes
const user = useAuthStore((state) => state.user);

// ❌ Bad — re-renders on any store change
const { user, isLoading, setUser } = useAuthStore();
```

- **Actions stay inside the store** — no derived logic in components. Keep components dumb.
- **Async actions** go inside the store too:

```ts
type AuthState = {
  // ...
  login: (email: string, password: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>()((set) => ({
  // ...
  login: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await loginAction(email, password);
    set({ user: data ?? null, isLoading: false });
  },
}));
```

### Persist Middleware

Use `persist` from `zustand/middleware` for state that should survive page reloads (e.g. user preferences, UI settings). Never persist sensitive data (tokens, passwords).

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PreferencesState = {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'alliance-preferences' },
  ),
);
```

### Testing Stores

Reset store state between tests to prevent bleed:

```ts
import { useAuthStore } from './authStore';

beforeEach(() => {
  useAuthStore.getState().reset();
});
```
