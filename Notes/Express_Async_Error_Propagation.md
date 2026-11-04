# T016 — Async Handler Error Propagation (Express 5)

## Learning objectives
Understand synchronous errors, rejected Promises, automatic forwarding in Express 5, `next(error)`, detached async work, and centralized error handling.

## Mental model
If an Express 5 route or middleware **returns** a Promise that rejects, Express forwards that rejection into error-handling middleware. It does **not** magically catch errors from arbitrary detached callbacks.

## Synchronous and async failures
```ts
app.get('/sync', (_req, _res) => {
  throw new Error('Sync failure');
});
app.get('/async', async (_req, res) => {
  const tasks = await loadTasksFromDatabase(); // rejection is forwarded by Express 5
  res.json({data: tasks});
});
```

Express 4 often required `try/catch(next)` or a wrapper around async routes. Express 5 forwards errors from rejected returned Promises.

## Detached work that Express cannot auto-catch
```ts
app.get('/bad', (_req, res) => {
  setTimeout(() => {throw new Error('Not caught by route Promise');}, 100);
  res.json({started: true});
});
```
The timer runs later, outside the returned handler Promise. Handle callback errors explicitly or redesign to await/return the Promise.

```ts
app.get('/unsafe', async (_req, res) => {
  saveAnalytics(); // detached Promise; possible unhandled rejection
  res.json({ok: true});
});

app.get('/safe', async (_req, res) => {
  await saveAnalytics(); // rejection propagates to Express 5
  res.json({ok: true});
});
```
For intentionally background work, use a managed queue or handle rejection with `.catch`.

## Custom expected errors
`src/utils/AppError.ts`:
```ts
export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}
```

Service example:
```ts
import {AppError} from '../utils/AppError.js';
export async function findTask(id: number) {
  const task = [{id: 1, title: 'Study'}].find(t => t.id === id);
  if (!task) throw new AppError(404, 'Task not found');
  return task;
}
```

Router example:
```ts
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id); // validate format in production first!
  const task = await findTask(id);
  res.json({data: task});
});
```

## Centralized error middleware
```ts
import type {ErrorRequestHandler} from 'express';
import {AppError} from '../utils/AppError.js';
export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof AppError && error.statusCode >= 400 && error.statusCode <= 599) {
    res.status(error.statusCode).json({status: 'ERROR', message: error.message});
    return;
  }
  console.error('Unexpected error', error);
  res.status(500).json({status: 'ERROR', message: 'Internal server error'});
};
```
Register after routes: `app.use(errorHandler)`.

## When try/catch is still useful
Use `try/catch` when you want to **recover**, retry safely, translate errors, log additional context, or provide a fallback. You don't need a catch around each async route solely to call `next`.

## Important nuances
- `res.headersSent` can be true if a stream/response began before an error; don't attempt to send a fresh JSON error then.
- Calling `next(error)` after already ending a response is hazardous; forward only when appropriate.
- An expected 404 should not become a 500.
- A process-level `unhandledRejection` handler is **not** a replacement for request error handling.
- On a rejected Promise in Express 5, Express forwards the rejection; if it has no rejection reason, Express supplies a default error value.

## Interview Q&A
**Q1. What changed for async errors in Express 5?** Rejected returned Promises are forwarded automatically.

**Q2. Does Express catch an exception from `setTimeout`?** Not when detached from returned Promise; handle it explicitly.

**Q3. Why use a central error handler?** Consistency and avoiding disclosure of internals.

**Q4. Why a custom AppError?** To distinguish expected HTTP-level failures from unexpected server errors.

**Q5. When do you still use try/catch?** For meaningful local handling: recovery/retry/fallback/context.

**Q6. Why check `res.headersSent`?** A response has started; you cannot safely replace it.

## Practice
1. Add `AppError(404, 'Task not found')` in service code.
2. Throw a normal `Error` in a simulated database call and confirm 500.
3. Test malformed input as 400, not 500.
4. Experiment with an intentionally detached rejected Promise in a controlled development setting; explain why Express won't catch it automatically.

**Further reading:** https://expressjs.com/en/guide/error-handling.html

---

## Study checklist

- [ ] Explain the core concept without referring to notes.
- [ ] Run the ESM + TypeScript example yourself.
- [ ] Test one success case and one failure case.
- [ ] Explain the common mistakes in a mock interview.

**Official documentation:** https://expressjs.com/en/5x/api.html

**Conventions:** These examples use Express 5, TypeScript, ESM (`"type": "module"`), and `module: "NodeNext"`. Relative imports from TypeScript files use `.js` in their source so compiled ESM imports resolve in Node.js. The snippets are focused examples; route snippets assume `app` or `router` has already been created unless stated otherwise. External HTTP input must always be validated at runtime.
