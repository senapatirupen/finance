Creating a comprehensive retirement plan involves combining various financial aspects, including SIPs, EMIs, income sources, and expenses (both monthly and yearly). Here's a way to design an Angular app to calculate and manage a retirement plan by integrating all these elements.

### TypeScript Logic

**retirement-plan-calculator.component.ts**:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-retirement-plan-calculator',
  templateUrl: './retirement-plan-calculator.component.html',
  styleUrls: ['./retirement-plan-calculator.component.css']
})
export class RetirementPlanCalculatorComponent {
  sips: any[] = [];
  emis: any[] = [];
  incomeSources: any[] = [];
  monthlyExpenses: any[] = [];
  annualExpenses: any[] = [];
  retirementYears: number;
  totalSavings: number | null = null;
  totalInvestments: number | null = null;
  totalEMIs: number | null = null;
  totalMonthlyExpenses: number | null = null;
  totalAnnualExpenses: number | null = null;
  retirementFund: number | null = null;

  addSIP() {
    this.sips.push({
      amount: null,
      rate: null,
      tenure: null,
      futureValue: null
    });
  }

  removeSIP(index: number) {
    this.sips.splice(index, 1);
    this.calculateRetirementFund();
  }

  addEMI() {
    this.emis.push({
      principal: null,
      rate: null,
      tenure: null,
      tenurePaid: 0,
      emi: null,
      principalPaid: null,
      interestPaid: null,
      principalRemaining: null,
      interestRemaining: null,
      tenureRemaining: null
    });
  }

  removeEMI(index: number) {
    this.emis.splice(index, 1);
    this.calculateRetirementFund();
  }

  addIncomeSource() {
    this.incomeSources.push({
      name: '',
      initialIncome: null,
      annualGrowthRate: null,
      years: null,
      projectedIncome: null,
      totalIncome: null
    });
  }

  removeIncomeSource(index: number) {
    this.incomeSources.splice(index, 1);
    this.calculateRetirementFund();
  }

  addMonthlyExpense() {
    this.monthlyExpenses.push({
      expenseName: '',
      initialMonthlyExpense: null,
      annualGrowthRate: null,
      years: null,
      projectedMonthlyExpense: null,
      totalAmountSpent: null
    });
  }

  removeMonthlyExpense(index: number) {
    this.monthlyExpenses.splice(index, 1);
    this.calculateRetirementFund();
  }

  addAnnualExpense() {
    this.annualExpenses.push({
      expenseName: '',
      initialAnnualExpense: null,
      annualGrowthRate: null,
      years: null,
      projectedAnnualExpense: null,
      totalAmountSpent: null
    });
  }

  removeAnnualExpense(index: number) {
    this.annualExpenses.splice(index, 1);
    this.calculateRetirementFund();
  }

  calculateSIPDetails(sip) {
    if (sip.amount && sip.rate && sip.tenure) {
      const ratePerMonth = sip.rate / 12 / 100;
      const tenureInMonths = sip.tenure * 12;
      sip.futureValue = sip.amount * ((Math.pow(1 + ratePerMonth, tenureInMonths) - 1) / ratePerMonth) * (1 + ratePerMonth);
    }
  }

