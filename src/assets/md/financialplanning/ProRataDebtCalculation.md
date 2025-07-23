### 📘 What is a Pro Rata Debt List?

A **Pro Rata Debt List** is a method of **allocating a payment across multiple debts proportionally**, based on each loan’s share of the total debt.

It’s commonly used when:

* A borrower has **multiple loans**, and
* They want to **distribute a lump-sum payment** (say, a partial payment or a bonus) **fairly across all loans**.

---

### 📊 **How Pro Rata Allocation Works**

The payment is divided **in proportion to the outstanding principal** of each loan.

---

### ✅ **Example: 3 Loans**

Let’s say a person has the following loans:

| Loan Type     | Outstanding Amount (₹) |
| ------------- | ---------------------- |
| Home Loan     | ₹5,00,000              |
| Personal Loan | ₹3,00,000              |
| Car Loan      | ₹2,00,000              |
| **Total**     | ₹10,00,000             |

And now the borrower wants to **pay ₹1,00,000** across all these loans **pro rata**.

---

### 🧮 **Step-by-Step Pro Rata Calculation**

1. **Calculate total debt** = ₹10,00,000

2. **Calculate each loan’s share:**

| Loan Type     | Formula                       | Share (%) | Amount from ₹1L |
| ------------- | ----------------------------- | --------- | --------------- |
| Home Loan     | ₹5,00,000 / ₹10,00,000 = 0.50 | 50%       | ₹50,000         |
| Personal Loan | ₹3,00,000 / ₹10,00,000 = 0.30 | 30%       | ₹30,000         |
| Car Loan      | ₹2,00,000 / ₹10,00,000 = 0.20 | 20%       | ₹20,000         |

---

### 🧾 Final Result: Pro Rata Payment Distribution

| Loan Type     | Original Balance | Payment | New Balance |
| ------------- | ---------------- | ------- | ----------- |
| Home Loan     | ₹5,00,000        | ₹50,000 | ₹4,50,000   |
| Personal Loan | ₹3,00,000        | ₹30,000 | ₹2,70,000   |
| Car Loan      | ₹2,00,000        | ₹20,000 | ₹1,80,000   |

---

### ⚠️ Why Use Pro Rata?

* Fair and simple method to **reduce all loans proportionally**
* Ensures no loan is neglected
* Can be used in legal settlements, bankruptcy, or bulk payments

---

### 🔁 Alternative Strategy: **Avalanche Method**

* Pay off **highest interest loan first**
* Not pro rata — but better if goal is **interest savings**

---

Would you like an Excel calculator or Angular input form to compute pro rata payments automatically?

```
// app.component.ts
import { Component } from '@angular/core';

interface Loan {
  name: string;
  balance: number;
  payment?: number;
  newBalance?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  lumpSumAmount: number = 0;
  loans: Loan[] = [
    { name: 'Home Loan', balance: 500000 },
    { name: 'Personal Loan', balance: 300000 },
    { name: 'Car Loan', balance: 200000 }
  ];

  calculateProRata() {
    const totalBalance = this.loans.reduce((sum, loan) => sum + loan.balance, 0);
    this.loans.forEach(loan => {
      loan.payment = parseFloat(((loan.balance / totalBalance) * this.lumpSumAmount).toFixed(2));
      loan.newBalance = parseFloat((loan.balance - loan.payment).toFixed(2));
    });
  }
}


// app.component.html
<div class="container mt-4">
  <h2 class="mb-3">Pro Rata Loan Payment Calculator</h2>

  <div class="mb-3">
    <label for="amount" class="form-label">Lump Sum Amount to Pay (₹)</label>
    <input type="number" id="amount" class="form-control" [(ngModel)]="lumpSumAmount">
  </div>

  <table class="table table-bordered">
    <thead class="table-light">
      <tr>
        <th>Loan Type</th>
        <th>Original Balance (₹)</th>
        <th>Pro Rata Payment (₹)</th>
        <th>New Balance (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let loan of loans">
        <td>{{ loan.name }}</td>
        <td>{{ loan.balance }}</td>
        <td>{{ loan.payment || '-' }}</td>
        <td>{{ loan.newBalance || '-' }}</td>
      </tr>
    </tbody>
  </table>

  <button class="btn btn-primary" (click)="calculateProRata()">Calculate Pro Rata</button>
</div>


// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

```

✅ Your Angular page is ready to:

* Accept a **lump sum amount**
* Display **multiple loans**
* Calculate **pro rata payments**
* Show **updated loan balances**

### 🛠 How to Use:

1. Enter the lump sum value.
2. Click **“Calculate Pro Rata”**.
3. Instantly view:

   * Payment per loan
   * Remaining balance

Would you like to:

* Add a feature to **edit/add/remove loans dynamically**?


