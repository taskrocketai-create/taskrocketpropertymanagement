'use strict';

const { INCIDENT_STATUS, VENDOR_RESPONSE_STATUS } = require('../../src/constants/statuses');

describe('INCIDENT_STATUS', () => {
  const expectedStatuses = [
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

  test('contains all required statuses', () => {
    for (const status of expectedStatuses) {
      expect(Object.values(INCIDENT_STATUS)).toContain(status);
    }
  });

  test('has no duplicate values', () => {
    const values = Object.values(INCIDENT_STATUS);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('VENDOR_RESPONSE_STATUS', () => {
  const expectedStatuses = ['Awaiting Response', 'Accepted', 'Declined', 'No Response', 'Late Response'];

  test('contains all required vendor response statuses', () => {
    for (const status of expectedStatuses) {
      expect(Object.values(VENDOR_RESPONSE_STATUS)).toContain(status);
    }
  });
});
