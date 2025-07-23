export interface Investment {
    id: string;
    name: string;
    type: 'SIP' | 'Lumpsum';
    assetClass: 'Equity' | 'Debt' | 'Gold' | 'Real Estate' | 'FD' | 'NPS' | 'Liquid Fund';
    amount: number;
    startDate: Date;
    durationYears: number;
    cagr: number;
    frequency?: 'Monthly' | 'Quarterly' | 'Yearly'; // For SIP only
    transactions?: Transaction[];
  }
  
  export interface Transaction {
    date: Date;
    amount: number;
    type: 'Investment' | 'Withdrawal';
  }