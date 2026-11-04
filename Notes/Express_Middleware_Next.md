# T015 — Express Middleware and `next()`

## Learning objectives
Understand middleware as request processing layers; register app-, router-, and route-level middleware; learn `next()`, `next(error)`, `next('route')`, and execution order.

## Mental model
A middleware is a function in the request-response lifecycle. It can:
1. inspect/change the request or response;
2. **send a response** and stop normal processing;
3. **call `next()`** to continue;
4. **call `next(error)`** to begin error handling.

```text
GET /tasks -> logger -> authenticate -> route -> response
               next()     next()
```

## Simple logger (TypeScript/ESM)
```ts
import type {RequestHandler} from 'express';
export const logger: RequestHandler = (req, res, next) => {
  console.log(req.method, req.path);
  next();
};
```

Register in `app.ts`:
```ts
import express from 'express';
import taskRouter from './routes/task.routes.js';
import {logger} from './middlewares/logger.js';
const app = express();
app.use(logger);            // registration; not invocation immediately
app.use(express.json());   // built-in body parsing middleware
app.use('/tasks', taskRouter);
export default app;
```

## `app.use()` and order
```ts
app.use((req, res, next) => {console.log('A'); next();});
app.use((req, res, next) => {console.log('B'); next();});
app.get('/tasks', (req, res) => {console.log('C'); res.json([]);});
// GET /tasks logs A, B, C
```
The first matching route that sends and ends a response without forwarding prevents later normal handlers from running.

`app.use(logger)` passes the middleware function reference. `app.use(logger())` executes a *factory* immediately and is only valid if it returns middleware.

## Authentication middleware demo
```ts
import type {RequestHandler} from 'express';
const secret = process.env.DEMO_API_KEY;
if (!secret) throw new Error('DEMO_API_KEY is required');
export const auth: RequestHandler = (req, res, next) => {
  if (req.get('x-api-key') !== secret) {
    res.status(401).json({error: 'Unauthorized'});
    return;
  }
  next();
};
```
In `task.routes.ts`:
```ts
import {Router} from 'express';
import {auth} from '../middlewares/auth.js';
const taskRouter = Router();
taskRouter.use(auth); // affects all subsequent matching task routes
// ...register route handlers
```
This is a toy API key flow, NOT complete production authentication/authorization.

## Understanding `next()` and async work
```ts
app.use((req, res, next) => {
  console.log('A');
  next();
  console.log('B');
});
app.get('/', (_req, res) => {
  console.log('C');
  res.send('hello');
});
// synchronous output: A, C, B
```
`next()` is NOT an `await`. Don't measure full asynchronous request duration immediately after it. Use `res.once('finish', ...)` for completion logging.

## Errors and route skipping
- `next()` -> next matching normal middleware/handler.
- `next(error)` -> error-handling chain.
- `next('route')` -> skip remaining callbacks for current `app.METHOD` or `router.METHOD` route; look for subsequent matching routes.

Error middleware shape:
```ts
import type {ErrorRequestHandler} from 'express';
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(err);
  res.status(500).json({error: 'Internal server error'});
};
```
Register **after routes**. Express 5 forwards rejected returned Promises automatically.

## Common mistakes
- Middleware neither responds nor calls `next()` -> request hangs.
- Middleware responds then calls `next()` -> later middleware may try to send another response.
- Registering parser/auth/logger after the routes they were meant to affect.
- Assuming `next()` waits for asynchronous downstream handlers.
- Forgetting `return` after sending an early error response.

## Interview Q&A
**Q1. What is middleware?** A reusable function participating in Express request-response flow.

**Q2. What is `next()`?** Express-supplied callback to continue processing.

**Q3. App-level vs router-level?** App-wide registration vs registration scoped to a router's mount.

**Q4. What happens if middleware doesn't call `next()` or send?** Request stays pending until external termination/timeout.

**Q5. Difference between `next(error)` and `next('route')`?** Error flow vs route skipping.

**Q6. Why does order matter?** Express processes matching middleware in registration order.

## Practice
1. Write a global request logger and a router-level demo authorization guard.
2. Verify authorized/unauthorized requests and request logging.
3. Experiment with A/B/C console ordering with sync versus async route.
4. Add an error handler after the router.

**Further reading:** https://expressjs.com/en/guide/using-middleware.html

---

## Study checklist

- [ ] Explain the core concept without referring to notes.
- [ ] Run the ESM + TypeScript example yourself.
- [ ] Test one success case and one failure case.
- [ ] Explain the common mistakes in a mock interview.

**Official documentation:** https://expressjs.com/en/5x/api.html

**Conventions:** These examples use Express 5, TypeScript, ESM (`"type": "module"`), and `module: "NodeNext"`. Relative imports from TypeScript files use `.js` in their source so compiled ESM imports resolve in Node.js. The snippets are focused examples; route snippets assume `app` or `router` has already been created unless stated otherwise. External HTTP input must always be validated at runtime.
