# Retirement Corpus & Expense Tracker

Here's a complete Angular solution with HTML, TypeScript, and JSON Server integration for tracking expenses and retirement investments.

## 1. Data Models

### models.ts
```typescript
export interface Expense {
  id: string;
  category: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  description?: string;
}

export interface Investment {
  id: string;
  name: string;
  type: 'FD' | 'Mutual Fund' | 'Stocks' | 'Real Estate' | 'NPS' | 'PPF';
  amount: number;
  startDate: string;
  cagr: number;
  maturityDate?: string;
}

export interface RetirementPlan {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentExpenses: number;
  inflationRate: number;
  postRetirementReturns: number;
}
```

## 2. HTML Page (retirement-tracker.component.html)

```html
<div class="container-fluid mt-4">
  <div class="row">
    <!-- Expenses Section -->
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-header bg-primary text-white">
          <h4>Monthly Expenses</h4>
          <button class="btn btn-sm btn-light" (click)="showExpenseForm = !showExpenseForm">
            {{ showExpenseForm ? 'Cancel' : 'Add Expense' }}
          </button>
        </div>

        <!-- Expense Form -->
        <div class="card-body" *ngIf="showExpenseForm">
          <form #expenseForm="ngForm" (ngSubmit)="saveExpense()">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label>Category</label>
                  <select class="form-control" [(ngModel)]="currentExpense.category" name="category" required>
                    <option value="Housing">Housing</option>
                    <option value="Food">Food</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" class="form-control" [(ngModel)]="currentExpense.amount" name="amount" required>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label>Frequency</label>
                  <select class="form-control" [(ngModel)]="currentExpense.frequency" name="frequency" required>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label>Description</label>
                  <input type="text" class="form-control" [(ngModel)]="currentExpense.description" name="description">
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary mr-2">Save</button>
            <button type="button" class="btn btn-secondary" (click)="cancelExpenseEdit()">Cancel</button>
          </form>
        </div>

        <!-- Expenses List -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Monthly Equivalent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let expense of expenses">
                <td>{{ expense.category }}</td>
                <td>{{ expense.amount | currency:'INR' }}</td>
                <td>{{ expense.frequency }}</td>
                <td>{{ getMonthlyEquivalent(expense) | currency:'INR' }}</td>
                <td>
                  <button class="btn btn-sm btn-warning mr-2" (click)="editExpense(expense)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteExpense(expense.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="!expenses.length">
                <td colspan="5" class="text-center">No expenses added yet</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="table-info">
                <th>Total Monthly Expenses</th>
                <th colspan="4">{{ totalMonthlyExpenses | currency:'INR' }}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Investments Section -->
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-header bg-success text-white">
          <h4>Retirement Investments</h4>
          <button class="btn btn-sm btn-light" (click)="showInvestmentForm = !showInvestmentForm">
            {{ showInvestmentForm ? 'Cancel' : 'Add Investment' }}
          </button>
        </div>

        <!-- Investment Form -->
        <div class="card-body" *ngIf="showInvestmentForm">
          <form #investmentForm="ngForm" (ngSubmit)="saveInvestment()">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label>Investment Type</label>
                  <select class="form-control" [(ngModel)]="currentInvestment.type" name="type" required>
                    <option value="FD">Fixed Deposit</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Stocks">Stocks</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="NPS">National Pension System</option>
                    <option value="PPF">Public Provident Fund</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label>Name/Description</label>
                  <input type="text" class="form-control" [(ngModel)]="currentInvestment.name" name="name" required>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-4">
                <div class="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" class="form-control" [(ngModel)]="currentInvestment.amount" name="amount" required>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Start Date</label>
                  <input type="date" class="form-control" [(ngModel)]="currentInvestment.startDate" name="startDate" required>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Expected CAGR (%)</label>
                  <input type="number" step="0.1" class="form-control" [(ngModel)]="currentInvestment.cagr" name="cagr" required>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-success mr-2">Save</button>
            <button type="button" class="btn btn-secondary" (click)="cancelInvestmentEdit()">Cancel</button>
          </form>
        </div>

        <!-- Investments List -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Start Date</th>
                <th>CAGR</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let investment of investments">
                <td>{{ investment.type }}</td>
                <td>{{ investment.name }}</td>
                <td>{{ investment.amount | currency:'INR' }}</td>
                <td>{{ investment.startDate | date }}</td>
                <td>{{ investment.cagr }}%</td>
                <td>
                  <button class="btn btn-sm btn-warning mr-2" (click)="editInvestment(investment)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteInvestment(investment.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="!investments.length">
                <td colspan="6" class="text-center">No investments added yet</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="table-info">
                <th colspan="2">Total Investments</th>
                <th>{{ totalInvestments | currency:'INR' }}</th>
                <th colspan="3"></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Retirement Planning Section -->
  <div class="row mt-4">
    <div class="col-12">
      <div class="card shadow">
        <div class="card-header bg-info text-white">
          <h4>Retirement Corpus Calculator</h4>
        </div>
        <div class="card-body">
          <form #retirementForm="ngForm">
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Current Age</label>
                  <input type="number" class="form-control" [(ngModel)]="retirementPlan.currentAge" name="currentAge" required>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label>Planned Retirement Age</label>
                  <input type="number" class="form-control" [(ngModel)]="retirementPlan.retirementAge" name="retirementAge" required>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label>Life Expectancy</label>
                  <input type="number" class="form-control" [(ngModel)]="retirementPlan.lifeExpectancy" name="lifeExpectancy" required>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label>Current Annual Expenses (₹)</label>
                  <input type="number" class="form-control" [(ngModel)]="retirementPlan.currentExpenses" name="currentExpenses" required>
                </div>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-4">
                <div class="form-group">
                  <label>Expected Inflation Rate (%)</label>
                  <input type="number" step="0.1" class="form-control" [(ngModel)]="retirementPlan.inflationRate" name="inflationRate" required>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Post-Retirement Returns (%)</label>
                  <input type="number" step="0.1" class="form-control" [(ngModel)]="retirementPlan.postRetirementReturns" name="postRetirementReturns" required>
                </div>
              </div>
              <div class="col-md-4 d-flex align-items-end">
                <button type="button" class="btn btn-info" (click)="calculateRetirement()">
                  Calculate Corpus
                </button>
              </div>
            </div>
          </form>

          <!-- Results -->
          <div class="row mt-4" *ngIf="retirementCorpus > 0">
            <div class="col-md-6">
              <div class="card bg-light">
                <div class="card-body">
                  <h5 class="card-title">Retirement Corpus Required</h5>
                  <p class="display-4">{{ retirementCorpus | currency:'INR' }}</p>
                  <p class="text-muted">At retirement age ({{ retirementPlan.retirementAge }} years)</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card bg-light">
                <div class="card-body">
                  <h5 class="card-title">Current Status</h5>
                  <p>Years to Retirement: {{ retirementPlan.retirementAge - retirementPlan.currentAge }}</p>
                  <p>Current Investments: {{ totalInvestments | currency:'INR' }}</p>
                  <p>Monthly Savings Needed: {{ monthlySavingsRequired | currency:'INR' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 3. Component Class (retirement-tracker.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Expense, Investment, RetirementPlan } from './models';

@Component({
  selector: 'app-retirement-tracker',
  templateUrl: './retirement-tracker.component.html',
  styleUrls: ['./retirement-tracker.component.css']
})
export class RetirementTrackerComponent implements OnInit {
  // Expenses
  expenses: Expense[] = [];
  currentExpense: Expense = {
    id: '',
    category: 'Housing',
    amount: 0,
    frequency: 'Monthly'
  };
  showExpenseForm = false;
  totalMonthlyExpenses = 0;

  // Investments
  investments: Investment[] = [];
  currentInvestment: Investment = {
    id: '',
    name: '',
    type: 'FD',
    amount: 0,
    startDate: new Date().toISOString().split('T')[0],
    cagr: 7
  };
  showInvestmentForm = false;
  totalInvestments = 0;

  // Retirement Planning
  retirementPlan: RetirementPlan = {
    currentAge: 30,
    retirementAge: 60,
    lifeExpectancy: 85,
    currentExpenses: 600000,
    inflationRate: 6,
    postRetirementReturns: 7
  };
  retirementCorpus = 0;
  monthlySavingsRequired = 0;

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.loadInvestments();
  }

  // Expense Methods
  loadExpenses(): void {
    this.http.get<Expense[]>(`${this.apiUrl}/expenses`).subscribe(expenses => {
      this.expenses = expenses;
      this.calculateTotalMonthlyExpenses();
    });
  }

  saveExpense(): void {
    if (this.currentExpense.id) {
      this.http.put(`${this.apiUrl}/expenses/${this.currentExpense.id}`, this.currentExpense)
        .subscribe(() => this.loadExpenses());
    } else {
      this.http.post(`${this.apiUrl}/expenses`, this.currentExpense)
        .subscribe(() => this.loadExpenses());
    }
    this.resetExpenseForm();
  }

  editExpense(expense: Expense): void {
    this.currentExpense = { ...expense };
    this.showExpenseForm = true;
  }

  deleteExpense(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.http.delete(`${this.apiUrl}/expenses/${id}`)
        .subscribe(() => this.loadExpenses());
    }
  }

  cancelExpenseEdit(): void {
    this.resetExpenseForm();
  }

  resetExpenseForm(): void {
    this.currentExpense = {
      id: '',
      category: 'Housing',
      amount: 0,
      frequency: 'Monthly'
    };
    this.showExpenseForm = false;
  }

  getMonthlyEquivalent(expense: Expense): number {
    switch (expense.frequency) {
      case 'Monthly': return expense.amount;
      case 'Quarterly': return expense.amount / 3;
      case 'Yearly': return expense.amount / 12;
      default: return expense.amount;
    }
  }

  calculateTotalMonthlyExpenses(): void {
    this.totalMonthlyExpenses = this.expenses.reduce((sum, expense) => {
      return sum + this.getMonthlyEquivalent(expense);
    }, 0);
    
    // Update retirement plan if not manually set
    if (!this.retirementPlan.currentExpenses || this.retirementPlan.currentExpenses === 600000) {
      this.retirementPlan.currentExpenses = this.totalMonthlyExpenses * 12;
    }
  }

  // Investment Methods
  loadInvestments(): void {
    this.http.get<Investment[]>(`${this.apiUrl}/investments`).subscribe(investments => {
      this.investments = investments;
      this.calculateTotalInvestments();
    });
  }

  saveInvestment(): void {
    if (this.currentInvestment.id) {
      this.http.put(`${this.apiUrl}/investments/${this.currentInvestment.id}`, this.currentInvestment)
        .subscribe(() => this.loadInvestments());
    } else {
      this.http.post(`${this.apiUrl}/investments`, this.currentInvestment)
        .subscribe(() => this.loadInvestments());
    }
    this.resetInvestmentForm();
  }

  editInvestment(investment: Investment): void {
    this.currentInvestment = { ...investment };
    this.showInvestmentForm = true;
  }

  deleteInvestment(id: string): void {
    if (confirm('Are you sure you want to delete this investment?')) {
      this.http.delete(`${this.apiUrl}/investments/${id}`)
        .subscribe(() => this.loadInvestments());
    }
  }

  cancelInvestmentEdit(): void {
    this.resetInvestmentForm();
  }

  resetInvestmentForm(): void {
    this.currentInvestment = {
      id: '',
      name: '',
      type: 'FD',
      amount: 0,
      startDate: new Date().toISOString().split('T')[0],
      cagr: 7
    };
    this.showInvestmentForm = false;
  }

  calculateTotalInvestments(): void {
    this.totalInvestments = this.investments.reduce((sum, investment) => {
      return sum + investment.amount;
    }, 0);
  }

  // Retirement Planning Methods
  calculateRetirement(): void {
    const yearsToRetirement = this.retirementPlan.retirementAge - this.retirementPlan.currentAge;
    const retirementDuration = this.retirementPlan.lifeExpectancy - this.retirementPlan.retirementAge;
    
    // Calculate future value of current expenses adjusted for inflation
    const futureAnnualExpenses = this.retirementPlan.currentExpenses * 
      Math.pow(1 + this.retirementPlan.inflationRate / 100, yearsToRetirement);
    
    // Calculate corpus needed (present value of annuity)
    const monthlyReturn = Math.pow(1 + this.retirementPlan.postRetirementReturns / 100, 1/12) - 1;
    const monthlyInflation = Math.pow(1 + this.retirementPlan.inflationRate / 100, 1/12) - 1;
    const realRate = ((1 + monthlyReturn) / (1 + monthlyInflation)) - 1;
    
    const months = retirementDuration * 12;
    const monthlyExpense = futureAnnualExpenses / 12;
    
    this.retirementCorpus = monthlyExpense * ((1 - Math.pow(1 + realRate, -months)) / realRate);
    
    // Calculate monthly savings needed
    const futureValueOfCurrentInvestments = this.totalInvestments * 
      Math.pow(1 + this.retirementPlan.postRetirementReturns / 100, yearsToRetirement);
    
    const remainingCorpus = Math.max(0, this.retirementCorpus - futureValueOfCurrentInvestments);
    
    const monthlyGrowth = Math.pow(1 + this.retirementPlan.postRetirementReturns / 100, 1/12) - 1;
    const monthsToSave = yearsToRetirement * 12;
    
    this.monthlySavingsRequired = remainingCorpus * 
      (monthlyGrowth / (Math.pow(1 + monthlyGrowth, monthsToSave) - 1));
  }
}
```

