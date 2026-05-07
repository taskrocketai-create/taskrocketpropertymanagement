/**
 * Vendor timeout watcher.
 *
 * This module implements the "Timeout Watcher Scenario" described in the
 * escalation rules.  It should be called on a recurring schedule
 * (every 2–5 minutes) to detect dispatches where the vendor has not
 * responded within the required time window.
 *
 * All external I/O (Airtable queries, SMS sends) is injected so that the
 * core logic can be unit-tested without real network calls.
 */

'use strict';

const { INCIDENT_STATUS, VENDOR_RESPONSE_STATUS } = require('../constants/statuses');
const managerMessages = require('../messages/managerMessages');

/**
 * Run one pass of the vendor timeout watcher.
 *
 * Searches for incidents where:
 *   - Status = "Awaiting Vendor"
 *   - Vendor Response Status = "Awaiting Response"
 *   - Vendor Response Deadline is before now
 *
 * For each such incident the watcher:
 *   1. Updates Vendor Response Status → "No Response"
 *   2. Updates Status → "Vendor No Response"
 *   3. Sends the manager the no-response menu
 *   4. Logs the action
 *
 * @param {object} services
 * @param {function} services.findTimedOutIncidents
 *   () => Promise<object[]>  – returns array of incident records that have
 *   passed their vendor response deadline.
 * @param {function} services.updateIncident
 *   (incidentId, fields) => Promise<void>
 * @param {function} services.sendManagerSms
 *   (phone, message) => Promise<void>
 * @param {function} services.logAction
 *   (incidentId, note) => Promise<void>
 *
 * @returns {Promise<{ processed: number, incidentIds: string[] }>}
 *   Summary of how many incidents were processed.
 */
async function runTimeoutWatcher(services) {
  const { findTimedOutIncidents, updateIncident, sendManagerSms, logAction } = services;

  const timedOut = await findTimedOutIncidents();
  const processedIds = [];

  for (const incident of timedOut) {
    await updateIncident(incident.id, {
      Status: INCIDENT_STATUS.VENDOR_NO_RESPONSE,
      'Vendor Response Status': VENDOR_RESPONSE_STATUS.NO_RESPONSE,
    });

    const alertMsg = managerMessages.vendorNoResponseAlert({
      vendorName: incident.vendorName,
      propertyName: incident.propertyName,
      unit: incident.unit,
      issueSummary: incident.issueSummary,
      severity: incident.severity,
    });

    await sendManagerSms(incident.managerPhone, alertMsg);
    await logAction(
      incident.id,
      `Vendor ${incident.vendorName} did not respond within the required window. Manager notified.`,
    );

    processedIds.push(incident.id);
  }

  return { processed: processedIds.length, incidentIds: processedIds };
}

module.exports = { runTimeoutWatcher };
