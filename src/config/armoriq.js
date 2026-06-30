'use strict';

/**
 * ArmorIQ SDK singleton client.
 *
 * Initialised once per process. The API key is read exclusively from
 * process.env.ARMORIQ_API_KEY — it is never accepted from request bodies,
 * query params, or any other user-controlled source.
 *
 * Per-request user scoping is done in armoriqMiddleware.js by creating a
 * fresh ArmorIQClient instance with the authenticated userId from req.user.
 */

const { ArmorIQClient } = require('@armoriq/sdk');

if (!process.env.ARMORIQ_API_KEY) {
  // Log at startup so the issue is visible in Render logs immediately.
  console.warn(
    '[ArmorIQ] WARNING: ARMORIQ_API_KEY is not set. ' +
    'All ArmorIQ-protected routes will fail closed (503) until the key is configured.'
  );
}

/**
 * Returns a per-user ArmorIQ client scoped to the given userId.
 * A new client instance is created for every request so that user identity
 * is never shared between concurrent requests.
 *
 * @param {string} userId - req.user._id.toString() from the protect middleware.
 * @returns {ArmorIQClient}
 */
function getClientForUser(userId) {
  return new ArmorIQClient({
    apiKey: process.env.ARMORIQ_API_KEY,
    userId: userId,
    agentId: 'cropiq-backend',
  });
}

module.exports = { getClientForUser };
