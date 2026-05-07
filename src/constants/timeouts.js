/**
 * Vendor response timeout rules per issue severity.
 * All durations are in minutes unless otherwise noted.
 *
 * These defaults can be customised per property in Airtable.
 */

const SEVERITY = {
  EMERGENCY: 'Emergency',
  URGENT: 'Urgent',
  ROUTINE_AFTER_HOURS: 'Routine After-Hours',
  ROUTINE_BUSINESS_HOURS: 'Routine Business Hours',
};

/**
 * Timeout (in minutes) within which a vendor must respond for each severity level.
 *
 * Emergency examples    : active flooding, sewer backup, door won't secure,
 *                          electrical hazard, no heat in freezing weather.
 * Urgent examples        : leak stopped but repair needed, refrigerator not cooling,
 *                          HVAC with vulnerable tenant, only toilet not working.
 * Routine after-hours   : non-emergency contact made after office hours.
 * Routine business hours: standard daytime work-order dispatch.
 *
 * Note: ROUTINE_BUSINESS_HOURS is stored in minutes (120 = 2 business hours)
 * but callers should be aware that business-hour calculation may exclude
 * nights/weekends when implemented in full scheduling logic.
 */
const VENDOR_TIMEOUT_MINUTES = {
  [SEVERITY.EMERGENCY]: 10,
  [SEVERITY.URGENT]: 20,
  [SEVERITY.ROUTINE_AFTER_HOURS]: 45,
  [SEVERITY.ROUTINE_BUSINESS_HOURS]: 120,
};

/**
 * How frequently (in minutes) the timeout watcher scenario should run.
 * Recommended: every 2–5 minutes.
 */
const TIMEOUT_WATCHER_INTERVAL_MINUTES = 2;

/**
 * Return the response-deadline Date for a dispatch sent at `dispatchedAt`
 * with the given `severity`.
 *
 * @param {string} severity  - One of the SEVERITY constants.
 * @param {Date}   [dispatchedAt=new Date()] - When the dispatch was sent.
 * @returns {Date} The deadline by which the vendor must respond.
 */
function getVendorDeadline(severity, dispatchedAt = new Date()) {
  const timeoutMinutes = VENDOR_TIMEOUT_MINUTES[severity];
  if (timeoutMinutes === undefined) {
    throw new Error(`Unknown severity level: "${severity}"`);
  }
  return new Date(dispatchedAt.getTime() + timeoutMinutes * 60 * 1000);
}

module.exports = {
  SEVERITY,
  VENDOR_TIMEOUT_MINUTES,
  TIMEOUT_WATCHER_INTERVAL_MINUTES,
  getVendorDeadline,
};
