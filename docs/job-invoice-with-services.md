# Create Invoice from Job with Services

## Updated Feature Implementation

The "Create from Job" button now integrates service selection functionality, allowing users to create invoices from jobs while adding multiple services with individual VAT and currency settings.

## How to Use

### 1. Access the Feature

1. Navigate to the **Invoices** page
2. Click the **"Create from Job"** button (blue button with package icon)
3. The enhanced job-to-invoice creation modal will open

### 2. Select Job and Basic Details

- **Job Selection**: Choose from available jobs (displays job number, client, and job type)
- **Invoice Number**: Enter a unique invoice number
- **Due Date**: Optional payment due date
- **Job Type**: Automatically displayed based on selected job

### 3. Add Services

- Click **"Add Service"** to add service line items
- Each service can be configured with:
  - **Service Selection**: Choose from predefined services
  - **Amount**: Manual amount entry (auto-filled from service)
  - **Currency**: USD or RWF
  - **VAT**: Radio buttons for Yes/No

### 4. Service Configuration

- **VAT Enabled Services** show:
  - VAT Rate (%) - adjustable, defaults to 18%
  - VAT Amount - automatically calculated
  - Total Amount - base + VAT
- **Non-VAT Services** show simple total

### 5. Review and Create

- **Totals Summary**: Real-time calculations for USD and RWF separately
- **Remarks**: Optional additional notes
- **Create Invoice**: Links the invoice to the selected job

## Key Benefits

### 🔗 **Job Integration**

- Invoice automatically linked to the selected job
- Job information (client, job number, booking number) auto-populated
- Job type displayed for context

### 💰 **Service Flexibility**

- Mix multiple services in one invoice
- Individual VAT control per service
- Multi-currency support (USD/RWF)
- Manual amount override capability

### 📊 **Professional Output**

- Proper line item breakdown
- Accurate VAT calculations
- Amount in words generation
- Job reference numbers included

## Example Workflow

### Creating Invoice for Sea Freight Job with Multiple Services

1. **Select Job**: "SFI-2024-001 - ABC Company (Sea Freight Import)"
2. **Add Services**:

   - Customs Warehouse Rent: RWF 53,100 (No VAT)
   - Agency Fees: RWF 100,000 (VAT @ 18%)
   - Delivery Charges: RWF 50,000 (No VAT)
   - Sea Freight Import: USD 1,800 (VAT @ 18%)

3. **Review Totals**:

   - **USD**: Subtotal $1,800 + VAT $324 = **Total $2,124**
   - **RWF**: Subtotal 203,100 + VAT 18,000 = **Total 221,100**

4. **Result**: Invoice created with job reference and 4 service line items

## Technical Implementation

### Enhanced Components

- **CreateInvoiceFromJobButton**: Expanded to include service management
- **ServiceLineItemForm**: Reusable service configuration component
- **TotalsSummary**: Multi-currency totals display

### Data Flow

1. Job selection populates client and job details
2. Service selection adds line items with VAT calculations
3. Invoice creation includes job linkage and service breakdown
4. Amount in words generated for main currency

### Database Integration

- Invoice linked to job via `jobId`
- Job number and booking number stored
- Service line items stored with VAT details
- Multi-currency totals calculated

## Validation Rules

- Job selection required
- Invoice number required
- At least one service must be added
- Amount must be positive numbers
- VAT percentage validation

This enhanced feature provides the perfect bridge between job management and invoicing, ensuring accurate billing with detailed service breakdowns while maintaining job traceability.
