// Utility functions for the tax report app

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Function to bucket exact income for AI processing
export function bucketIncome(exactIncome: number): string {
  if (exactIncome < 75000) return 'Under $75,000';
  if (exactIncome < 150000) return '$75,000 - $150,000';
  if (exactIncome < 250000) return '$150,000 - $250,000';
  if (exactIncome < 400000) return '$250,000 - $400,000';
  if (exactIncome < 750000) return '$400,000 - $750,000';
  return '$750,000+';
}

// Function to bucket business profit for AI processing
export function bucketBusinessProfit(exactProfit: number): string {
  if (exactProfit < 30000) return 'Under $30,000';
  if (exactProfit < 60000) return '$30,000 - $60,000';
  if (exactProfit < 100000) return '$60,000 - $100,000';
  if (exactProfit < 200000) return '$100,000 - $200,000';
  return '$200,000+';
}

// Function to validate income input
export function validateIncome(input: string): number | null {
  const num = parseInt(input.replace(/[^0-9]/g, ''));
  return (num >= 1000 && num <= 10000000) ? num : null;
}

export function calculateFederalTaxRate(income: number | string): number {
  const incomeRanges = [
    { max: 75000, rate: 22 },
    { max: 150000, rate: 24 },
    { max: 250000, rate: 32 },
    { max: 400000, rate: 35 },
    { max: 750000, rate: 37 },
    { max: Infinity, rate: 37 },
  ]

  let incomeNum: number;
  if (typeof income === 'string') {
    incomeNum = parseInt(income.replace(/[^0-9]/g, ''));
  } else {
    incomeNum = income;
  }

  for (const range of incomeRanges) {
    if (incomeNum <= range.max) {
      return range.rate
    }
  }

  return 37 // Default
}

export function getStateTaxRate(state: string, stateTaxRates: Record<string, number>): number {
  return stateTaxRates[state] || 5 // Default to 5% if state not found
}