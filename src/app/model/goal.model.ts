export interface Goal {
    id?: number;
    name: string;
    category: 'short-term' | 'medium-term' | 'long-term' | 'retirement';
    duration: number | null; // in years
    targetAmount: number | null;
    notes?: string;
    inflationAdjustedAmount?: number | null;
  }