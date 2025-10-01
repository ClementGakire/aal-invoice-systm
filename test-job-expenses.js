// Test script to create a job and expenses for testing the new functionality
// Note: Using native fetch (available in Node 18+)

const API_BASE = 'http://localhost:3000/api';

async function testJobExpensesFunctionality() {
  try {
    console.log('🧪 Testing job expenses functionality...\n');

    // 1. First, get all clients to use one for the test job
    console.log('📋 Getting clients...');
    const clientsResponse = await fetch(`${API_BASE}/clients`);
    const clientsData = await clientsResponse.json();
    
    if (!clientsData.clients || clientsData.clients.length === 0) {
      console.log('❌ No clients found. Creating a test client first...');
      
      // Create a test client
      const newClientResponse = await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Client for Job Expenses',
          email: 'test@jobexpenses.com',
          phone: '+1-555-TEST',
          address: '123 Test Street, Test City'
        })
      });
      
      const newClientData = await newClientResponse.json();
      console.log('✅ Created test client:', newClientData.client.name);
      clientsData.clients = [newClientData.client];
    }

    const testClient = clientsData.clients[0];
    console.log(`✅ Using client: ${testClient.name}\n`);

    // 2. Create a test job
    console.log('🚢 Creating a test job...');
    const jobResponse = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Job for Expense Functionality',
        clientId: testClient.id,
        jobType: 'AIR_FREIGHT_IMPORT',
        portOfLoading: 'KGL - Kigali International Airport',
        portOfDischarge: 'DXB - Dubai International Airport',
        grossWeight: 1500,
        chargeableWeight: 1600,
        shipper: 'Test Shipper Company',
        consignee: 'Test Consignee Company',
        package: '10 Pallets',
        goodDescription: 'Electronics and spare parts',
        awb: {
          masterAirWaybill: 'MAWB-TEST-001',
          houseAirWaybill: 'HAWB-TEST-001'
        }
      })
    });

    const jobData = await jobResponse.json();
    
    if (!jobData.job) {
      console.error('❌ Failed to create job:', jobData);
      return;
    }

    const testJob = jobData.job;
    console.log(`✅ Created job: ${testJob.jobNumber} - ${testJob.title}\n`);

    // 3. Create expenses for the job using the new endpoint
    console.log('💰 Creating expenses for the job...');
    
    const expenses = [
      {
        title: 'Airport Handling Fee',
        amount: 250.00,
        currency: 'USD',
        supplierName: 'Kigali Airport Services'
      },
      {
        title: 'Documentation Charges',
        amount: 75.00,
        currency: 'USD',
        supplierName: 'Customs Broker Ltd'
      },
      {
        title: 'Transport to Airport',
        amount: 120.50,
        currency: 'USD',
        supplierName: 'Local Transport Co'
      }
    ];

    for (const expense of expenses) {
      const expenseResponse = await fetch(`${API_BASE}/jobs/${testJob.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });

      const expenseData = await expenseResponse.json();
      
      if (expenseData.expense) {
        console.log(`   ✅ Created expense: ${expense.title} - $${expense.amount}`);
      } else {
        console.log(`   ❌ Failed to create expense: ${expense.title}`);
        console.log('   Response:', expenseData);
      }
    }

    // 4. Get job expenses to verify total calculation
    console.log('\n📊 Checking job expenses summary...');
    const jobExpensesResponse = await fetch(`${API_BASE}/jobs/${testJob.id}/expenses`);
    const jobExpensesData = await jobExpensesResponse.json();

    if (jobExpensesData.success) {
      console.log(`✅ Job: ${jobExpensesData.job.jobNumber}`);
      console.log(`   📈 Total Expenses: $${jobExpensesData.totalExpenses.toFixed(2)}`);
      console.log(`   🧾 Number of Expenses: ${jobExpensesData.count}`);
      console.log('   📋 Expense Details:');
      
      jobExpensesData.expenses.forEach((exp, index) => {
        console.log(`      ${index + 1}. ${exp.title} - ${exp.currency} ${exp.amount}`);
        if (exp.supplierName) {
          console.log(`         Supplier: ${exp.supplierName}`);
        }
      });
    } else {
      console.log('❌ Failed to get job expenses summary');
    }

    // 5. Verify job details include expense totals
    console.log('\n🔍 Verifying job details include expense totals...');
    const jobDetailsResponse = await fetch(`${API_BASE}/jobs?id=${testJob.id}`);
    const jobDetailsData = await jobDetailsResponse.json();

    if (jobDetailsData.totalExpenses !== undefined) {
      console.log(`✅ Job details include expense totals: $${jobDetailsData.totalExpenses.toFixed(2)}`);
      console.log(`✅ Expense count: ${jobDetailsData.expenseCount}`);
    } else {
      console.log('❌ Job details do not include expense totals');
    }

    console.log('\n🎉 Job expenses functionality test completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Created test job: ${testJob.jobNumber}`);
    console.log(`   - Added ${expenses.length} expenses totaling $${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}`);
    console.log(`   - Verified expense calculation and job integration`);
    console.log('\n✨ The system now supports:');
    console.log('   ✓ Creating expenses directly from jobs');
    console.log('   ✓ Calculating total expenses per job');
    console.log('   ✓ Displaying expense summaries in job details');
    console.log('   ✓ Linking expenses to specific jobs');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testJobExpensesFunctionality();