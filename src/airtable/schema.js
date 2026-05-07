/**
 * Airtable Incidents table field definitions.
 *
 * This module serves as the single source of truth for every field that the
 * property management automation reads from or writes to.  Import these
 * constants wherever you need to reference an Airtable field name so that
 * renaming a field only requires a change in one place.
 */

/**
 * Core incident fields present in the Incidents table.
 */
const INCIDENT_FIELDS = {
  // ── Identifiers ────────────────────────────────────────────────────────────
  ID: 'ID',
  PROPERTY_NAME: 'Property Name',
  UNIT: 'Unit',
  TENANT_NAME: 'Tenant Name',
  TENANT_PHONE: 'Tenant Phone',

  // ── Issue details ──────────────────────────────────────────────────────────
  ISSUE_SUMMARY: 'Issue Summary',
  AI_TRIAGE_SUMMARY: 'AI Triage Summary',
  PHOTO_LINK: 'Photo Link',
  SEVERITY: 'Severity',

  // ── Incident state ─────────────────────────────────────────────────────────
  STATUS: 'Status',

  // ── Emergency / scheduling ─────────────────────────────────────────────────
  EMERGENCY_DISPATCH_SENT: 'Emergency Dispatch Sent',          // Checkbox
  SCHEDULED_FOR_BUSINESS_HOURS: 'Scheduled For Business Hours', // Checkbox
  BUSINESS_HOURS_FOLLOW_UP_NEEDED: 'Business Hours Follow-Up Needed', // Checkbox

  // ── Vendor tracking ────────────────────────────────────────────────────────
  VENDOR_CONTACTED_TIME: 'Vendor Contacted Time',              // Date/time
  VENDOR_RESPONSE_DEADLINE: 'Vendor Response Deadline',        // Date/time
  VENDOR_TIMEOUT_MINUTES: 'Vendor Timeout Minutes',            // Number
  VENDOR_RESPONSE_STATUS: 'Vendor Response Status',            // Single select

  // ── Backup vendor ──────────────────────────────────────────────────────────
  BACKUP_VENDOR_CONTACTED: 'Backup Vendor Contacted',          // Checkbox
  BACKUP_VENDOR_SELECTED: 'Backup Vendor Selected',            // Linked record

  // ── Manager actions ────────────────────────────────────────────────────────
  MANAGER_FINAL_ACTION: 'Manager Final Action',                // Text

  // ── Tenant communication ───────────────────────────────────────────────────
  TENANT_UPDATED: 'Tenant Updated',                            // Checkbox

  // ── Follow-up ──────────────────────────────────────────────────────────────
  FOLLOW_UP_DUE_DATE_TIME: 'Follow-Up Due Date/Time',          // Date/time
};

/**
 * Allowed values for the VENDOR_RESPONSE_STATUS single-select field.
 * These mirror the VENDOR_RESPONSE_STATUS constants in statuses.js and are
 * repeated here so that schema configuration can be done without importing
 * from the constants module.
 */
const VENDOR_RESPONSE_STATUS_OPTIONS = [
  'Awaiting Response',
  'Accepted',
  'Declined',
  'No Response',
  'Late Response',
];

/**
 * Allowed values for the STATUS single-select field.
 */
const INCIDENT_STATUS_OPTIONS = [
  'New',
  'Awaiting Tenant',
  'Awaiting Manager',
  'Awaiting Vendor',
  'Vendor Accepted',
  'Vendor Declined',
  'Vendor No Response',
  'Scheduled for Business Hours',
  'Work Order Created',
  'Emergency Escalated',
  'Resolved by Tenant',
  'Closed',
];

module.exports = {
  INCIDENT_FIELDS,
  VENDOR_RESPONSE_STATUS_OPTIONS,
  INCIDENT_STATUS_OPTIONS,
};
