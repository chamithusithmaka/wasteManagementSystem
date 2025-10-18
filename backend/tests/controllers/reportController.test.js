import assert from 'assert';
import * as reportController from '../../controllers/reportController.js';
import * as reportService from '../../services/reportService.js';

// Manual mock for Express req/res
function mockResponse() {
  return {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };
}

function stub(obj, method, impl) {
  const orig = obj[method];
  obj[method] = impl;
  return () => { obj[method] = orig; };
}

function run(description, fn) {
  try {
    fn();
    console.log('✓', description);
  } catch (e) {
    console.error('✗', description);
    console.error(e);
  }
}

async function test(description, fn) {
  try {
    await fn();
    console.log('✓', description);
  } catch (e) {
    console.error('✗', description);
    console.error(e);
  }
}

// Tests
run('reportController.generateReport should return 200 and data on success', async () => {
  const restore = stub(reportService, 'generateReportByType', async () => ({ result: 'ok' }));
  const req = { body: { reportType: 'Waste Collection Summary', startDate: '2025-10-01', endDate: '2025-10-10' } };
  const res = mockResponse();
  await reportController.generateReport(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.jsonData.success, true);
  assert.deepStrictEqual(res.jsonData.data, { result: 'ok' });
  restore();
});

run('reportController.generateReport should return 500 on error', async () => {
  const restore = stub(reportService, 'generateReportByType', async () => { throw new Error('fail'); });
  const req = { body: { reportType: 'Waste Collection Summary', startDate: '2025-10-01', endDate: '2025-10-10' } };
  const res = mockResponse();
  await reportController.generateReport(req, res);
  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(res.jsonData.success, false);
  restore();
});

run('reportController.getStatusCounts should return 200 and data on success', async () => {
  const restore = stub(reportService, 'getCountsByStatus', async () => ({ count: 5 }));
  const req = {};
  const res = mockResponse();
  await reportController.getStatusCounts(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.jsonData.success, true);
  assert.deepStrictEqual(res.jsonData.data, { count: 5 });
  restore();
});

run('reportController.getStatusCounts should return 500 on error', async () => {
  const restore = stub(reportService, 'getCountsByStatus', async () => { throw new Error('fail'); });
  const req = {};
  const res = mockResponse();
  await reportController.getStatusCounts(req, res);
  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(res.jsonData.success, false);
  restore();
});

run('reportController.getSensorDataByStatus should return 200 and data on success', async () => {
  const restore = stub(reportService, 'getSensorDataCountsByStatus', async () => ({ count: 3 }));
  const req = {};
  const res = mockResponse();
  await reportController.getSensorDataByStatus(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.jsonData.success, true);
  assert.deepStrictEqual(res.jsonData.data, { count: 3 });
  restore();
});

run('reportController.getSensorDataByStatus should return 500 on error', async () => {
  const restore = stub(reportService, 'getSensorDataCountsByStatus', async () => { throw new Error('fail'); });
  const req = {};
  const res = mockResponse();
  await reportController.getSensorDataByStatus(req, res);
  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(res.jsonData.success, false);
  restore();
});

run('reportController.getWasteCollectionByType should return 200 and data on success', async () => {
  const restore = stub(reportService, 'getCountsByWasteType', async () => ({ count: 7 }));
  const req = {};
  const res = mockResponse();
  await reportController.getWasteCollectionByType(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.jsonData.success, true);
  assert.deepStrictEqual(res.jsonData.data, { count: 7 });
  restore();
});

run('reportController.getWasteCollectionByType should return 500 on error', async () => {
  const restore = stub(reportService, 'getCountsByWasteType', async () => { throw new Error('fail'); });
  const req = {};
  const res = mockResponse();
  await reportController.getWasteCollectionByType(req, res);
  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(res.jsonData.success, false);
  restore();
});

run('reportController.getSensorDataByContainerType should return 200 and data on success', async () => {
  const restore = stub(reportService, 'getSensorDataCountsByContainerType', async () => ({ count: 2 }));
  const req = {};
  const res = mockResponse();
  await reportController.getSensorDataByContainerType(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.jsonData.success, true);
  assert.deepStrictEqual(res.jsonData.data, { count: 2 });
  restore();
});

run('reportController.getSensorDataByContainerType should return 500 on error', async () => {
  const restore = stub(reportService, 'getSensorDataCountsByContainerType', async () => { throw new Error('fail'); });
  const req = {};
  const res = mockResponse();
  await reportController.getSensorDataByContainerType(req, res);
  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(res.jsonData.success, false);
  restore();
});
