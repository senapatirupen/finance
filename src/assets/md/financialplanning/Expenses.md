To create a similar design for managing expenses, we can adapt the structure used for income sources. The logic will be similar, but instead of calculating the growth of income, we will focus on the accumulation and categorization of expenses over time.

### TypeScript Logic

**expenses-calculator.component.ts**:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-expenses-calculator',
  templateUrl: './expenses-calculator.component.html',
  styleUrls: ['./expenses-calculator.component.css']
})
export class ExpensesCalculatorComponent {
  expenses: any[] = [];
  totalInitialExpenses: number | null = null;
  totalProjectedExpenses: number | null = null;
  totalAmountSpent: number | null = null;

  addExpense() {
    this.expenses.push({
      expenseName: '',
      initialMonthlyExpense: null,
      annualGrowthRate: null,
      years: null,
      projectedMonthlyExpense: null,
      totalAmountSpent: null
    });
  }

  removeExpense(index: number) {
    this.expenses.splice(index, 1);
    this.calculateTotalExpenses();
  }

  calculateExpenseDetails(expense) {
    if (expense.initialMonthlyExpense && expense.annualGrowthRate && expense.years) {
      expense.projectedMonthlyExpense = expense.initialMonthlyExpense * Math.pow(1 + expense.annualGrowthRate / 100, expense.years);
      expense.totalAmountSpent = 0;
      let monthlyExpense = expense.initialMonthlyExpense;
      for (let i = 0; i < expense.years; i++) {
        expense.totalAmountSpent += monthlyExpense * 12;
        monthlyExpense *= 1 + expense.annualGrowthRate / 100;
      }
    }
  }

  calculateTotalExpenses() {
    this.totalInitialExpenses = 0;
    this.totalProjectedExpenses = 0;
    this.totalAmountSpent = 0;

    this.expenses.forEach(expense => {
      this.calculateExpenseDetails(expense);
      this.totalInitialExpenses += expense.initialMonthlyExpense * 12;
      this.totalProjectedExpenses += expense.projectedMonthlyExpense * 12;
      this.totalAmountSpent += expense.totalAmountSpent;
    });
  }
}
```

### HTML Template

**expenses-calculator.component.html**:
```html
<div class="container mt-5">
  <h2 class="text-center mb-4">Expenses Calculator</h2>
  <form (ngSubmit)="calculateTotalExpenses()">
    <div *ngFor="let expense of expenses; let i = index" class="expense-input">
      <h4>Expense {{ i + 1 }}</h4>
      <div class="form-group">
        <label for="expenseName{{i}}">Expense Name:</label>
        <input type="text" class="form-control" id="expenseName{{i}}" name="expenseName{{i}}" [(ngModel)]="expense.expenseName" required>
      </div>
      <div class="form-group">
        <label for="initialMonthlyExpense{{i}}">Initial Monthly Expense (INR):</label>
        <input type="number" class="form-control" id="initialMonthlyExpense{{i}}" name="initialMonthlyExpense{{i}}" [(ngModel)]="expense.initialMonthlyExpense" required>
      </div>
      <div class="form-group">
        <label for="annualGrowthRate{{i}}">Annual Growth Rate (%):</label>
        <input type="number" class="form-control" id="annualGrowthRate{{i}}" name="annualGrowthRate{{i}}" [(ngModel)]="expense.annualGrowthRate" required>
      </div>
      <div class="form-group">
        <label for="years{{i}}">Number of Years:</label>
        <input type="number" class="form-control" id="years{{i}}" name="years{{i}}" [(ngModel)]="expense.years" required>
      </div>
      <div class="expense-summary">
        <p>Projected Monthly Expense: {{ expense.projectedMonthlyExpense | currency:'INR':true:'1.0-2' }}</p>
        <p>Total Amount Spent: {{ expense.totalAmountSpent | currency:'INR':true:'1.0-2' }}</p>
      </div>
      <button type="button" class="btn btn-danger" (click)="removeExpense(i)">Remove Expense</button>
      <hr>
    </div>
    <button type="button" class="btn btn-primary btn-block" (click)="addExpense()">Add Expense</button>
    <button type="submit" class="btn btn-success btn-block mt-3">Calculate Total Expenses</button>
  </form>
  <div *ngIf="totalProjectedExpenses !== null" class="mt-4">
    <h4>Total Initial Expenses (Annually): {{ totalInitialExpenses | currency:'INR':true:'1.0-2' }}</h4>
    <h4>Total Projected Expenses (Annually): {{ totalProjectedExpenses | currency:'INR':true:'1.0-2' }}</h4>
    <h4>Total Amount Spent: {{ totalAmountSpent | currency:'INR':true:'1.0-2' }}</h4>
  </div>
</div>
```

### Explanation

1. **TypeScript Logic**:
    - `initialMonthlyExpense` is the initial monthly expense.
    - `projectedMonthlyExpense` is the projected monthly expense after the specified number of years, accounting for annual growth.
    - `totalAmountSpent` is the total amount spent over the specified number of years, calculated using a loop to account for the annual growth.
    - `calculateExpenseDetails` method calculates the projected monthly expense and total amount spent.
    - `calculateTotalExpenses` method sums the initial annual expense, projected annual expense, and total amount spent for all expenses.

2. **HTML Template**:
    - Inputs for `initialMonthlyExpense`, `annualGrowthRate`, and `years` for each expense.
    - Displays the projected monthly expense and total amount spent for each expense.
    - Displays the total initial annual expenses, total projected annual expenses, and total amount spent for all expenses.

This setup provides a detailed view of the projected growth of expenses and the cumulative total amount spent over the specified period, similar to how the income sources were managed.