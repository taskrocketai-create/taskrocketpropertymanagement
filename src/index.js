/**
 * TaskRocket Property Management – main entry point.
 *
 * This file re-exports the public API of the response-agent so that
 * integrations (Twilio webhooks, scheduled jobs, etc.) can import from a
 * single location.
 */

'use strict';

const { INCIDENT_STATUS, VENDOR_RESPONSE_STATUS } = require('./constants/statuses');
const { SEVERITY, VENDOR_TIMEOUT_MINUTES, getVendorDeadline } = require('./constants/timeouts');

const tenantMessages = require('./messages/tenantMessages');
const vendorMessages = require('./messages/vendorMessages');
const managerMessages = require('./messages/managerMessages');

const { classifyManagerReply, handleManagerReply } = require('./handlers/managerHandler');
const { classifyVendorReply, handleVendorReply } = require('./handlers/vendorHandler');
const { runTimeoutWatcher } = require('./handlers/timeoutWatcher');

const { INCIDENT_FIELDS, VENDOR_RESPONSE_STATUS_OPTIONS, INCIDENT_STATUS_OPTIONS } =
  require('./airtable/schema');

module.exports = {
  // Constants
  INCIDENT_STATUS,
  VENDOR_RESPONSE_STATUS,
  SEVERITY,
  VENDOR_TIMEOUT_MINUTES,
  getVendorDeadline,

  // Message builders
  tenantMessages,
  vendorMessages,
  managerMessages,

  // Handlers
  classifyManagerReply,
  handleManagerReply,
  classifyVendorReply,
  handleVendorReply,
  runTimeoutWatcher,

  // Airtable schema
  INCIDENT_FIELDS,
  VENDOR_RESPONSE_STATUS_OPTIONS,
  INCIDENT_STATUS_OPTIONS,
};
