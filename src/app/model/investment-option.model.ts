export interface InvestmentOption {
    id?: number;
    name: string;
    category: 'equity' | 'fixed-income' | 'real-estate' | 'commodities' | 'alternative';
    minCAGR: number;
    maxCAGR: number;
    riskLevel: 'low' | 'medium' | 'high' | 'very-high';
    liquidity: 'high' | 'medium' | 'low';
    taxEfficiency?: string;
    notes?: string;
  }