## 4. JSON Server Setup

Create a `db.json` file:

```json
{
  "expenses": [
    {
      "id": "1",
      "category": "Housing",
      "amount": 25000,
      "frequency": "Monthly",
      "description": "Rent"
    },
    {
      "id": "2",
      "category": "Food",
      "amount": 15000,
      "frequency": "Monthly",
      "description": "Groceries and dining out"
    }
  ],
  "investments": [
    {
      "id": "1",
      "name": "SBI Bluechip Fund",
      "type": "Mutual Fund",
      "amount": 500000,
      "startDate": "2020-01-15",
      "cagr": 12
    },
    {
      "id": "2",
      "name": "ICICI Bank FD",
      "type": "FD",
      "amount": 300000,
      "startDate": "2021-05-20",
      "cagr": 6.5
    }
  ]
}
```

Start JSON server:
```bash
json-server --watch db.json --port 3000
```

## Key Features

1. **Expense Tracking**:
   - Add/edit/delete expenses with categories
   - Automatic monthly equivalent calculation
   - Total monthly expenses summary

2. **Investment Tracking**:
   - Support for multiple investment types
   - Track expected returns (CAGR)
   - Total investment value calculation

3. **Retirement Planning**:
   - Corpus calculation based on current expenses
   - Inflation-adjusted projections
   - Monthly savings requirement calculator

