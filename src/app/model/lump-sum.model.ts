export interface LumpSum {
    id?: number;
    investmentName: string;
    principalAmount: number | null;
    duration: number | null;
    expectedReturn: number | null;
    futureValue: number | null;
    totalInterest: number | null;
}