/**
 * Manager command handler.
 *
 * Parses inbound SMS replies from property managers and maps them to the
 * correct system action.  All Airtable writes and message sends are delegated
 * to injected service objects so the pure logic can be unit-tested without
 * real network calls.
 */

'use strict';

const { INCIDENT_STATUS } = require('../constants/statuses');
const tenantMessages = require('../messages/tenantMessages');
const managerMessages = require('../messages/managerMessages');

// ─── Intent detection ────────────────────────────────────────────────────────

/**
 * Patterns that unambiguously mean "do not escalate; schedule for business hours".
 */
const NO_ESCALATE_PATTERNS = [
  /don'?t\s+escalat/i,
  /no\s+emergency/i,
  /hold\s+until\s+morning/i,
  /regular\s+business\s+hours/i,
  /work\s+order\s+tomorrow/i,
  /schedule\s+regular/i,
  /schedule\s+during\s+business\s+hours/i,
];

/**
 * Patterns that are ambiguous and require confirmation.
 * e.g. "let's wait", "wait", "later", "hold on"
 */
const AMBIGUOUS_WAIT_PATTERNS = [/\bwait\b/i, /\blater\b/i, /\bhold\s+on\b/i, /\blet'?s\s+wait\b/i];

/**
 * Patterns for manager confirming a previous ambiguous prompt.
 */
const CONFIRM_YES_PATTERN = /^\s*yes\s*$/i;
const CONFIRM_NO_PATTERN = /^\s*no\s*$/i;

// ─── Public helpers ──────────────────────────────────────────────────────────

/**
 * Classify a raw manager reply text.
 *
 * @param {string} text - The raw SMS body from the manager.
 * @returns {'NO_ESCALATE'|'AMBIGUOUS'|'CONFIRM_YES'|'CONFIRM_NO'|'UNKNOWN'} intent
 */
function classifyManagerReply(text) {
  if (!text || typeof text !== 'string') return 'UNKNOWN';

  if (NO_ESCALATE_PATTERNS.some((re) => re.test(text))) return 'NO_ESCALATE';
  if (CONFIRM_YES_PATTERN.test(text)) return 'CONFIRM_YES';
  if (CONFIRM_NO_PATTERN.test(text)) return 'CONFIRM_NO';
  if (AMBIGUOUS_WAIT_PATTERNS.some((re) => re.test(text))) return 'AMBIGUOUS';

  return 'UNKNOWN';
}

// ─── Handler ─────────────────────────────────────────────────────────────────

/**
 * Process an inbound manager SMS for a given incident.
 *
 * @param {object} params
 * @param {object} params.incident         - Current incident record from Airtable.
 * @param {string} params.managerReply     - Raw SMS body from the manager.
 * @param {boolean} [params.awaitingConfirmation=false]
 *   True when the previous manager message was an ambiguous instruction and we
 *   already sent a YES/NO confirmation prompt.
 *
 * @param {object} services
 * @param {function} services.updateIncident  - (incidentId, fields) => Promise<void>
 * @param {function} services.sendManagerSms  - (phone, message)     => Promise<void>
 * @param {function} services.sendTenantSms   - (phone, message)     => Promise<void>
 * @param {function} services.logAction       - (incidentId, note)   => Promise<void>
 *
 * @returns {Promise<{action: string, message?: string}>}
 */
async function handleManagerReply(
  { incident, managerReply, awaitingConfirmation = false },
  services,
) {
  const { updateIncident, sendManagerSms, sendTenantSms, logAction } = services;
  const intent = classifyManagerReply(managerReply);

  // ── Awaiting YES/NO confirmation ──────────────────────────────────────────
  if (awaitingConfirmation) {
    if (intent === 'CONFIRM_YES') {
      return _applyNoEscalate({ incident }, services);
    }
    if (intent === 'CONFIRM_NO') {
      await logAction(incident.id, 'Manager replied NO to confirmation. Awaiting new instruction.');
      return { action: 'AWAITING_NEW_INSTRUCTION' };
    }
  }

  // ── Clear "don't escalate" instruction ───────────────────────────────────
  if (intent === 'NO_ESCALATE') {
    return _applyNoEscalate({ incident }, services);
  }

  // ── Ambiguous instruction ─────────────────────────────────────────────────
  if (intent === 'AMBIGUOUS') {
    const confirmMsg = managerMessages.clarifyNoEscalation();
    await sendManagerSms(incident.managerPhone, confirmMsg);
    await logAction(incident.id, `Ambiguous manager reply. Sent confirmation prompt: "${confirmMsg}"`);
    return { action: 'AWAITING_CONFIRMATION', message: confirmMsg };
  }

  // ── Unknown instruction ───────────────────────────────────────────────────
  await logAction(incident.id, `Unrecognised manager reply: "${managerReply}"`);
  return { action: 'UNKNOWN', message: managerReply };
}

/**
 * Apply the "no escalate / schedule for business hours" action to an incident.
 *
 * @private
 */
async function _applyNoEscalate({ incident }, services) {
  const { updateIncident, sendTenantSms, logAction } = services;

  await updateIncident(incident.id, {
    Status: INCIDENT_STATUS.SCHEDULED_BUSINESS_HOURS,
    'Work Order Needed': true,
    'Emergency Dispatch': false,
    'Scheduled For Business Hours': true,
    'Business Hours Follow-Up Needed': true,
    'Manager Final Action': 'Don\'t Escalate / Schedule Business Hours',
  });

  const tenantMsg = tenantMessages.noEmergencyDispatch();
  await sendTenantSms(incident.tenantPhone, tenantMsg);
  await logAction(incident.id, 'Manager: No escalate. Scheduled for business hours. Tenant notified.');

  return { action: 'NO_ESCALATE', message: tenantMsg };
}

module.exports = { classifyManagerReply, handleManagerReply };
