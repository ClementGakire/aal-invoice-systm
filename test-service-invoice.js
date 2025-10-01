// Test script to verify service invoice functionality
console.log('🧪 Testing Service Invoice Functionality');

// Test number to words conversion
function testNumberToWords() {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];
  const thousands = ['', 'Thousand', 'Million', 'Billion'];

  function convertHundreds(num) {
    let result = '';
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)];
      if (num % 10 !== 0) result += '-' + ones[num % 10];
    } else if (num > 0) {
      result += ones[num];
    }
    return result.trim();
  }

  function convertNumber(num) {
    if (num === 0) return '';

    let result = '';
    let thousandIndex = 0;

    while (num > 0) {
      const chunk = num % 1000;
      if (chunk !== 0) {
        const chunkText = convertHundreds(chunk);
        result =
          chunkText +
          (thousands[thousandIndex] ? ' ' + thousands[thousandIndex] : '') +
          (result ? ' ' + result : '');
      }
      num = Math.floor(num / 1000);
      thousandIndex++;
    }

    return result.trim();
  }

  function numberToWords(amount, currency) {
    if (amount === 0) return `Zero ${currency}`;

    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 100);

    const integerWords = convertNumber(integerPart);
    const currencyName =
      currency === 'USD' ? 'Dollars' : currency === 'RWF' ? 'Francs' : currency;
    const centName =
      currency === 'USD' ? 'Cents' : currency === 'RWF' ? 'Centimes' : 'Cents';

    let result = `${integerWords} ${currencyName}`;
    if (decimalPart > 0) {
      const decimalWords = convertNumber(decimalPart);
      result += ` And ${decimalWords} ${centName}`;
    }

    return result;
  }

  // Test cases
  const testCases = [
    {
      amount: 251100,
      currency: 'RWF',
      expected: 'Two Hundred Fifty-One Thousand One Hundred Francs',
    },
    {
      amount: 233100.18,
      currency: 'RWF',
      expected:
        'Two Hundred Thirty-Three Thousand One Hundred Francs And Eighteen Centimes',
    },
    {
      amount: 2500.5,
      currency: 'USD',
      expected: 'Two Thousand Five Hundred Dollars And Fifty Cents',
    },
    { amount: 100, currency: 'USD', expected: 'One Hundred Dollars' },
    { amount: 0, currency: 'USD', expected: 'Zero USD' },
  ];

  console.log('\n💰 Testing Number to Words Conversion:');
  testCases.forEach((test, index) => {
    const result = numberToWords(test.amount, test.currency);
    console.log(`Test ${index + 1}:`);
    console.log(`  Input: ${test.amount} ${test.currency}`);
    console.log(`  Result: ${result}`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  ✅ ${result === test.expected ? 'PASS' : 'FAIL'}`);
    console.log('');
  });
}

// Test VAT calculations
function testVatCalculations() {
  console.log('\n🧾 Testing VAT Calculations:');

  const testServices = [
    { name: 'Agency Fees', amount: 100000, vatEnabled: true, vatPercent: 18 },
    {
      name: 'Delivery Charges',
      amount: 50000,
      vatEnabled: false,
      vatPercent: 0,
    },
    { name: 'Air Freight', amount: 2500, vatEnabled: true, vatPercent: 18 },
  ];

  testServices.forEach((service, index) => {
    const vatAmount = service.vatEnabled
      ? (service.amount * service.vatPercent) / 100
      : 0;
    const totalAmount = service.amount + vatAmount;

    console.log(`Service ${index + 1}: ${service.name}`);
    console.log(`  Base Amount: ${service.amount.toLocaleString()}`);
    console.log(
      `  VAT (${service.vatPercent}%): ${vatAmount.toLocaleString()}`
    );
    console.log(`  Total: ${totalAmount.toLocaleString()}`);
    console.log('');
  });
}

// Test multi-currency totals
function testMultiCurrencyTotals() {
  console.log('\n💱 Testing Multi-Currency Totals:');

  const services = [
    { currency: 'RWF', amount: 53100, vatAmount: 0 },
    { currency: 'RWF', amount: 100000, vatAmount: 18000 },
    { currency: 'RWF', amount: 50000, vatAmount: 0 },
    { currency: 'USD', amount: 2500, vatAmount: 450 },
    { currency: 'USD', amount: 150, vatAmount: 0 },
  ];

  const usdServices = services.filter((s) => s.currency === 'USD');
  const rwfServices = services.filter((s) => s.currency === 'RWF');

  const usdSubTotal = usdServices.reduce((sum, s) => sum + s.amount, 0);
  const usdVatTotal = usdServices.reduce((sum, s) => sum + s.vatAmount, 0);
  const usdTotal = usdSubTotal + usdVatTotal;

  const rwfSubTotal = rwfServices.reduce((sum, s) => sum + s.amount, 0);
  const rwfVatTotal = rwfServices.reduce((sum, s) => sum + s.vatAmount, 0);
  const rwfTotal = rwfSubTotal + rwfVatTotal;

  console.log('USD Summary:');
  console.log(`  Subtotal: $${usdSubTotal.toFixed(2)}`);
  console.log(`  VAT: $${usdVatTotal.toFixed(2)}`);
  console.log(`  Total: $${usdTotal.toFixed(2)}`);
  console.log('');

  console.log('RWF Summary:');
  console.log(`  Subtotal: RWF ${rwfSubTotal.toLocaleString()}`);
  console.log(`  VAT: RWF ${rwfVatTotal.toLocaleString()}`);
  console.log(`  Total: RWF ${rwfTotal.toLocaleString()}`);
}

// Run all tests
testNumberToWords();
testVatCalculations();
testMultiCurrencyTotals();

console.log('\n🎉 All tests completed!');
