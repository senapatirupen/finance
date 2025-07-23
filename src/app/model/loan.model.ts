export interface Loan {
    id: string;
    name: string;
    principal: number;
    interestRate: number;
    tenureMonths: number;
    startDate: Date;
    payments: Payment[];
}

export interface Payment {
    date: Date;
    amount: number;
    isExtraPayment?: boolean;
}