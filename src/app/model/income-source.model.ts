export interface IncomeSource {
    id?: number;
    sourceName: string;
    initialMonthlyIncome: number | null;
    annualGrowthRate: number | null;
    years: number | null;
    projectedMonthlyIncome: number | null;
    totalAmountReceived: number | null;
  }