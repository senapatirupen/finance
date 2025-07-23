import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../model/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'http://localhost:3000/expenses';
  private defaultInflationRates: {[key: string]: number} = {
    'Housing': 5,
    'Food': 6,
    'Transportation': 7,
    'Healthcare': 8,
    'Entertainment': 4,
    'Utilities': 5,
    'Other': 5
  };

  constructor(private http: HttpClient) { }

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }

  getExpensesByMonth(year: number, month: number): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}?date_gte=${year}-${month}-01&date_lte=${year}-${month}-31`);
  }

  addExpense(expense: Expense): Observable<Expense> {
    // Set default inflation rate if not provided
    if (!expense.inflationRate) {
      expense.inflationRate = this.defaultInflationRates[expense.category] || 5;
    }
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  updateExpense(id: number, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTotalExpenses(expenses: Expense[]): number {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  calculateFutureValue(currentAmount: number, years: number, inflationRate: number): number {
    return currentAmount * Math.pow(1 + (inflationRate / 100), years);
  }

  getCategoryTotals(expenses: Expense[]): {category: string, amount: number, inflationRate: number}[] {
    const categories: {[key: string]: {amount: number, inflationRate: number}} = {};
    
    expenses.forEach(expense => {
      if (!categories[expense.category]) {
        categories[expense.category] = {
          amount: 0,
          inflationRate: expense.inflationRate || this.defaultInflationRates[expense.category] || 5
        };
      }
      categories[expense.category].amount += expense.amount;
    });

    return Object.keys(categories).map(category => ({
      category,
      amount: categories[category].amount,
      inflationRate: categories[category].inflationRate
    }));
  }
}