  calculateEMIDetails(emi) {
    if (emi.principal && emi.rate && emi.tenure) {
      const monthlyRate = emi.rate / 12 / 100;
      const totalMonths = emi.tenure * 12;
      const paidMonths = emi.tenurePaid;
      emi.emi = (emi.principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      emi.principalPaid = 0;
      emi.interestPaid = 0;
      let principalRemaining = emi.principal;
      for (let i = 0; i < paidMonths; i++) {
        const interestForMonth = principalRemaining * monthlyRate;
        const principalForMonth = emi.emi - interestForMonth;
        emi.principalPaid += principalForMonth;
        emi.interestPaid += interestForMonth;
        principalRemaining -= principalForMonth;
      }
      emi.principalRemaining = principalRemaining;
      emi.interestRemaining = 0;
      for (let i = paidMonths; i < totalMonths; i++) {
        const interestForMonth = principalRemaining * monthlyRate;
        emi.interestRemaining += interestForMonth;
        const principalForMonth = emi.emi - interestForMonth;
        principalRemaining -= principalForMonth;
      }
      emi.tenureRemaining = totalMonths - paidMonths;
    }
  }

  calculateIncomeSourceDetails(incomeSource) {
    if (incomeSource.initialIncome && incomeSource.annualGrowthRate && incomeSource.years) {
      incomeSource.projectedIncome = incomeSource.initialIncome * Math.pow(1 + incomeSource.annualGrowthRate / 100, incomeSource.years);
      incomeSource.totalIncome = 0;
      let annualIncome = incomeSource.initialIncome;
      for (let i = 0; i < incomeSource.years; i++) {
        incomeSource.totalIncome += annualIncome;
        annualIncome *= 1 + incomeSource.annualGrowthRate / 100;
      }
    }
  }

  calculateMonthlyExpenseDetails(monthlyExpense) {
    if (monthlyExpense.initialMonthlyExpense && monthlyExpense.annualGrowthRate && monthlyExpense.years) {
      monthlyExpense.projectedMonthlyExpense = monthlyExpense.initialMonthlyExpense * Math.pow(1 + monthlyExpense.annualGrowthRate / 100, monthlyExpense.years);
      monthlyExpense.totalAmountSpent = 0;
      let monthlyExpenseAmount = monthlyExpense.initialMonthlyExpense;
      for (let i = 0; i < monthlyExpense.years; i++) {
        monthlyExpense.totalAmountSpent += monthlyExpenseAmount * 12;
        monthlyExpenseAmount *= 1 + monthlyExpense.annualGrowthRate / 100;
      }
    }
  }

  calculateAnnualExpenseDetails(annualExpense) {
    if (annualExpense.initialAnnualExpense && annualExpense.annualGrowthRate && annualExpense.years) {
      annualExpense.projectedAnnualExpense = annualExpense.initialAnnualExpense * Math.pow(1 + annualExpense.annualGrowthRate / 100, annualExpense.years);
      annualExpense.totalAmountSpent = 0;
      let annualExpenseAmount = annualExpense.initialAnnualExpense;
      for (let i = 0; i < annualExpense.years; i++) {
        annualExpense.totalAmountSpent += annualExpenseAmount;
        annualExpenseAmount *= 1 + annualExpense.annualGrowthRate / 100;
      }
    }
  }

  calculateRetirementFund() {
    this.totalSavings = 0;
    this.totalInvestments = 0;
    this.totalEMIs = 0;
    this.totalMonthlyExpenses = 0;
    this.totalAnnualExpenses = 0;
    this.retirementFund = 0;

    // Calculate SIPs
    this.sips.forEach(sip => {
      this.calculateSIPDetails(sip);
      this.totalInvestments += sip.futureValue;
    });

    // Calculate EMIs
    this.emis.forEach(emi => {
      this.calculateEMIDetails(emi);
      this.totalEMIs += emi.emi * emi.tenureRemaining;
    });

    // Calculate Income Sources
    this.incomeSources.forEach(incomeSource => {
      this.calculateIncomeSourceDetails(incomeSource);
      this.totalSavings += incomeSource.totalIncome;
    });

    // Calculate Monthly Expenses
    this.monthlyExpenses.forEach(monthlyExpense => {
      this.calculateMonthlyExpenseDetails(monthlyExpense);
      this.totalMonthlyExpenses += monthlyExpense.totalAmountSpent;
    });

    // Calculate Annual Expenses
    this.annualExpenses.forEach(annualExpense => {
      this.calculateAnnualExpenseDetails(annualExpense);
      this.totalAnnualExpenses += annualExpense.totalAmountSpent;
    });

    // Calculate Retirement Fund
    this.retirementFund = this.totalSavings + this.totalInvestments - this.totalEMIs - this.totalMonthlyExpenses - this.totalAnnualExpenses;
  }
}
```

### HTML Template

**retirement-plan-calculator.component.html**:
```html
<div class="container mt-5">
  <h2 class="text-center mb-4">Retirement Plan Calculator</h2>
  <form (ngSubmit)="calculateRetirementFund()">
    <h3>SIPs</h3>
    <div *ngFor="let sip of sips; let i = index" class="sip-input">
      <h4>SIP {{ i + 1 }}</h4>
      <div class="form-group">
        <label for="sipAmount{{i}}">Amount (INR):</label>
        <input type="number" class="form-control" id="sipAmount{{i}}" name="sipAmount{{i}}" [(ngModel)]="sip.amount" required>
      </div>
      <div class="form-group">
        <label for="sipRate{{i}}">Annual Growth Rate (%):</label>
        <input type="number" class="form-control" id="sipRate{{i}}" name="sipRate{{i}}" [(ngModel)]="sip.rate" required>
      </div>
      <div class="form-group">
        <label for="sipTenure{{i}}">Tenure (Years):</label>
        <input type="number" class="form-control" id="sipTen

ure{{i}}" name="sipTenure{{i}}" [(ngModel)]="sip.tenure" required>
      </div>
      <div class="expense-summary">
        <p>Future Value: {{ sip.futureValue | currency:'INR':true:'1.0-2' }}</p>
      </div>
      <button type="button" class="btn btn-danger" (click)="removeSIP(i)">Remove SIP</button>
      <hr>
    </div>
    <button type="button" class="btn btn-primary btn-block" (click)="addSIP()">Add SIP</button>

