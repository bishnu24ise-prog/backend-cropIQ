# ArmorIQ SDK Integration

This document describes how the ArmorIQ SDK (`@armoriq/sdk`) is integrated into the
`backend-cropIQ` Express server to provide cryptographic intent verification for
high-risk financial and order management operations.

---

## Table of Contents

1. [Which routes are protected](#1-which-routes-are-protected)
2. [Architecture overview](#2-architecture-overview)
3. [How per-user scoping works](#3-how-per-user-scoping-works)
4. [Fail-closed behavior](#4-fail-closed-behavior)
5. [Log events & how to read them](#5-log-events--how-to-read-them)
6. [Rotating the API key](#6-rotating-the-api-key)
7. [Adding a new protected route](#7-adding-a-new-protected-route)
8. [Unprotected routes (intentional)](#8-unprotected-routes-intentional)

---

## 1. Which routes are protected

### Financial Dashboard & Debt Fund

| Route | Method | Action verified | Identity source |
|---|---|---|---|
| `/api/loans` | GET | `read_loans` | `req.user._id` |
| `/api/loans` | POST | `create_loan` | `req.user._id` |
| `/api/debt-fund/apply` | POST | `create_grant_application` | `req.user._id` |

### Order Management

| Route | Method | Action verified | Identity source |
|---|---|---|---|
| `/api/orders` | POST | `create_order` + `deduct_inventory` | `req.user._id` |
| `/api/orders/:id` | PATCH | `update_order_status` | `req.user._id` |

> **Note:** `POST /api/orders` and `PATCH /api/orders/:id` were previously public. Both now
> require a valid JWT Bearer token (the `protect` middleware runs before ArmorIQ).
> `GET /api/orders` (admin listing) remains public.
> **Transaction/Rollback Note:** The `POST /api/orders` endpoint executes order creation and inventory deduction as separate operations. To prevent orphan records in local development environments (which use standalone MongoDB instances and do not support `session.withTransaction()`), it uses a manual application-level rollback: the order is created first, and if inventory deduction fails, the created order is explicitly deleted. While this introduces a tiny crash window compared to true atomic transactions, it ensures local development works smoothly without requiring a local Replica Set. Production deployments using MongoDB Atlas (which provides Replica Sets by default) could be upgraded to use true atomic transactions in the future.

---

## 2. Architecture overview

```
Request
  │
  ▼
protect middleware          ← validates JWT, sets req.user
  │
  ▼
controller function
  │
  ├─ constructs plan object  ← { goal, steps: [{ action, inputs }] }
  │
  ▼
withArmorIQ()               ← src/middleware/armoriqMiddleware.js
  │
  ├─ getClientForUser(userId)              ← per-user scoped ArmorIQClient
  ├─ client.capturePlan(model, prompt, plan)
  ├─ client.getIntentToken(planCapture)    → token
  ├─ client.invoke('cropiq-backend', action, token, inputs)
  │
  ├─ [if approved]  → run DB/business logic
  ├─ [if rejected]  → 403 + ARMORIQ_POLICY_BLOCK audit log
  └─ [if unreachable] → 503 + ARMORIQ_PROXY_OUTAGE audit log
```

**Files introduced:**

| File | Purpose |
|---|---|
| `src/config/armoriq.js` | `getClientForUser(userId)` factory — creates per-request client |
| `src/middleware/armoriqMiddleware.js` | `withArmorIQ()` wrapper that implements the plan→token→invoke flow |
| `src/utils/auditLog.js` | Structured JSON audit logger (`logPolicyBlock`, `logProxyOutage`) |

---

## 3. How per-user scoping works

The SDK uses a **one-key, per-request-userId** model.

- The `ARMORIQ_API_KEY` is a single org-level key stored in `.env` — never in code.
- For every request, `getClientForUser(userId)` creates a **fresh** `ArmorIQClient`
  instance with `userId` set to `req.user._id.toString()`.
- This scopes all audit trails, policy evaluations, and intent tokens to that specific user.
- A token issued for `userId=X` **cannot** be reused for `userId=Y`.
- The `userId` is always derived from `req.user` (set by the `protect` JWT middleware),
  never from the request body or query params that a client could spoof.

```js
// src/config/armoriq.js
function getClientForUser(userId) {
  return new ArmorIQClient({
    apiKey: process.env.ARMORIQ_API_KEY,
    userId: userId,           // ← cryptographically binds token to this user
    agentId: 'cropiq-backend',
  });
}
```

---

## 4. Fail-closed behavior

The integration is **strictly fail-closed** for all protected routes.

| Scenario | HTTP response | Log event | DB action |
|---|---|---|---|
| ArmorIQ approves | Proceeds normally | — | ✅ Runs |
| ArmorIQ rejects (policy) | `403 Forbidden` | `ARMORIQ_POLICY_BLOCK` (stdout) | ❌ Blocked |
| ArmorIQ proxy unreachable/timeout | `503 Service Unavailable` | `ARMORIQ_PROXY_OUTAGE` (stderr) | ❌ Blocked |
| ARMORIQ_API_KEY missing | `503 Service Unavailable` | `ARMORIQ_PROXY_OUTAGE` (stderr) | ❌ Blocked |

The 403 and 503 response bodies contain only a generic user-facing message.
**Internal policy details and error messages are never exposed to the client.**

---

## 5. Log events & how to read them

All audit events are single-line JSON objects. Grep them by event type:

```bash
# All policy-level blocks (deliberate rejections by ArmorIQ)
grep ARMORIQ_POLICY_BLOCK <your-log-file>

# All proxy outage blocks (infrastructure failures)
grep ARMORIQ_PROXY_OUTAGE <your-log-file>
```

### `ARMORIQ_POLICY_BLOCK` (stdout)
```json
{
  "ts": "2025-01-15T10:23:45.123Z",
  "event": "ARMORIQ_POLICY_BLOCK",
  "userId": "6789abc...",
  "action": "create_loan",
  "route": "POST /api/loans",
  "reason": "Intent mismatch: declared action not found in signed plan",
  "inputs": { "userId": "6789abc...", "amount": 50000, "lender": "Bank X" }
}
```

### `ARMORIQ_PROXY_OUTAGE` (stderr)
```json
{
  "ts": "2025-01-15T10:23:45.123Z",
  "event": "ARMORIQ_PROXY_OUTAGE",
  "userId": "6789abc...",
  "action": "create_order",
  "route": "POST /api/orders",
  "reason": "connect ECONNREFUSED 52.x.x.x:443"
}
```

---

## 6. Rotating the API key

1. Log in to [platform.armoriq.ai](https://platform.armoriq.ai) → your organization → API Keys.
2. Generate a new key with the name `cropiq-backend-dev` (or a new name for the rotation).
3. **SSH into your Render service** (or use the Render dashboard → Environment Variables).
4. Update `ARMORIQ_API_KEY` to the new value.
5. Trigger a redeploy (Render auto-restarts on env var changes, or deploy manually).
6. Verify the old key is revoked in the ArmorIQ platform dashboard.

> **Never** paste the key into `.env.example`, chat, commit messages, or log output.
> The variable name in `.env` must be exactly `ARMORIQ_API_KEY`.

---

## 7. Adding a new protected route

Follow this checklist to protect a new route using the same pattern:

### Step 1 — Ensure the route is authenticated

Add `protect` middleware to the route in `src/routes/<yourRoute>.js`:
```js
router.post('/sensitive-action', protect, yourController.action);
```

### Step 2 — Construct a plan object in the controller

```js
const { withArmorIQ } = require('../middleware/armoriqMiddleware');

exports.yourAction = async (req, res) => {
  const userId = req.user._id.toString(); // Always from req.user, never req.body

  const plan = {
    goal: 'Human-readable description of what this action achieves',
    steps: [
      {
        action: 'your_action_name',   // snake_case, matches what you log
        tool: 'mongodb',
        mcp: 'cropiq-backend',
        inputs: {
          userId,
          // include only the inputs that describe the action, no secrets
        },
      },
    ],
  };

  await withArmorIQ(
    { userId, plan, action: 'your_action_name', route: 'POST /api/your-route', res },
    async () => {
      // Your existing DB logic here — only runs if ArmorIQ approves
      try {
        // ...
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
};
```

### Step 3 — Test the fail-closed path

Before deploying, verify:
- With a valid token: action executes normally.
- With `ARMORIQ_API_KEY` unset: route returns 503, no DB write.
- No internal error details appear in the `res.json()` body.

---

## 8. Unprotected routes (intentional)

The following routes were explicitly left **outside** the ArmorIQ scope as agreed:

| Route | Reason |
|---|---|
| `GET /api/debt-fund/stats` | Public read-only aggregate, no user data |
| `GET /api/orders` | Public admin/demo listing |
| `GET /api/orders/farmer` | Read-only, lower risk than writes |
| All `/api/crops/*` | Crop diagnosis — AI read, no financial write |
| All `/api/ai/*` | Chat/Q&A — AI inference, no financial write |
| All `/api/weather/*` | Weather data — external API read only |
| All `/api/market/*` | Market forecast — read only |
| All `/api/community/*` | Forum posts — low risk |
| All `/api/analytics/*` | Analytics read |
| All `/api/schemes/*` | Government scheme lookup |

To protect any of these in the future, follow the steps in [Section 7](#7-adding-a-new-protected-route).
