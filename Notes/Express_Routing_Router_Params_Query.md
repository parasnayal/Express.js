# T013 — Express Routing and `express.Router()`

## Learning objectives
Understand route selection, modular routers, mount paths, route params versus query strings and bodies, route order, and Express 5 routing differences.

## Mental model
Routing selects handlers by **HTTP method** and **URL path**. A router groups related endpoints and can be mounted under a common prefix.

```text
GET /tasks          -> list tasks
POST /tasks         -> create task
GET /tasks/:id      -> fetch task
DELETE /tasks/:id   -> delete task
GET /tasks?done=true -> list/filter tasks; query is NOT part of route path
```

## ESM + TypeScript project structure
```text
src/
  app.ts
  server.ts
  routes/task.routes.ts
```

`src/routes/task.routes.ts`:
```ts
import {Router} from 'express';
const taskRouter = Router();
taskRouter.get('/', (_req, res) => res.json({data: []}));
taskRouter.get('/stats', (_req, res) => res.json({total: 0}));
taskRouter.get('/:id', (req, res) => {
  res.json({id: req.params.id});
});
taskRouter.post('/', (_req, res) => res.status(201).json({message: 'created'}));
export default taskRouter;
```

`src/app.ts`:
```ts
import express from 'express';
import taskRouter from './routes/task.routes.js';
const app = express();
app.use(express.json());
app.use('/tasks', taskRouter);
export default app;
```

`src/server.ts`:
```ts
import app from './app.js';
app.listen(3000);
```

Mounting `'/tasks'` plus router `'/:id'` creates `GET /tasks/:id`.

## Params, query and body
| Property | Example request | Example value | Typical purpose |
|---|---|---|---|
| `req.params.id` | `GET /tasks/25` | `'25'` | Target resource |
| `req.query.done` | `GET /tasks?done=true` | `'true'` | Filter/sort/page |
| `req.body.title` | `POST /tasks` with JSON | `'Study'` | Create/update fields |

Validate external data even with TypeScript. Params are normally strings; query values may have other shapes depending on parser/repetition.

```ts
function parsePositiveTaskId(raw: unknown): number | null {
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}
```

Query filter:
```ts
taskRouter.get('/filtered', (req, res) => {
  const done = req.query.done;
  if (done !== undefined && done !== 'true' && done !== 'false') {
    return res.status(400).json({message: 'done must be true or false'});
  }
  return res.json({done: done === undefined ? null : done === 'true'});
});
```

## Route registration order
`'/:id'` also matches `/stats`. Register specific routes (e.g. `/stats`) before generic `/:id`. The first route that sends a response without forwarding stops normal traversal.

## Express 5 details
- Named wildcard: `/{*splat}` (including root) or `/*splat` (excluding root).
- Older string-route patterns such as `/:id(\d+)` are not valid Express 5 string route syntax; use normal route + explicit validation, or a supported RegExp route.
- `next('route')` skips remaining handlers in the current route and continues searching other routes.

## Common pitfalls
- Using `Number(req.params.id)` without checking for NaN, fractions, overflow or leading zeros.
- Writing `if (!req.query.done)` instead of comparing with `undefined` (empty query value becomes indistinguishable from absent).
- Mount path duplicated (using `/tasks` in both app and router).
- Importing TS source modules with `.ts` in NodeNext output.
- Believing a missing resource and an unknown route are exactly the same condition (both can be 404 but occur at different stages).

## Interview Q&A
**Q1. `app` vs `Router()`?** Main application vs modular mountable router.

**Q2. Is query string used for route matching?** Not as part of the path. GET `/tasks?page=2` matches `/tasks`.

**Q3. What does `app.use('/tasks', router)` do?** Mounts router beneath `/tasks`.

**Q4. Why does `/tasks/stats` hit `/:id`?** The parameter route matches any one segment; order matters.

**Q5. Params vs query?** Params identify a route segment; query modifies retrieval/filtering/pagination.

**Q6. How do you handle `/tasks/abc`?** Validate ID; in this API return 400 for invalid format, 404 for well-formed missing task.

## Practice
1. Split Task API into `app.ts`, `server.ts`, and `task.routes.ts`.
2. Add list, get-by-ID, create, and delete routes.
3. Add `?completed=true|false` filter with validation.
4. Add `/stats` before `/:id` and verify correct matching.

**Further reading:** https://expressjs.com/en/guide/routing.html and https://expressjs.com/en/guide/migrating-5.html

---

## Study checklist

- [ ] Explain the core concept without referring to notes.
- [ ] Run the ESM + TypeScript example yourself.
- [ ] Test one success case and one failure case.
- [ ] Explain the common mistakes in a mock interview.

**Official documentation:** https://expressjs.com/en/5x/api.html

**Conventions:** These examples use Express 5, TypeScript, ESM (`"type": "module"`), and `module: "NodeNext"`. Relative imports from TypeScript files use `.js` in their source so compiled ESM imports resolve in Node.js. The snippets are focused examples; route snippets assume `app` or `router` has already been created unless stated otherwise. External HTTP input must always be validated at runtime.
