'use strict';

const m = require('../../src/messages/tenantMessages');

describe('noEmergencyDispatch (default)', () => {
  test('includes "Management reviewed the information"', () => {
    expect(m.noEmergencyDispatch()).toContain('Management reviewed the information');
  });

  test('mentions "not sending emergency dispatch right now"', () => {
    expect(m.noEmergencyDispatch()).toContain('not sending emergency dispatch right now');
  });

  test('mentions "documented" and "scheduled for regular business hours"', () => {
    const msg = m.noEmergencyDispatch();
    expect(msg).toContain('documented');
    expect(msg).toContain('scheduled for regular business hours');
  });

  test('invites tenant to reply if things get worse', () => {
    expect(m.noEmergencyDispatch()).toContain('reply back here right away');
  });

  test('does NOT use dismissive language like "not an emergency"', () => {
    const msg = m.noEmergencyDispatch();
    expect(msg).not.toMatch(/this is not an emergency/i);
    expect(msg).not.toMatch(/we have a record/i);
  });
});

describe('noEmergencyDispatchPersonal', () => {
  test('references "Based on the information provided"', () => {
    expect(m.noEmergencyDispatchPersonal()).toContain('Based on the information provided');
  });

  test('mentions "kept on record" and "regular business hours"', () => {
    const msg = m.noEmergencyDispatchPersonal();
    expect(msg).toContain('kept on record');
    expect(msg).toContain('regular business hours');
  });
});

describe('noEmergencyDispatchShort', () => {
  test('is shorter than the default version', () => {
    expect(m.noEmergencyDispatchShort().length).toBeLessThan(m.noEmergencyDispatch().length);
  });

  test('still mentions "not sending emergency dispatch"', () => {
    expect(m.noEmergencyDispatchShort()).toContain('not sending emergency dispatch');
  });
});

describe('maintenanceNotEmergency', () => {
  test('mentions logging and business hours scheduling', () => {
    const msg = m.maintenanceNotEmergency();
    expect(msg).toContain('logged');
    expect(msg).toContain('business hours');
  });
});

describe('complaintOrOfficeIssue', () => {
  test('mentions 911 for safety concerns', () => {
    expect(m.complaintOrOfficeIssue()).toContain('911');
  });

  test('mentions "documented"', () => {
    expect(m.complaintOrOfficeIssue()).toContain('documented');
  });
});

describe('scheduledForBusinessHours', () => {
  test('confirms documentation and business hours follow-up', () => {
    const msg = m.scheduledForBusinessHours();
    expect(msg).toContain('documented');
    expect(msg).toContain('business hours');
  });
});

describe('stillRoutingVendor', () => {
  test('reassures tenant the issue has not been forgotten', () => {
    const msg = m.stillRoutingVendor();
    expect(msg).toContain('documented');
    expect(msg).toContain('management has been notified');
  });
});

describe('vendorAccepted', () => {
  test('includes vendor name and ETA', () => {
    const msg = m.vendorAccepted('Marco Plumbing', '3:00 PM');
    expect(msg).toContain('Marco Plumbing');
    expect(msg).toContain('3:00 PM');
  });

  test('mentions "Maintenance has been notified"', () => {
    expect(m.vendorAccepted('HVAC Co', '4:00 PM')).toContain('Maintenance has been notified');
  });
});
