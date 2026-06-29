This file provides guidance to coding agents (Claude Code, etc.) when working in this repository. `CLAUDE.md` is a symlink to this file.

## Overview

Outline is a fast, collaborative knowledge base for teams. It is TypeScript end-to-end: a React + MobX frontend (`app/`) and a Koa + Sequelize backend (`server/`), with real-time collaborative editing (ProseMirror + Y.js). PostgreSQL is the datastore; Redis + Bull power queues and pub/sub. It can be self-hosted or run as a cloud service.

Package manager is **Yarn 4** (`packageManager: yarn@4.11.0`); use `yarn` for all dependency management. Node version range is in `engines` (Node >= 20.12).

## Development Commands

First-time / full local stack (Docker Postgres + Redis, SSL, install, dev):

```bash
make up          # docker compose up redis+postgres, install-local-ssl, yarn install, yarn dev:watch
```

Copy `.env.sample` to `.env` before the first run. Day-to-day:

```bash
yarn dev:watch   # backend (nodemon) + frontend (vite) with hot reload — the usual dev command
yarn dev:backend # backend only
yarn vite:dev    # frontend only
yarn build       # production build: vite build + i18n extraction + esbuild server bundle
yarn start       # run the already-built server from build/
```

### Tests (Vitest)

```bash
make test                              # provisions/migrates the test DB, then runs all tests
yarn test path/to/file.test.ts         # run a single test file (preferred)
yarn test path/to/file.test.ts --watch
yarn test:app | yarn test:server | yarn test:shared   # whole project (slow; avoid)
```

`make test` must be run once to create the test DB before invoking `vitest` directly. Tests are colocated as `.test.ts` next to the code; do not create separate test directories. Mocks live in `__mocks__/`.

### Database (Sequelize)

```bash
yarn db:create-migration --name my-migration
yarn db:migrate
yarn db:rollback
yarn db:migrate --env test     # run against the test database
```

### Quality

```bash
yarn lint        # oxlint --type-aware (app server shared plugins)
yarn format      # oxfmt — the formatter is oxfmt, NOT Prettier (older docs/badges are stale)
yarn tsc         # TypeScript type check
```

Husky pre-commit hooks run automatically.

## Architecture

Monorepo with three TypeScript roots plus plugins (see `docs/ARCHITECTURE.md` and `docs/SERVICES.md` for the canonical overview):

- `app/` — React SPA (Vite, MobX, styled-components)
- `server/` — Koa API server, Sequelize ORM, Bull workers
- `shared/` — code used by both client and server; most importantly the ProseMirror editor schema, i18n, validations, and types
- `plugins/` — self-contained feature plugins, each with `client/`, `server/`, `shared/`

### Backend request flow

Route → middleware (auth, CSRF, rate limit, validation) → policy → command/model → presenter.

- **Routes** (`server/routes/api/`) are thin: validate input and delegate.
- **Policies** (`server/policies/`) authorize via cancan-style ability checks; always check before data access.
- **Commands** (`server/commands/`, e.g. `documentCreator`, `documentUpdater`) orchestrate logic that spans multiple models or has side effects. Use a command when logic crosses models; use model methods for single-entity CRUD/queries.
- **Presenters** (`server/presenters/`) shape models into JSON — the backend→frontend contract.
- Custom error classes live in `server/errors.ts`.

### Services (runtime roles)

The server runs one or more services selected with `--services=` (see the `dev` script and `docs/SERVICES.md`): `web` (HTTP + API), `websockets`, `collaboration` (Hocuspocus/Y.js), `worker` (Bull queues), `cron` (scheduled tasks), `admin` (dev-only queue browser). A single process can run several; production can split them across machines. At least one `web` and one `worker` are required.

### Background jobs (Bull + Redis)

- `server/queues/processors/` listen to model lifecycle events on the event bus and enqueue work.
- `server/queues/tasks/` are the async jobs themselves (extend `BaseTask`, implement `perform()`), run by the `worker` service.

### Frontend

- `app/stores/` — MobX stores (aggregated in `RootStore`); keep business logic here, not in components. Base CRUD/pagination lives in `app/stores/base/Store.ts`.
- `app/models/` — MobX domain models.
- `app/scenes/` are full-page views, `app/components/` are reusable UI, `app/actions/` are reusable actions.
- `app/utils/ApiClient.ts` is the RPC client (POST to `/api/*`); stores call it and update observables, which re-render components.

### Real-time collaboration

The ProseMirror editor schema lives in `shared/editor/` (nodes, marks, extensions) so client and server serialize documents identically. The `collaboration` service runs Hocuspocus with a stack of extensions (auth, persistence, presence/views, throttle, optional Redis for multi-node). Document content is stored as Y.js state on `Document.content`.

### Plugins

Each plugin (`plugins/<name>/`) has a `plugin.json` (id, name, priority) plus `client/`, `server/`, `shared/`. `server/utils/PluginManager.ts` glob-loads `build/plugins/*/server/*` and registers hooks (API, AuthProvider, Processor, Task, SearchProvider, EmailTemplate, and more). Prefer extending via a plugin over modifying core.

## Conventions

### General

- **Do not create new markdown (.md) files.**
- Do not add translation strings manually — they are auto-extracted from the codebase (`yarn build:i18n`).
- Do not replace smart quotes (“”, ‘’) with straight quotes.
- Use early returns; always use curly braces for `if` statements.

### TypeScript

- Strict mode. Never use `any`; avoid `unknown` unless necessary. Avoid type assertions (`as`, `!`).
- Prefer `interface` over `type` for object shapes. Avoid `#` for private fields.
- Exported members go at the top of the file; use named exports for new components/classes.
- JSDoc all public/exported functions: description, a blank line, then `@param`/`@returns` (start lowercase, end with a period) and `@throws` where relevant.
- Class member order: public static vars → public static methods → public vars → public methods → protected → private.

### React

- Functional components + hooks. Do not import React unless used directly.
- Event handlers prefixed `handle` (e.g. `handleClick`). Memoize where it matters (`React.memo`/`useMemo`/`useCallback`).
- styled-components for styling; ARIA roles and semantic HTML for accessibility.

### MobX

- Stores in `app/stores/`; use `observable`/`action`/`computed`. Prefer computed values over render-time calculation.

### Database / API / Auth

- Sequelize models in `server/models/`; wrap multi-table writes in transactions; add indexes for query performance.
- REST-ish endpoints under `/api/`, auth under `/auth/`; validate with the validation middleware/schemas; format responses with presenters.
- JWT auth; `rateLimiter` middleware on sensitive endpoints; `authenticated` middleware on protected routes.

### Security

- Always use `sanitizeUrl()` when setting `href` or `src` from user-controlled data in ProseMirror `toDOM` methods (regardless of import path). Unlike React, `toDOM` writes raw DOM and does not sanitize attribute values.

### Dependency upgrades

When adding a `resolutions` entry for a transitive-dependency advisory, scope it to the exact vulnerable descriptors using `name@npm:<range>` rather than overriding the package globally — inspect `yarn.lock` for the requested ranges and add one entry per range. Run `yarn install` afterward to update the lockfile.
