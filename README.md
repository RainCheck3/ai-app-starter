# Web App Starter

A reusable starter template for web products, dashboards, tools, landing pages, SaaS apps, and AI-powered web apps.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- ESLint
- Prettier
- pnpm
- nvm

## Getting Started

For a new project, select **Use this template > Create a new repository** on GitHub, then clone the new repository. Update the package name, app metadata, and README for your project.

Use the expected Node version:

```bash
nvm use
```

Install dependencies and start local development:

```bash
pnpm install
pnpm dev
```

Run the standard quality gate before sharing or deploying:

```bash
pnpm check
```

## Continuous Integration

GitHub Actions runs `pnpm check` on every push and pull request. The workflow uses `.nvmrc`, the pnpm version in `package.json`, and a frozen lockfile install. You can also run it manually from the Actions tab.
