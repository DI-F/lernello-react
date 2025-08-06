# Lernello

Hi 👉👈

---

## 📦 Table of Contents

1. [Backend](#backend-backend)
2. [PostgreSQL](#-postgresql-docker)
3. [Frontend](#frontend-frontend)
4. [Swagger / API Docs](#swagger)

---

## Backend (`/backend`)

> **Stack:** Java 23 · Gradle 8+ · Spring Boot

### Requirements

| Tool   | Version              |
|--------|----------------------|
| Java   | 23                   |
| Gradle | 8 (Wrapper included) |

### Common Commands

```bash
# Live-reload backend (auto-restart on rebuild):
gradle bootRun

# Continuous build on file changes (no run):
gradle build --continuous
```

### OpenAI API Key (required for AI features)

1. **Set an environment variable** before starting the backend

   ```powershell
   # PowerShell (Windows)
   $env:OPENAI_API_KEY = "sk-..."
   ```
   ```cmd
   :: CMD (Windows)
   set OPENAI_API_KEY=sk-...
   ```
   ```bash
   # Bash / macOS / Linux
   export OPENAI_API_KEY=sk-...
   ```

2. **Or** add it once in *IntelliJ*  
   `Run → Edit Configurations → Environment variables`

3. **(Last resort)** place it in `application.properties`  
   *Not recommended for production – commits leak secrets.*
   ```properties
   OPENAI_API_KEY=sk-...
   ```

---

## 🐳 PostgreSQL (`/docker`)

We run Postgres via **Docker Compose** – no local install needed.

| Action                  | Command                  |
|-------------------------|--------------------------|
| **Start DB**            | `docker compose up -d`   |
| **Restart (keep data)** | `docker compose down`    |
| **Reset (delete data)** | `docker compose down -v` |

> **Volume note**    
> Data lives in the named Docker volume **`pgdata`**.  
> Removing with `docker compose down -v` creates a fresh database.

### Connection details

| Host      | Port  | Database | User     | Password |
|-----------|-------|----------|----------|----------|
| localhost | 15432 | lernello | postgres | secret   |

### PGAdmin4 for GUI access

> **Note:** PGAdmin4 is optional, but useful for managing the database.

You can access pgAdmin4 at the URL (after starting the Docker Compose):

```
http://localhost:16543
```

| Field (Register “General → Connection”) | Value       |
|-----------------------------------------|-------------|
| Host name/address                       | lernello-db |
| Port	                                   | 15432       |
| Maintenance database	                   | lernello    |
| Username	                               | postgres    |
| Password	                               | secret      |

```bash
# quick psql inside the container
docker exec -it lernello-db   psql -U postgres -d lernello
```

### 🚀 One-shot dev start

```bash
gradle startDev
```

This will

1. Start PostgreSQL via Docker Compose
2. Run Spring Boot with the **`local`** profile (`gradlew bootRun`)

---

## Frontend (`/frontend`)

> **React** app with Vite, TypeScript, Tailwind CSS, and more.

### Requirements

- Node.js 18+

### Common Commands

```bash
npm i            # install dependencies
npm run dev      # local dev server
npm run lint     # eslint
npm run format   # prettier
```

---

## Swagger

Browse the generated API docs at

```
http://localhost:8080/swagger-ui/index.html
```

---

_Happy coding!_ 🦉
