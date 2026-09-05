# Alliance UI — Testing Standards

These rules apply to all test files in the project. We use **Vitest** + **React Testing Library**.

## File Placement

- Co-locate tests next to the file they test: `ComponentName.test.tsx`
- Integration tests for server actions: `actionName.test.ts` in the `actions/` folder
- E2E tests (if added later): top-level `e2e/` directory

## Test Structure

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('renders user name', () => {
    render(<UserCard user={{ id: '1', name: 'Nik' }} />);
    expect(screen.getByText('Nik')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(<UserCard user={{ id: '1', name: 'Nik' }} onSelect={handleSelect} />);
    await user.click(screen.getByRole('button'));

    expect(handleSelect).toHaveBeenCalledWith('1');
  });
});
```

## Conventions

- Use `describe` blocks grouped by component/function name.
- Use `it` (not `test`) for consistency.
- Test behavior, not implementation — query by role, text, or label, not by class or test ID.
- Use `userEvent` over `fireEvent` for realistic interaction simulation.
- Use `vi.fn()` for mocks, `vi.mock()` for module mocks.
- Use `vi.spyOn()` for spying on existing methods.
- Keep tests isolated — no shared mutable state between tests.

## Naming

- Describe what the component/function **does**, not what it **is**.
- Pattern: `it('does X when Y')` or `it('renders X for state Y')`

```tsx
// ✅ Good
it('disables submit button when form is invalid');
it('shows error message after failed login');

// ❌ Bad
it('should work');
it('test button');
```

## What to Test

| Layer          | Test                                                          |
| -------------- | ------------------------------------------------------------- |
| UI Components  | Renders correctly, handles interactions, shows correct states |
| Hooks          | Return values, state transitions, cleanup                     |
| Utils/Helpers  | Pure function input → output                                  |
| Zod Schemas    | Valid inputs pass, invalid inputs fail with correct errors    |
| Server Actions | Input validation, error paths (mock DB/API calls)             |

## What NOT to Test

- Implementation details (internal state, private methods)
- Third-party library internals
- Tailwind class names
- Exact snapshot matching (use targeted assertions)

## Mocking

- Mock **external boundaries** (API calls, Supabase, third-party services)
- Never mock the component under test
- Keep mocks minimal — only mock what's needed for the specific test
- Co-locate mock data in a `__mocks__/` folder or inline in the test

## Coverage

- Aim for meaningful coverage, not 100%.
- Focus on: business logic, user-facing behavior, edge cases, error states.
- `vitest --coverage` is available but don't chase vanity metrics.
