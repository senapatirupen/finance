# Angular Expense Tracker with Inflation Projection

Here's a complete Angular application with Bootstrap that allows users to manage monthly expenses, calculate totals, and project future expenses with inflation.

## 1. Setup the Angular Project

First, create a new Angular project and install Bootstrap:
```bash
ng new expense-tracker
cd expense-tracker
npm install bootstrap @popperjs/core
```

Add Bootstrap to `angular.json`:
```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

## 2. Create Expense Service

### expense.service.ts
```typescript
import { Injectable } from '@angular/core';
import { Expense } from './expense.model';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expensesUrl = 'assets/expenses.json';
  private expenses: Expense[] = [];

  constructor(private http: HttpClient) {
    this.loadExpenses();
  }

  private loadExpenses(): void {
    this.http.get<Expense[]>(this.expensesUrl).subscribe(
      expenses => this.expenses = expenses,
      error => {
        console.error('Error loading expenses, using empty array', error);
        this.expenses = [];
      }
    );
  }

  getExpenses(): Observable<Expense[]> {
    return of(this.expenses);
  }

  addExpense(expense: Expense): Observable<Expense> {
    this.expenses.push(expense);
    return of(expense);
  }

  updateExpense(updatedExpense: Expense): Observable<Expense> {
    const index = this.expenses.findIndex(e => e.id === updatedExpense.id);
    if (index !== -1) {
      this.expenses[index] = updatedExpense;
    }
    return of(updatedExpense);
  }

  deleteExpense(id: string): Observable<void> {
    this.expenses = this.expenses.filter(e => e.id !== id);
    return of(void 0);
  }

  calculateFutureExpenses(currentTotal: number, inflationRate: number, years: number): any[] {
    const projections = [];
    for (let year = 1; year <= years; year++) {
      const futureValue = currentTotal * Math.pow(1 + (inflationRate / 100), year);
      projections.push({
        year,
        amount: futureValue,
        inflation: (Math.pow(1 + (inflationRate / 100), year) - 1) * 100
      });
    }
    return projections;
  }
}
```

## 3. Create Expense Model

### expense.model.ts
```typescript
export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}
```

## 4. Create JSON Data File

### assets/expenses.json
```json
[
  {
    "id": "1",
    "category": "Housing",
    "amount": 15000,
    "date": "2023-11-01",
    "description": "Monthly rent"
  },
  {
    "id": "2",
    "category": "Groceries",
    "amount": 8000,
    "date": "2023-11-05",
    "description": "Monthly groceries"
  },
  {
    "id": "3",
    "category": "Transportation",
    "amount": 3000,
    "date": "2023-11-10",
    "description": "Fuel and maintenance"
  }
]
```

## 5. Create Main Component

### expense-tracker.component.ts
```typescript
import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../expense.service';
import { Expense } from '../expense.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-expense-tracker',
  templateUrl: './expense-tracker.component.html',
  styleUrls: ['./expense-tracker.component.css']
})
export class ExpenseTrackerComponent implements OnInit {
  expenses: Expense[] = [];
  expenseForm: FormGroup;
  isEditing = false;
  currentEditId: string | null = null;
  totalExpenses = 0;
  inflationRate = 5;
  futureProjections: any[] = [];
  showProjections = false;

  constructor(
    private expenseService: ExpenseService,
    private fb: FormBuilder
  ) {
    this.expenseForm = this.fb.group({
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe(expenses => {
      this.expenses = expenses;
      this.calculateTotal();
    });
  }

  calculateTotal(): void {
    this.totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const expense: Expense = {
        id: this.isEditing && this.currentEditId ? this.currentEditId : uuidv4(),
        ...this.expenseForm.value
      };

      if (this.isEditing) {
        this.expenseService.updateExpense(expense).subscribe(() => {
          this.loadExpenses();
          this.resetForm();
        });
      } else {
        this.expenseService.addExpense(expense).subscribe(() => {
          this.loadExpenses();
          this.resetForm();
        });
      }
    }
  }

  onEdit(expense: Expense): void {
    this.isEditing = true;
    this.currentEditId = expense.id;
    this.expenseForm.patchValue({
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description
    });
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe(() => {
        this.loadExpenses();
      });
    }
  }

  resetForm(): void {
    this.expenseForm.reset();
    this.isEditing = false;
    this.currentEditId = null;
  }

