/**
 * Vendor-facing message templates.
 *
 * Each function returns a plain string ready to be delivered via SMS or
 * another messaging channel.
 */

/**
 * Initial dispatch request sent to a vendor (or backup vendor).
 *
 * @param {object} params
 * @param {string} params.propertyName   - Name of the property.
 * @param {string} params.unit           - Unit identifier.
 * @param {string} params.tenantName     - Tenant's full name.
 * @param {string} params.tenantPhone    - Tenant's phone number.
 * @param {string} params.issueSummary   - Plain-English description of the issue.
 * @param {string} params.aiTriageSummary - AI triage notes.
 * @param {string} [params.photoLink]    - URL to photos (optional).
 * @returns {string}
 */
function dispatchRequest({
  propertyName,
  unit,
  tenantName,
  tenantPhone,
  issueSummary,
  aiTriageSummary,
  photoLink,
}) {
  const photoLine = photoLink ? `\nPhotos:\n${photoLink}` : '';
  return (
    'New Maintenance Dispatch Request\n\n' +
    `Property: ${propertyName}\n` +
    `Unit: ${unit}\n` +
    `Tenant: ${tenantName}\n` +
    `Phone: ${tenantPhone}\n\n` +
    `Issue:\n${issueSummary}\n\n` +
    `Notes:\n${aiTriageSummary}` +
    photoLine +
    '\n\nReply ACCEPT with ETA or DECLINE.\n' +
    'Example: ACCEPT 2:30 PM'
  );
}

/**
 * Message sent to a vendor that responded AFTER the system already rerouted
 * the dispatch to a backup vendor.
 *
 * @returns {string}
 */
function lateResponseStandBy() {
  return (
    'Thanks. This dispatch has already been rerouted. ' +
    'Please stand by unless management contacts you directly.'
  );
}

module.exports = {
  dispatchRequest,
  lateResponseStandBy,
};
