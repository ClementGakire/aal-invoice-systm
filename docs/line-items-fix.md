# Fixed: Line Items Not Displaying in PrintableInvoice

## Issue Identified

The line items were not showing in the PrintableInvoice component even though they were being saved to the database correctly.

## Root Cause

In the `/api/invoices.js` file, the GET method for fetching all invoices was only including:

```javascript
_count: {
  select: { lineItems: true },
}
```

This returned the **count** of line items but not the actual line items data. When the PrintableInvoice component received an invoice from the list, it had no line items to display.

## Solution Applied

Updated the API to include the actual line items:

```javascript
lineItems: {
  orderBy: { id: 'asc' },
},
_count: {
  select: { lineItems: true },
},
```

## What This Fixes

- ✅ **PrintableInvoice**: Now shows all service line items correctly
- ✅ **Service Display**: Charge descriptions, amounts, VAT, and totals
- ✅ **Multi-Currency**: Proper currency formatting (USD/RWF)
- ✅ **VAT Calculations**: Displays VAT percentages and amounts
- ✅ **Professional Format**: Complete invoice with all service details

## Testing Steps

1. **Navigate to Invoices page**
2. **Find an existing invoice** with services (like the ones in your screenshots)
3. **Click "Print" button** on any invoice
4. **Verify line items** now display in the charges table:
   - Service names under "Charge Description"
   - Amounts and currencies
   - VAT percentages and amounts
   - Proper totals calculation

## Expected Results

The PrintableInvoice should now display:

**Instead of:**

```
┌─────────────────────────────────────────────┐
│ No line items found for this invoice        │
└─────────────────────────────────────────────┘
```

**You should see:**

```
┌─────────────────────────┬──────────────┬──────────────┬──────────┬─────────────┬──────────────┐
│ Charge Description      │ Based On     │ Rate & Curr  │ Amount   │ Tax %       │ Billing      │
│                        │ Qty & UOM    │ Ex Rate      │          │ Tax Amount  │ Amount (RWF) │
├─────────────────────────┼──────────────┼──────────────┼──────────┼─────────────┼──────────────┤
│ Delivery Charges       │ Service      │ 50000.00 RWF │ 50,000   │             │ 50,000.00    │
│                        │ 1            │ 1.00         │          │             │              │
├─────────────────────────┼──────────────┼──────────────┼──────────┼─────────────┼──────────────┤
│ Handling Fee           │ Service      │ 15000.00 RWF │ 15,000   │ VAT @ 18.00%│ 17,700.00    │
│                        │ 1            │ 1.00         │          │ 2,700       │              │
└─────────────────────────┴──────────────┴──────────────┴──────────┴─────────────┴──────────────┘
```

## Database Verification

The database query showed that line items were being saved correctly:

```
Invoice INV-1759326222989-VDDTB:
  Client: The Apostolic Nunciature in Rwanda
  Line Items: 2
    - Delivery Charges: RWF 50000
    - Handling Fee: RWF 15000
```

## Summary

This was a backend API issue where the invoice list endpoint wasn't including the line items data. The fix ensures that when invoices are fetched for display, they include all their associated line items, allowing the PrintableInvoice component to render them correctly.

The service creation functionality was working perfectly - the issue was purely in the data retrieval for display purposes.
