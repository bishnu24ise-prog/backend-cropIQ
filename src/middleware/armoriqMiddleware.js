'use strict';

/**
 * ArmorIQ intent verification middleware helper for CropIQ backend.
 *
 * Usage in a controller:
 *
 *   const { withArmorIQ } = require('../middleware/armoriqMiddleware');
 *
 *   exports.addLoan = async (req, res) => {
 *     const userId = req.user._id.toString();
 *     const plan = {
 *       goal: 'Add new loan record for farmer',
 *       steps: [{ action: 'create_loan', tool: 'mongodb', mcp: 'cropiq-backend',
 *                 inputs: { userId, amount: req.body.amount, lender: req.body.lender } }],
 *     };
 *     await withArmorIQ({ userId, plan, action: 'create_loan', route: 'POST /api/loans', res }, async () => {
 *       // your existing DB logic here — only runs if ArmorIQ approves
 *     });
 *   };
 *
 * Fail-closed guarantee:
 *   - Policy rejection  → 403, ARMORIQ_POLICY_BLOCK audit log
 *   - Proxy unreachable → 503, ARMORIQ_PROXY_OUTAGE audit log
 *   - Either case: the DB action is NEVER executed on failure
 */

const { getClientForUser } = require('../config/armoriq');
const { logPolicyBlock, logProxyOutage } = require('../utils/auditLog');
const {
  ArmorIQException,
  InvalidTokenException,
  IntentMismatchException,
  MCPInvocationException,
} = require('@armoriq/sdk');

/**
 * Wraps an async action with ArmorIQ plan capture + intent verification.
 *
 * @param {object}   opts
 * @param {string}   opts.userId   - Authenticated user ID (req.user._id.toString())
 * @param {object}   opts.plan     - ArmorIQ plan: { goal: string, steps: Array }
 * @param {string}   opts.action   - Action name matching the step (for logging)
 * @param {string}   opts.route    - Route string for audit logs, e.g. "POST /api/loans"
 * @param {object}   opts.res      - Express response object (for sending error responses)
 * @param {Function} fn            - Async function containing the DB/business logic
 *
 * @returns {Promise<void>}
 */
async function withArmorIQ({ userId, plan, action, route, res }, fn) {
  let client;
  try {
    client = getClientForUser(userId);
  } catch (initErr) {
    // Client construction failed (e.g. ARMORIQ_API_KEY missing) — treat as outage
    logProxyOutage({
      userId,
      action,
      route,
      reason: `ArmorIQ client init failed: ${initErr.message}`,
    });
    return res.status(503).json({
      error: 'Security verification service is unavailable. Please try again later.',
    });
  }

  let token;
  try {
    // Step 1: Capture the plan and obtain a signed intent token
    const planCapture = client.capturePlan(
      'cropiq-express-backend', // model/agent identifier
      `CropIQ API: ${route}`,   // human-readable prompt context
      plan
    );
    const tokenResponse = await client.getIntentToken(planCapture);
    token = tokenResponse?.token ?? tokenResponse; // handle object or raw string

    // Step 2: Invoke through ArmorIQ — action is verified against the declared plan
    await client.invoke('cropiq-backend', action, token, plan.steps[0]?.inputs ?? {});
  } catch (err) {
    // ── Network/timeout errors → PROXY_OUTAGE (fail-closed) ────────────────
    const isNetworkError =
      err?.constructor?.name === 'NetworkError' ||
      err?.constructor?.name === 'ConnectionError' ||
      err?.constructor?.name === 'TimeoutError' ||
      err?.code === 'ECONNREFUSED' ||
      err?.code === 'ETIMEDOUT' ||
      err?.code === 'ENOTFOUND' ||
      (err instanceof Error && /network|timeout|ECONNR|ETIMEDOUT|fetch|ENOTFOUND/i.test(err.message));

    if (isNetworkError) {
      logProxyOutage({ userId, action, route, reason: err.message });
      return res.status(503).json({
        error: 'Security verification service is unavailable. Please try again later.',
      });
    }

    // ── Policy / token errors → POLICY_BLOCK (403) ──────────────────────────
    const isPolicyBlock =
      err instanceof IntentMismatchException ||
      err instanceof InvalidTokenException ||
      err?.constructor?.name === 'IntentMismatchException' ||
      err?.constructor?.name === 'InvalidTokenException' ||
      err?.constructor?.name === 'TokenExpiredException' ||
      err?.constructor?.name === 'VerificationError' ||
      err?.constructor?.name === 'TokenInvalidError' ||
      err?.constructor?.name === 'TokenError';

    if (isPolicyBlock || err instanceof ArmorIQException) {
      logPolicyBlock({ userId, action, route, reason: err.message });
      // Return generic 403 — do NOT expose internal policy details to the client
      return res.status(403).json({
        error: 'This action was not permitted. Contact support if you believe this is an error.',
      });
    }

    // ── Unknown ArmorIQ errors → treat as outage (fail-closed) ─────────────
    logProxyOutage({ userId, action, route, reason: `Unexpected ArmorIQ error: ${err.message}` });
    return res.status(503).json({
      error: 'Security verification service is unavailable. Please try again later.',
    });
  }

  // ── ArmorIQ approved — execute the actual business logic ──────────────────
  await fn();
}

module.exports = { withArmorIQ };
