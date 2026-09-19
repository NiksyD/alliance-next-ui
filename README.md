This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Repository layout

This repo holds the Next.js app at the root, plus a vendored ASP.NET Core project:

```
.
├── app/                  # Next.js App Router
├── public/
└── ASIBasecodeCsharp/    # vendored C# basecode (git subtree)
```

### The `ASIBasecodeCsharp/` subtree

It was brought in from [keder-asi/ASIBasecodeCsharp](https://github.com/keder-asi/ASIBasecodeCsharp)
with `git subtree` and **without** `--squash`, so the upstream commit history is preserved
in this repo's log rather than collapsed into a single commit.

Nothing special is needed to check it out — the files are ordinary tracked files, not a
submodule. To pull upstream updates:

```bash
git subtree pull --prefix=ASIBasecodeCsharp https://github.com/keder-asi/ASIBasecodeCsharp.git master
```

Two things to get right there: the upstream default branch is `master`, not `main`; and do
not add `--squash`, because the original `subtree add` did not use it and mixing the two
modes produces confusing merges.

To push local changes back upstream (requires write access on that repo):

```bash
git subtree push --prefix=ASIBasecodeCsharp <remote> <branch>
```

The folder is deliberately excluded from the Next.js toolchain — see `exclude` in
[`tsconfig.json`](tsconfig.json) and `globalIgnores` in [`eslint.config.mjs`](eslint.config.mjs).
Its `wwwroot/lib/` directory ships minified jQuery, Bootstrap and React bundles, and with
`allowJs: true` those would otherwise be type-checked, linted and watched by `next dev`.
Keep the exclusions in place if you ever move or rename the folder.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# alliance-next-ui
