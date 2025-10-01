# Service-Based Invoice Creation

This document explains how to use the new service-based invoice creation feature that allows you to create invoices with multiple services, each with individual VAT settings and currency options.

## Features

### 🎯 Core Functionality
- **Multiple Services**: Add one or many services to a single invoice
- **Service Selection**: Choose from pre-defined services in your database
- **Manual Amount Override**: Set custom amounts for each service, independent of the service's default price
- **VAT Control**: Individual VAT toggle for each service (Yes/No radio buttons)
- **Multi-Currency Support**: Mix USD and RWF services in the same invoice
- **Automatic Calculations**: Real-time VAT and total calculations
- **Amount in Words**: Automatic conversion of total amounts to written format

### 💰 Supported Services
The system comes pre-loaded with common logistics services:

**RWF Services:**
- Customs Warehouse Rent (RWF 53,100)
- Agency Fees (RWF 100,000) - VAT enabled
- Delivery Charges (RWF 50,000)
- Consolidation Fee (RWF 30,000)
- Storage Fee (RWF 25,000)
- Handling Fee (RWF 15,000) - VAT enabled

**USD Services:**
- Air Freight Import ($2,500) - VAT enabled
- Sea Freight Import ($1,800) - VAT enabled
- Road Freight ($800)
- Documentation Fee ($150)

## How to Use

### 1. Access the Feature
1. Navigate to the **Invoices** page
2. Click the **"Invoice with Services"** button (green button)
3. The service invoice creation form will open

### 2. Basic Invoice Information
Fill in the required invoice details:
- **Client**: Select from existing clients (required)
- **Invoice Date**: Set the invoice date (required)
- **Due Date**: Optional payment due date
- **Remarks**: Additional notes or comments

### 3. Adding Services

#### Add a Service Line
1. Click **"Add Service"** to create a new service line
2. Each service line includes:
   - **Service Selection**: Dropdown of available services
   - **Amount**: Manual amount input (auto-filled from service price)
   - **Currency**: USD or RWF selection
   - **VAT Options**: Radio buttons for "No VAT" or "VAT"

#### Configure VAT
When VAT is enabled for a service:
- **VAT Rate**: Adjustable percentage (default: 18%)
- **VAT Amount**: Automatically calculated
- **Total Amount**: Base amount + VAT amount

#### Multiple Services
- Add as many services as needed
- Remove services with the trash icon
- Each service calculates independently

### 4. Totals Summary
The system provides real-time calculation summaries:

**USD Services:**
- Subtotal: Sum of all USD service amounts
- VAT: Total VAT for USD services
- Total: USD subtotal + USD VAT

**RWF Services:**
- Subtotal: Sum of all RWF service amounts  
- VAT: Total VAT for RWF services
- Total: RWF subtotal + RWF VAT

### 5. Create Invoice
1. Ensure at least one service is added
2. Click **"Create Invoice"**
3. The invoice will be created with all line items
4. Amount in words is automatically generated

## Example Usage

### Recreating the Sample Invoice
Based on the provided invoice image, here's how to recreate it:

1. **Add Customs Warehouse Rent**
   - Service: Customs Warehouse Rent
   - Amount: 53,100
   - Currency: RWF
   - VAT: No VAT

2. **Add Agency Fees**
   - Service: Agency Fees  
   - Amount: 100,000
   - Currency: RWF
   - VAT: VAT @ 18% (18,000 RWF)

3. **Add Delivery Charges**
   - Service: Delivery Charges
   - Amount: 50,000
   - Currency: RWF
   - VAT: No VAT

4. **Add Consolidation Fee**
   - Service: Consolidation Fee
   - Amount: 30,000
   - Currency: RWF
   - VAT: No VAT

**Result:**
- Subtotal: RWF 233,100
- VAT: RWF 18,000
- **Total: RWF 251,100**
- Amount in Words: "Two Hundred Fifty-One Thousand One Hundred Francs"

## Technical Details

### Database Schema
The feature leverages the existing database structure:
- `ServiceItem` table for service definitions
- `Invoice` table for invoice headers
- `InvoiceLineItem` table for individual service entries

### API Integration
- Uses existing `/api/services` endpoint
- Creates invoices via `/api/invoices` with line items
- Supports batch creation of line items

### Validation
- Client selection is required
- At least one service must be added
- Amount validation (positive numbers)
- VAT percentage validation

## Benefits

1. **Flexibility**: Mix different services, currencies, and VAT settings
2. **Accuracy**: Automatic calculations reduce manual errors
3. **Professional**: Generates properly formatted invoices
4. **Compliance**: Proper VAT handling for tax requirements
5. **Efficiency**: Pre-defined services speed up invoice creation
6. **Multilingual**: Amount in words supports both English and local currency terms

## Future Enhancements

Potential improvements for future versions:
- Service templates for common combinations
- Bulk service addition
- Service pricing tiers
- Custom service creation from invoice form
- Exchange rate integration for mixed currencies
- PDF generation with service breakdown