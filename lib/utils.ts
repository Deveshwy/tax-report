// Utility functions for the tax report app

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateFederalTaxRate(income: string): number {
  const incomeRanges = [
    { max: 75000, rate: 22 },
    { max: 150000, rate: 24 },
    { max: 250000, rate: 32 },
    { max: 400000, rate: 35 },
    { max: 750000, rate: 37 },
    { max: Infinity, rate: 37 },
  ]

  const incomeNum = parseInt(income.replace(/[^0-9]/g, ''))

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