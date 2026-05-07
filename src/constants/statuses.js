/**
 * Incident status constants used across the property management system.
 * These map to the Status field in the Airtable Incidents table.
 */

const INCIDENT_STATUS = {
  NEW: 'New',
  AWAITING_TENANT: 'Awaiting Tenant',
  AWAITING_MANAGER: 'Awaiting Manager',
  AWAITING_VENDOR: 'Awaiting Vendor',
  VENDOR_ACCEPTED: 'Vendor Accepted',
  VENDOR_DECLINED: 'Vendor Declined',
  VENDOR_NO_RESPONSE: 'Vendor No Response',
  SCHEDULED_BUSINESS_HOURS: 'Scheduled for Business Hours',
  WORK_ORDER_CREATED: 'Work Order Created',
  EMERGENCY_ESCALATED: 'Emergency Escalated',
  RESOLVED_BY_TENANT: 'Resolved by Tenant',
  CLOSED: 'Closed',
};

/**
 * Vendor Response Status field values.
 */
const VENDOR_RESPONSE_STATUS = {
  AWAITING_RESPONSE: 'Awaiting Response',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  NO_RESPONSE: 'No Response',
  LATE_RESPONSE: 'Late Response',
};

module.exports = { INCIDENT_STATUS, VENDOR_RESPONSE_STATUS };
