'use strict';

const {
  SEVERITY,
  VENDOR_TIMEOUT_MINUTES,
  TIMEOUT_WATCHER_INTERVAL_MINUTES,
  getVendorDeadline,
} = require('../../src/constants/timeouts');

describe('SEVERITY', () => {
  test('defines Emergency, Urgent, Routine After-Hours and Routine Business Hours', () => {
    expect(SEVERITY.EMERGENCY).toBe('Emergency');
    expect(SEVERITY.URGENT).toBe('Urgent');
    expect(SEVERITY.ROUTINE_AFTER_HOURS).toBe('Routine After-Hours');
    expect(SEVERITY.ROUTINE_BUSINESS_HOURS).toBe('Routine Business Hours');
  });
});

describe('VENDOR_TIMEOUT_MINUTES', () => {
  test('Emergency timeout is 10 minutes', () => {
    expect(VENDOR_TIMEOUT_MINUTES[SEVERITY.EMERGENCY]).toBe(10);
  });

  test('Urgent timeout is 20 minutes', () => {
    expect(VENDOR_TIMEOUT_MINUTES[SEVERITY.URGENT]).toBe(20);
  });

  test('Routine After-Hours timeout is 45 minutes', () => {
    expect(VENDOR_TIMEOUT_MINUTES[SEVERITY.ROUTINE_AFTER_HOURS]).toBe(45);
  });

  test('Routine Business Hours timeout is 120 minutes (2 business hours)', () => {
    expect(VENDOR_TIMEOUT_MINUTES[SEVERITY.ROUTINE_BUSINESS_HOURS]).toBe(120);
  });
});

describe('TIMEOUT_WATCHER_INTERVAL_MINUTES', () => {
  test('is between 2 and 5 minutes', () => {
    expect(TIMEOUT_WATCHER_INTERVAL_MINUTES).toBeGreaterThanOrEqual(2);
    expect(TIMEOUT_WATCHER_INTERVAL_MINUTES).toBeLessThanOrEqual(5);
  });
});

describe('getVendorDeadline', () => {
  const baseTime = new Date('2025-01-01T12:00:00.000Z');

  test('returns correct deadline for Emergency (10 min)', () => {
    const deadline = getVendorDeadline(SEVERITY.EMERGENCY, baseTime);
    expect(deadline.getTime()).toBe(baseTime.getTime() + 10 * 60 * 1000);
  });

  test('returns correct deadline for Urgent (20 min)', () => {
    const deadline = getVendorDeadline(SEVERITY.URGENT, baseTime);
    expect(deadline.getTime()).toBe(baseTime.getTime() + 20 * 60 * 1000);
  });

  test('returns correct deadline for Routine After-Hours (45 min)', () => {
    const deadline = getVendorDeadline(SEVERITY.ROUTINE_AFTER_HOURS, baseTime);
    expect(deadline.getTime()).toBe(baseTime.getTime() + 45 * 60 * 1000);
  });

  test('returns correct deadline for Routine Business Hours (120 min)', () => {
    const deadline = getVendorDeadline(SEVERITY.ROUTINE_BUSINESS_HOURS, baseTime);
    expect(deadline.getTime()).toBe(baseTime.getTime() + 120 * 60 * 1000);
  });

  test('uses current time when dispatchedAt is not provided', () => {
    const before = Date.now();
    const deadline = getVendorDeadline(SEVERITY.EMERGENCY);
    const after = Date.now();
    // Deadline should be ~10 min after "now"
    expect(deadline.getTime()).toBeGreaterThanOrEqual(before + 10 * 60 * 1000);
    expect(deadline.getTime()).toBeLessThanOrEqual(after + 10 * 60 * 1000);
  });

  test('throws for unknown severity', () => {
    expect(() => getVendorDeadline('SuperUrgent')).toThrow(/Unknown severity/);
  });
});
