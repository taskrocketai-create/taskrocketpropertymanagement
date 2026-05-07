'use strict';

const { classifyManagerReply, handleManagerReply } = require('../../src/handlers/managerHandler');
const { INCIDENT_STATUS } = require('../../src/constants/statuses');

// ─── classifyManagerReply ────────────────────────────────────────────────────

describe('classifyManagerReply', () => {
  test.each([
    ["Don't escalate"],
    ["Don't escalate. Schedule during business hours."],
    ['No emergency'],
    ['Hold until morning'],
    ['Regular business hours'],
    ['Work order tomorrow'],
    ['Schedule regular'],
    ['schedule during business hours'],
  ])('classifies "%s" as NO_ESCALATE', (text) => {
    expect(classifyManagerReply(text)).toBe('NO_ESCALATE');
  });

  test.each([["Let's wait"], ['wait'], ['later'], ['hold on']])(
    'classifies "%s" as AMBIGUOUS',
    (text) => {
      expect(classifyManagerReply(text)).toBe('AMBIGUOUS');
    },
  );

  test('classifies "yes" as CONFIRM_YES', () => {
    expect(classifyManagerReply('yes')).toBe('CONFIRM_YES');
    expect(classifyManagerReply('YES')).toBe('CONFIRM_YES');
    expect(classifyManagerReply('  Yes  ')).toBe('CONFIRM_YES');
  });

  test('classifies "no" as CONFIRM_NO', () => {
    expect(classifyManagerReply('no')).toBe('CONFIRM_NO');
    expect(classifyManagerReply('NO')).toBe('CONFIRM_NO');
  });

  test('classifies unrecognised text as UNKNOWN', () => {
    expect(classifyManagerReply('Do something else')).toBe('UNKNOWN');
  });

  test('classifies empty string as UNKNOWN', () => {
    expect(classifyManagerReply('')).toBe('UNKNOWN');
  });

  test('classifies null as UNKNOWN', () => {
    expect(classifyManagerReply(null)).toBe('UNKNOWN');
  });
});

// ─── handleManagerReply ──────────────────────────────────────────────────────

function makeServices(overrides = {}) {
  return {
    updateIncident: jest.fn().mockResolvedValue(),
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
  tenantName: 'Jane Doe',
  tenantPhone: '555-1234',
  managerPhone: '555-5678',
  issueSummary: 'Water leak under sink',
  severity: 'Urgent',
};

describe('handleManagerReply – NO_ESCALATE', () => {
  test("updates incident to Scheduled for Business Hours", async () => {
    const services = makeServices();
    const result = await handleManagerReply(
      { incident, managerReply: "Don't escalate. Schedule during business hours." },
      services,
    );

    expect(result.action).toBe('NO_ESCALATE');
    expect(services.updateIncident).toHaveBeenCalledWith(
      'inc_001',
      expect.objectContaining({ Status: INCIDENT_STATUS.SCHEDULED_BUSINESS_HOURS }),
    );
  });

  test('sends tenant the no-emergency-dispatch message', async () => {
    const services = makeServices();
    await handleManagerReply(
      { incident, managerReply: "Don't escalate" },
      services,
    );

    expect(services.sendTenantSms).toHaveBeenCalledWith(
      '555-1234',
      expect.stringContaining('not sending emergency dispatch'),
    );
  });

  test('sends tenant message that mentions "documented"', async () => {
    const services = makeServices();
    const result = await handleManagerReply(
      { incident, managerReply: 'No emergency' },
      services,
    );
    expect(result.message).toContain('documented');
  });

  test('logs the manager action', async () => {
    const services = makeServices();
    await handleManagerReply({ incident, managerReply: 'Hold until morning' }, services);
    expect(services.logAction).toHaveBeenCalledWith('inc_001', expect.any(String));
  });
});

describe('handleManagerReply – AMBIGUOUS', () => {
  test('sends confirmation SMS to manager', async () => {
    const services = makeServices();
    const result = await handleManagerReply(
      { incident, managerReply: "Let's wait" },
      services,
    );

    expect(result.action).toBe('AWAITING_CONFIRMATION');
    expect(services.sendManagerSms).toHaveBeenCalledWith(
      '555-5678',
      expect.stringContaining('YES'),
    );
  });
});

describe('handleManagerReply – confirmation flow', () => {
  test('YES while awaiting confirmation triggers no-escalate', async () => {
    const services = makeServices();
    const result = await handleManagerReply(
      { incident, managerReply: 'yes', awaitingConfirmation: true },
      services,
    );
    expect(result.action).toBe('NO_ESCALATE');
  });

  test('NO while awaiting confirmation returns AWAITING_NEW_INSTRUCTION', async () => {
    const services = makeServices();
    const result = await handleManagerReply(
      { incident, managerReply: 'no', awaitingConfirmation: true },
      services,
    );
    expect(result.action).toBe('AWAITING_NEW_INSTRUCTION');
  });
});

describe('handleManagerReply – UNKNOWN', () => {
  test('returns UNKNOWN action and logs the raw text', async () => {
    const services = makeServices();
    const result = await handleManagerReply(
      { incident, managerReply: 'Do something else' },
      services,
    );
    expect(result.action).toBe('UNKNOWN');
    expect(services.logAction).toHaveBeenCalled();
  });
});
