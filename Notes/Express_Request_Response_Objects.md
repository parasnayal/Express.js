# T014 — Express Request (`req`) and Response (`res`) Objects

## Learning objectives
Distinguish incoming HTTP information (`req`) from outgoing response construction (`res`), understand headers, status methods, serialization, and response lifecycle.

## Mental model
HTTP request -> Express handler (`req`, `res`) -> HTTP response.

- **`req`** extends Node's `IncomingMessage` with Express conveniences.
- **`res`** extends Node's `ServerResponse` with convenience methods.
- `req` and `res` are **per-request** objects.

## `req`: essential properties
| Property / method | Meaning |
|---|---|
| `req.method` | Incoming HTTP method |
| `req.path` | Current URL path |
| `req.originalUrl` | Original URL including query (avoid logging secrets) |
| `req.params` | Named route parameters; values normally strings |
| `req.query` | Parsed query string; untrusted |
| `req.body` | Parsed request body if middleware supported it |
| `req.get('Authorization')` | Request header lookup, case-insensitive |
| `req.ip` | Client IP as Express understands it; proxy configuration-sensitive |
| `req.baseUrl` | Matched mount path of router |

```ts
import express from 'express';
const app = express();
app.use(express.json());
app.get('/tasks/:id', (req, res) => {
  const id = req.params.id;      // e.g. '7', not 7
  const include = req.query.include; // may be 'true'
  const accept = req.get('Accept');
  res.json({id, include, accept});
});
```

## `res`: essential methods
| Method | Meaning |
|---|---|
| `res.status(201)` | Sets status; DOES NOT send |
| `res.json(data)` | JSON serialize + Content-Type + send/end |
| `res.send(data)` | Sends supported data (can also serialize objects) |
| `res.end()` | Ends response, commonly with no body |
| `res.set(name, value)` | Sets response header |
| `res.redirect(url)` | Sends redirect |
| `res.download(path)` | Sends file as attachment |
| `res.headersSent` | Have response headers been sent? |
| `res.locals` | Per-response storage for sharing data among handlers |

```ts
app.post('/tasks', (req, res) => {
  const title = req.body?.title;
  if (typeof title !== 'string' || !title.trim()) {
    res.status(400).json({error: 'title required'});
    return;
  }
  res.set('Cache-Control', 'no-store');
  res.status(201).json({id: 1, title: title.trim()});
});
```

### JSON serialization: what it means
```ts
const task = {id: 1, title: 'Express'};
// Express res.json(task) conceptually serializes as:
JSON.stringify(task); // '{"id":1,"title":"Express"}'
```
`res.json()` sends JSON with a JSON Content-Type. In a browser, `fetch(...).then(r => r.json())` does the **opposite**: parses received JSON into a JS value.

### Why `res.status().json()` chains
`res.status()` returns `res`, allowing `.json()` to be called on that same object.

### Important: responding is not the same as returning from the function
```ts
app.get('/demo', (req, res) => {
  if (!req.query.id) {
    res.status(400).json({error: 'id required'});
    return; // prevents execution continuing
  }
  res.json({ok: true});
});
```
`res.json()` ends the HTTP response, but the JavaScript handler continues unless you `return` or otherwise stop it. Writing again can produce `ERR_HTTP_HEADERS_SENT`.

## Cache-Control and HTTP cache refresher
- HTTP caches store HTTP responses for later reuse; browsers, proxies, CDNs may cache.
- `Cache-Control: no-store`: HTTP caches must not store response.
- `Cache-Control: no-cache`: may store but must revalidate before reuse.
- `Cache-Control: private, max-age=60`: private caches may reuse while fresh for 60 seconds subject to other conditions.
- React Query / TanStack Query cache is application state and NOT controlled automatically by HTTP Cache-Control.

## TypeScript request/response generics
```ts
import type {Request, Response} from 'express';
type Params = {id: string};
type Json = {id: number};
function handler(req: Request<Params>, res: Response<Json>) {
  const id = Number(req.params.id); // still validate at runtime!
  res.json({id});
}
```

## `res.locals` refresher
`res.locals.requestId = id` stores server-side data for middleware/handlers on **this request only**, not globally. It is not sent to clients unless explicitly put in a header or response body.

## Common pitfalls
- Trusting TypeScript annotations as request validation.
- Assuming `res.status()` sends the response.
- Sending body with 204 (204 must have no representation body).
- Logging authorization tokens or sensitive query strings.
- Assuming `res.json()` stops further JS execution.
- Treating `req.ip` as trusted without understanding reverse proxies and `trust proxy`.

## Interview Q&A
**Q1. `req` vs `res`?** Incoming message vs outgoing response.

**Q2. `res.json()` vs `response.json()`?** Express serializes/sends; Fetch parses received JSON.

**Q3. `res.json()` vs `res.send()`?** `json()` always expresses JSON; `send()` accepts varied body types, including objects.

**Q4. Does `res.status(200)` end the request?** No.

**Q5. What is `res.headersSent`?** Boolean indicating response headers were sent.

**Q6. What is `res.locals`?** Request-scoped shared context, not automatically part of response.

## Practice
1. Add `GET /tasks/:id/details?includeMetadata=true` with validation.
2. Include `Cache-Control: no-store` on a private response.
3. Read `Accept` from incoming headers and include `X-Request-ID` in outgoing headers.
4. Test valid, missing, and invalid inputs and observe status/headers/body separately.

**Further reading:** https://expressjs.com/en/5x/api/request and https://expressjs.com/en/5x/api/response

---

## Study checklist

- [ ] Explain the core concept without referring to notes.
- [ ] Run the ESM + TypeScript example yourself.
- [ ] Test one success case and one failure case.
- [ ] Explain the common mistakes in a mock interview.

**Official documentation:** https://expressjs.com/en/5x/api.html

**Conventions:** These examples use Express 5, TypeScript, ESM (`"type": "module"`), and `module: "NodeNext"`. Relative imports from TypeScript files use `.js` in their source so compiled ESM imports resolve in Node.js. The snippets are focused examples; route snippets assume `app` or `router` has already been created unless stated otherwise. External HTTP input must always be validated at runtime.
