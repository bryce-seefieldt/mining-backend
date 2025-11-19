# AI Coding Agent Instructions (mining-backend)

Focus only on patterns actually present. Keep changes surgical and in line with existing NestJS + TypeORM setup.

## Big Picture
- Monorepo root `mining-backend/`; active service code lives in `backend-api/`. `planning/` holds human architecture notes (not enforced in code yet).
- NestJS application entry: `src/main.ts` (sets ValidationPipe, Swagger at `/api`, CORS, dynamic port default `3001`).
- Core wiring: `src/app.module.ts` loads env vars (global `ConfigModule`), configures Postgres via `TypeOrmModule.forRootAsync` (hard-coded host `localhost`, `synchronize: true` for dev), imports `UsersModule`.
- Persistence: TypeORM entities auto-loaded (`autoLoadEntities: true`); modules explicitly register repositories with `TypeOrmModule.forFeature`.

## Developer Workflows
- Install deps: `pnpm install` (pnpm is required; lockfile present).
- Start (no watch): `pnpm run start`; Dev (watch): `pnpm run start:dev`; Prod (after build): `pnpm run start:prod`.
- Build: `pnpm run build` (outputs to `dist/`).
- Unit tests: `pnpm run test` (Jest config inline in `package.json`).
- E2E tests: `pnpm run test:e2e` (config `test/jest-e2e.json`).
- Coverage: `pnpm run test:cov`.
- DB spin-up (local dev): `pnpm run db:up` / teardown `pnpm run db:down` (uses `docker compose --env-file .env.local`). Root README also shows manual variant with `.env`.

## Conventions & Patterns
- Entities: UUID primary key via `@PrimaryGeneratedColumn('uuid')`; audit fields using `@CreateDateColumn` / `@UpdateDateColumn`.
- Sensitive data: `passwordHash` uses `{ select: false }` to keep it out of default query results—preserve this on auth-related additions.
- Role-based access scaffolded via `UserRole` enum in `user.entity.ts` (values: `user`, `admin`, `super_admin`). Extend with enums, not magic strings.
- Validation: Global `ValidationPipe` with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`. DTOs you add must declare allowed properties; unknown input is stripped/rejected.
- Swagger: Config defined in `main.ts`; adding controllers decorated with Swagger decorators auto-includes them. Keep path grouping meaningful.
- Modules: Each domain gets its own module; import its entities with `TypeOrmModule.forFeature([Entity])` and export if other modules need repository access.

## Data & Persistence
- Current DB connection pulls creds from env keys: `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` (defaults: `postgres`, `Seven30est!`, `app_db`). Host/port fixed (`localhost:5432`).
- `synchronize: true` is enabled (dev convenience). For production-oriented changes, note in PR if a migration strategy is required; do not silently rely on synchronize.
- New entities: place under `src/<feature>/<name>.entity.ts`; use explicit column options (e.g., `@Column({ unique: true })`) as in `User`.

## Testing Patterns
- Unit tests co-located (`*.spec.ts`) use `Test.createTestingModule` with controllers/providers only (see `app.controller.spec.ts`). Mimic this minimal pattern.
- E2E tests (`test/*.e2e-spec.ts`) bootstrap full `AppModule` and call HTTP via Supertest.
- Prefer adding endpoint assertions to e2e rather than over-mocking in unit tests.

## Security & API Surface
- CORS already enabled globally; do not duplicate per controller.
- Always ensure new DTOs + ValidationPipe reject extraneous fields (no unchecked spreading of request bodies).
- Keep `passwordHash` internal; never expose raw password nor rename the field without updating its `select:false` safeguard.

## Adding Features (Example Flow)
1. Generate module (optional CLI): `pnpm nest generate module accounts`.
2. Create entity `accounts/account.entity.ts` with UUID id + audit columns.
3. Update `AccountsModule` to `imports: [TypeOrmModule.forFeature([Account])]` and export if other modules will access it.
4. Add controller + service; wire routes; use DTO classes with validation decorators.
5. If entity should appear in swagger, ensure DTOs are decorated (e.g. `@ApiProperty`).

## Do / Avoid
- DO reuse ValidationPipe assumptions; define DTOs explicitly.
- DO export module repositories only when cross-module access is needed.
- DO mention in PR when touching DB schema (given `synchronize: true`).
- AVOID hardcoding secrets—follow existing env key naming pattern.
- AVOID returning sensitive columns (keep `{ select: false }` where needed).
- AVOID generic helpers without a module boundary; maintain clear domain modules.

## Quick Reference
- Entry: `src/main.ts`
- Config: `src/app.module.ts`
- Entity exemplar: `src/users/user.entity.ts`
- Module exemplar: `src/users/users.module.ts`
- Docker: `docker-compose.yml`
- Scripts: `package.json` > `scripts`

## Git Workflow
- NEVER commit directly to `main`. Treat it as protected even locally.
- Before starting work: `git fetch origin && git checkout main && git pull --ff-only origin main`.
- Create a branch per logical change: `git checkout -b feat/<short-slug>` (use prefixes like `feat/`, `fix/`, `chore/`, `docs/`). Keep scope tight.
- Stage & commit incrementally with clear messages (describe behavior change; mention entity or module touched). Avoid gigantic single commits.
- Push branch: `git push -u origin feat/<short-slug>`.
- Open PR via GitHub CLI after meaningful change set (tests pass locally): `gh pr create --fill` (or add `--title` / `--body`). Include notes if DB schema changed (due to `synchronize: true`).
- Keep PR focused; split unrelated changes into separate branches/PRs.
- After PR merge: update local main (`git checkout main && git pull --ff-only origin main`) then delete branch (`git branch -d feat/<short-slug>` and `git push origin --delete feat/<short-slug>`).
- If main advances while branch open: `git fetch origin && git merge origin/main` (or rebase if preferred; resolve conflicts before pushing).
- Agent actions must always assume branch context; if on `main`, pause and create a feature branch before editing.

## Feedback
Flag unclear areas (e.g., migration strategy, auth flow not yet present) and request clarification before large structural changes.
