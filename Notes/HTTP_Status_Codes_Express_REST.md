# T017 — HTTP Status Codes for Express REST APIs

## Learning objectives
Select response codes based on actual outcomes rather than memorizing them in isolation; distinguish client input failures from server failures.

## Five families
| Family | Meaning |
|---|---|
| 1xx | Informational |
| 2xx | Success |
| 3xx | Redirect/caching-related outcomes |
| 4xx | Request cannot be fulfilled as sent |
| 5xx | Server failed to fulfill request |

## Most important codes
| Code | Name | Example |
|---|---|---|
| 200 | OK | GET tasks returns data; DELETE with message body |
| 201 | Created | POST creates a task |
| 202 | Accepted | Async work queued, not yet completed |
| 204 | No Content | DELETE successful without body |
| 304 | Not Modified | Conditional GET permits cached response reuse; no representation body |
| 400 | Bad Request | Invalid ID format, malformed JSON |
| 401 | Unauthorized | Missing or invalid authentication credentials |
| 403 | Forbidden | Authenticated but lacks permission |
| 404 | Not Found | Resource/route not found |
| 405 | Method Not Allowed | Endpoint doesn't allow HTTP method; include Allow header when applicable |
| 409 | Conflict | Conflict with resource state, such as uniqueness constraint |
| 413 | Content Too Large | Request body exceeds limit |
| 415 | Unsupported Media Type | Unsupported request content type |
| 422 | Unprocessable Content | Valid syntax but semantically invalid instructions (policy dependent) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected application failure |
| 502 | Bad Gateway | Proxy/gateway gets invalid upstream response |
| 503 | Service Unavailable | Service temporarily unable to handle request |
| 504 | Gateway Timeout | Gateway timed out waiting upstream |

## REST examples
```ts
router.get('/:id', (req, res) => {
  const task = findTask(req.params.id); // illustrative
  if (!task) {
    res.status(404).json({message: 'Task not found'});
    return;
  }
  res.status(200).json({data: task});
});
router.post('/', (req, res) => {
  const created = {id: 5, title: 'Study'};
  res.status(201).location(`/tasks/${created.id}`).json({data: created});
});
router.delete('/:id', (req, res) => {
  // after successful deletion
  res.status(204).end();
});
```

## Common comparisons
### 200 vs 201 vs 204
- 200 is general success, usually with a response body.
- 201 signals a new resource and may include `Location`.
- 204 means success with **no response body**; do not attempt `.json()` to send a body.

### 400 vs 422
Both used for invalid input. A common convention: 400 for malformed/bad-format requests and 422 for syntactically valid but semantically invalid content. Decide and document consistent API policy.

### 401 vs 403
401: client lacks valid authentication. 403: valid identity but operation forbidden. When using HTTP authentication, 401 normally accompanies an appropriate `WWW-Authenticate` challenge.

### 404 vs 400
`GET /tasks/abc`: could be 400 under an explicit integer-only route contract. `GET /tasks/999`: 404 for well-formed but nonexistent resource. Some applications intentionally return 404 for invalid resource paths as a routing choice.

### 500 vs 503
500 is unexpected internal failure. 503 is temporary unavailability (often suitable with `Retry-After`). Do not turn every error into 500.

## Caching detail
304 is a conditional caching response, not a normal update-success response. It has no representation body. HTTP caching is different from React Query application cache.

## Common pitfalls
- Responding `200` for failures merely because JSON contains `{success: false}`.
- Using `401` for a validly authenticated user without permission (normally 403).
- Sending JSON body with `204`.
- Returning 500 for invalid client JSON.
- Returning `201` before resource creation if request is only queued (consider 202).

## Interview Q&A
**Q1. When use 201?** After resource creation succeeds; optionally include Location to new resource.

**Q2. Can 204 include JSON?** No.

**Q3. 401 vs 403?** No valid authentication vs not permitted.

**Q4. What does 409 mean?** A request conflicts with the resource's current state or a resource constraint.

**Q5. When choose 202?** Request accepted, processing not yet complete.

**Q6. Why is 304 special?** Conditional cache revalidation; no representation body.

## Practice
1. Modify your Task API to return 200, 201, 204, 400, 404 and 500 accurately.
2. Compare POST creation (`201`) with asynchronous import (`202`).
3. Decide and document whether your API uses 400 or 422 for valid-JSON invalid fields.
4. Test response status in curl with `curl -i` rather than inspecting body only.

**Further reading:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status

---

## Study checklist

- [ ] Explain the core concept without referring to notes.
- [ ] Run the ESM + TypeScript example yourself.
- [ ] Test one success case and one failure case.
- [ ] Explain the common mistakes in a mock interview.

**Official documentation:** https://expressjs.com/en/5x/api.html

**Conventions:** These examples use Express 5, TypeScript, ESM (`"type": "module"`), and `module: "NodeNext"`. Relative imports from TypeScript files use `.js` in their source so compiled ESM imports resolve in Node.js. The snippets are focused examples; route snippets assume `app` or `router` has already been created unless stated otherwise. External HTTP input must always be validated at runtime.
