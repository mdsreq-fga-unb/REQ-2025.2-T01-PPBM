# PPBM

## Features

- **TypeScript** - For type safety and improved developer experience
- **Fastify** - Fast, low-overhead web framework
- **Node.js** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality
- **Turborepo** - Optimized monorepo build system


## Getting Started with Docker

To upload the complete environment (Postgres, API and Client) with hot reload:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Useful commands:
```bash
# Apply Prisma schema (run once with services live)
docker compose -f docker-compose.dev.yml exec server pnpm -C apps/server db:push

# Open Prisma Studio
docker compose -f docker-compose.dev.yml exec server pnpm -C apps/server db:studio
```

The API is running at [http://localhost:3000](http://localhost:3000) and client is running at [http://localhost:4321](http://localhost:4321)

## Project Structure

```
app/
├── apps/
    └── client/      # Frontend (Astro)
│   └── server/      # Backend API (Fastify)
```
