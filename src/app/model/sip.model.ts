export interface SIP {
    id?: number;
    investmentOnName: string;
    monthlyInvestment: number | null;
    duration: number | null;
    expectedReturn: number | null;
    futureValue: number | null;
    totalInvestment: number | null;
    totalInterestPaid: number | null;
}