```
// app.component.ts
import { Component } from '@angular/core';

interface Loan {
  name: string;
  balance: number;
  payment?: number;
  newBalance?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  lumpSumAmount: number = 0;
  newLoanName: string = '';
  newLoanBalance: number = 0;

  loans: Loan[] = [];

  addLoan() {
    if (this.newLoanName && this.newLoanBalance > 0) {
      this.loans.push({ name: this.newLoanName, balance: this.newLoanBalance });
      this.newLoanName = '';
      this.newLoanBalance = 0;
    }
  }

  removeLoan(index: number) {
    this.loans.splice(index, 1);
  }

  calculateProRata() {
    const totalBalance = this.loans.reduce((sum, loan) => sum + loan.balance, 0);
    this.loans.forEach(loan => {
      loan.payment = parseFloat(((loan.balance / totalBalance) * this.lumpSumAmount).toFixed(2));
      loan.newBalance = parseFloat((loan.balance - loan.payment).toFixed(2));
    });
  }
}


// app.component.html
<div class="container mt-4">
  <h2 class="mb-3">Pro Rata Loan Payment Calculator</h2>

  <div class="mb-3">
    <label for="amount" class="form-label">Lump Sum Amount to Pay (₹)</label>
    <input type="number" id="amount" class="form-control" [(ngModel)]="lumpSumAmount">
  </div>

  <div class="mb-4">
    <h5>Add a Loan</h5>
    <div class="row">
      <div class="col-md-5 mb-2">
        <input type="text" class="form-control" placeholder="Loan Name" [(ngModel)]="newLoanName">
      </div>
      <div class="col-md-5 mb-2">
        <input type="number" class="form-control" placeholder="Loan Balance (₹)" [(ngModel)]="newLoanBalance">
      </div>
      <div class="col-md-2">
        <button class="btn btn-success w-100" (click)="addLoan()">Add Loan</button>
      </div>
    </div>
  </div>

  <table class="table table-bordered" *ngIf="loans.length">
    <thead class="table-light">
      <tr>
        <th>Loan Type</th>
        <th>Original Balance (₹)</th>
        <th>Pro Rata Payment (₹)</th>
        <th>New Balance (₹)</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let loan of loans; let i = index">
        <td>{{ loan.name }}</td>
        <td>{{ loan.balance }}</td>
        <td>{{ loan.payment || '-' }}</td>
        <td>{{ loan.newBalance || '-' }}</td>
        <td><button class="btn btn-danger btn-sm" (click)="removeLoan(i)">Remove</button></td>
      </tr>
    </tbody>
  </table>

  <button class="btn btn-primary" (click)="calculateProRata()" [disabled]="!loans.length">Calculate Pro Rata</button>
</div>


// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

```
* Save the results using **local storage or a backend API**?

```
// app.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Loan {
  name: string;
  balance: number;
  payment?: number;
  newBalance?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  lumpSumAmount: number = 0;
  newLoanName: string = '';
  newLoanBalance: number = 0;

  loans: Loan[] = [];

  constructor(private http: HttpClient) {
    this.loadLoans();
  }

  addLoan() {
    if (this.newLoanName && this.newLoanBalance > 0) {
      const newLoan: Loan = { name: this.newLoanName, balance: this.newLoanBalance };
      this.http.post<Loan>('http://localhost:3000/loans', newLoan).subscribe(() => {
        this.newLoanName = '';
        this.newLoanBalance = 0;
        this.loadLoans();
      });
    }
  }

  removeLoan(index: number) {
    const loan = this.loans[index];
    this.http.delete(`http://localhost:3000/loans/${loan['id']}`).subscribe(() => {
      this.loadLoans();
    });
  }

  loadLoans() {
    this.http.get<Loan[]>('http://localhost:3000/loans').subscribe(data => {
      this.loans = data;
    });
  }

  calculateProRata() {
    const totalBalance = this.loans.reduce((sum, loan) => sum + loan.balance, 0);
    this.loans.forEach(loan => {
      loan.payment = parseFloat(((loan.balance / totalBalance) * this.lumpSumAmount).toFixed(2));
      loan.newBalance = parseFloat((loan.balance - loan.payment).toFixed(2));
    });
  }
}


// app.component.html
<div class="container mt-4">
  <h2 class="mb-3">Pro Rata Loan Payment Calculator</h2>

  <div class="mb-3">
    <label for="amount" class="form-label">Lump Sum Amount to Pay (₹)</label>
    <input type="number" id="amount" class="form-control" [(ngModel)]="lumpSumAmount">
  </div>

  <div class="mb-4">
    <h5>Add a Loan</h5>
    <div class="row">
      <div class="col-md-5 mb-2">
        <input type="text" class="form-control" placeholder="Loan Name" [(ngModel)]="newLoanName">
      </div>
      <div class="col-md-5 mb-2">
        <input type="number" class="form-control" placeholder="Loan Balance (₹)" [(ngModel)]="newLoanBalance">
      </div>
      <div class="col-md-2">
        <button class="btn btn-success w-100" (click)="addLoan()">Add Loan</button>
      </div>
    </div>
  </div>

  <table class="table table-bordered" *ngIf="loans.length">
    <thead class="table-light">
      <tr>
        <th>Loan Type</th>
        <th>Original Balance (₹)</th>
        <th>Pro Rata Payment (₹)</th>
        <th>New Balance (₹)</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let loan of loans; let i = index">
        <td>{{ loan.name }}</td>
        <td>{{ loan.balance }}</td>
        <td>{{ loan.payment || '-' }}</td>
        <td>{{ loan.newBalance || '-' }}</td>
        <td><button class="btn btn-danger btn-sm" (click)="removeLoan(i)">Remove</button></td>
      </tr>
    </tbody>
  </table>

  <button class="btn btn-primary" (click)="calculateProRata()" [disabled]="!loans.length">Calculate Pro Rata</button>
</div>


// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

```