    <h3>EMIs</h3>
    <div *ngFor="let emi of emis; let i = index" class="emi-input">
      <h4>EMI {{ i + 1 }}</h4>
      <div class="form-group">
        <label for="emiPrincipal{{i}}">Principal (INR):</label>
        <input type="number" class="form-control" id="emiPrincipal{{i}}" name="emiPrincipal{{i}}" [(ngModel)]="emi.principal" required>
      </div>
      <div class="form-group">
        <label for="emiRate{{i}}">Annual Interest Rate (%):</label>
        <input type="number" class="form-control" id="emiRate{{i}}" name="emiRate{{i}}" [(ngModel)]="emi.rate" required>
      </div>
      <div class="form-group">
        <label for="emiTenure{{i}}">Tenure (Years):</label>
        <input type="number" class="form-control" id="emiTenure{{i}}" name="emiTenure{{i}}" [(ngModel)]="emi.tenure" required>
      </div>
      <div class="form-group">
        <label for="emiTenurePaid{{i}}">Tenure Paid (Years):</label>
        <input type="number" class="form-control" id="emiTenurePaid{{i}}" name="emiTenurePaid{{i}}" [(ngModel)]="emi.tenurePaid">
      </div>
      <div class="expense-summary">
        <p>EMI Amount: {{ emi.emi | currency:'INR':true:'1.0-2' }}</p>
        <p>Principal Paid: {{ emi.principalPaid | currency:'INR':true:'1.0-2' }}</p>
        <p>Interest Paid: {{ emi.interestPaid | currency:'INR':true:'1.0-2' }}</p>
        <p>Principal Remaining: {{ emi.principalRemaining | currency:'INR':true:'1.0-2' }}</p>
        <p>Interest Remaining: {{ emi.interestRemaining | currency:'INR':true:'1.0-2' }}</p>
        <p>Tenure Remaining: {{ emi.tenureRemaining }}</p>
      </div>
      <button type="button" class="btn btn-danger" (click)="removeEMI(i)">Remove EMI</button>
      <hr>
    </div>
    <button type="button" class="btn btn-primary btn-block" (click)="addEMI()">Add EMI</button>

    <h3>Income Sources</h3>
    <div *ngFor="let incomeSource of incomeSources; let i = index" class="income-source-input">
      <h4>Income Source {{ i + 1 }}</h4>
      <div class="form-group">
        <label for="incomeSourceName{{i}}">Name:</label>
        <input type="text" class="form-control" id="incomeSourceName{{i}}" name="incomeSourceName{{i}}" [(ngModel)]="incomeSource.name" required>
      </div>
      <div class="form-group">
        <label for="initialIncome{{i}}">Initial Annual Income (INR):</label>
        <input type="number" class="form-control" id="initialIncome{{i}}" name="initialIncome{{i}}" [(ngModel)]="incomeSource.initialIncome" required>
      </div>
      <div class="form-group">
        <label for="annualGrowthRate{{i}}">Annual Growth Rate (%):</label>
        <input type="number" class="form-control" id="annualGrowthRate{{i}}" name="annualGrowthRate{{i}}" [(ngModel)]="incomeSource.annualGrowthRate" required>
      </div>
      <div class="form-group">
        <label for="incomeYears{{i}}">Number of Years:</label>
        <input type="number" class="form-control" id="incomeYears{{i}}" name="incomeYears{{i}}" [(ngModel)]="incomeSource.years" required>
      </div>
      <div class="expense-summary">
        <p>Projected Annual Income: {{ incomeSource.projectedIncome | currency:'INR':true:'1.0-2' }}</p>
        <p>Total Income: {{ incomeSource.totalIncome | currency:'INR':true:'1.0-2' }}</p>
      </div>
      <button type="button" class="btn btn-danger" (click)="removeIncomeSource(i)">Remove Income Source</button>
      <hr>
    </div>
    <button type="button" class="btn btn-primary btn-block" (click)="addIncomeSource()">Add Income Source</button>

