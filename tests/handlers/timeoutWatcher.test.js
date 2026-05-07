'use strict';

const { runTimeoutWatcher } = require('../../src/handlers/timeoutWatcher');
const { INCIDENT_STATUS, VENDOR_RESPONSE_STATUS } = require('../../src/constants/statuses');

function makeServices(timedOutIncidents = [], overrides = {}) {
  return {
    findTimedOutIncidents: jest.fn().mockResolvedValue(timedOutIncidents),
    updateIncident: jest.fn().mockResolvedValue(),
    sendManagerSms: jest.fn().mockResolvedValue(),
    logAction: jest.fn().mockResolvedValue(),
    ...overrides,
  };
}

const incident1 = {
  id: 'inc_001',
  vendorName: 'Marco Plumbing',
  propertyName: 'Sunset Apartments',
  unit: '4B',
  issueSummary: 'Water leak under sink',
  severity: 'Emergency',
  managerPhone: '555-5678',
};

const incident2 = {
  id: 'inc_002',
  vendorName: 'Tom Electrician',
  propertyName: 'Oak View',
  unit: '2A',
  issueSummary: 'Outlet sparking',
  severity: 'Emergency',
  managerPhone: '555-0001',
};

describe('runTimeoutWatcher', () => {
  test('returns { processed: 0, incidentIds: [] } when no incidents are timed out', async () => {
    const services = makeServices([]);
    const result = await runTimeoutWatcher(services);
    expect(result).toEqual({ processed: 0, incidentIds: [] });
  });

  test('processes a single timed-out incident', async () => {
    const services = makeServices([incident1]);
    const result = await runTimeoutWatcher(services);

    expect(result.processed).toBe(1);
    expect(result.incidentIds).toContain('inc_001');
  });

  test('updates Vendor Response Status to No Response', async () => {
    const services = makeServices([incident1]);
    await runTimeoutWatcher(services);

    expect(services.updateIncident).toHaveBeenCalledWith(
      'inc_001',
      expect.objectContaining({
        'Vendor Response Status': VENDOR_RESPONSE_STATUS.NO_RESPONSE,
      }),
    );
  });

  test('updates incident Status to Vendor No Response', async () => {
    const services = makeServices([incident1]);
    await runTimeoutWatcher(services);

    expect(services.updateIncident).toHaveBeenCalledWith(
      'inc_001',
      expect.objectContaining({ Status: INCIDENT_STATUS.VENDOR_NO_RESPONSE }),
    );
  });

  test('sends manager the no-response alert', async () => {
    const services = makeServices([incident1]);
    await runTimeoutWatcher(services);

    expect(services.sendManagerSms).toHaveBeenCalledWith(
      '555-5678',
      expect.stringContaining('Vendor No Response'),
    );
    expect(services.sendManagerSms).toHaveBeenCalledWith(
      '555-5678',
      expect.stringContaining('Marco Plumbing'),
    );
  });

  test('logs the timeout event', async () => {
    const services = makeServices([incident1]);
    await runTimeoutWatcher(services);

    expect(services.logAction).toHaveBeenCalledWith('inc_001', expect.any(String));
  });

  test('processes multiple timed-out incidents independently', async () => {
    const services = makeServices([incident1, incident2]);
    const result = await runTimeoutWatcher(services);

    expect(result.processed).toBe(2);
    expect(result.incidentIds).toContain('inc_001');
    expect(result.incidentIds).toContain('inc_002');
    expect(services.updateIncident).toHaveBeenCalledTimes(2);
    expect(services.sendManagerSms).toHaveBeenCalledTimes(2);
    expect(services.logAction).toHaveBeenCalledTimes(2);
  });

  test('sends manager message that includes the 6-option menu', async () => {
    const services = makeServices([incident1]);
    await runTimeoutWatcher(services);

    expect(services.sendManagerSms).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('1. Message backup vendor'),
    );
    expect(services.sendManagerSms).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('6. Close / hold'),
    );
  });
});