4. **Full CRUD Operations**:
   - All data stored in JSON server
   - Real-time updates
   - Form validation

5. **Responsive Design**:
   - Works on all screen sizes
   - Clean, intuitive interface

To run the application:
1. Start JSON server: `json-server --watch db.json --port 3000`
2. Start Angular app: `ng serve`
3. Navigate to `http://localhost:4200`

Great! Let's walk through a **customized investment planning framework** using your specified parameters. We'll start with an **example scenario** and then derive **investment decisions** based on that.

---

## 🔧 **Input Parameters (Example)**

| Parameter                       | Value                         |
| ------------------------------- | ----------------------------- |
| **Age**                         | 28                            |
| **Monthly Salary**              | ₹80,000                       |
| **Monthly Expenses**            | ₹30,000                       |
| **Outstanding Bad Loans**       | ₹2,00,000 (Credit card, etc.) |
| **Outstanding Good Loans**      | ₹5,00,000 (Education loan)    |
| **Monthly Investment Capacity** | ₹20,000                       |
| **Total Assets (Net Worth)**    | ₹4,00,000 (cash, MF, crypto)  |

---

## 🎯 **Future Goals**

| Goal           | Time Horizon | Amount Needed                |
| -------------- | ------------ | ---------------------------- |
| Marriage       | 2 years      | ₹8,00,000                    |
| Buy a Flat     | 5 years      | ₹25,00,000 (20% downpayment) |
| Buy Land       | 7 years      | ₹15,00,000                   |
| Higher Studies | 3 years      | ₹10,00,000                   |
| Long Vacation  | 2 years      | ₹2,00,000                    |
| Start Business | 12 years     | ₹2 Crore                     |

