export interface UserProfile {
    id?: string;
    age: number;
    salary: number;
    monthlyExpenses: number;
    badLoans: number;
    goodLoans: number;
    totalAssets: number;
    futureGoals: {
        retirementAge: number;
        housePurchase: number;
        childrenEducation: number;
        otherGoals: number;
    };
    riskAppetite: 'Low' | 'Medium' | 'High';
    createdAt?: string;
}

export interface InvestmentRecommendation {
    id?: string;
    userId: string;
    recommendations: {
        assetClass: string;
        percentage: number;
        products: string[];
        rationale: string;
    }[];
    createdAt?: string;
}