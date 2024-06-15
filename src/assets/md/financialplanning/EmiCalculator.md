To create an EMI (Equated Monthly Installment) calculator that allows for adding multiple EMIs and calculating the combined results, we can follow a similar approach. The EMI formula is:

\[ EMI = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1} \]

where:
- \( P \) is the principal loan amount
- \( r \) is the monthly interest rate (annual interest rate divided by 12 and converted to a decimal)
- \( n \) is the number of monthly installments

Let's create the Angular component to handle this:

**emi-calculator.component.ts**:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-emi-calculator',
  templateUrl: './emi-calculator.component.html',
  styleUrls: ['./emi-calculator.component.css']
})
export class EmiCalculatorComponent {
  emiData: any[] = [];
  totalEMI: number | null = null;
  totalPrincipal: number | null = null;
  totalInterestPaid: number | null = null;

  addEMI() {
    this.emiData.push({
      principal: null,
      annualInterestRate: null,
      loanTenure: null,
      emi: null,
      totalPayment: null,
      totalInterestPaid: null
    });
  }

  removeEMI(index: number) {
    this.emiData.splice(index, 1);
    this.calculateEMI();
  }

  calculateEMI() {
    this.totalEMI = 0;
    this.totalPrincipal = 0;
    this.totalInterestPaid = 0;

    this.emiData.forEach(emi => {
      const principal = parseFloat(emi.principal.toString() || '0');
      const annualInterestRate = parseFloat(emi.annualInterestRate.toString() || '0');
      const loanTenure = parseFloat(emi.loanTenure.toString() || '0');

      const monthlyInterestRate = annualInterestRate / 12 / 100;
      const totalMonths = loanTenure * 12;

      // Calculate EMI using the formula
      const emiValue = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
      emi.emi = emiValue;

      // Calculate total payment and total interest paid
      const totalPayment = emiValue * totalMonths;
      const totalInterestPaid = totalPayment - principal;

      emi.totalPayment = totalPayment;
      emi.totalInterestPaid = totalInterestPaid;

      this.totalEMI += emiValue;
      this.totalPrincipal += principal;
      this.totalInterestPaid += totalInterestPaid;
    });
  }
}
```

**emi-calculator.component.html**:
```html
<div class="container mt-5">
    <h2 class="text-center mb-4">EMI Calculator</h2>
    <form (ngSubmit)="calculateEMI()">
        <div *ngFor="let emi of emiData; let i = index" class="emi-input">
            <h4>EMI {{ i + 1 }}</h4>
            <div class="form-group">
                <label for="principal{{i}}">Principal Loan Amount (INR):</label>
                <input type="number" class="form-control" id="principal{{i}}" name="principal{{i}}" [(ngModel)]="emi.principal" required>
            </div>
            <div class="form-group">
                <label for="annualInterestRate{{i}}">Annual Interest Rate (%):</label>
                <input type="number" class="form-control" id="annualInterestRate{{i}}" name="annualInterestRate{{i}}" [(ngModel)]="emi.annualInterestRate" required>
            </div>
            <div class="form-group">
                <label for="loanTenure{{i}}">Loan Tenure (in years):</label>
                <input type="number" class="form-control" id="loanTenure{{i}}" name="loanTenure{{i}}" [(ngModel)]="emi.loanTenure" required>
            </div>
            <div class="emi-summary">
                <p>EMI: {{ emi.emi | currency:'INR':true:'1.0-2' }}</p>
                <p>Total Payment: {{ emi.totalPayment | currency:'INR':true:'1.0-2' }}</p>
                <p>Total Interest Paid: {{ emi.totalInterestPaid | currency:'INR':true:'1.0-2' }}</p>
            </div>
            <button type="button" class="btn btn-danger" (click)="removeEMI(i)">Remove EMI</button>
            <hr>
        </div>
        <button type="button" class="btn btn-primary btn-block" (click)="addEMI()">Add EMI</button>
        <button type="submit" class="btn btn-success btn-block mt-3">Calculate EMI</button>
    </form>
    <div *ngIf="totalEMI !== null" class="mt-4">
        <h4>Total EMI: {{ totalEMI | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Principal: {{ totalPrincipal | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Interest Paid: {{ totalInterestPaid | currency:'INR':true:'1.0-2' }}</h4>
    </div>
</div>
```

In this implementation:

1. **TypeScript Logic**:
   - We maintain an array `emiData` to store data for each EMI.
   - The `addEMI()` method adds a new EMI input set.
   - The `removeEMI(index: number)` method removes a specific EMI input set.
   - The `calculateEMI()` method calculates the EMI, total payment, and total interest paid for each EMI and updates the total values accordingly.

2. **HTML Template**:
   - We use an `*ngFor` directive to iterate over the `emiData` array and generate input fields for each EMI.
   - Below each EMI input, we display the calculated EMI, total payment, and total interest paid for that EMI.
   - At the bottom, we display the combined total EMI, total principal, and total interest paid for all EMIs.

This setup allows users to input data for multiple EMIs and dynamically see the results for each individual EMI as well as the combined totals. Adjust the styles and formatting as needed to fit your application's design.

To accommodate your requirements, we'll modify the EMI calculator to:

1. Accept the total principal amount, annual interest rate, total loan tenure, and the number of tenures paid.
2. Calculate the EMI amount, total principal paid so far, total interest paid so far, remaining principal, interest to be paid in the remaining tenure, and the remaining tenure.

### TypeScript Logic

**emi-calculator.component.ts**:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-emi-calculator',
  templateUrl: './emi-calculator.component.html',
  styleUrls: ['./emi-calculator.component.css']
})
export class EmiCalculatorComponent {
  principal: number | null = null;
  annualInterestRate: number | null = null;
  totalTenure: number | null = null;
  tenuresPaid: number | null = null;
  
  emiAmount: number | null = null;
  principalPaidSoFar: number | null = null;
  interestPaidSoFar: number | null = null;
  remainingPrincipal: number | null = null;
  interestToBePaid: number | null = null;
  remainingTenure: number | null = null;

  calculateEMI() {
    if (this.principal && this.annualInterestRate && this.totalTenure && this.tenuresPaid) {
      const monthlyInterestRate = this.annualInterestRate / 12 / 100;
      const totalMonths = this.totalTenure * 12;
      const monthsPaid = this.tenuresPaid;

      // Calculate EMI using the formula
      this.emiAmount = (this.principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

      let remainingPrincipal = this.principal;
      this.interestPaidSoFar = 0;
      this.principalPaidSoFar = 0;

      for (let month = 0; month < monthsPaid; month++) {
        const interestForMonth = remainingPrincipal * monthlyInterestRate;
        const principalForMonth = this.emiAmount - interestForMonth;

        this.interestPaidSoFar += interestForMonth;
        this.principalPaidSoFar += principalForMonth;
        remainingPrincipal -= principalForMonth;
      }

      this.remainingPrincipal = remainingPrincipal;
      this.remainingTenure = totalMonths - monthsPaid;
      this.interestToBePaid = 0;

      for (let month = 0; month < this.remainingTenure; month++) {
        const interestForMonth = remainingPrincipal * monthlyInterestRate;
        const principalForMonth = this.emiAmount - interestForMonth;

        this.interestToBePaid += interestForMonth;
        remainingPrincipal -= principalForMonth;
      }
    }
  }
}
```

### HTML Template

**emi-calculator.component.html**:
```html
<div class="container mt-5">
    <h2 class="text-center mb-4">EMI Calculator</h2>
    <form (ngSubmit)="calculateEMI()">
        <div class="form-group">
            <label for="principal">Total Principal Loan Amount (INR):</label>
            <input type="number" class="form-control" id="principal" name="principal" [(ngModel)]="principal" required>
        </div>
        <div class="form-group">
            <label for="annualInterestRate">Annual Interest Rate (%):</label>
            <input type="number" class="form-control" id="annualInterestRate" name="annualInterestRate" [(ngModel)]="annualInterestRate" required>
        </div>
        <div class="form-group">
            <label for="totalTenure">Total Loan Tenure (in years):</label>
            <input type="number" class="form-control" id="totalTenure" name="totalTenure" [(ngModel)]="totalTenure" required>
        </div>
        <div class="form-group">
            <label for="tenuresPaid">Number of Tenures Paid (in months):</label>
            <input type="number" class="form-control" id="tenuresPaid" name="tenuresPaid" [(ngModel)]="tenuresPaid" required>
        </div>
        <button type="submit" class="btn btn-success btn-block mt-3">Calculate EMI</button>
    </form>
    <div *ngIf="emiAmount !== null" class="mt-4">
        <h4>EMI Amount: {{ emiAmount | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Principal Paid So Far: {{ principalPaidSoFar | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Interest Paid So Far: {{ interestPaidSoFar | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Remaining Principal: {{ remainingPrincipal | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Interest To Be Paid in Remaining Tenure: {{ interestToBePaid | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Remaining Tenure: {{ remainingTenure }} months</h4>
    </div>
</div>
```

### Explanation:

1. **TypeScript Logic**:
   - Accepts total principal, annual interest rate, total tenure, and tenures paid as inputs.
   - Calculates the monthly EMI using the standard EMI formula.
   - Iterates through the number of tenures paid to calculate total interest paid and total principal paid so far.
   - Determines the remaining principal and the number of months left in the loan tenure.
   - Calculates the interest to be paid over the remaining tenure by iterating through the remaining months.

2. **HTML Template**:
   - Provides input fields for total principal, annual interest rate, total tenure, and tenures paid.
   - Displays the calculated EMI amount, total principal paid so far, total interest paid so far, remaining principal, interest to be paid in the remaining tenure, and the remaining tenure.

This setup provides a comprehensive view of the loan repayment status, including detailed breakdowns of payments and remaining amounts.

To set the default value of "Tenures Paid" to zero and ensure the form reflects this, you need to initialize the `tenuresPaid` property to `0` when adding a new EMI entry. Additionally, ensure the `ngModel` bindings in the template reflect these default values correctly.

### TypeScript Logic

**emi-calculator.component.ts**:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-emi-calculator',
  templateUrl: './emi-calculator.component.html',
  styleUrls: ['./emi-calculator.component.css']
})
export class EmiCalculatorComponent {
  emiData: any[] = [];
  totalInterestPaid: number | null = null;
  totalPrincipalPaid: number | null = null;
  totalEMIAmount: number | null = null;
  totalRemainingPrincipal: number | null = null;
  totalInterestToBePaid: number | null = null;
  totalRemainingTenure: number | null = null;

  addEMI() {
    this.emiData.push({
      principal: null,
      annualInterestRate: null,
      totalTenure: null,
      tenuresPaid: 0,  // Set default value to zero
      emiAmount: null,
      principalPaidSoFar: null,
      interestPaidSoFar: null,
      remainingPrincipal: null,
      interestToBePaid: null,
      remainingTenure: null
    });
  }

  removeEMI(index: number) {
    this.emiData.splice(index, 1);
    this.calculateAllEMIs();
  }

  calculateEMI(emi) {
    if (emi.principal && emi.annualInterestRate && emi.totalTenure !== null && emi.tenuresPaid !== null) {
      const monthlyInterestRate = emi.annualInterestRate / 12 / 100;
      const totalMonths = emi.totalTenure * 12;
      const monthsPaid = emi.tenuresPaid;

      // Calculate EMI using the formula
      emi.emiAmount = (emi.principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

      let remainingPrincipal = emi.principal;
      emi.interestPaidSoFar = 0;
      emi.principalPaidSoFar = 0;

      for (let month = 0; month < monthsPaid; month++) {
        const interestForMonth = remainingPrincipal * monthlyInterestRate;
        const principalForMonth = emi.emiAmount - interestForMonth;

        emi.interestPaidSoFar += interestForMonth;
        emi.principalPaidSoFar += principalForMonth;
        remainingPrincipal -= principalForMonth;
      }

      emi.remainingPrincipal = remainingPrincipal;
      emi.remainingTenure = totalMonths - monthsPaid;
      emi.interestToBePaid = 0;

      for (let month = 0; month < emi.remainingTenure; month++) {
        const interestForMonth = remainingPrincipal * monthlyInterestRate;
        const principalForMonth = emi.emiAmount - interestForMonth;

        emi.interestToBePaid += interestForMonth;
        remainingPrincipal -= principalForMonth;
      }
    }
  }

  calculateAllEMIs() {
    this.totalInterestPaid = 0;
    this.totalPrincipalPaid = 0;
    this.totalEMIAmount = 0;
    this.totalRemainingPrincipal = 0;
    this.totalInterestToBePaid = 0;
    this.totalRemainingTenure = 0;

    this.emiData.forEach(emi => {
      this.calculateEMI(emi);

      this.totalInterestPaid += emi.interestPaidSoFar;
      this.totalPrincipalPaid += emi.principalPaidSoFar;
      this.totalEMIAmount += emi.emiAmount;
      this.totalRemainingPrincipal += emi.remainingPrincipal;
      this.totalInterestToBePaid += emi.interestToBePaid;
      this.totalRemainingTenure += emi.remainingTenure;
    });
  }
}
```

### HTML Template

**emi-calculator.component.html**:
```html
<div class="container mt-5">
    <h2 class="text-center mb-4">EMI Calculator</h2>
    <form (ngSubmit)="calculateAllEMIs()">
        <div *ngFor="let emi of emiData; let i = index" class="emi-input">
            <h4>EMI {{ i + 1 }}</h4>
            <div class="form-group">
                <label for="principal{{i}}">Total Principal Loan Amount (INR):</label>
                <input type="number" class="form-control" id="principal{{i}}" name="principal{{i}}" [(ngModel)]="emi.principal" required>
            </div>
            <div class="form-group">
                <label for="annualInterestRate{{i}}">Annual Interest Rate (%):</label>
                <input type="number" class="form-control" id="annualInterestRate{{i}}" name="annualInterestRate{{i}}" [(ngModel)]="emi.annualInterestRate" required>
            </div>
            <div class="form-group">
                <label for="totalTenure{{i}}">Total Loan Tenure (in years):</label>
                <input type="number" class="form-control" id="totalTenure{{i}}" name="totalTenure{{i}}" [(ngModel)]="emi.totalTenure" required>
            </div>
            <div class="form-group">
                <label for="tenuresPaid{{i}}">Number of Tenures Paid (in months):</label>
                <input type="number" class="form-control" id="tenuresPaid{{i}}" name="tenuresPaid{{i}}" [(ngModel)]="emi.tenuresPaid" required>
            </div>
            <div class="emi-summary">
                <p>EMI Amount: {{ emi.emiAmount | currency:'INR':true:'1.0-2' }}</p>
                <p>Total Principal Paid So Far: {{ emi.principalPaidSoFar | currency:'INR':true:'1.0-2' }}</p>
                <p>Total Interest Paid So Far: {{ emi.interestPaidSoFar | currency:'INR':true:'1.0-2' }}</p>
                <p>Remaining Principal: {{ emi.remainingPrincipal | currency:'INR':true:'1.0-2' }}</p>
                <p>Interest To Be Paid in Remaining Tenure: {{ emi.interestToBePaid | currency:'INR':true:'1.0-2' }}</p>
                <p>Remaining Tenure: {{ emi.remainingTenure }} months</p>
            </div>
            <button type="button" class="btn btn-danger" (click)="removeEMI(i)">Remove EMI</button>
            <hr>
        </div>
        <button type="button" class="btn btn-primary btn-block" (click)="addEMI()">Add EMI</button>
        <button type="submit" class="btn btn-success btn-block mt-3">Calculate All EMIs</button>
    </form>
    <div *ngIf="totalEMIAmount !== null" class="mt-4">
        <h4>Total EMI Amount: {{ totalEMIAmount | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Principal Paid So Far: {{ totalPrincipalPaid | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Interest Paid So Far: {{ totalInterestPaid | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Remaining Principal: {{ totalRemainingPrincipal | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Interest To Be Paid in Remaining Tenure: {{ totalInterestToBePaid | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Remaining Tenure: {{ totalRemainingTenure }} months</h4>
    </div>
</div>
```

### Explanation:

1. **TypeScript Logic**:
    - The `addEMI` method initializes `tenuresPaid` to `0` by default.
    - The `calculateEMI` method checks if the `totalTenure` and `tenuresPaid` properties are not `null` to ensure proper calculations.

2. **HTML Template**:
    - The form input for `tenuresPaid` is bound to `emi.tenuresPaid` with a default value of `0`.
    - The rest of the template remains the same to allow users to add, remove, and calculate multiple EMIs.

This setup ensures that new EMI entries have the "Tenures Paid" default to zero, making it more convenient for users.

**Above example is Using Reducing Balance Method like Real Time EMI**