# Repository Guidelines

## Project Structure & Module Organization

Application code is under `src/`. `app.ts` configures Express and mounts `routes/`; each resource follows the routes → controllers → services → repositories → models layers. `config/` contains PostgreSQL setup, `middlewares/` contains request and error handling, and `utils/` and `types/` hold shared helpers and TypeScript definitions. `Notes/` contains learning/reference notes. There is no dedicated test or asset directory currently.

## Build, Test, and Development Commands

Use Yarn 4.6.0 (declared in `package.json`). Run `yarn dev` to start the API with `.env` loading and watch mode, `yarn typecheck` to check TypeScript without emitting files, and `yarn build` to compile `src/` into `dist/`. Run a compiled server with `yarn start` after building. No test or lint command is configured yet; add one to `package.json` when introducing that tooling.

## Coding Style & Naming Conventions

Write TypeScript using ES modules and the strict compiler settings in `tsconfig.json`. Format with `.prettierrc.json`: two spaces, LF line endings, semicolons, and double quotes. Keep filenames lowercase and descriptive, with role suffixes such as `task.controller.ts`, `task.service.ts`, and `task.repository.ts`; use PascalCase for classes/types and camelCase for values and functions. Follow the existing resource-layer boundaries and keep SQL access in repositories. Use parameterized SQL values rather than interpolating request data.

## Testing Guidelines

There is no configured test framework or coverage requirement. For changes, run `yarn typecheck` and exercise affected API routes against a development PostgreSQL database. If adding tests, place them in a clearly named `tests/` directory and use descriptive names tied to the behavior under test.

## Commits & Pull Requests

Recent commits use short, direct summaries (for example, `Transaction`, `CRUD operations`, `Database error handling`). Keep commit subjects concise and focused. Pull requests should explain the behavior change, list validation performed, link a related issue when applicable, and include request/response examples for API changes.

## Configuration & Security

Configure PostgreSQL with `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE` in a local `.env` file. Never commit credentials or expose secrets in logs. Keep SQL parameterized and validate request data at the API boundary.
