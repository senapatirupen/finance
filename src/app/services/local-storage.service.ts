import { Injectable } from '@angular/core';
import { Loan } from '../model/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly STORAGE_KEY = 'loan-manager-data';

  getLoans(): Loan[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveLoans(loans: Loan[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loans));
  }

  addLoan(loan: Loan): void {
    const loans = this.getLoans();
    loans.push(loan);
    this.saveLoans(loans);
  }

  updateLoan(updatedLoan: Loan): void {
    const loans = this.getLoans();
    const index = loans.findIndex(l => l.id === updatedLoan.id);
    if (index !== -1) {
      loans[index] = updatedLoan;
      this.saveLoans(loans);
    }
  }

  deleteLoan(id: string): void {
    const loans = this.getLoans().filter(loan => loan.id !== id);
    this.saveLoans(loans);
  }
}