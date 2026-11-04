# T019 — 404 Handling and Centralized Error Middleware

## Learning objectives
Distinguish unmatched routes from errors inside matched routes, handle malformed JSON, preserve meaningful 4xx codes, and register middleware in correct order.

## Mental model
```text
express.json() -> task routes -> catch-all 404 -> error handler
       |              |
  JSON parse error  thrown/rejected Promise
       +--------------+----------> error handler
```
A route that is never matched normally reaches a catch-all **regular** middleware. A route that throws or calls `next(error)` enters the **error-handling** chain.

## Catch-all 404
```ts
import type {RequestHandler} from 'express';
export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({status: 'ERROR', message: 'Route not found'});
};
```
Use `app.use(notFound)` **after** your routes. No wildcard syntax required.

Missing route vs missing resource:
- `GET /unknown`: no matching route -> catch-all 404.
- `GET /tasks/999`: route matches but task not found -> handler returns/throws 404.

## Expected error class
```ts
// src/utils/AppError.ts
export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}
```

## Robust introductory error handler
```ts
import type {ErrorRequestHandler} from 'express';
import {AppError} from '../utils/AppError.js';
export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof AppError && err.statusCode >= 400 && err.statusCode <= 599) {
    res.status(err.statusCode).json({status: 'ERROR', message: err.message});
    return;
  }

  // Malformed JSON from express.json / body-parser
  if (err && typeof err === 'object' && 'type' in err && 'status' in err &&
      err.type === 'entity.parse.failed' && err.status === 400) {
    res.status(400).json({status: 'ERROR', message: 'Invalid JSON request body'});
    return;
  }

  console.error('Unexpected request error', err);
  res.status(500).json({status: 'ERROR', message: 'Internal server error'});
};
```
This example handles malformed JSON but is not a comprehensive classification of every parser error (e.g. 413 large body or 415 unsupported encoding); production error handlers should handle those conditions appropriately.

## app.ts order
```ts
import express from 'express';
import taskRouter from './routes/task.routes.js';
import {notFound} from './middlewares/not-found.js';
import {errorHandler} from './middlewares/error.js';
const app = express();
app.use(express.json());
app.use('/tasks', taskRouter);
app.use(notFound);
app.use(errorHandler); // FOUR arguments: (err, req, res, next)
export default app;
```

## What happens in different situations?
| Scenario | Destination | Code |
|---|---|---|
| `GET /tasks` exists and succeeds | task handler | 200 |
| `GET /not-a-route` | catch-all 404 | 404 |
| `GET /tasks/999` no task | route / AppError | 404 |
| Malformed JSON sent to POST | JSON parser -> error handler | 400 |
| Unexpected DB exception | Express 5 async propagation -> error handler | 500 |
| Authorization failure | auth middleware or AppError | 401/403 |

## `res.headersSent` nuance
Once response headers have been sent, you cannot safely replace the body with a fresh JSON error. Hand off via `next(err)` to the default error handler, which may terminate the connection. This matters with streaming responses and partial sends.

## Express 5 and rejected Promises
Express 5 forwards rejections from Promise-returning route handlers/middleware automatically. For callback-based I/O or detached background work, forward errors explicitly or connect them to the returned Promise.

## Common pitfalls
- Putting catch-all 404 before actual routes -> all requests return 404.
- Using error middleware with only three parameters -> Express doesn't recognize it as an error handler.
- Treating malformed JSON as unexpected 500.
- Returning raw stack traces and database errors to clients.
- Attempting another `.json()` after response headers are already sent.
- Thinking unmatched-route 404 is automatically an exception.

## Interview Q&A
**Q1. Is an unmatched route automatically forwarded to error middleware?** No; use catch-all regular middleware.

**Q2. Why four arguments for error middleware?** Express uses `(err, req, res, next)` to identify it.

**Q3. Where should the error handler be registered?** After the routes and regular catch-all middleware.

**Q4. How should malformed JSON be handled?** Generally HTTP 400 with safe client message; it originated in body parser.

**Q5. Why `res.headersSent` check?** Response already began; avoid sending conflicting response.

**Q6. What is the difference between a missing route and missing task?** Different failure stage; both can map to 404.

## Practice
1. Build `notFound`, `errorHandler`, and `AppError` as separate ESM modules.
2. Test `/unknown`, `/tasks/999`, and malformed JSON.
3. Simulate a failed database Promise and verify a sanitized 500.
4. Add a development-only streaming-error test and observe headersSent behavior.
5. Check your middleware order and produce an execution diagram.

**Further reading:** https://expressjs.com/en/guide/error-handling.html

---

## Study checklist

- [ ] Explain the core concept without referring to notes.
- [ ] Run the ESM + TypeScript example yourself.
- [ ] Test one success case and one failure case.
- [ ] Explain the common mistakes in a mock interview.

**Official documentation:** https://expressjs.com/en/5x/api.html

**Conventions:** These examples use Express 5, TypeScript, ESM (`"type": "module"`), and `module: "NodeNext"`. Relative imports from TypeScript files use `.js` in their source so compiled ESM imports resolve in Node.js. The snippets are focused examples; route snippets assume `app` or `router` has already been created unless stated otherwise. External HTTP input must always be validated at runtime.
