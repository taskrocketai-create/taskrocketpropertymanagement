'use strict';

const m = require('../../src/messages/vendorMessages');

describe('dispatchRequest', () => {
  const base = {
    propertyName: 'Sunset Apartments',
    unit: '4B',
    tenantName: 'Jane Doe',
    tenantPhone: '555-1234',
    issueSummary: 'Active water leak under kitchen sink',
    aiTriageSummary: 'Tenant reports steady drip, no flooding yet.',
    photoLink: 'https://example.com/photos/1',
  };

  test('includes all required fields', () => {
    const msg = m.dispatchRequest(base);
    expect(msg).toContain('Sunset Apartments');
    expect(msg).toContain('4B');
    expect(msg).toContain('Jane Doe');
    expect(msg).toContain('555-1234');
    expect(msg).toContain('Active water leak under kitchen sink');
    expect(msg).toContain('Tenant reports steady drip');
    expect(msg).toContain('https://example.com/photos/1');
  });

  test('includes ACCEPT / DECLINE instructions', () => {
    const msg = m.dispatchRequest(base);
    expect(msg).toContain('Reply ACCEPT with ETA or DECLINE');
    expect(msg).toContain('ACCEPT 2:30 PM');
  });

  test('omits photo section when photoLink is not provided', () => {
    const { photoLink, ...noPhoto } = base;
    const msg = m.dispatchRequest(noPhoto);
    expect(msg).not.toContain('Photos:');
  });
});

describe('lateResponseStandBy', () => {
  test('tells vendor the dispatch was already rerouted', () => {
    expect(m.lateResponseStandBy()).toContain('already been rerouted');
  });

  test('asks vendor to stand by', () => {
    expect(m.lateResponseStandBy()).toContain('stand by');
  });
});
