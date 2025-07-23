import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Loan, Payment } from '../model/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private loans: Loan[] = [];
  private loansSubject = new BehaviorSubject<Loan[]>([]);
  
  loans$ = this.loansSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // Sample data or load from localStorage/API
    this.loans = [
      {
        id: '1',
        name: 'Home Loan',
        principal: 5000000,
        interestRate: 8.5,
        tenureMonths: 240,
        startDate: new Date(2020, 0, 1),
        payments: [
          { date: new Date(2020, 1, 1), amount: 43438 },
          { date: new Date(2020, 2, 1), amount: 43438 }
        ]
      }
    ];
    this.loansSubject.next([...this.loans]);
  }

  calculateEmi(principal: number, rate: number, tenure: number): number {
    const monthlyRate = rate / 1200;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
           (Math.pow(1 + monthlyRate, tenure) - 1);
  }

  calculateLoanAnalytics(loan: Loan): any {
    const emi = this.calculateEmi(loan.principal, loan.interestRate, loan.tenureMonths);
    let remainingPrincipal = loan.principal;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    const paymentsMade = loan.payments.length;
    
    // Calculate paid amounts
    loan.payments.forEach(payment => {
      const interest = remainingPrincipal * (loan.interestRate / 1200);
      const principal = payment.amount - interest;
      totalInterestPaid += interest;
      totalPrincipalPaid += principal;
      remainingPrincipal -= principal;
    });
    
    // Calculate future projections
    let futureInterest = 0;
    let tempPrincipal = remainingPrincipal;
    const remainingMonths = loan.tenureMonths - paymentsMade;
    
    for (let i = 0; i < remainingMonths; i++) {
      const interest = tempPrincipal * (loan.interestRate / 1200);
      const principal = emi - interest;
      futureInterest += interest;
      tempPrincipal -= principal;
    }
    
    return {
      emi,
      totalInterestPaid,
      totalPrincipalPaid,
      remainingPrincipal,
      futureInterest,
      totalInterest: totalInterestPaid + futureInterest,
      totalPayable: loan.principal + totalInterestPaid + futureInterest
    };
  }

  calculateSummary(): any {
    let totalInterestPaid = 0;
    let totalFutureInterest = 0;
    let totalPrincipalPaid = 0;
    let totalRemainingPrincipal = 0;
    
    this.loans.forEach(loan => {
      const analytics = this.calculateLoanAnalytics(loan);
      totalInterestPaid += analytics.totalInterestPaid;
      totalFutureInterest += analytics.futureInterest;
      totalPrincipalPaid += analytics.totalPrincipalPaid;
      totalRemainingPrincipal += analytics.remainingPrincipal;
    });
    
    return {
      totalInterestPaid,
      totalFutureInterest,
      totalPrincipalPaid,
      totalRemainingPrincipal,
      totalInterest: totalInterestPaid + totalFutureInterest
    };
  }

  addLoan(loan: Loan): void {
    this.loans.push(loan);
    this.loansSubject.next([...this.loans]);
  }

  updateLoan(updatedLoan: Loan): void {
    const index = this.loans.findIndex(l => l.id === updatedLoan.id);
    if (index !== -1) {
      this.loans[index] = updatedLoan;
      this.loansSubject.next([...this.loans]);
    }
  }

  deleteLoan(id: string): void {
    this.loans = this.loans.filter(loan => loan.id !== id);
    this.loansSubject.next([...this.loans]);
  }

  addPayment(loanId: string, payment: Payment): void {
    const loan = this.loans.find(l => l.id === loanId);
    if (loan) {
      loan.payments.push(payment);
      this.loansSubject.next([...this.loans]);
    }
  }
}