/**
 * Manager-facing message templates.
 *
 * Each function returns a plain string suitable for SMS delivery.
 */

/**
 * Main maintenance-review menu sent to the manager when a new maintenance
 * incident needs their decision.
 *
 * Option 1 is intentionally phrased as "Don't Escalate / Schedule Business Hours"
 * to prevent the tenant message from feeling dismissive.
 *
 * @param {object} params
 * @param {string} params.propertyName       - Name of the property.
 * @param {string} params.unit               - Unit identifier.
 * @param {string} params.tenantName         - Tenant's full name.
 * @param {string} params.issueSummary       - Brief description of the issue.
 * @param {string} params.photoStatus        - e.g. "3 photos attached" or "No photos".
 * @param {string} params.plainEnglishSummary - AI-generated plain-English summary.
 * @param {string} params.severity           - Suggested priority label.
 * @param {string[]} params.vendorOptions    - List of vendor names for options 2–N.
 * @returns {string}
 */
function maintenanceReviewMenu({
  propertyName,
  unit,
  tenantName,
  issueSummary,
  photoStatus,
  plainEnglishSummary,
  severity,
  vendorOptions = [],
}) {
  const vendorLines = vendorOptions
    .map((name, i) => `${i + 2}. Message ${name}`)
    .join('\n');

  const nextOption = vendorOptions.length + 2;

  return (
    'Maintenance Review Needed\n\n' +
    `Property: ${propertyName}\n` +
    `Unit: ${unit}\n` +
    `Tenant: ${tenantName}\n` +
    `Issue: ${issueSummary}\n` +
    `Photos: ${photoStatus}\n\n` +
    `Summary:\n${plainEnglishSummary}\n\n` +
    `Suggested priority: ${severity}\n\n` +
    'Reply with one:\n\n' +
    '1. Don\'t Escalate / Schedule Business Hours\n' +
    (vendorLines ? vendorLines + '\n' : '') +
    `${nextOption}. Create Work Order Only\n` +
    `${nextOption + 1}. Call Tenant\n` +
    `${nextOption + 2}. Call Me`
  );
}

/**
 * Alert sent to the manager when a vendor has not responded within the
 * required time window.
 *
 * @param {object} params
 * @param {string} params.vendorName     - Name of the unresponsive vendor.
 * @param {string} params.propertyName   - Name of the property.
 * @param {string} params.unit           - Unit identifier.
 * @param {string} params.issueSummary   - Brief description of the issue.
 * @param {string} params.severity       - Priority level.
 * @returns {string}
 */
function vendorNoResponseAlert({ vendorName, propertyName, unit, issueSummary, severity }) {
  return (
    'Vendor No Response\n\n' +
    `${vendorName} has not accepted the dispatch for ${propertyName}, Unit ${unit}, within the response window.\n\n` +
    `Issue: ${issueSummary}\n` +
    `Priority: ${severity}\n\n` +
    'Reply with one:\n\n' +
    '1. Message backup vendor\n' +
    '2. Message another vendor\n' +
    '3. Call tenant\n' +
    '4. Schedule for regular business hours\n' +
    '5. Call me\n' +
    '6. Close / hold'
  );
}

/**
 * Alert sent to the manager when a vendor has declined the dispatch.
 *
 * @param {object} params
 * @param {string} params.vendorName     - Name of the vendor that declined.
 * @param {string} params.propertyName   - Name of the property.
 * @param {string} params.unit           - Unit identifier.
 * @param {string} params.issueSummary   - Brief description of the issue.
 * @param {string} params.severity       - Priority level.
 * @returns {string}
 */
function vendorDeclinedAlert({ vendorName, propertyName, unit, issueSummary, severity }) {
  return (
    'Vendor Declined\n\n' +
    `${vendorName} declined the dispatch for ${propertyName}, Unit ${unit}.\n\n` +
    `Issue: ${issueSummary}\n` +
    `Priority: ${severity}\n\n` +
    'Reply with one:\n\n' +
    '1. Message backup vendor\n' +
    '2. Message another vendor\n' +
    '3. Call tenant\n' +
    '4. Schedule for regular business hours\n' +
    '5. Call me\n' +
    '6. Close / hold'
  );
}

/**
 * Shorter alert used when a backup vendor is already defined in the system.
 *
 * @param {object} params
 * @param {string} params.vendorName       - Name of the vendor that declined/timed out.
 * @param {string} params.backupVendorName - Name of the pre-configured backup vendor.
 * @returns {string}
 */
function vendorDeclinedBackupAvailable({ vendorName, backupVendorName }) {
  return (
    `${vendorName} declined this dispatch. Backup vendor is ${backupVendorName}.\n\n` +
    'Reply YES to message backup vendor, or reply with another instruction.'
  );
}

/**
 * Note appended to the incident log when the original vendor responds after
 * the system has already rerouted to a backup vendor.
 *
 * @param {object} params
 * @param {string} params.vendorName       - The late-responding vendor's name.
 * @param {string} params.backupVendorName - Name of the backup vendor already dispatched.
 * @returns {string}
 */
function vendorLateResponseNote({ vendorName, backupVendorName }) {
  return (
    `${vendorName} responded after timeout. Dispatch had already been rerouted to ${backupVendorName}.`
  );
}

/**
 * Confirmation prompt sent back to the manager when their instruction is ambiguous.
 *
 * @returns {string}
 */
function clarifyNoEscalation() {
  return (
    'Confirming: Should I mark this as no emergency dispatch and schedule it for regular business hours? ' +
    'Reply YES to confirm or NO to choose another action.'
  );
}

module.exports = {
  maintenanceReviewMenu,
  vendorNoResponseAlert,
  vendorDeclinedAlert,
  vendorDeclinedBackupAvailable,
  vendorLateResponseNote,
  clarifyNoEscalation,
};
