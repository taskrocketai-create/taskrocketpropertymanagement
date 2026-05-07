/**
 * Tenant-facing message templates.
 *
 * Each function returns a plain string that can be sent via SMS or any
 * messaging channel.  Callers are responsible for providing all required
 * template variables.
 */

/**
 * Default "don't escalate" message.
 * Used when management reviews the issue and decides NOT to send emergency
 * dispatch, but still wants the tenant to feel heard and documented.
 *
 * @returns {string}
 */
function noEmergencyDispatch() {
  return (
    'Thanks for working through that with us. Management reviewed the information and is not sending emergency dispatch right now.\n\n' +
    'This has been documented and will be scheduled for regular business hours so it does not get missed. ' +
    'If anything changes, gets worse, or becomes unsafe, reply back here right away.'
  );
}

/**
 * Slightly more personal variant of the no-emergency-dispatch message.
 *
 * @returns {string}
 */
function noEmergencyDispatchPersonal() {
  return (
    'Thanks for working through that with us. Based on the information provided, management is not sending emergency dispatch right now.\n\n' +
    'This is still being kept on record and will be scheduled for regular business hours so it does not get missed. ' +
    'If anything changes, gets worse, or feels unsafe, reply back here right away.'
  );
}

/**
 * Short variant of the no-emergency-dispatch message.
 *
 * @returns {string}
 */
function noEmergencyDispatchShort() {
  return (
    'Thanks. Management reviewed this and is not sending emergency dispatch right now. ' +
    'This will still be kept on record and scheduled for regular business hours. ' +
    'If anything changes or gets worse, reply back here.'
  );
}

/**
 * Message for maintenance issues that don't need emergency dispatch.
 *
 * @returns {string}
 */
function maintenanceNotEmergency() {
  return (
    'Thanks for the information. This does not appear to need emergency dispatch right now, ' +
    'but it will still be logged and scheduled for regular maintenance review during business hours.\n\n' +
    'If the issue gets worse, causes active damage, or becomes unsafe, reply back here right away.'
  );
}

/**
 * Message for complaints or office issues.
 *
 * @returns {string}
 */
function complaintOrOfficeIssue() {
  return (
    'Thanks. This has been documented and will be sent to the office for review during regular business hours. ' +
    'If there is immediate danger or a safety concern, please call 911 and reply back here so management can be notified.'
  );
}

/**
 * Message sent when management schedules the issue for business hours.
 *
 * @returns {string}
 */
function scheduledForBusinessHours() {
  return (
    'Thanks for working through that with us. This has been documented and will be scheduled for regular business hours. ' +
    'If anything changes, gets worse, or becomes unsafe, reply back here right away.'
  );
}

/**
 * Message sent while the system is still routing to a vendor
 * (e.g., waiting for vendor acceptance after timeout triggered re-routing).
 *
 * @returns {string}
 */
function stillRoutingVendor() {
  return (
    "We're still working on getting this routed. Your message is documented, and management has been notified. " +
    'If anything changes or becomes unsafe, reply back here right away.'
  );
}

/**
 * Message sent when a vendor has accepted the dispatch and provided an ETA.
 *
 * @param {string} vendorName - Display name of the vendor.
 * @param {string} eta        - Human-readable ETA string (e.g. "2:30 PM").
 * @returns {string}
 */
function vendorAccepted(vendorName, eta) {
  return (
    'Thanks for working through that with us. Maintenance has been notified. ' +
    `${vendorName} is expected around ${eta}. ` +
    'Please keep the area as safe as you can until they arrive.'
  );
}

module.exports = {
  noEmergencyDispatch,
  noEmergencyDispatchPersonal,
  noEmergencyDispatchShort,
  maintenanceNotEmergency,
  complaintOrOfficeIssue,
  scheduledForBusinessHours,
  stillRoutingVendor,
  vendorAccepted,
};
