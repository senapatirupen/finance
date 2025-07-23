export interface EMI {
    id?: number;
    emiForName: string;
    principal: number | null;
    annualInterestRate: number | null;
    totalTenure: number | null;
    tenuresPaid: number;
    emiAmount: number | null;
    principalPaidSoFar: number | null;
    interestPaidSoFar: number | null;
    remainingPrincipal: number | null;
    interestToBePaid: number | null;
    remainingTenure: number | null;
  }