'use strict';

/**
 * Structured JSON audit logger for ArmorIQ security events.
 *
 * All lines are written to stdout as single-line JSON objects so they can be
 * grepped independently from normal application logs.
 *
 * Two distinct event types are used:
 *   ARMORIQ_POLICY_BLOCK   — ArmorIQ verified but explicitly rejected the action
 *   ARMORIQ_PROXY_OUTAGE   — ArmorIQ proxy was unreachable or timed out (fail-closed)
 *
 * Grep examples:
 *   grep ARMORIQ_POLICY_BLOCK  <log-file>   # deliberate policy rejections
 *   grep ARMORIQ_PROXY_OUTAGE  <log-file>   # infrastructure outage blocks
 */

/**
 * Log a policy-level block (ArmorIQ rejected the intent).
 *
 * @param {object} opts
 * @param {string} opts.userId     - req.user._id.toString()
 * @param {string} opts.action     - The action name that was attempted
 * @param {string} opts.route      - e.g. "POST /api/loans"
 * @param {string} opts.reason     - Error message from the SDK (safe to log internally)
 * @param {object} [opts.inputs]   - Sanitised input snapshot (no secrets)
 */
function logPolicyBlock({ userId, action, route, reason, inputs = {} }) {
  const entry = {
    ts: new Date().toISOString(),
    event: 'ARMORIQ_POLICY_BLOCK',
    userId,
    action,
    route,
    reason,
    inputs,
  };
  // Single JSON line — greppable, parseable by log aggregators
  console.log(JSON.stringify(entry));
}

/**
 * Log a proxy outage block (ArmorIQ was unreachable — fail-closed).
 *
 * @param {object} opts
 * @param {string} opts.userId   - req.user._id.toString()
 * @param {string} opts.action   - The action name that was attempted
 * @param {string} opts.route    - e.g. "POST /api/orders"
 * @param {string} opts.reason   - Network error message
 */
function logProxyOutage({ userId, action, route, reason }) {
  const entry = {
    ts: new Date().toISOString(),
    event: 'ARMORIQ_PROXY_OUTAGE',
    userId,
    action,
    route,
    reason,
  };
  // stderr so outage events stand out from normal policy blocks on stdout
  console.error(JSON.stringify(entry));
}

module.exports = { logPolicyBlock, logProxyOutage };