---

## 🧠 **Investment Decision Framework (Excluding Govt. Investments)**

### 1. 🧹 **Clear Bad Loans First**

* **Bad debt (₹2L)** should be cleared in **12 months**.

  * Allocate ₹8,000/month for debt clearing.
  * That leaves **₹12,000/month for investing**.

### 2. 💵 **Bucket Investments by Goal Horizon**

| Horizon       | Goal(s)                          | Instruments                                                           |
| ------------- | -------------------------------- | --------------------------------------------------------------------- |
| **0–3 years** | Marriage, Vacation, Higher Study | Liquid funds, Ultra Short-term Debt Funds, Arbitrage Funds            |
| **3–7 years** | Buy Flat, Land                   | Hybrid Funds (Equity + Debt), Flexi-cap Mutual Funds                  |
| **7+ years**  | Start ₹2 Cr Business             | Equity Mutual Funds (Index/Flexi-cap), Direct Equity, Crypto (max 5%) |

---

### 3. 💰 **Investment Distribution Plan**

#### Phase 1: Year 1 (Focus on Debt + Short-Term Goals)

| Use                       | Monthly Amount (₹)  |
| ------------------------- | ------------------- |
| Clear Bad Loan (EMI)      | ₹8,000              |
| Emergency Fund + Liquid   | ₹3,000              |
| Ultra Short-Term Funds    | ₹3,000 (Marriage)   |
| Arbitrage Fund (Vacation) | ₹2,000              |
| Balanced Advantage Fund   | ₹2,000 (Studies)    |
| Equity Flexi-cap Fund     | ₹2,000 (Long goals) |

