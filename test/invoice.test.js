var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function summary(figures) {
  return {
    subtotal: figures.subtotal,
    discount: figures.discount,
    tax: figures.tax,
    cgst: figures.cgst,
    sgst: figures.sgst,
    total: figures.total
  };
}

test('invoice matches checkout for mixed GST slabs and a capped coupon', function () {
  var items = [
    { price: 1120, qty: 1, hsn: '1508' },
    { price: 560, qty: 2, hsn: '0405' }
  ];
  var checkout = pricing.computeTotals(items, 'SAVE10');
  var printed = invoice.computeInvoiceFigures({ items: items, coupon: 'SAVE10' });

  assert.deepEqual(summary(printed), summary(checkout));
  assert.deepEqual(printed.rows.map(function (row) {
    return [row.gstPercent, row.lineTax];
  }), [[5, 52.25], [12, 125.4]]);

  var saved = {
    items: items, coupon: 'SAVE10', subtotal: 2240, discount: 100, tax: 181.9, total: 2321.9
  };
  assert.deepEqual(summary(invoice.computeInvoiceFigures(saved)),
    { subtotal: 2240, discount: 100, tax: 181.9, cgst: 90.95, sgst: 90.95, total: 2321.9 });
  assert.match(invoice.render(saved), /Line GST is recalculated using current pricing rules/);
});

test('CURRENT BEHAVIOUR: #1001 invoice uses 5% and 12% HSN slabs', function () {
  // Checkout snapshots carry HSN and omit gstRate.
  var order = {
    coupon: '',
    items: [
      { price: 165, qty: 2, hsn: '0713' },
      { price: 260, qty: 1, hsn: '0405' }
    ]
  };
  var printed = invoice.computeInvoiceFigures(order);
  var checkout = pricing.computeTotals(order.items, order.coupon);

  assert.deepEqual(summary(printed),
    { subtotal: 590, discount: 0, tax: 47.7, cgst: 23.85, sgst: 23.85, total: 637.7 });
  assert.deepEqual(printed.rows.map(function (row) {
    return [row.gstPercent, row.lineTax];
  }), [[5, 16.5], [12, 31.2]]);
  assert.deepEqual(summary(checkout),
    { subtotal: 590, discount: 0, tax: 47.7, cgst: 23.85, sgst: 23.85, total: 637.7 });
  assert.deepEqual(checkout.lines.map(function (line) {
    return [line.gstPercent, line.tax];
  }), [[5, 16.5], [12, 31.2]]);
});

test('CURRENT BEHAVIOUR: #1002 invoice applies SAVE10 before GST', function () {
  // Checkout snapshots carry HSN and omit gstRate.
  var order = {
    coupon: 'SAVE10',
    items: [
      { price: 640, qty: 1, hsn: '1006' },
      { price: 190, qty: 2, hsn: '1512' }
    ]
  };
  var printed = invoice.computeInvoiceFigures(order);
  var checkout = pricing.computeTotals(order.items, order.coupon);

  assert.deepEqual(summary(printed),
    { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9 });
  assert.deepEqual(printed.rows.map(function (row) {
    return [row.gstPercent, row.lineTax];
  }), [[5, 28.8], [5, 17.1]]);
  assert.deepEqual(summary(checkout),
    { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9 });
  assert.deepEqual(checkout.lines.map(function (line) {
    return [line.gstPercent, line.tax];
  }), [[5, 28.8], [5, 17.1]]);
});

test('CURRENT BEHAVIOUR: #1004 invoice honors the SAVE10 cap', function () {
  // Checkout snapshots carry HSN and omit gstRate.
  var order = {
    coupon: 'SAVE10',
    items: [
      { price: 1120, qty: 2, hsn: '1508' }
    ]
  };
  var printed = invoice.computeInvoiceFigures(order);
  var checkout = pricing.computeTotals(order.items, order.coupon);

  assert.deepEqual(summary(printed),
    { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5 });
  assert.deepEqual(printed.rows.map(function (row) {
    return [row.gstPercent, row.lineTax];
  }), [[5, 104.5]]);
  assert.deepEqual(summary(checkout),
    { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5 });
  assert.deepEqual(checkout.lines.map(function (line) {
    return [line.gstPercent, line.tax];
  }), [[5, 104.5]]);
});

test('CURRENT BEHAVIOUR: #1008 invoice matches checkout for uncouponed 18% lines', function () {
  // Checkout snapshots carry HSN and omit gstRate.
  var order = {
    coupon: '',
    items: [
      { price: 140, qty: 1, hsn: '0902' },
      { price: 180, qty: 2, hsn: '2106' }
    ]
  };
  var printed = invoice.computeInvoiceFigures(order);
  var checkout = pricing.computeTotals(order.items, order.coupon);

  assert.deepEqual(summary(printed),
    { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 });
  assert.deepEqual(printed.rows.map(function (row) {
    return [row.gstPercent, row.lineTax];
  }), [[18, 25.2], [18, 64.8]]);
  assert.deepEqual(summary(checkout),
    { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 });
  assert.deepEqual(checkout.lines.map(function (line) {
    return [line.gstPercent, line.tax];
  }), [[18, 25.2], [18, 64.8]]);
});