    <h3>Monthly Expenses</h3>
    <div *ngFor="let monthlyExpense of monthlyExpenses; let i = index" class="monthly-expense-input">
      <h4>Monthly Expense {{ i + 1 }}</h4>
      <div class="form-group">
        <label for="monthlyExpenseName{{i}}">Expense Name:</label>
        <input type="text" class="form-control" id="monthlyExpenseName{{i}}" name="monthlyExpenseName{{i}}" [(ngModel)]="monthlyExpense.expenseName" required>
      </div>
      <div class="form-group">
        <label for="initialMonthlyExpense{{i}}">Initial Monthly Expense (INR):</label>
        <input type="number" class="form-control" id="initialMonthlyExpense{{i}}" name="initialMonthlyExpense{{i}}" [(ngModel)]="monthlyExpense.initialMonthlyExpense" required>
      </div>
      <div class="form-group">
        <label for="monthlyGrowthRate{{i}}">Annual Growth Rate (%):</label>
        <input type="number" class="form-control" id="monthlyGrowthRate{{i}}" name="monthlyGrowthRate{{i}}" [(ngModel)]="monthlyExpense.annualGrowthRate" required>
      </div>
      <div class="form-group">
        <label for="monthlyExpenseYears{{i}}">Number of Years:</label>
        <input type="number" class="form-control" id="monthlyExpenseYears{{i}}" name="monthlyExpenseYears{{i}}" [(ngModel)]="monthlyExpense.years" required>
      </div>
      <div class="expense-summary">
        <p>Projected Monthly Expense: {{ monthlyExpense.projectedMonthlyExpense | currency:'INR':true:'1.0-2' }}</p>
        <p>Total Amount Spent: {{ monthlyExpense.totalAmountSpent | currency:'INR':true:'1.0-2' }}</p>
      </div>
      <button type="button" class="btn btn-danger" (click)="removeMonthlyExpense(i)">Remove Monthly Expense</button>
      <hr>
    </div>
    <button type="button" class="btn btn-primary btn-block" (click)="addMonthlyExpense()">Add Monthly Expense</button>

    <h3>Annual Expenses</h3>
    <div *ngFor="let annualExpense of annualExpenses; let i = index" class="annual-expense-input">
      <h4>Annual Expense {{ i + 1 }}</h4>
      <div class="form-group">
        <label for="annualExpenseName{{i}}">Expense Name:</label>
        <input type="text" class="form-control" id="annualExpenseName{{i}}" name="annualExpenseName{{i}}" [(ngModel)]="annualExpense.expenseName" required>
      </div>
      <div class="form-group">
        <label for="initialAnnualExpense{{i}}">Initial Annual Expense (INR):</label>
        <input type="number" class="form-control" id="initialAnnualExpense{{i}}" name="initialAnnualExpense{{i}}" [(ngModel)]="annualExpense.initialAnnualExpense" required>
      </div>
      <div class="form-group">
        <label for="annualGrowthRate{{i}}">Annual Growth Rate (%):</label>
        <input type="number" class="form-control" id="annualGrowthRate{{i}}" name="annualGrowthRate{{i}}" [(ngModel)]="annualExpense.annualGrowthRate" required>
      </div>
      <div class="form-group">
        <label for="annualExpenseYears{{i}}">Number of Years:</label>
        <input type="number" class="form-control" id="annualExpenseYears{{i}}" name="annualExpenseYears{{i}}" [(ngModel)]="annualExpense.years" required>
      </div>
      <div class="expense-summary">
        <p>Projected Annual Expense: {{ annualExpense.projectedAnnualExpense | currency:'INR':true:'1.0-2' }}</p>
        <p>Total Amount Spent: {{ annualExpense.totalAmountSpent | currency:'INR':true:'1.0-2' }}</p

>
      </div>
      <button type="button" class="btn btn-danger" (click)="removeAnnualExpense(i)">Remove Annual Expense</button>
      <hr>
    </div>
    <button type="button" class="btn btn-primary btn-block" (click)="addAnnualExpense()">Add Annual Expense</button>

    <div class="form-group mt-4">
      <label for="retirementYears">Number of Years to Retirement:</label>
      <input type="number" class="form-control" id="retirementYears" name="retirementYears" [(ngModel)]="retirementYears" required>
    </div>
    <button type="submit" class="btn btn-success btn-block">Calculate Retirement Fund</button>
  </form>

  <div class="results mt-5" *ngIf="retirementFund !== null">
    <h3>Retirement Fund Summary</h3>
    <p>Total Savings: {{ totalSavings | currency:'INR':true:'1.0-2' }}</p>
    <p>Total Investments: {{ totalInvestments | currency:'INR':true:'1.0-2' }}</p>
    <p>Total EMIs: {{ totalEMIs | currency:'INR':true:'1.0-2' }}</p>
    <p>Total Monthly Expenses: {{ totalMonthlyExpenses | currency:'INR':true:'1.0-2' }}</p>
    <p>Total Annual Expenses: {{ totalAnnualExpenses | currency:'INR':true:'1.0-2' }}</p>
    <p><strong>Retirement Fund: {{ retirementFund | currency:'INR':true:'1.0-2' }}</strong></p>
  </div>
</div>
```

### CSS

**retirement-plan-calculator.component.css**:
```css
.container {
  max-width: 800px;
}

.expense-summary {
  margin-top: 15px;
}
```

This Angular app provides a comprehensive overview of a user's retirement plan by integrating SIPs, EMIs, income sources, and expenses (both monthly and annual). Users can add and remove multiple entries in each category and see the calculated projections for their retirement fund.