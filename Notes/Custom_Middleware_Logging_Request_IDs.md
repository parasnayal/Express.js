# T018 — Custom Middleware, Request Logging, Request IDs, and Timing

## Learning objectives
Create reusable logging middleware, measure request duration accurately, generate per-request IDs, distinguish completion from aborted responses, and practice structured logging without leaking secrets.

## Mental model
```text
request -> requestId middleware -> logging middleware -> routes -> response
                         |                   |
                res.locals.requestId    finish/close listener logs duration
```

## Why logging middleware?
Avoid repeating `console.log` inside each route. A global middleware can log method, safe path, response status, duration, and request ID consistently.

## Minimal logger
```ts
import type {RequestHandler} from 'express';
export const requestLogger: RequestHandler = (req, res, next) => {
  console.log(req.method, req.path);
  next();
};
```

## Do NOT time immediately after `next()`
`next()` does not wait for asynchronous route work. Use the response lifecycle.

```ts
import type {RequestHandler} from 'express';
export const timedLogger: RequestHandler = (req, res, next) => {
  const start = performance.now();
  res.once('finish', () => {
    console.log({method: req.method, status: res.statusCode,
      durationMs: Math.round(performance.now() - start)});
  });
  next();
};
```
`finish` means response data was handed off to the OS, **not** guaranteed received by client. `close` may indicate premature termination. `performance.now()` is monotonic and suitable for elapsed time.

## Request ID middleware
```ts
import {randomUUID} from 'node:crypto';
import type {RequestHandler} from 'express';
export const requestId: RequestHandler = (_req, res, next) => {
  const id = randomUUID();
  res.locals.requestId = id; // private to this request; shared by downstream handlers
  res.setHeader('X-Request-ID', id); // explicitly sends ID to client header
  next();
};
```
`res.locals` is **not global** and **not automatically included in a response**. Each HTTP request has its own response object with its own `locals` storage. Good for auth context and correlation IDs. Do not use a mutable global `let currentRequestId` across concurrent requests.

## Production-inspired logger with aborted response tracking
```ts
import type {RequestHandler} from 'express';
export const logger: RequestHandler = (req, res, next) => {
  const start = performance.now();
  let recorded = false;
  const record = (outcome: 'completed' | 'aborted') => {
    if (recorded) return;
    recorded = true;
    console.log(JSON.stringify({
      level: outcome === 'completed' ? 'info' : 'warn',
      requestId: res.locals.requestId,
      method: req.method,
      path: req.path,  // sanitize/normalize for your real deployment
      statusCode: res.statusCode,
      durationMs: Math.round(performance.now() - start),
      outcome,
      time: new Date().toISOString()
    }));
  };
  res.once('finish', () => record('completed'));
  res.once('close', () => {
    if (!res.writableFinished) record('aborted');
  });
  next();
};
```
The status code on an aborted response may never have reached the client.

## Correct registration order (`src/app.ts`)
```ts
import express from 'express';
import taskRouter from './routes/task.routes.js';
import {requestId} from './middlewares/request-id.js';
import {logger} from './middlewares/logger.js';
import {errorHandler} from './middlewares/error.js';
const app = express();
app.use(requestId);
app.use(logger);
app.use(express.json());
app.use('/tasks', taskRouter);
app.use(errorHandler);
export default app;
```

## Structured logging
Prefer event objects/JSON with timestamps, levels, request IDs and meaningful messages. Logging libraries include Pino and Winston, which offer standardized formatting, levels and transports. OpenTelemetry traces go further for cross-service observability.

## Privacy and security
Never log password fields, raw `Authorization` headers, API keys, cookies, token-bearing query strings, or unnecessarily detailed personal data. Use safe normalized paths rather than blindly logging full `req.originalUrl` with query strings.

## Common pitfalls
- `console.log(Date.now() - start)` immediately after `next()` -> misses async duration.
- Logging only on `finish` -> no entry for some aborted connections.
- Logging both `finish` and `close` unguarded -> duplicate entries.
- Reusing a global variable for request IDs -> concurrent request contamination.
- Expecting `res.locals` to be automatically sent to frontend.
- Registering request ID middleware after the logger.

## Interview Q&A
**Q1. Why middleware logging?** Consistent cross-cutting logging without duplicating route code.

**Q2. What does `res.once('finish')` indicate?** Response handed off for transmission; not proof client received it.

**Q3. Why `performance.now()`?** Monotonic elapsed-time measurement.

**Q4. Why request IDs?** Correlate logs produced by one HTTP request.

**Q5. Why `res.locals`?** Request-specific shared data among middleware/handlers.

**Q6. What is structured logging?** Machine-readable fields for filtering, alerts and aggregation.

**Q7. What about client disconnection?** Observe `close`; detect if `res.writableFinished` was false, and avoid double logging.

## Practice
1. Log method, safe path, status, request duration, and UUID correlation ID.
2. Add `X-Request-ID` to response and compare it to logged value.
3. Make an async route sleep three seconds; verify duration includes time.
4. Abort an HTTP request and inspect `close` behavior.
5. Ensure no bearer token appears in logs.

**Further reading:** https://expressjs.com/en/guide/writing-middleware.html and https://nodejs.org/api/http.html

---

## Study checklist

- [ ] Explain the core concept without referring to notes.
- [ ] Run the ESM + TypeScript example yourself.
- [ ] Test one success case and one failure case.
- [ ] Explain the common mistakes in a mock interview.

**Official documentation:** https://expressjs.com/en/5x/api.html

**Conventions:** These examples use Express 5, TypeScript, ESM (`"type": "module"`), and `module: "NodeNext"`. Relative imports from TypeScript files use `.js` in their source so compiled ESM imports resolve in Node.js. The snippets are focused examples; route snippets assume `app` or `router` has already been created unless stated otherwise. External HTTP input must always be validated at runtime.