#### Phase 2: Year 2–5 (No bad loan; ramp up investing)

After clearing bad loans, ₹20K/month available.

| Goal             | Monthly Amount (₹) | Investment Vehicle                 |
| ---------------- | ------------------ | ---------------------------------- |
| Flat (5 yr)      | ₹6,000             | Flexi-cap Mutual Fund              |
| Higher Studies   | ₹3,000             | Balanced Advantage / Debt-oriented |
| Vacation         | ₹1,000             | Liquid / Ultra Short-Term          |
| Land (7 yr)      | ₹4,000             | Large Cap + Flexi-cap Funds        |
| Business (12 yr) | ₹6,000             | Index Fund, Mid Cap, Direct Equity |

---

### 4. 💼 **Fund Types to Use (Exclude Government)**

| Type                       | Good For                        | Return Estimate | Risk        |
| -------------------------- | ------------------------------- | --------------- | ----------- |
| Liquid Funds               | Short-term goals, emergency     | 4–6%            | Low         |
| Ultra Short-Term           | 1–2 year goals                  | 5–6.5%          | Low         |
| Arbitrage Funds            | 1–2 year, tax-efficient returns | 6–7%            | Low-Mid     |
| Balanced Advantage         | Volatile markets, studies       | 8–10%           | Medium      |
| Flexi-cap Funds            | 3–7 year goals                  | 12–14%          | Medium      |
| Index Funds (Nifty/Sensex) | 7+ year goals                   | 12–15%          | Medium-High |
| Direct Stocks              | Long-term growth, business      | 15–18%          | High        |

---

### 5. 🧾 **Key Rules for You**

* **Debt First**: Bad loans should not exist when planning long-term goals.
* **SIP Discipline**: Automate investing in mutual funds.
* **Emergency Buffer**: Always maintain 6 months of expenses.
* **Track & Rebalance**: Re-assess investments every year.
* **Avoid Insurance-Based Plans or Government Schemes**, as requested.

---

### 📦 Final Tip

If planning for **a ₹2 Cr business**:

* You’ll need about ₹6–8L/year investing for 12 years in assets that give 15%+ CAGR.
* Either **bootstrap** or start with a **profitable side hustle** to increase future SIPs.

---

Would you like a dynamic **Excel calculator** where you input these parameters and it generates the investment roadmap automatically?