  calculateFutureExpenses(): void {
    this.futureProjections = this.expenseService.calculateFutureExpenses(
      this.totalExpenses,
      this.inflationRate,
      10
    );
    this.showProjections = true;
  }
}
```

## 6. Create Template

### expense-tracker.component.html
```html
<div class="container mt-4">
  <div class="row">
    <div class="col-md-6">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h3>Add/Edit Expense</h3>
        </div>
        <div class="card-body">
          <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="category" class="form-label">Category</label>
              <select class="form-select" id="category" formControlName="category">
                <option value="">Select a category</option>
                <option value="Housing">Housing</option>
                <option value="Utilities">Utilities</option>
                <option value="Groceries">Groceries</option>
                <option value="Transportation">Transportation</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div class="mb-3">
              <label for="amount" class="form-label">Amount (₹)</label>
              <input type="number" class="form-control" id="amount" formControlName="amount">
            </div>
            
            <div class="mb-3">
              <label for="date" class="form-label">Date</label>
              <input type="date" class="form-control" id="date" formControlName="date">
            </div>
            
            <div class="mb-3">
              <label for="description" class="form-label">Description (Optional)</label>
              <textarea class="form-control" id="description" formControlName="description" rows="2"></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary me-2" [disabled]="!expenseForm.valid">
              {{ isEditing ? 'Update' : 'Add' }} Expense
            </button>
            <button type="button" class="btn btn-secondary" (click)="resetForm()" *ngIf="isEditing">
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
    
    <div class="col-md-6">
      <div class="card">
        <div class="card-header bg-success text-white">
          <h3>Monthly Summary</h3>
        </div>
        <div class="card-body">
          <div class="alert alert-info">
            <h4 class="alert-heading">Total Monthly Expenses</h4>
            <p class="mb-0">₹ {{ totalExpenses | number:'1.2-2' }}</p>
          </div>
          
          <div class="mb-3">
            <label for="inflationRate" class="form-label">Inflation Rate (%)</label>
            <input type="number" class="form-control" id="inflationRate" [(ngModel)]="inflationRate">
          </div>
          
          <button class="btn btn-warning" (click)="calculateFutureExpenses()">
            Calculate Future Expenses
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header bg-info text-white">
          <h3>Expense List</h3>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let expense of expenses">
                <td>{{ expense.category }}</td>
                <td>₹ {{ expense.amount | number:'1.2-2' }}</td>
                <td>{{ expense.date | date }}</td>
                <td>{{ expense.description || '-' }}</td>
                <td>
                  <button class="btn btn-sm btn-primary me-2" (click)="onEdit(expense)">
                    Edit
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="onDelete(expense.id)">
                    Delete
                  </button>
                </td>
              </tr>
              <tr *ngIf="expenses.length === 0">
                <td colspan="5" class="text-center">No expenses recorded yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  <div class="row mt-4" *ngIf="showProjections">
    <div class="col-12">
      <div class="card">
        <div class="card-header bg-warning text-dark">
          <h3>Future Expense Projections</h3>
        </div>
        <div class="card-body">
          <p>Current monthly expenses: ₹ {{ totalExpenses | number:'1.2-2' }}</p>
          <p>Inflation rate: {{ inflationRate }}%</p>
          
          <table class="table table-bordered">
            <thead class="table-dark">
              <tr>
                <th>Year</th>
                <th>Projected Monthly Expense</th>
                <th>Projected Yearly Expense</th>
                <th>Cumulative Inflation</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let projection of futureProjections">
                <td>{{ projection.year }}</td>
                <td>₹ {{ projection.amount | number:'1.2-2' }}</td>
                <td>₹ {{ (projection.amount * 12) | number:'1.2-2' }}</td>
                <td>{{ projection.inflation | number:'1.2-2' }}%</td>
              </tr>
            </tbody>
          </table>
          
          <div class="alert alert-success">
            <h4>Key Projections</h4>
            <p><strong>After 5 years:</strong> ₹ {{ futureProjections[4]?.amount | number:'1.2-2' }}/month</p>
            <p><strong>After 10 years:</strong> ₹ {{ futureProjections[9]?.amount | number:'1.2-2' }}/month</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 7. Add Styles

### expense-tracker.component.css
```css
.card {
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: bold;
}

.table {
  margin-top: 15px;
}

.alert {
  margin-bottom: 20px;
}

.btn {
  margin-right: 5px;
}

.form-control, .form-select {
  margin-bottom: 15px;
}
```

## 8. Update App Module

### app.module.ts
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ExpenseTrackerComponent } from './expense-tracker/expense-tracker.component';

@NgModule({
  declarations: [
    AppComponent,
    ExpenseTrackerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Features of This Application

1. **CRUD Operations**:
   - Add new expenses with category, amount, date, and description
   - Edit existing expenses
   - Delete expenses with confirmation

2. **Real-time Calculations**:
   - Automatically calculates total monthly expenses
   - Projects future expenses based on inflation rate

3. **User-Friendly Interface**:
   - Clean Bootstrap layout
   - Form validation
   - Responsive design

4. **Data Persistence**:
   - Uses JSON file for data storage
   - Simulates backend operations with service

5. **Future Projections**:
   - Shows monthly and yearly projections
   - Highlights 5-year and 10-year projections
   - Displays cumulative inflation impact

To run the application:
```bash
ng serve
```

Then navigate to `http://localhost:4200` in your browser. The application will load expenses from the JSON file and allow you to manage them through the UI.