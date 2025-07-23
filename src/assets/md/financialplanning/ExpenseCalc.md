# Enhanced Expense Calculator with Inflation Projections

Here's a complete rewrite of the expense calculator with inflation projections for each category and summary projections for 5 and 10 years.

## 1. Updated Expense Model (`expense.model.ts`)
```typescript
export interface Expense {
  id?: number;
  category: string;
  amount: number;
  date: string;
  description: string;
  inflationRate?: number; // Category-specific inflation rate
}
```

## 2. Updated Expense Service (`expense.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';

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
```

## 3. Updated Expense List Component (`expense-list.component.ts`)
```typescript
import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss'],
  providers: [DatePipe]
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  totalExpenses = 0;
  categoryTotals: {category: string, amount: number, inflationRate: number}[] = [];
  inflationRate = 6; // Default inflation rate for summary calculations
  summaryProjections = {
    fiveYears: 0,
    tenYears: 0
  };
  categoryProjections: {
    category: string, 
    currentAmount: number,
    fiveYears: number,
    tenYears: number,
    inflationRate: number
  }[] = [];

  constructor(
    private expenseService: ExpenseService,
    private datePipe: DatePipe,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpensesByMonth(this.currentYear, this.currentMonth)
      .subscribe(expenses => {
        this.expenses = expenses;
        this.totalExpenses = this.expenseService.getTotalExpenses(expenses);
        this.categoryTotals = this.expenseService.getCategoryTotals(expenses);
        this.calculateProjections();
      });
  }

  calculateProjections(): void {
    // Calculate summary projections
    this.summaryProjections.fiveYears = this.expenseService.calculateFutureValue(
      this.totalExpenses, 5, this.inflationRate
    );
    this.summaryProjections.tenYears = this.expenseService.calculateFutureValue(
      this.totalExpenses, 10, this.inflationRate
    );

    // Calculate category-wise projections
    this.categoryProjections = this.categoryTotals.map(category => ({
      category: category.category,
      currentAmount: category.amount,
      fiveYears: this.expenseService.calculateFutureValue(
        category.amount, 5, category.inflationRate
      ),
      tenYears: this.expenseService.calculateFutureValue(
        category.amount, 10, category.inflationRate
      ),
      inflationRate: category.inflationRate
    }));
  }

  changeMonth(offset: number): void {
    const date = new Date(this.currentYear, this.currentMonth - 1 + offset, 1);
    this.currentMonth = date.getMonth() + 1;
    this.currentYear = date.getFullYear();
    this.loadExpenses();
  }

  editExpense(expense: Expense): void {
    this.router.navigate(['/planning/expenses/edit', expense.id]);
  }

  deleteExpense(id?: number): void {
    if (id === undefined) return;
    
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe(() => {
        this.loadExpenses();
      });
    }
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'MMM d, y') || '';
  }

  addNewExpense(): void {
    this.router.navigate(['/planning/expenses/new']);
  }

  updateInflationRate(): void {
    this.calculateProjections();
  }
}
```

## 4. Updated Expense List Template (`expense-list.component.html`)
```html
<div class="expense-container">
  <div class="header">
    <button class="btn btn-outline-secondary" routerLink="/planning/dashboard">
      <i class="bi bi-arrow-left"></i> Back to Planning
    </button>
    <div class="month-navigation">
      <button class="btn btn-outline-primary" (click)="changeMonth(-1)">
        <i class="bi bi-chevron-left"></i>
      </button>
      <h3>{{ currentMonth }}/{{ currentYear }}</h3>
      <button class="btn btn-outline-primary" (click)="changeMonth(1)">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
    <button class="btn btn-primary" (click)="addNewExpense()">
      <i class="bi bi-plus"></i> Add Expense
    </button>
  </div>

  <!-- Expense Table -->
  <div class="table-responsive mt-3">
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-end">Amount</th>
          <th>Date</th>
          <th>Description</th>
          <th>Inflation Rate</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let expense of expenses">
          <td>{{ expense.category }}</td>
          <td class="text-end">{{ expense.amount | currency:'INR':'symbol':'1.2-2' }}</td>
          <td>{{ formatDate(expense.date) }}</td>
          <td>{{ expense.description }}</td>
          <td>{{ (expense.inflationRate || 0) }}%</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-2" (click)="editExpense(expense)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" (click)="deleteExpense(expense.id)">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Current Month Summary -->
  <div class="summary-card mt-4">
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Current Month Summary</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <h6>Total Expenses: {{ totalExpenses | currency:'INR':'symbol':'1.2-2' }}</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th class="text-end">Amount</th>
                    <th class="text-end">Inflation Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let category of categoryTotals">
                    <td>{{ category.category }}</td>
                    <td class="text-end">{{ category.amount | currency:'INR':'symbol':'1.2-2' }}</td>
                    <td class="text-end">{{ category.inflationRate }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="col-md-6">
            <div class="inflation-control mb-3">
              <label for="inflationRate" class="form-label">Summary Inflation Rate: {{ inflationRate }}%</label>
              <input type="range" class="form-range" id="inflationRate" 
                     min="0" max="20" step="0.5" [(ngModel)]="inflationRate"
                     (ngModelChange)="updateInflationRate()">
            </div>
            <div class="projection-summary">
              <h6>Future Projections</h6>
              <div class="projection-item">
                <span>After 5 Years:</span>
                <span class="fw-bold">{{ summaryProjections.fiveYears | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="projection-item">
                <span>After 10 Years:</span>
                <span class="fw-bold">{{ summaryProjections.tenYears | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Category-wise Projections -->
  <div class="category-projections mt-4">
    <div class="card">
      <div class="card-header bg-info text-white">
        <h5 class="mb-0">Category-wise Future Projections</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Category</th>
                <th class="text-end">Current</th>
                <th class="text-end">Inflation Rate</th>
                <th class="text-end">5 Years</th>
                <th class="text-end">10 Years</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let proj of categoryProjections">
                <td>{{ proj.category }}</td>
                <td class="text-end">{{ proj.currentAmount | currency:'INR':'symbol':'1.2-2' }}</td>
                <td class="text-end">{{ proj.inflationRate }}%</td>
                <td class="text-end">{{ proj.fiveYears | currency:'INR':'symbol':'1.2-2' }}</td>
                <td class="text-end">{{ proj.tenYears | currency:'INR':'symbol':'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 5. Updated Expense Form Component (`expense-form.component.ts`)
```typescript
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Expense } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  categories = ['Housing', 'Food', 'Transportation', 'Healthcare', 'Entertainment', 'Utilities', 'Other'];
  defaultInflationRates: {[key: string]: number} = {
    'Housing': 5,
    'Food': 6,
    'Transportation': 7,
    'Healthcare': 8,
    'Entertainment': 4,
    'Utilities': 5,
    'Other': 5
  };
  isEditMode = false;
  expenseId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.expenseForm = this.fb.group({
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required],
      description: [''],
      inflationRate: [null]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.expenseId = +params['id'];
        this.loadExpense(this.expenseId);
      }
    });

    // Set default inflation rate when category changes
    this.expenseForm.get('category')?.valueChanges.subscribe(category => {
      if (category && !this.expenseForm.get('inflationRate')?.value) {
        this.expenseForm.get('inflationRate')?.setValue(this.defaultInflationRates[category]);
      }
    });
  }

  loadExpense(id: number): void {
    this.expenseService.getExpenses().subscribe(expenses => {
      const expense = expenses.find(e => e.id === id);
      if (expense) {
        this.expenseForm.patchValue({
          category: expense.category,
          amount: expense.amount,
          date: expense.date,
          description: expense.description,
          inflationRate: expense.inflationRate || this.defaultInflationRates[expense.category] || 5
        });
      }
    });
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const expenseData: Expense = this.expenseForm.value;

      if (this.isEditMode && this.expenseId) {
        this.expenseService.updateExpense(this.expenseId, expenseData)
          .subscribe(() => this.router.navigate(['/planning/expenses']));
      } else {
        this.expenseService.addExpense(expenseData)
          .subscribe(() => this.router.navigate(['/planning/expenses']));
      }
    }
  }

  onCancel(): void {
    this.location.back();
  }
}
```

## 6. Updated Expense Form Template (`expense-form.component.html`)
```html
<div class="expense-form-container">
  <h3>{{ isEditMode ? 'Edit Expense' : 'Add New Expense' }}</h3>
  
  <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">
    <div class="row g-3">
      <div class="col-md-4">
        <label for="category" class="form-label">Category</label>
        <select class="form-control" id="category" formControlName="category" required>
          <option value="" disabled selected>Select a category</option>
          <option *ngFor="let category of categories" [value]="category">
            {{ category }}
          </option>
        </select>
      </div>
      
      <div class="col-md-3">
        <label for="amount" class="form-label">Amount (₹)</label>
        <input type="number" class="form-control" id="amount" 
               formControlName="amount" step="0.01" min="0.01" required>
      </div>
      
      <div class="col-md-3">
        <label for="date" class="form-label">Date</label>
        <input type="date" class="form-control" id="date" formControlName="date" required>
      </div>
      
      <div class="col-md-2">
        <label for="inflationRate" class="form-label">Inflation Rate (%)</label>
        <input type="number" class="form-control" id="inflationRate" 
               formControlName="inflationRate" step="0.1" min="0">
      </div>
    </div>
    
    <div class="row mt-3">
      <div class="col-md-12">
        <label for="description" class="form-label">Description</label>
        <textarea class="form-control" id="description" formControlName="description" rows="2"></textarea>
      </div>
    </div>
    
    <div class="form-actions mt-4">
      <button type="submit" class="btn btn-primary me-2" [disabled]="!expenseForm.valid">
        {{ isEditMode ? 'Update' : 'Save' }}
      </button>
      <button type="button" class="btn btn-outline-secondary" (click)="onCancel()">
        Cancel
      </button>
    </div>
  </form>
</div>
```

## Key Enhancements:

1. **Category-specific Inflation Rates**: Each expense category has default inflation rates that can be customized
2. **Future Projections**: Calculates 5-year and 10-year projections for each category and overall expenses
3. **Interactive Inflation Control**: Slider to adjust the inflation rate for summary projections
4. **Detailed Reports**: Shows current spending, category breakdowns, and future projections
5. **Improved Form**: Includes inflation rate field with category-specific defaults
6. **Better Data Visualization**: Clean tables and cards to display the information

This enhanced expense calculator now provides valuable insights into how expenses might grow over time due to inflation, helping with better financial planning.