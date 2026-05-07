'use strict';

const m = require('../../src/messages/managerMessages');

const baseMenuParams = {
  propertyName: 'Sunset Apartments',
  unit: '4B',
  tenantName: 'Jane Doe',
  issueSummary: 'Water leak under sink',
  photoStatus: '2 photos attached',
  plainEnglishSummary: 'Kitchen sink dripping steadily. No flooding yet.',
  severity: 'Urgent',
  vendorOptions: ['Marco Plumbing', 'Performance HVAC', 'Tom Electrician'],
};

describe('maintenanceReviewMenu', () => {
  test('includes property, unit and tenant name', () => {
    const msg = m.maintenanceReviewMenu(baseMenuParams);
    expect(msg).toContain('Sunset Apartments');
    expect(msg).toContain('4B');
    expect(msg).toContain('Jane Doe');
  });

  test('option 1 reads "Don\'t Escalate / Schedule Business Hours"', () => {
    const msg = m.maintenanceReviewMenu(baseMenuParams);
    expect(msg).toContain("1. Don't Escalate / Schedule Business Hours");
  });

  test('lists vendor options starting at option 2', () => {
    const msg = m.maintenanceReviewMenu(baseMenuParams);
    expect(msg).toContain('2. Message Marco Plumbing');
    expect(msg).toContain('3. Message Performance HVAC');
    expect(msg).toContain('4. Message Tom Electrician');
  });

  test('works when no vendor options are provided', () => {
    const msg = m.maintenanceReviewMenu({ ...baseMenuParams, vendorOptions: [] });
    expect(msg).toContain("1. Don't Escalate / Schedule Business Hours");
  });

  test('includes severity and summary', () => {
    const msg = m.maintenanceReviewMenu(baseMenuParams);
    expect(msg).toContain('Urgent');
    expect(msg).toContain('Kitchen sink dripping steadily');
  });
});

describe('vendorNoResponseAlert', () => {
  const params = {
    vendorName: 'Marco Plumbing',
    propertyName: 'Sunset Apartments',
    unit: '4B',
    issueSummary: 'Water leak under sink',
    severity: 'Emergency',
  };

  test('starts with "Vendor No Response" header', () => {
    expect(m.vendorNoResponseAlert(params)).toMatch(/^Vendor No Response/);
  });

  test('names the vendor and property', () => {
    const msg = m.vendorNoResponseAlert(params);
    expect(msg).toContain('Marco Plumbing');
    expect(msg).toContain('Sunset Apartments');
    expect(msg).toContain('4B');
  });

  test('shows the 6-option reply menu', () => {
    const msg = m.vendorNoResponseAlert(params);
    expect(msg).toContain('1. Message backup vendor');
    expect(msg).toContain('6. Close / hold');
  });
});

describe('vendorDeclinedAlert', () => {
  const params = {
    vendorName: 'Tom Electrician',
    propertyName: 'Sunset Apartments',
    unit: '4B',
    issueSummary: 'Outlet sparking',
    severity: 'Emergency',
  };

  test('starts with "Vendor Declined" header', () => {
    expect(m.vendorDeclinedAlert(params)).toMatch(/^Vendor Declined/);
  });

  test('names the vendor and property', () => {
    const msg = m.vendorDeclinedAlert(params);
    expect(msg).toContain('Tom Electrician');
    expect(msg).toContain('Sunset Apartments');
  });

  test('shows the 6-option reply menu', () => {
    const msg = m.vendorDeclinedAlert(params);
    expect(msg).toContain('1. Message backup vendor');
    expect(msg).toContain('6. Close / hold');
  });
});

describe('vendorDeclinedBackupAvailable', () => {
  test('names both vendors and prompts YES', () => {
    const msg = m.vendorDeclinedBackupAvailable({
      vendorName: 'Marco Plumbing',
      backupVendorName: 'Reliable Repairs',
    });
    expect(msg).toContain('Marco Plumbing');
    expect(msg).toContain('Reliable Repairs');
    expect(msg).toContain('Reply YES');
  });
});

describe('vendorLateResponseNote', () => {
  test('mentions original vendor and backup vendor', () => {
    const note = m.vendorLateResponseNote({
      vendorName: 'Marco Plumbing',
      backupVendorName: 'Reliable Repairs',
    });
    expect(note).toContain('Marco Plumbing');
    expect(note).toContain('Reliable Repairs');
    expect(note).toContain('after timeout');
  });
});

describe('clarifyNoEscalation', () => {
  test('asks for YES or NO confirmation', () => {
    const msg = m.clarifyNoEscalation();
    expect(msg).toContain('YES');
    expect(msg).toContain('NO');
  });

  test('mentions "no emergency dispatch"', () => {
    expect(m.clarifyNoEscalation()).toContain('no emergency dispatch');
  });
});
