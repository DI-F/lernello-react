# 🏋️ Frontend Starter Kit

A production-grade React starter kit for admin dashboards with Supabase backend — optimized for multi-tenant apps like
shift scheduling, time tracking, or internal tools.

---

## 🚀 Stack Overview

| Category     | Tech / Package                                             | Purpose                                          |
|--------------|------------------------------------------------------------|--------------------------------------------------|
| **Frontend** | [React 18](https://react.dev/)                             | Component-based UI framework                     |
|              | [Vite](https://vitejs.dev/)                                | Fast dev server & lightweight bundler            |
|              | [Tailwind CSS](https://tailwindcss.com)                    | Utility-first CSS styling                        |
|              | [shadcn/ui](https://ui.shadcn.com)                         | Accessible UI components based on Radix          |
|              | [lucide-react](https://lucide.dev/)                        | Icon set with Tailwind-friendly sizing           |
|              | [react-router-dom](https://reactrouter.com/)               | Routing with guards and layouts                  |
| **Forms**    | [react-hook-form](https://react-hook-form.com/)            | Lightweight forms with validation support        |
|              | [zod](https://zod.dev/) + `@hookform/resolvers`            | Type-safe schema validation                      |
| **Data**     | [@tanstack/react-query](https://tanstack.com/query/latest) | Data fetching, caching, mutations                |
| **i18n**     | [i18next](https://www.i18next.com/) + `react-i18next`      | Internationalization (default: `de-CH`)          |
| **Backend**  | [Supabase](https://supabase.com/)                          | PostgreSQL + Auth + RLS for secure multi-tenancy |

---

## 🛠 Setup

1. Clone the repo
   ```bash
   git clone git@github.com:deomiarn/frontend-starter-kit.git
   cd frontend-starter-kit
   npm install

2. Create .env file
   ```bash
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key

3. Start the dev server
   ```bash
    npm run dev
