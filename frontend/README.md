# 📚 Lernello – Frontend

A production-ready **React frontend** (Vite) for data-driven SPAs with **routing, forms, i18n**, and **API integration
**.  
Designed to help you ship feature-rich UIs fast—lean, type-safe, and maintainable.

---

## ⚙️ Stack Overview

| Category      | Package(s)                                                               | Purpose                                               |
|---------------|--------------------------------------------------------------------------|-------------------------------------------------------|
| **Core**      | React **19**, Vite **6**                                                 | Modern React app, fast dev server & build             |
| **Styling**   | Tailwind CSS **4**, `tailwind-merge`, `clsx`, `class-variance-authority` | Utility CSS, clean class composition, variant pattern |
| **Routing**   | `react-router` **v7**                                                    | SPA routing (layouts, guards, optional loaders)       |
| **Forms**     | `react-hook-form`, `zod`, `@hookform/resolvers`                          | Lightweight forms + schema validation                 |
| **Data**      | `@tanstack/react-query` (+ Devtools in dev)                              | Fetching, caching, mutations, revalidation            |
| **i18n**      | `i18next`, `react-i18next`                                               | Translations & localization                           |
| **Utilities** | `date-fns`, `immer`, `lucide-react`, `@radix-ui/react-slot`              | Dates/times, immutable updates, icons, slot pattern   |
| **Tooling**   | TypeScript, ESLint, Prettier, Vite React Plugin                          | DX, linting, formatting                               |

---

## 🚀 Quick Start

```bash
# Install
npm install

# Development
npm run dev

# Lint
npm run lint

# Production
npm run build && npm run preview
```

## Environment variables (Vite)

Create a `.env` file in the root directory with the following variables:

```env
# Base URL of your API (e.g. https://api.example.com)
VITE_API_URL=localhost:5173
```

Note: Note: Only variables with the `VITE_` prefix will be exposed to the client-side code.
