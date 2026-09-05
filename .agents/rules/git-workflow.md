# Alliance UI — Git & Workflow Standards

## Branch Naming

```
feature/short-description
fix/short-description
chore/short-description
refactor/short-description
```

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication flow
fix: resolve hydration mismatch in sidebar
chore: configure vitest and testing library
refactor: extract shared form validation utils
test: add unit tests for UserCard component
docs: update README with setup instructions
style: fix linting errors
perf: lazy load dashboard charts
```

- Keep the subject line under 72 characters.
- Use imperative mood ("add", not "added" or "adds").
- No period at the end of the subject.

## Pre-commit

Husky + lint-staged runs on every commit:

1. ESLint (fix)
2. Prettier (format)
3. TypeScript type-check on staged files

Never bypass with `--no-verify` unless you have a reason and document it.
