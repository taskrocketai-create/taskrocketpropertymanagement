'use strict';

const { classifyVendorReply, handleVendorReply } = require('../../src/handlers/vendorHandler');
const { INCIDENT_STATUS, VENDOR_RESPONSE_STATUS } = require('../../src/constants/statuses');

// ─── classifyVendorReply ─────────────────────────────────────────────────────

describe('classifyVendorReply', () => {
  test.each([
    ['ACCEPT 2:30 PM', 'ACCEPT', '2:30 PM'],
    ['accept 3:00PM', 'ACCEPT', '3:00PM'],
    ['ACCEPT', 'ACCEPT', ''],
  ])('classifies "%s" as ACCEPT with eta "%s"', (text, intent, eta) => {
    const result = classifyVendorReply(text);
    expect(result.intent).toBe(intent);
    expect(result.eta).toBe(eta);
  });

  test.each([
    ['Decline'],
    ["Can't take it"],
    ['Unavailable'],
    ['Not tonight'],
    ["Can't get there"],
    ['DECLINE'],
  ])('classifies "%s" as DECLINE', (text) => {
    expect(classifyVendorReply(text).intent).toBe('DECLINE');
  });

  test('classifies unknown text as UNKNOWN', () => {
    expect(classifyVendorReply('Sure, on my way').intent).toBe('UNKNOWN');
  });

  test('classifies empty string as UNKNOWN', () => {
    expect(classifyVendorReply('').intent).toBe('UNKNOWN');
  });

  test('classifies null as UNKNOWN', () => {
    expect(classifyVendorReply(null).intent).toBe('UNKNOWN');
  });
});

// ─── handleVendorReply ───────────────────────────────────────────────────────

function makeServices(overrides = {}) {
  return {
    updateIncident: jest.fn().mockResolvedValue(),
    sendVendorSms: jest.fn().mockResolvedValue(),
    sendManagerSms: jest.fn().mockResolvedValue(),
    sendTenantSms: jest.fn().mockResolvedValue(),
    logAction: jest.fn().mockResolvedValue(),
    ...overrides,
  };
}

const incident = {
  id: 'inc_001',
  propertyName: 'Sunset Apartments',
  unit: '4B',
  tenantPhone: '555-1234',
  managerPhone: '555-5678',
  issueSummary: 'Water leak under sink',
  severity: 'Urgent',
  backupVendorName: null,
};

const vendor = { id: 'v_001', name: 'Marco Plumbing', phone: '555-9012' };

describe('handleVendorReply – ACCEPT', () => {
  test('updates incident to Vendor Accepted', async () => {
    const services = makeServices();
    const result = await handleVendorReply(
      { incident, vendor, vendorReply: 'ACCEPT 2:30 PM' },
      services,
    );

    expect(result.action).toBe('ACCEPT');
    expect(result.eta).toBe('2:30 PM');
    expect(services.updateIncident).toHaveBeenCalledWith(
      'inc_001',
      expect.objectContaining({
        Status: INCIDENT_STATUS.VENDOR_ACCEPTED,
        'Vendor Response Status': VENDOR_RESPONSE_STATUS.ACCEPTED,
      }),
    );
  });

  test('sends tenant the vendor-accepted message with ETA', async () => {
    const services = makeServices();
    await handleVendorReply({ incident, vendor, vendorReply: 'ACCEPT 3:00 PM' }, services);

    expect(services.sendTenantSms).toHaveBeenCalledWith(
      '555-1234',
      expect.stringContaining('Marco Plumbing'),
    );
    expect(services.sendTenantSms).toHaveBeenCalledWith(
      '555-1234',
      expect.stringContaining('3:00 PM'),
    );
  });

  test('falls back to "soon" when no ETA provided', async () => {
    const services = makeServices();
    await handleVendorReply({ incident, vendor, vendorReply: 'ACCEPT' }, services);

    expect(services.sendTenantSms).toHaveBeenCalledWith(
      '555-1234',
      expect.stringContaining('soon'),
    );
  });
});

describe('handleVendorReply – DECLINE', () => {
  test('updates incident to Vendor Declined', async () => {
    const services = makeServices();
    const result = await handleVendorReply(
      { incident, vendor, vendorReply: 'Decline' },
      services,
    );

    expect(result.action).toBe('DECLINE');
    expect(services.updateIncident).toHaveBeenCalledWith(
      'inc_001',
      expect.objectContaining({
        Status: INCIDENT_STATUS.VENDOR_DECLINED,
        'Vendor Response Status': VENDOR_RESPONSE_STATUS.DECLINED,
      }),
    );
  });

  test('sends manager the full declined alert when no backup vendor', async () => {
    const services = makeServices();
    await handleVendorReply({ incident, vendor, vendorReply: 'Decline' }, services);

    expect(services.sendManagerSms).toHaveBeenCalledWith(
      '555-5678',
      expect.stringContaining('Vendor Declined'),
    );
  });

  test('sends manager the short backup-available alert when backup vendor exists', async () => {
    const incidentWithBackup = { ...incident, backupVendorName: 'Reliable Repairs' };
    const services = makeServices();
    await handleVendorReply({ incident: incidentWithBackup, vendor, vendorReply: 'Decline' }, services);

    expect(services.sendManagerSms).toHaveBeenCalledWith(
      '555-5678',
      expect.stringContaining('Reliable Repairs'),
    );
    expect(services.sendManagerSms).toHaveBeenCalledWith(
      '555-5678',
      expect.stringContaining('Reply YES'),
    );
  });

  test('does NOT notify tenant on decline', async () => {
    const services = makeServices();
    await handleVendorReply({ incident, vendor, vendorReply: "Can't take it" }, services);
    expect(services.sendTenantSms).not.toHaveBeenCalled();
  });
});

describe('handleVendorReply – already rerouted (late response)', () => {
  test('tells original vendor to stand by', async () => {
    const services = makeServices();
    const result = await handleVendorReply(
      {
        incident: { ...incident, backupVendorName: 'Reliable Repairs' },
        vendor,
        vendorReply: 'ACCEPT 5:00 PM',
        alreadyRerouted: true,
      },
      services,
    );

    expect(result.action).toBe('LATE_RESPONSE');
    expect(services.sendVendorSms).toHaveBeenCalledWith(
      vendor.phone,
      expect.stringContaining('already been rerouted'),
    );
  });

  test('notifies manager of late response', async () => {
    const services = makeServices();
    await handleVendorReply(
      {
        incident: { ...incident, backupVendorName: 'Reliable Repairs' },
        vendor,
        vendorReply: 'ACCEPT 5:00 PM',
        alreadyRerouted: true,
      },
      services,
    );

    expect(services.sendManagerSms).toHaveBeenCalledWith(
      '555-5678',
      expect.stringContaining('after timeout'),
    );
  });
});

describe('handleVendorReply – UNKNOWN', () => {
  test('returns UNKNOWN action and logs message', async () => {
    const services = makeServices();
    const result = await handleVendorReply(
      { incident, vendor, vendorReply: 'On my way soon' },
      services,
    );
    expect(result.action).toBe('UNKNOWN');
    expect(services.logAction).toHaveBeenCalled();
  });
});
