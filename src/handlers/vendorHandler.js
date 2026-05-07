/**
 * Vendor response handler.
 *
 * Parses inbound SMS replies from vendors and routes them to the correct
 * action (accept / decline).  All Airtable writes and outbound messages are
 * delegated to injected service functions so the logic is unit-testable.
 */

'use strict';

const { INCIDENT_STATUS, VENDOR_RESPONSE_STATUS } = require('../constants/statuses');
const vendorMessages = require('../messages/vendorMessages');
const managerMessages = require('../messages/managerMessages');
const tenantMessages = require('../messages/tenantMessages');

// ─── Intent classification ───────────────────────────────────────────────────

/**
 * Patterns that indicate the vendor is ACCEPTING the dispatch.
 * The vendor should reply "ACCEPT <ETA>", e.g. "ACCEPT 2:30 PM".
 */
const ACCEPT_PATTERN = /^\s*ACCEPT\b/i;

/**
 * Patterns that indicate the vendor is DECLINING the dispatch.
 */
const DECLINE_PATTERNS = [
  /^\s*decline\b/i,
  /\bcan'?t\s+take\s+it\b/i,
  /\bunavailable\b/i,
  /\bnot\s+tonight\b/i,
  /\bcan'?t\s+get\s+there\b/i,
];

/**
 * Classify a raw vendor SMS body.
 *
 * @param {string} text - Raw SMS body from the vendor.
 * @returns {{ intent: 'ACCEPT'|'DECLINE'|'UNKNOWN', eta?: string }}
 */
function classifyVendorReply(text) {
  if (!text || typeof text !== 'string') return { intent: 'UNKNOWN' };

  if (ACCEPT_PATTERN.test(text)) {
    // Extract optional ETA after the ACCEPT keyword.
    const etaMatch = text.match(/^\s*ACCEPT\s+(.*)/i);
    const eta = etaMatch ? etaMatch[1].trim() : '';
    return { intent: 'ACCEPT', eta };
  }

  if (DECLINE_PATTERNS.some((re) => re.test(text))) {
    return { intent: 'DECLINE' };
  }

  return { intent: 'UNKNOWN' };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

/**
 * Process an inbound vendor SMS for a given incident.
 *
 * @param {object} params
 * @param {object} params.incident     - Current incident record from Airtable.
 * @param {object} params.vendor       - Vendor record (id, name, phone).
 * @param {string} params.vendorReply  - Raw SMS body from the vendor.
 * @param {boolean} [params.alreadyRerouted=false]
 *   True if the system has already dispatched a backup vendor for this
 *   incident (i.e. this is a late / unsolicited response from the original).
 *
 * @param {object} services
 * @param {function} services.updateIncident  - (incidentId, fields) => Promise<void>
 * @param {function} services.sendVendorSms   - (phone, message)     => Promise<void>
 * @param {function} services.sendManagerSms  - (phone, message)     => Promise<void>
 * @param {function} services.sendTenantSms   - (phone, message)     => Promise<void>
 * @param {function} services.logAction       - (incidentId, note)   => Promise<void>
 *
 * @returns {Promise<{action: string, eta?: string}>}
 */
async function handleVendorReply(
  { incident, vendor, vendorReply, alreadyRerouted = false },
  services,
) {
  const { updateIncident, sendVendorSms, sendManagerSms, sendTenantSms, logAction } = services;
  const { intent, eta } = classifyVendorReply(vendorReply);

  // ── Late response after reroute ───────────────────────────────────────────
  if (alreadyRerouted) {
    const standByMsg = vendorMessages.lateResponseStandBy();
    await sendVendorSms(vendor.phone, standByMsg);

    const backupName = incident.backupVendorName || 'backup vendor';
    const note = managerMessages.vendorLateResponseNote({
      vendorName: vendor.name,
      backupVendorName: backupName,
    });
    await logAction(incident.id, note);
    await sendManagerSms(incident.managerPhone, note);

    return { action: 'LATE_RESPONSE' };
  }

  // ── Vendor accepted ───────────────────────────────────────────────────────
  if (intent === 'ACCEPT') {
    await updateIncident(incident.id, {
      Status: INCIDENT_STATUS.VENDOR_ACCEPTED,
      'Vendor Response Status': VENDOR_RESPONSE_STATUS.ACCEPTED,
    });

    const tenantMsg = tenantMessages.vendorAccepted(vendor.name, eta || 'soon');
    await sendTenantSms(incident.tenantPhone, tenantMsg);
    await logAction(
      incident.id,
      `Vendor ${vendor.name} accepted dispatch. ETA: ${eta || 'not provided'}.`,
    );

    return { action: 'ACCEPT', eta };
  }

  // ── Vendor declined ───────────────────────────────────────────────────────
  if (intent === 'DECLINE') {
    await updateIncident(incident.id, {
      Status: INCIDENT_STATUS.VENDOR_DECLINED,
      'Vendor Response Status': VENDOR_RESPONSE_STATUS.DECLINED,
    });

    // If a backup vendor is configured, use the shorter alert.
    let managerMsg;
    if (incident.backupVendorName) {
      managerMsg = managerMessages.vendorDeclinedBackupAvailable({
        vendorName: vendor.name,
        backupVendorName: incident.backupVendorName,
      });
    } else {
      managerMsg = managerMessages.vendorDeclinedAlert({
        vendorName: vendor.name,
        propertyName: incident.propertyName,
        unit: incident.unit,
        issueSummary: incident.issueSummary,
        severity: incident.severity,
      });
    }

    await sendManagerSms(incident.managerPhone, managerMsg);
    await logAction(incident.id, `Vendor ${vendor.name} declined the dispatch. Manager notified.`);

    return { action: 'DECLINE' };
  }

  // ── Unknown reply ─────────────────────────────────────────────────────────
  await logAction(incident.id, `Unrecognised vendor reply from ${vendor.name}: "${vendorReply}"`);
  return { action: 'UNKNOWN' };
}

module.exports = { classifyVendorReply, handleVendorReply };
