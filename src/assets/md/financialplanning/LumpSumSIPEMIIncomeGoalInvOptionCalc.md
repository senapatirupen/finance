# Lump Sum Investment Calculator with Angular, Bootstrap, and JSON Server

Here's a complete implementation for a lump sum investment calculator that allows adding, editing, deleting, and calculating multiple investments inline.

## 1. File Structure
```
src/
├── app/
│   ├── components/
│   │   └── lump-sum-calculator/
│   │       ├── lump-sum-calculator.component.ts
│   │       ├── lump-sum-calculator.component.html
│   │       └── lump-sum-calculator.component.css
│   ├── models/
│   │   └── lump-sum.model.ts
│   ├── services/
│   │   └── lump-sum.service.ts
│   ├── app.module.ts
│   └── app-routing.module.ts
```

## 2. Lump Sum Model (`lump-sum.model.ts`)
```typescript
export interface LumpSum {
  id?: number;
  investmentName: string;
  principalAmount: number | null;
  duration: number | null;
  expectedReturn: number | null;
  futureValue: number | null;
  totalInterest: number | null;
}
```

## 3. Lump Sum Service (`lump-sum.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LumpSum } from '../models/lump-sum.model';

@Injectable({
  providedIn: 'root'
})
export class LumpSumService {
  private apiUrl = 'http://localhost:3000/lumpSums';

  constructor(private http: HttpClient) { }

  getLumpSums(): Observable<LumpSum[]> {
    return this.http.get<LumpSum[]>(this.apiUrl);
  }

  addLumpSum(lumpSum: LumpSum): Observable<LumpSum> {
    return this.http.post<LumpSum>(this.apiUrl, lumpSum);
  }

  updateLumpSum(id: number, lumpSum: LumpSum): Observable<LumpSum> {
    return this.http.put<LumpSum>(`${this.apiUrl}/${id}`, lumpSum);
  }

  deleteLumpSum(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## 4. Lump Sum Calculator Component

### `lump-sum-calculator.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { LumpSum } from '../../models/lump-sum.model';
import { LumpSumService } from '../../services/lump-sum.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-lump-sum-calculator',
  templateUrl: './lump-sum-calculator.component.html',
  styleUrls: ['./lump-sum-calculator.component.css']
})
export class LumpSumCalculatorComponent implements OnInit {
  investments: LumpSum[] = [];
  totalFutureValue = 0;
  totalPrincipal = 0;
  totalInterest = 0;
  lumpSumForm: FormGroup;
  isEditing = false;
  currentEditId: number | null = null;

  constructor(
    private lumpSumService: LumpSumService,
    private fb: FormBuilder
  ) {
    this.lumpSumForm = this.fb.group({
      investmentName: ['', Validators.required],
      principalAmount: [null, [Validators.required, Validators.min(1)]],
      duration: [null, [Validators.required, Validators.min(1)]],
      expectedReturn: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadInvestments();
  }

  loadInvestments(): void {
    this.lumpSumService.getLumpSums().subscribe(investments => {
      this.investments = investments;
      this.calculateInvestments();
    });
  }

  addInvestment(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.lumpSumForm.reset();
  }

  editInvestment(investment: LumpSum): void {
    this.isEditing = true;
    this.currentEditId = investment.id || null;
    this.lumpSumForm.patchValue({
      investmentName: investment.investmentName,
      principalAmount: investment.principalAmount,
      duration: investment.duration,
      expectedReturn: investment.expectedReturn
    });
  }

  saveInvestment(): void {
    if (this.lumpSumForm.valid) {
      const investmentData = this.lumpSumForm.value;
      this.calculateSingleInvestment(investmentData);

      if (this.isEditing && this.currentEditId) {
        this.lumpSumService.updateLumpSum(this.currentEditId, investmentData)
          .subscribe(() => {
            this.loadInvestments();
            this.lumpSumForm.reset();
          });
      } else {
        this.lumpSumService.addLumpSum(investmentData)
          .subscribe(() => {
            this.loadInvestments();
            this.lumpSumForm.reset();
          });
      }
    }
  }

  deleteInvestment(id: number): void {
    if (confirm('Are you sure you want to delete this investment?')) {
      this.lumpSumService.deleteLumpSum(id).subscribe(() => {
        this.loadInvestments();
      });
    }
  }

  calculateInvestments(): void {
    this.totalFutureValue = 0;
    this.totalPrincipal = 0;
    this.totalInterest = 0;

    this.investments.forEach(investment => {
      this.calculateSingleInvestment(investment);
      
      if (investment.futureValue) this.totalFutureValue += investment.futureValue;
      if (investment.principalAmount) this.totalPrincipal += investment.principalAmount;
      if (investment.totalInterest) this.totalInterest += investment.totalInterest;
    });
  }

  private calculateSingleInvestment(investment: LumpSum): void {
    const principal = investment.principalAmount || 0;
    const duration = investment.duration || 0;
    const expectedReturn = investment.expectedReturn || 0;

    // Calculate future value using compound interest formula: FV = P(1 + r)^n
    investment.futureValue = principal * Math.pow(1 + (expectedReturn / 100), duration);
    
    // Calculate total interest
    investment.totalInterest = (investment.futureValue || 0) - principal;
  }
}
```

### `lump-sum-calculator.component.html`
```html
<div class="container mt-4">
  <div class="card shadow">
    <div class="card-header bg-primary text-white">
      <h3 class="mb-0">Lump Sum Investment Calculator</h3>
    </div>
    <div class="card-body">
      <!-- Investment Form -->
      <form [formGroup]="lumpSumForm" (ngSubmit)="saveInvestment()" class="mb-4">
        <div class="row g-3">
          <div class="col-md-3">
            <label for="investmentName" class="form-label">Investment Name</label>
            <input type="text" class="form-control" id="investmentName" 
                   formControlName="investmentName" placeholder="e.g., Stock Investment">
            <div *ngIf="lumpSumForm.get('investmentName')?.invalid && lumpSumForm.get('investmentName')?.touched" 
                 class="text-danger">
              Investment name is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="principalAmount" class="form-label">Principal Amount (₹)</label>
            <input type="number" class="form-control" id="principalAmount" 
                   formControlName="principalAmount" min="1" placeholder="e.g., 100000">
            <div *ngIf="lumpSumForm.get('principalAmount')?.invalid && lumpSumForm.get('principalAmount')?.touched" 
                 class="text-danger">
              Valid amount is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="duration" class="form-label">Duration (Years)</label>
            <input type="number" class="form-control" id="duration" 
                   formControlName="duration" min="1" placeholder="e.g., 5">
            <div *ngIf="lumpSumForm.get('duration')?.invalid && lumpSumForm.get('duration')?.touched" 
                 class="text-danger">
              Valid duration is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="expectedReturn" class="form-label">Expected Return (%)</label>
            <input type="number" class="form-control" id="expectedReturn" 
                   formControlName="expectedReturn" step="0.01" min="0.01" placeholder="e.g., 10">
            <div *ngIf="lumpSumForm.get('expectedReturn')?.invalid && lumpSumForm.get('expectedReturn')?.touched" 
                 class="text-danger">
              Valid return rate is required
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button type="submit" class="btn btn-primary me-2" [disabled]="!lumpSumForm.valid">
              {{ isEditing ? 'Update' : 'Add' }} Investment
            </button>
            <button type="button" class="btn btn-outline-secondary" (click)="addInvestment()" *ngIf="isEditing">
              Cancel
            </button>
          </div>
        </div>
      </form>

      <!-- Investments Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Investment Name</th>
              <th class="text-end">Principal (₹)</th>
              <th class="text-end">Duration (Yrs)</th>
              <th class="text-end">Return (%)</th>
              <th class="text-end">Future Value (₹)</th>
              <th class="text-end">Total Interest (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let investment of investments">
              <td>{{ investment.investmentName }}</td>
              <td class="text-end">{{ investment.principalAmount | number:'1.2-2' }}</td>
              <td class="text-end">{{ investment.duration }}</td>
              <td class="text-end">{{ investment.expectedReturn | number:'1.2-2' }}</td>
              <td class="text-end">{{ investment.futureValue | number:'1.2-2' }}</td>
              <td class="text-end">{{ investment.totalInterest | number:'1.2-2' }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-2" (click)="editInvestment(investment)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteInvestment(investment.id!)" *ngIf="investment.id">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="row mt-4">
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Principal</h5>
              <p class="card-text fs-4">{{ totalPrincipal | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Interest</h5>
              <p class="card-text fs-4">{{ totalInterest | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Future Value</h5>
              <p class="card-text fs-4">{{ totalFutureValue | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### `lump-sum-calculator.component.css`
```css
.table th {
  font-weight: 600;
}

.card {
  border-radius: 0.5rem;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.table-responsive {
  border-radius: 0.5rem;
  overflow: hidden;
}

.table th.text-end, 
.table td.text-end {
  padding-right: 1.5rem;
}

.card-body.text-center .card-text {
  color: #0d6efd;
  font-weight: 600;
}

/* Add some spacing between form and table */
form {
  margin-bottom: 2rem;
}
```

## 5. App Module (`app.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { LumpSumCalculatorComponent } from './components/lump-sum-calculator/lump-sum-calculator.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    LumpSumCalculatorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## 6. App Routing Module (`app-routing.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LumpSumCalculatorComponent } from './components/lump-sum-calculator/lump-sum-calculator.component';

const routes: Routes = [
  { path: '', component: LumpSumCalculatorComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

## 7. JSON Server Setup

Create or update your `db.json` file in the project root:
```json
{
  "lumpSums": [
    {
      "id": 1,
      "investmentName": "Stock Portfolio",
      "principalAmount": 500000,
      "duration": 5,
      "expectedReturn": 12,
      "futureValue": 881170.49,
      "totalInterest": 381170.49
    },
    {
      "id": 2,
      "investmentName": "Bond Investment",
      "principalAmount": 300000,
      "duration": 3,
      "expectedReturn": 7,
      "futureValue": 367512.90,
      "totalInterest": 67512.90
    }
  ]
}
```

## 8. Running the Application

1. Start JSON server:
```bash
json-server --watch db.json
```

2. Start Angular application:
```bash
ng serve
```

## Features Implemented

1. **Add Investments**: Add new lump sum investments with validation
2. **Edit Investments**: Modify existing investments
3. **Delete Investments**: Remove investments
4. **Calculate Investments**: Automatic calculation of future value and interest
5. **Multiple Investments**: Manage and calculate multiple investments simultaneously
6. **Totals**: View aggregated totals for all investments
7. **Responsive Design**: Works on all screen sizes
8. **Form Validation**: Ensures valid data entry
9. **Persistent Data**: All data is saved to and retrieved from JSON server

This implementation provides a complete solution for managing and calculating lump sum investments with a clean, user-friendly interface built with Bootstrap. The calculator uses the standard compound interest formula (FV = P(1 + r)^n) to compute future values.

# SIP (Systematic Investment Plan) Calculator with Angular, Bootstrap, and JSON Server

Here's a complete implementation for an SIP calculator that allows adding, editing, deleting, and calculating multiple SIPs inline.

## 1. File Structure
```
src/
├── app/
│   ├── components/
│   │   └── sip-calculator/
│   │       ├── sip-calculator.component.ts
│   │       ├── sip-calculator.component.html
│   │       └── sip-calculator.component.css
│   ├── models/
│   │   └── sip.model.ts
│   ├── services/
│   │   └── sip.service.ts
│   ├── app.module.ts
│   └── app-routing.module.ts
```

## 2. SIP Model (`sip.model.ts`)
```typescript
export interface SIP {
  id?: number;
  investmentOnName: string;
  monthlyInvestment: number | null;
  duration: number | null;
  expectedReturn: number | null;
  futureValue: number | null;
  totalInvestment: number | null;
  totalInterestPaid: number | null;
}
```

## 3. SIP Service (`sip.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SIP } from '../models/sip.model';

@Injectable({
  providedIn: 'root'
})
export class SipService {
  private apiUrl = 'http://localhost:3000/sips';

  constructor(private http: HttpClient) { }

  getSIPs(): Observable<SIP[]> {
    return this.http.get<SIP[]>(this.apiUrl);
  }

  addSIP(sip: SIP): Observable<SIP> {
    return this.http.post<SIP>(this.apiUrl, sip);
  }

  updateSIP(id: number, sip: SIP): Observable<SIP> {
    return this.http.put<SIP>(`${this.apiUrl}/${id}`, sip);
  }

  deleteSIP(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## 4. SIP Calculator Component

### `sip-calculator.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { SIP } from '../../models/sip.model';
import { SipService } from '../../services/sip.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sip-calculator',
  templateUrl: './sip-calculator.component.html',
  styleUrls: ['./sip-calculator.component.css']
})
export class SipCalculatorComponent implements OnInit {
  sipData: SIP[] = [];
  totalFutureValue = 0;
  totalInvestment = 0;
  totalInterestPaid = 0;
  sipForm: FormGroup;
  isEditing = false;
  currentEditId: number | null = null;

  constructor(
    private sipService: SipService,
    private fb: FormBuilder
  ) {
    this.sipForm = this.fb.group({
      investmentOnName: ['', Validators.required],
      monthlyInvestment: [null, [Validators.required, Validators.min(1)]],
      duration: [null, [Validators.required, Validators.min(1)]],
      expectedReturn: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadSIPs();
  }

  loadSIPs(): void {
    this.sipService.getSIPs().subscribe(sips => {
      this.sipData = sips;
      this.calculateSIP();
    });
  }

  addSIP(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.sipForm.reset();
  }

  editSIP(sip: SIP): void {
    this.isEditing = true;
    this.currentEditId = sip.id || null;
    this.sipForm.patchValue({
      investmentOnName: sip.investmentOnName,
      monthlyInvestment: sip.monthlyInvestment,
      duration: sip.duration,
      expectedReturn: sip.expectedReturn
    });
  }

  saveSIP(): void {
    if (this.sipForm.valid) {
      const sipData = this.sipForm.value;
      this.calculateSingleSIP(sipData);

      if (this.isEditing && this.currentEditId) {
        this.sipService.updateSIP(this.currentEditId, sipData).subscribe(() => {
          this.loadSIPs();
          this.sipForm.reset();
        });
      } else {
        this.sipService.addSIP(sipData).subscribe(() => {
          this.loadSIPs();
          this.sipForm.reset();
        });
      }
    }
  }

  deleteSIP(id: number): void {
    if (confirm('Are you sure you want to delete this SIP?')) {
      this.sipService.deleteSIP(id).subscribe(() => {
        this.loadSIPs();
      });
    }
  }

  calculateSIP(): void {
    this.totalFutureValue = 0;
    this.totalInvestment = 0;
    this.totalInterestPaid = 0;

    this.sipData.forEach(sip => {
      this.calculateSingleSIP(sip);
      
      if (sip.futureValue) this.totalFutureValue += sip.futureValue;
      if (sip.totalInvestment) this.totalInvestment += sip.totalInvestment;
      if (sip.totalInterestPaid) this.totalInterestPaid += sip.totalInterestPaid;
    });
  }

  private calculateSingleSIP(sip: SIP): void {
    const monthlyInvestment = sip.monthlyInvestment || 0;
    const duration = sip.duration || 0;
    const expectedReturn = sip.expectedReturn || 0;

    const monthlyReturn = expectedReturn / 12 / 100;
    const totalMonths = duration * 12;

    // Calculate future value using the formula for compound interest
    sip.futureValue = monthlyInvestment * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn);

    // Calculate total investment
    sip.totalInvestment = monthlyInvestment * totalMonths;

    // Calculate total interest paid
    sip.totalInterestPaid = (sip.futureValue || 0) - (sip.totalInvestment || 0);
  }
}
```

### `sip-calculator.component.html`
```html
<div class="container mt-4">
  <div class="card shadow">
    <div class="card-header bg-primary text-white">
      <h3 class="mb-0">SIP Calculator</h3>
    </div>
    <div class="card-body">
      <!-- SIP Form -->
      <form [formGroup]="sipForm" (ngSubmit)="saveSIP()" class="mb-4">
        <div class="row g-3">
          <div class="col-md-3">
            <label for="investmentOnName" class="form-label">Investment Name</label>
            <input type="text" class="form-control" id="investmentOnName" 
                   formControlName="investmentOnName" placeholder="e.g., Mutual Fund">
            <div *ngIf="sipForm.get('investmentOnName')?.invalid && sipForm.get('investmentOnName')?.touched" 
                 class="text-danger">
              Investment name is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="monthlyInvestment" class="form-label">Monthly Investment (₹)</label>
            <input type="number" class="form-control" id="monthlyInvestment" 
                   formControlName="monthlyInvestment" min="1" placeholder="e.g., 5000">
            <div *ngIf="sipForm.get('monthlyInvestment')?.invalid && sipForm.get('monthlyInvestment')?.touched" 
                 class="text-danger">
              Valid amount is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="duration" class="form-label">Duration (Years)</label>
            <input type="number" class="form-control" id="duration" 
                   formControlName="duration" min="1" placeholder="e.g., 5">
            <div *ngIf="sipForm.get('duration')?.invalid && sipForm.get('duration')?.touched" 
                 class="text-danger">
              Valid duration is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="expectedReturn" class="form-label">Expected Return (%)</label>
            <input type="number" class="form-control" id="expectedReturn" 
                   formControlName="expectedReturn" step="0.01" min="0.01" placeholder="e.g., 12">
            <div *ngIf="sipForm.get('expectedReturn')?.invalid && sipForm.get('expectedReturn')?.touched" 
                 class="text-danger">
              Valid return rate is required
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button type="submit" class="btn btn-primary me-2" [disabled]="!sipForm.valid">
              {{ isEditing ? 'Update' : 'Add' }} SIP
            </button>
            <button type="button" class="btn btn-outline-secondary" (click)="addSIP()" *ngIf="isEditing">
              Cancel
            </button>
          </div>
        </div>
      </form>

      <!-- SIP List Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Investment Name</th>
              <th class="text-end">Monthly (₹)</th>
              <th class="text-end">Duration (Yrs)</th>
              <th class="text-end">Return (%)</th>
              <th class="text-end">Future Value (₹)</th>
              <th class="text-end">Total Invested (₹)</th>
              <th class="text-end">Interest Earned (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let sip of sipData">
              <td>{{ sip.investmentOnName }}</td>
              <td class="text-end">{{ sip.monthlyInvestment | number:'1.2-2' }}</td>
              <td class="text-end">{{ sip.duration }}</td>
              <td class="text-end">{{ sip.expectedReturn | number:'1.2-2' }}</td>
              <td class="text-end">{{ sip.futureValue | number:'1.2-2' }}</td>
              <td class="text-end">{{ sip.totalInvestment | number:'1.2-2' }}</td>
              <td class="text-end">{{ sip.totalInterestPaid | number:'1.2-2' }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-2" (click)="editSIP(sip)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteSIP(sip.id!)" *ngIf="sip.id">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="row mt-4">
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Investment</h5>
              <p class="card-text fs-4">{{ totalInvestment | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Interest</h5>
              <p class="card-text fs-4">{{ totalInterestPaid | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Future Value</h5>
              <p class="card-text fs-4">{{ totalFutureValue | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### `sip-calculator.component.css`
```css
.table th {
  font-weight: 600;
}

.card {
  border-radius: 0.5rem;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.table-responsive {
  border-radius: 0.5rem;
  overflow: hidden;
}

.table th.text-end, 
.table td.text-end {
  padding-right: 1.5rem;
}

.card-body.text-center .card-text {
  color: #0d6efd;
  font-weight: 600;
}
```

## 5. App Module (`app.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { SipCalculatorComponent } from './components/sip-calculator/sip-calculator.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    SipCalculatorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## 6. App Routing Module (`app-routing.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SipCalculatorComponent } from './components/sip-calculator/sip-calculator.component';

const routes: Routes = [
  { path: '', component: SipCalculatorComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

## 7. JSON Server Setup

Create a `db.json` file in your project root:
```json
{
  "sips": [
    {
      "id": 1,
      "investmentOnName": "Large Cap Fund",
      "monthlyInvestment": 10000,
      "duration": 5,
      "expectedReturn": 12,
      "futureValue": 825152.92,
      "totalInvestment": 600000,
      "totalInterestPaid": 225152.92
    },
    {
      "id": 2,
      "investmentOnName": "Small Cap Fund",
      "monthlyInvestment": 5000,
      "duration": 10,
      "expectedReturn": 15,
      "futureValue": 1392718.70,
      "totalInvestment": 600000,
      "totalInterestPaid": 792718.70
    }
  ]
}
```

## 8. Running the Application

1. Start JSON server:
```bash
json-server --watch db.json
```

2. Start Angular application:
```bash
ng serve
```

## Features Implemented

1. **Add SIP**: Add new SIP investments with validation
2. **Edit SIP**: Modify existing SIP investments
3. **Delete SIP**: Remove SIP investments
4. **Calculate SIP**: Automatic calculation of future value, total investment, and interest
5. **Multiple SIPs**: Manage and calculate multiple SIPs simultaneously
6. **Totals**: View aggregated totals for all SIPs
7. **Responsive Design**: Works on all screen sizes
8. **Form Validation**: Ensures valid data entry
9. **Persistent Data**: All data is saved to and retrieved from JSON server

The application provides a complete solution for managing and calculating SIP investments with a clean, user-friendly interface built with Bootstrap.

# EMI Calculator with Angular, Bootstrap, and JSON Server

Here's a complete implementation for an EMI calculator that allows adding, editing, deleting, and calculating multiple EMIs inline.

## 1. File Structure
```
src/
├── app/
│   ├── components/
│   │   └── emi-calculator/
│   │       ├── emi-calculator.component.ts
│   │       ├── emi-calculator.component.html
│   │       └── emi-calculator.component.css
│   ├── models/
│   │   └── emi.model.ts
│   ├── services/
│   │   └── emi.service.ts
│   ├── app.module.ts
│   └── app-routing.module.ts
```

## 2. EMI Model (`emi.model.ts`)
```typescript
export interface EMI {
  id?: number;
  emiForName: string;
  principal: number | null;
  annualInterestRate: number | null;
  totalTenure: number | null;
  tenuresPaid: number;
  emiAmount: number | null;
  principalPaidSoFar: number | null;
  interestPaidSoFar: number | null;
  remainingPrincipal: number | null;
  interestToBePaid: number | null;
  remainingTenure: number | null;
}
```

## 3. EMI Service (`emi.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EMI } from '../models/emi.model';

@Injectable({
  providedIn: 'root'
})
export class EmiService {
  private apiUrl = 'http://localhost:3000/emis';

  constructor(private http: HttpClient) { }

  getEMIs(): Observable<EMI[]> {
    return this.http.get<EMI[]>(this.apiUrl);
  }

  addEMI(emi: EMI): Observable<EMI> {
    return this.http.post<EMI>(this.apiUrl, emi);
  }

  updateEMI(id: number, emi: EMI): Observable<EMI> {
    return this.http.put<EMI>(`${this.apiUrl}/${id}`, emi);
  }

  deleteEMI(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## 4. EMI Calculator Component

### `emi-calculator.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { EMI } from '../../models/emi.model';
import { EmiService } from '../../services/emi.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-emi-calculator',
  templateUrl: './emi-calculator.component.html',
  styleUrls: ['./emi-calculator.component.css']
})
export class EmiCalculatorComponent implements OnInit {
  emiData: EMI[] = [];
  totalEmiInterestPaid = 0;
  totalPrincipalPaid = 0;
  totalEMIAmount = 0;
  totalRemainingPrincipal = 0;
  totalInterestToBePaid = 0;
  totalRemainingTenure = 0;
  emiForm: FormGroup;
  isEditing = false;
  currentEditId: number | null = null;

  constructor(
    private emiService: EmiService,
    private fb: FormBuilder
  ) {
    this.emiForm = this.fb.group({
      emiForName: ['', Validators.required],
      principal: [null, [Validators.required, Validators.min(1)]],
      annualInterestRate: [null, [Validators.required, Validators.min(0.01)]],
      totalTenure: [null, [Validators.required, Validators.min(1)]],
      tenuresPaid: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadEMIs();
  }

  loadEMIs(): void {
    this.emiService.getEMIs().subscribe(emis => {
      this.emiData = emis;
      this.calculateAllEMIs();
    });
  }

  addEMI(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.emiForm.reset({ tenuresPaid: 0 });
  }

  editEMI(emi: EMI): void {
    this.isEditing = true;
    this.currentEditId = emi.id || null;
    this.emiForm.patchValue({
      emiForName: emi.emiForName,
      principal: emi.principal,
      annualInterestRate: emi.annualInterestRate,
      totalTenure: emi.totalTenure,
      tenuresPaid: emi.tenuresPaid
    });
  }

  saveEMI(): void {
    if (this.emiForm.valid) {
      const emiData = this.emiForm.value;
      this.calculateSingleEMI(emiData);

      if (this.isEditing && this.currentEditId) {
        this.emiService.updateEMI(this.currentEditId, emiData)
          .subscribe(() => {
            this.loadEMIs();
            this.emiForm.reset({ tenuresPaid: 0 });
          });
      } else {
        this.emiService.addEMI(emiData)
          .subscribe(() => {
            this.loadEMIs();
            this.emiForm.reset({ tenuresPaid: 0 });
          });
      }
    }
  }

  deleteEMI(id: number): void {
    if (confirm('Are you sure you want to delete this EMI?')) {
      this.emiService.deleteEMI(id).subscribe(() => {
        this.loadEMIs();
      });
    }
  }

  calculateSingleEMI(emi: EMI): void {
    if (emi.principal && emi.annualInterestRate && emi.totalTenure !== null && emi.tenuresPaid !== null) {
      const monthlyInterestRate = emi.annualInterestRate / 12 / 100;
      const totalMonths = emi.totalTenure * 12;
      const monthsPaid = emi.tenuresPaid;

      // Calculate EMI using the formula
      emi.emiAmount = (emi.principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / 
                      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

      let remainingPrincipal = emi.principal;
      emi.interestPaidSoFar = 0;
      emi.principalPaidSoFar = 0;

      // Calculate paid amounts
      for (let month = 0; month < monthsPaid; month++) {
        const interestForMonth = remainingPrincipal * monthlyInterestRate;
        const principalForMonth = (emi.emiAmount || 0) - interestForMonth;

        emi.interestPaidSoFar += interestForMonth;
        emi.principalPaidSoFar += principalForMonth;
        remainingPrincipal -= principalForMonth;
      }

      emi.remainingPrincipal = remainingPrincipal;
      emi.remainingTenure = totalMonths - monthsPaid;
      emi.interestToBePaid = 0;

      // Calculate future interest
      let tempPrincipal = emi.remainingPrincipal;
      for (let month = 0; month < (emi.remainingTenure || 0); month++) {
        const interestForMonth = tempPrincipal * monthlyInterestRate;
        const principalForMonth = (emi.emiAmount || 0) - interestForMonth;

        emi.interestToBePaid += interestForMonth;
        tempPrincipal -= principalForMonth;
      }
    }
  }

  calculateAllEMIs(): void {
    this.totalEmiInterestPaid = 0;
    this.totalPrincipalPaid = 0;
    this.totalEMIAmount = 0;
    this.totalRemainingPrincipal = 0;
    this.totalInterestToBePaid = 0;
    this.totalRemainingTenure = 0;

    this.emiData.forEach(emi => {
      this.calculateSingleEMI(emi);
      
      if (emi.interestPaidSoFar) this.totalEmiInterestPaid += emi.interestPaidSoFar;
      if (emi.principalPaidSoFar) this.totalPrincipalPaid += emi.principalPaidSoFar;
      if (emi.emiAmount) this.totalEMIAmount += emi.emiAmount;
      if (emi.remainingPrincipal) this.totalRemainingPrincipal += emi.remainingPrincipal;
      if (emi.interestToBePaid) this.totalInterestToBePaid += emi.interestToBePaid;
      if (emi.remainingTenure) this.totalRemainingTenure += emi.remainingTenure;
    });
  }
}
```

### `emi-calculator.component.html`
```html
<div class="container mt-4">
  <div class="card shadow">
    <div class="card-header bg-primary text-white">
      <h3 class="mb-0">EMI Calculator</h3>
    </div>
    <div class="card-body">
      <!-- EMI Form -->
      <form [formGroup]="emiForm" (ngSubmit)="saveEMI()" class="mb-4">
        <div class="row g-3">
          <div class="col-md-3">
            <label for="emiForName" class="form-label">Loan For</label>
            <input type="text" class="form-control" id="emiForName" 
                   formControlName="emiForName" placeholder="e.g., Home Loan">
            <div *ngIf="emiForm.get('emiForName')?.invalid && emiForm.get('emiForName')?.touched" 
                 class="text-danger">
              Loan purpose is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="principal" class="form-label">Principal (₹)</label>
            <input type="number" class="form-control" id="principal" 
                   formControlName="principal" min="1" placeholder="e.g., 500000">
            <div *ngIf="emiForm.get('principal')?.invalid && emiForm.get('principal')?.touched" 
                 class="text-danger">
              Valid amount is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="annualInterestRate" class="form-label">Interest Rate (%)</label>
            <input type="number" class="form-control" id="annualInterestRate" 
                   formControlName="annualInterestRate" step="0.01" min="0.01" placeholder="e.g., 8.5">
            <div *ngIf="emiForm.get('annualInterestRate')?.invalid && emiForm.get('annualInterestRate')?.touched" 
                 class="text-danger">
              Valid interest rate is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="totalTenure" class="form-label">Tenure (Years)</label>
            <input type="number" class="form-control" id="totalTenure" 
                   formControlName="totalTenure" min="1" placeholder="e.g., 20">
            <div *ngIf="emiForm.get('totalTenure')?.invalid && emiForm.get('totalTenure')?.touched" 
                 class="text-danger">
              Valid tenure is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="tenuresPaid" class="form-label">Paid (Months)</label>
            <input type="number" class="form-control" id="tenuresPaid" 
                   formControlName="tenuresPaid" min="0" placeholder="e.g., 24">
            <div *ngIf="emiForm.get('tenuresPaid')?.invalid && emiForm.get('tenuresPaid')?.touched" 
                 class="text-danger">
              Valid number is required
            </div>
          </div>
          <div class="col-md-1 d-flex align-items-end">
            <button type="submit" class="btn btn-primary me-2" [disabled]="!emiForm.valid">
              {{ isEditing ? 'Update' : 'Add' }}
            </button>
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-md-12">
            <button type="button" class="btn btn-outline-secondary" (click)="addEMI()" *ngIf="isEditing">
              Cancel
            </button>
          </div>
        </div>
      </form>

      <!-- EMI List Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Loan For</th>
              <th class="text-end">Principal (₹)</th>
              <th class="text-end">Rate (%)</th>
              <th class="text-end">Tenure (Yrs)</th>
              <th class="text-end">Paid (Mons)</th>
              <th class="text-end">EMI (₹)</th>
              <th class="text-end">Principal Paid (₹)</th>
              <th class="text-end">Interest Paid (₹)</th>
              <th class="text-end">Remaining (₹)</th>
              <th class="text-end">Future Interest (₹)</th>
              <th class="text-end">Remaining (Mons)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let emi of emiData">
              <td>{{ emi.emiForName }}</td>
              <td class="text-end">{{ emi.principal | number:'1.2-2' }}</td>
              <td class="text-end">{{ emi.annualInterestRate | number:'1.2-2' }}</td>
              <td class="text-end">{{ emi.totalTenure }}</td>
              <td class="text-end">{{ emi.tenuresPaid }}</td>
              <td class="text-end">{{ emi.emiAmount | number:'1.2-2' }}</td>
              <td class="text-end">{{ emi.principalPaidSoFar | number:'1.2-2' }}</td>
              <td class="text-end">{{ emi.interestPaidSoFar | number:'1.2-2' }}</td>
              <td class="text-end">{{ emi.remainingPrincipal | number:'1.2-2' }}</td>
              <td class="text-end">{{ emi.interestToBePaid | number:'1.2-2' }}</td>
              <td class="text-end">{{ emi.remainingTenure }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-2" (click)="editEMI(emi)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteEMI(emi.id!)" *ngIf="emi.id">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="row mt-4">
        <div class="col-md-3">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Principal Paid</h5>
              <p class="card-text fs-4">{{ totalPrincipalPaid | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Interest Paid</h5>
              <p class="card-text fs-4">{{ totalEmiInterestPaid | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Remaining Principal</h5>
              <p class="card-text fs-4">{{ totalRemainingPrincipal | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Future Interest</h5>
              <p class="card-text fs-4">{{ totalInterestToBePaid | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### `emi-calculator.component.css`
```css
.table th {
  font-weight: 600;
  white-space: nowrap;
}

.card {
  border-radius: 0.5rem;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.table-responsive {
  border-radius: 0.5rem;
  overflow: hidden;
}

.table th.text-end, 
.table td.text-end {
  padding-right: 1.5rem;
}

.card-body.text-center .card-text {
  color: #0d6efd;
  font-weight: 600;
}

/* Add some spacing between form and table */
form {
  margin-bottom: 2rem;
}

/* Make table more compact */
.table td, .table th {
  padding: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .table-responsive {
    overflow-x: auto;
  }
}
```

## 5. App Module (`app.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { EmiCalculatorComponent } from './components/emi-calculator/emi-calculator.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    EmiCalculatorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## 6. App Routing Module (`app-routing.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmiCalculatorComponent } from './components/emi-calculator/emi-calculator.component';

const routes: Routes = [
  { path: '', component: EmiCalculatorComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

## 7. JSON Server Setup

Create or update your `db.json` file in the project root:
```json
{
  "emis": [
    {
      "id": 1,
      "emiForName": "Home Loan",
      "principal": 5000000,
      "annualInterestRate": 8.5,
      "totalTenure": 20,
      "tenuresPaid": 24,
      "emiAmount": 43438.42,
      "principalPaidSoFar": 483932.58,
      "interestPaidSoFar": 558989.46,
      "remainingPrincipal": 4516067.42,
      "interestToBePaid": 4666253.58,
      "remainingTenure": 216
    },
    {
      "id": 2,
      "emiForName": "Car Loan",
      "principal": 800000,
      "annualInterestRate": 9.5,
      "totalTenure": 5,
      "tenuresPaid": 12,
      "emiAmount": 16791.34,
      "principalPaidSoFar": 107654.66,
      "interestPaidSoFar": 93741.42,
      "remainingPrincipal": 692345.34,
      "interestToBePaid": 143136.66,
      "remainingTenure": 48
    }
  ]
}
```

## 8. Running the Application

1. Start JSON server:
```bash
json-server --watch db.json
```

2. Start Angular application:
```bash
ng serve
```

## Features Implemented

1. **Add EMIs**: Add new loan EMIs with validation
2. **Edit EMIs**: Modify existing EMIs
3. **Delete EMIs**: Remove EMIs
4. **Calculate EMIs**: Automatic calculation of all EMI components
5. **Multiple EMIs**: Manage and calculate multiple EMIs simultaneously
6. **Detailed Breakdown**: Shows principal paid, interest paid, remaining amounts, and future interest
7. **Totals**: View aggregated totals for all EMIs
8. **Responsive Design**: Works on all screen sizes
9. **Form Validation**: Ensures valid data entry
10. **Persistent Data**: All data is saved to and retrieved from JSON server

This implementation provides a comprehensive solution for managing and calculating EMIs with a clean, user-friendly interface built with Bootstrap. The calculator uses the standard EMI formula and provides detailed breakdowns of loan repayment status.

# Income Source Projection Calculator with Angular, Bootstrap, and JSON Server

Here's a complete implementation for an income source projection calculator that allows adding, editing, deleting, and calculating multiple income sources with growth projections.

## 1. File Structure
```
src/
├── app/
│   ├── components/
│   │   └── income-calculator/
│   │       ├── income-calculator.component.ts
│   │       ├── income-calculator.component.html
│   │       └── income-calculator.component.css
│   ├── models/
│   │   └── income-source.model.ts
│   ├── services/
│   │   └── income.service.ts
│   ├── app.module.ts
│   └── app-routing.module.ts
```

## 2. Income Source Model (`income-source.model.ts`)
```typescript
export interface IncomeSource {
  id?: number;
  sourceName: string;
  initialMonthlyIncome: number | null;
  annualGrowthRate: number | null;
  years: number | null;
  projectedMonthlyIncome: number | null;
  totalAmountReceived: number | null;
}
```

## 3. Income Service (`income.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IncomeSource } from '../models/income-source.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private apiUrl = 'http://localhost:3000/incomeSources';

  constructor(private http: HttpClient) { }

  getIncomeSources(): Observable<IncomeSource[]> {
    return this.http.get<IncomeSource[]>(this.apiUrl);
  }

  addIncomeSource(incomeSource: IncomeSource): Observable<IncomeSource> {
    return this.http.post<IncomeSource>(this.apiUrl, incomeSource);
  }

  updateIncomeSource(id: number, incomeSource: IncomeSource): Observable<IncomeSource> {
    return this.http.put<IncomeSource>(`${this.apiUrl}/${id}`, incomeSource);
  }

  deleteIncomeSource(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## 4. Income Calculator Component

### `income-calculator.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { IncomeSource } from '../../models/income-source.model';
import { IncomeService } from '../../services/income.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-income-calculator',
  templateUrl: './income-calculator.component.html',
  styleUrls: ['./income-calculator.component.css']
})
export class IncomeCalculatorComponent implements OnInit {
  incomeSources: IncomeSource[] = [];
  totalInitialIncome = 0;
  totalProjectedIncome = 0;
  totalAmountReceived = 0;
  incomeForm: FormGroup;
  isEditing = false;
  currentEditId: number | null = null;

  constructor(
    private incomeService: IncomeService,
    private fb: FormBuilder
  ) {
    this.incomeForm = this.fb.group({
      sourceName: ['', Validators.required],
      initialMonthlyIncome: [null, [Validators.required, Validators.min(1)]],
      annualGrowthRate: [null, [Validators.required, Validators.min(0)]],
      years: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadIncomeSources();
  }

  loadIncomeSources(): void {
    this.incomeService.getIncomeSources().subscribe(sources => {
      this.incomeSources = sources;
      this.calculateTotalIncome();
    });
  }

  addIncomeSource(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.incomeForm.reset();
  }

  editIncomeSource(source: IncomeSource): void {
    this.isEditing = true;
    this.currentEditId = source.id || null;
    this.incomeForm.patchValue({
      sourceName: source.sourceName,
      initialMonthlyIncome: source.initialMonthlyIncome,
      annualGrowthRate: source.annualGrowthRate,
      years: source.years
    });
  }

  saveIncomeSource(): void {
    if (this.incomeForm.valid) {
      const incomeData = this.incomeForm.value;
      this.calculateIncomeDetails(incomeData);

      if (this.isEditing && this.currentEditId) {
        this.incomeService.updateIncomeSource(this.currentEditId, incomeData)
          .subscribe(() => {
            this.loadIncomeSources();
            this.incomeForm.reset();
          });
      } else {
        this.incomeService.addIncomeSource(incomeData)
          .subscribe(() => {
            this.loadIncomeSources();
            this.incomeForm.reset();
          });
      }
    }
  }

  deleteIncomeSource(id: number): void {
    if (confirm('Are you sure you want to delete this income source?')) {
      this.incomeService.deleteIncomeSource(id).subscribe(() => {
        this.loadIncomeSources();
      });
    }
  }

  calculateIncomeDetails(incomeSource: IncomeSource): void {
    if (incomeSource.initialMonthlyIncome && incomeSource.annualGrowthRate !== null && incomeSource.years) {
      // Calculate projected monthly income after growth
      incomeSource.projectedMonthlyIncome = incomeSource.initialMonthlyIncome * 
        Math.pow(1 + (incomeSource.annualGrowthRate / 100), incomeSource.years);
      
      // Calculate total amount received over the years
      incomeSource.totalAmountReceived = 0;
      let currentMonthlyIncome = incomeSource.initialMonthlyIncome;
      
      for (let year = 0; year < incomeSource.years; year++) {
        incomeSource.totalAmountReceived += currentMonthlyIncome * 12;
        currentMonthlyIncome *= 1 + (incomeSource.annualGrowthRate / 100);
      }
    }
  }

  calculateTotalIncome(): void {
    this.totalInitialIncome = 0;
    this.totalProjectedIncome = 0;
    this.totalAmountReceived = 0;

    this.incomeSources.forEach(source => {
      this.calculateIncomeDetails(source);
      
      if (source.initialMonthlyIncome) this.totalInitialIncome += source.initialMonthlyIncome * 12;
      if (source.projectedMonthlyIncome) this.totalProjectedIncome += source.projectedMonthlyIncome * 12;
      if (source.totalAmountReceived) this.totalAmountReceived += source.totalAmountReceived;
    });
  }
}
```

### `income-calculator.component.html`
```html
<div class="container mt-4">
  <div class="card shadow">
    <div class="card-header bg-primary text-white">
      <h3 class="mb-0">Income Projection Calculator</h3>
    </div>
    <div class="card-body">
      <!-- Income Form -->
      <form [formGroup]="incomeForm" (ngSubmit)="saveIncomeSource()" class="mb-4">
        <div class="row g-3">
          <div class="col-md-3">
            <label for="sourceName" class="form-label">Income Source</label>
            <input type="text" class="form-control" id="sourceName" 
                   formControlName="sourceName" placeholder="e.g., Salary, Rental">
            <div *ngIf="incomeForm.get('sourceName')?.invalid && incomeForm.get('sourceName')?.touched" 
                 class="text-danger">
              Income source is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="initialMonthlyIncome" class="form-label">Monthly Income (₹)</label>
            <input type="number" class="form-control" id="initialMonthlyIncome" 
                   formControlName="initialMonthlyIncome" min="1" placeholder="e.g., 50000">
            <div *ngIf="incomeForm.get('initialMonthlyIncome')?.invalid && incomeForm.get('initialMonthlyIncome')?.touched" 
                 class="text-danger">
              Valid amount is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="annualGrowthRate" class="form-label">Growth Rate (%)</label>
            <input type="number" class="form-control" id="annualGrowthRate" 
                   formControlName="annualGrowthRate" step="0.01" min="0" placeholder="e.g., 5">
            <div *ngIf="incomeForm.get('annualGrowthRate')?.invalid && incomeForm.get('annualGrowthRate')?.touched" 
                 class="text-danger">
              Valid growth rate is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="years" class="form-label">Years</label>
            <input type="number" class="form-control" id="years" 
                   formControlName="years" min="1" placeholder="e.g., 10">
            <div *ngIf="incomeForm.get('years')?.invalid && incomeForm.get('years')?.touched" 
                 class="text-danger">
              Valid number of years is required
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button type="submit" class="btn btn-primary me-2" [disabled]="!incomeForm.valid">
              {{ isEditing ? 'Update' : 'Add' }} Source
            </button>
            <button type="button" class="btn btn-outline-secondary" (click)="addIncomeSource()" *ngIf="isEditing">
              Cancel
            </button>
          </div>
        </div>
      </form>

      <!-- Income Sources Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Income Source</th>
              <th class="text-end">Initial Monthly (₹)</th>
              <th class="text-end">Initial Annual (₹)</th>
              <th class="text-end">Growth Rate (%)</th>
              <th class="text-end">Years</th>
              <th class="text-end">Projected Monthly (₹)</th>
              <th class="text-end">Projected Annual (₹)</th>
              <th class="text-end">Total Received (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let source of incomeSources">
              <td>{{ source.sourceName }}</td>
              <td class="text-end">{{ source.initialMonthlyIncome | number:'1.2-2' }}</td>
              <td class="text-end">{{ (source.initialMonthlyIncome || 0) * 12 | number:'1.2-2' }}</td>
              <td class="text-end">{{ source.annualGrowthRate | number:'1.2-2' }}</td>
              <td class="text-end">{{ source.years }}</td>
              <td class="text-end">{{ source.projectedMonthlyIncome | number:'1.2-2' }}</td>
              <td class="text-end">{{ (source.projectedMonthlyIncome || 0) * 12 | number:'1.2-2' }}</td>
              <td class="text-end">{{ source.totalAmountReceived | number:'1.2-2' }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-2" (click)="editIncomeSource(source)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteIncomeSource(source.id!)" *ngIf="source.id">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="row mt-4">
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Initial Annual Income</h5>
              <p class="card-text fs-4">{{ totalInitialIncome | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Projected Annual Income</h5>
              <p class="card-text fs-4">{{ totalProjectedIncome | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Amount Received</h5>
              <p class="card-text fs-4">{{ totalAmountReceived | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### `income-calculator.component.css`
```css
.table th {
  font-weight: 600;
  white-space: nowrap;
}

.card {
  border-radius: 0.5rem;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.table-responsive {
  border-radius: 0.5rem;
  overflow: hidden;
}

.table th.text-end, 
.table td.text-end {
  padding-right: 1.5rem;
}

.card-body.text-center .card-text {
  color: #0d6efd;
  font-weight: 600;
}

/* Add some spacing between form and table */
form {
  margin-bottom: 2rem;
}

/* Make table more compact */
.table td, .table th {
  padding: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .table-responsive {
    overflow-x: auto;
  }
}
```

## 5. App Module (`app.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { IncomeCalculatorComponent } from './components/income-calculator/income-calculator.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    IncomeCalculatorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## 6. App Routing Module (`app-routing.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncomeCalculatorComponent } from './components/income-calculator/income-calculator.component';

const routes: Routes = [
  { path: '', component: IncomeCalculatorComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

## 7. JSON Server Setup

Create or update your `db.json` file in the project root:
```json
{
  "incomeSources": [
    {
      "id": 1,
      "sourceName": "Salary",
      "initialMonthlyIncome": 75000,
      "annualGrowthRate": 7,
      "years": 5,
      "projectedMonthlyIncome": 105187.65,
      "totalAmountReceived": 5367865.80
    },
    {
      "id": 2,
      "sourceName": "Rental Income",
      "initialMonthlyIncome": 25000,
      "annualGrowthRate": 3,
      "years": 5,
      "projectedMonthlyIncome": 28981.82,
      "totalAmountReceived": 1593181.82
    }
  ]
}
```

## 8. Running the Application

1. Start JSON server:
```bash
json-server --watch db.json
```

2. Start Angular application:
```bash
ng serve
```

## Features Implemented

1. **Add Income Sources**: Add new income sources with validation
2. **Edit Income Sources**: Modify existing income sources
3. **Delete Income Sources**: Remove income sources
4. **Calculate Projections**: Automatic calculation of projected income and total received amounts
5. **Multiple Income Sources**: Manage and calculate multiple income sources simultaneously
6. **Detailed Breakdown**: Shows initial, projected, and total received amounts
7. **Totals**: View aggregated totals for all income sources
8. **Responsive Design**: Works on all screen sizes
9. **Form Validation**: Ensures valid data entry
10. **Persistent Data**: All data is saved to and retrieved from JSON server

This implementation provides a comprehensive solution for managing and projecting income growth with a clean, user-friendly interface built with Bootstrap. The calculator uses compound growth calculations to project future income values.

# Future Goals Calculator with Angular, Bootstrap, and JSON Server

Here's a complete implementation for a future goals calculator that allows adding, editing, deleting, and categorizing multiple financial goals.

## 1. File Structure
```
src/
├── app/
│   ├── components/
│   │   └── goals-calculator/
│   │       ├── goals-calculator.component.ts
│   │       ├── goals-calculator.component.html
│   │       └── goals-calculator.component.css
│   ├── models/
│   │   └── goal.model.ts
│   ├── services/
│   │   └── goal.service.ts
│   ├── app.module.ts
│   └── app-routing.module.ts
```

## 2. Goal Model (`goal.model.ts`)
```typescript
export interface Goal {
  id?: number;
  name: string;
  category: 'short-term' | 'medium-term' | 'long-term' | 'retirement';
  duration: number | null; // in years
  targetAmount: number | null;
  notes?: string;
  inflationAdjustedAmount?: number | null;
}
```

## 3. Goal Service (`goal.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Goal } from '../models/goal.model';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private apiUrl = 'http://localhost:3000/goals';

  constructor(private http: HttpClient) { }

  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(this.apiUrl);
  }

  addGoal(goal: Goal): Observable<Goal> {
    return this.http.post<Goal>(this.apiUrl, goal);
  }

  updateGoal(id: number, goal: Goal): Observable<Goal> {
    return this.http.put<Goal>(`${this.apiUrl}/${id}`, goal);
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  calculateInflationAdjustedAmount(targetAmount: number, years: number, inflationRate: number = 6): number {
    return targetAmount * Math.pow(1 + (inflationRate / 100), years);
  }
}
```

## 4. Goals Calculator Component

### `goals-calculator.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { Goal } from '../../models/goal.model';
import { GoalService } from '../../services/goal.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-goals-calculator',
  templateUrl: './goals-calculator.component.html',
  styleUrls: ['./goals-calculator.component.css']
})
export class GoalsCalculatorComponent implements OnInit {
  goals: Goal[] = [];
  categories = ['short-term', 'medium-term', 'long-term', 'retirement'];
  totalAmount = 0;
  inflationRate = 6; // Default inflation rate
  goalForm: FormGroup;
  isEditing = false;
  currentEditId: number | null = null;

  constructor(
    private goalService: GoalService,
    private fb: FormBuilder
  ) {
    this.goalForm = this.fb.group({
      name: ['', Validators.required],
      category: ['short-term', Validators.required],
      duration: [null, [Validators.required, Validators.min(1)]],
      targetAmount: [null, [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    this.goalService.getGoals().subscribe(goals => {
      this.goals = goals;
      this.calculateTotals();
    });
  }

  addGoal(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.goalForm.reset({ category: 'short-term' });
  }

  editGoal(goal: Goal): void {
    this.isEditing = true;
    this.currentEditId = goal.id || null;
    this.goalForm.patchValue({
      name: goal.name,
      category: goal.category,
      duration: goal.duration,
      targetAmount: goal.targetAmount,
      notes: goal.notes
    });
  }

  saveGoal(): void {
    if (this.goalForm.valid) {
      const goalData: Goal = this.goalForm.value;
      
      // Calculate inflation adjusted amount
      if (goalData.targetAmount && goalData.duration) {
        goalData.inflationAdjustedAmount = this.goalService.calculateInflationAdjustedAmount(
          goalData.targetAmount, 
          goalData.duration,
          this.inflationRate
        );
      }

      if (this.isEditing && this.currentEditId) {
        this.goalService.updateGoal(this.currentEditId, goalData)
          .subscribe(() => {
            this.loadGoals();
            this.goalForm.reset({ category: 'short-term' });
          });
      } else {
        this.goalService.addGoal(goalData)
          .subscribe(() => {
            this.loadGoals();
            this.goalForm.reset({ category: 'short-term' });
          });
      }
    }
  }

  deleteGoal(id: number): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.goalService.deleteGoal(id).subscribe(() => {
        this.loadGoals();
      });
    }
  }

  calculateTotals(): void {
    this.totalAmount = 0;
    this.goals.forEach(goal => {
      if (goal.inflationAdjustedAmount) {
        this.totalAmount += goal.inflationAdjustedAmount;
      } else if (goal.targetAmount) {
        this.totalAmount += goal.targetAmount;
      }
    });
  }

  updateInflationRate(): void {
    this.goals.forEach(goal => {
      if (goal.targetAmount && goal.duration) {
        goal.inflationAdjustedAmount = this.goalService.calculateInflationAdjustedAmount(
          goal.targetAmount, 
          goal.duration,
          this.inflationRate
        );
      }
    });
    this.calculateTotals();
  }

  getCategoryClass(category: string): string {
    switch(category) {
      case 'short-term': return 'bg-info text-white';
      case 'medium-term': return 'bg-primary text-white';
      case 'long-term': return 'bg-warning';
      case 'retirement': return 'bg-danger text-white';
      default: return '';
    }
  }
}
```

### `goals-calculator.component.html`
```html
<div class="container mt-4">
  <div class="card shadow">
    <div class="card-header bg-success text-white">
      <h3 class="mb-0">Future Goals Calculator</h3>
    </div>
    <div class="card-body">
      <!-- Goal Form -->
      <form [formGroup]="goalForm" (ngSubmit)="saveGoal()" class="mb-4">
        <div class="row g-3">
          <div class="col-md-3">
            <label for="name" class="form-label">Goal Name</label>
            <input type="text" class="form-control" id="name" 
                   formControlName="name" placeholder="e.g., Buy a Car">
            <div *ngIf="goalForm.get('name')?.invalid && goalForm.get('name')?.touched" 
                 class="text-danger">
              Goal name is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="category" class="form-label">Category</label>
            <select class="form-select" id="category" formControlName="category">
              <option *ngFor="let cat of categories" [value]="cat">
                {{ cat | titlecase }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label for="duration" class="form-label">Duration (Years)</label>
            <input type="number" class="form-control" id="duration" 
                   formControlName="duration" min="1" placeholder="e.g., 5">
            <div *ngIf="goalForm.get('duration')?.invalid && goalForm.get('duration')?.touched" 
                 class="text-danger">
              Valid duration is required
            </div>
          </div>
          <div class="col-md-2">
            <label for="targetAmount" class="form-label">Target Amount (₹)</label>
            <input type="number" class="form-control" id="targetAmount" 
                   formControlName="targetAmount" min="1" placeholder="e.g., 500000">
            <div *ngIf="goalForm.get('targetAmount')?.invalid && goalForm.get('targetAmount')?.touched" 
                 class="text-danger">
              Valid amount is required
            </div>
          </div>
          <div class="col-md-3">
            <label for="notes" class="form-label">Notes</label>
            <input type="text" class="form-control" id="notes" 
                   formControlName="notes" placeholder="Optional notes">
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-md-12">
            <button type="submit" class="btn btn-primary me-2" [disabled]="!goalForm.valid">
              {{ isEditing ? 'Update' : 'Add' }} Goal
            </button>
            <button type="button" class="btn btn-outline-secondary" (click)="addGoal()" *ngIf="isEditing">
              Cancel
            </button>
          </div>
        </div>
      </form>

      <!-- Inflation Rate Control -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text">Inflation Rate (%)</span>
            <input type="number" class="form-control" [(ngModel)]="inflationRate" 
                   (ngModelChange)="updateInflationRate()" step="0.1" min="0">
            <button class="btn btn-outline-secondary" type="button" (click)="updateInflationRate()">
              Update
            </button>
          </div>
        </div>
      </div>

      <!-- Goals Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Goal Name</th>
              <th>Category</th>
              <th class="text-end">Duration (Yrs)</th>
              <th class="text-end">Target Amount (₹)</th>
              <th class="text-end">Inflation Adjusted (₹)</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let goal of goals">
              <td>{{ goal.name }}</td>
              <td>
                <span class="badge rounded-pill" [ngClass]="getCategoryClass(goal.category)">
                  {{ goal.category | titlecase }}
                </span>
              </td>
              <td class="text-end">{{ goal.duration }}</td>
              <td class="text-end">{{ goal.targetAmount | number:'1.2-2' }}</td>
              <td class="text-end">{{ goal.inflationAdjustedAmount | number:'1.2-2' }}</td>
              <td>{{ goal.notes }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-2" (click)="editGoal(goal)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteGoal(goal.id!)" *ngIf="goal.id">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="row mt-4">
        <div class="col-md-12">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Inflation-Adjusted Amount Required</h5>
              <p class="card-text fs-2">{{ totalAmount | number:'1.2-2' }} ₹</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="row mt-4">
        <div class="col-md-3" *ngFor="let cat of categories">
          <div class="card">
            <div class="card-body text-center">
              <h6 class="card-title">{{ cat | titlecase }} Goals</h6>
              <p class="card-text fs-5">
                {{ getCategoryTotal(cat) | number:'1.2-2' }} ₹
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### `goals-calculator.component.css`
```typescript
// Add to the component class
getCategoryTotal(category: string): number {
  return this.goals
    .filter(goal => goal.category === category)
    .reduce((sum, goal) => {
      return sum + (goal.inflationAdjustedAmount || goal.targetAmount || 0);
    }, 0);
}
```

```css
.table th {
  font-weight: 600;
  white-space: nowrap;
}

.card {
  border-radius: 0.5rem;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.table-responsive {
  border-radius: 0.5rem;
  overflow: hidden;
}

.table th.text-end, 
.table td.text-end {
  padding-right: 1.5rem;
}

.card-body.text-center .card-text {
  color: #0d6efd;
  font-weight: 600;
}

/* Add some spacing between form and table */
form {
  margin-bottom: 2rem;
}

/* Make table more compact */
.table td, .table th {
  padding: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .table-responsive {
    overflow-x: auto;
  }
}

/* Category badges */
.badge {
  padding: 0.5em 0.75em;
  font-size: 0.875em;
}

/* Category card colors */
.card .card-body {
  border-left: 4px solid;
}

.card:nth-child(1) .card-body {
  border-left-color: #0dcaf0; /* short-term */
}
.card:nth-child(2) .card-body {
  border-left-color: #0d6efd; /* medium-term */
}
.card:nth-child(3) .card-body {
  border-left-color: #ffc107; /* long-term */
}
.card:nth-child(4) .card-body {
  border-left-color: #dc3545; /* retirement */
}
```

## 5. App Module (`app.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { GoalsCalculatorComponent } from './components/goals-calculator/goals-calculator.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    GoalsCalculatorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## 6. App Routing Module (`app-routing.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoalsCalculatorComponent } from './components/goals-calculator/goals-calculator.component';

const routes: Routes = [
  { path: '', component: GoalsCalculatorComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

## 7. JSON Server Setup

Create or update your `db.json` file in the project root:
```json
{
  "goals": [
    {
      "id": 1,
      "name": "Purchase Car",
      "category": "short-term",
      "duration": 2,
      "targetAmount": 800000,
      "inflationAdjustedAmount": 898880,
      "notes": "Electric SUV"
    },
    {
      "id": 2,
      "name": "Children's Higher Education Fund",
      "category": "long-term",
      "duration": 15,
      "targetAmount": 2000000,
      "inflationAdjustedAmount": 4793116.18,
      "notes": "For MBA abroad"
    },
    {
      "id": 3,
      "name": "Retirement Corpus",
      "category": "retirement",
      "duration": 20,
      "targetAmount": 15000000,
      "inflationAdjustedAmount": 48107061.48,
      "notes": "For comfortable retirement"
    }
  ]
}
```

## 8. Running the Application

1. Start JSON server:
```bash
json-server --watch db.json
```

2. Start Angular application:
```bash
ng serve
```

## Features Implemented

1. **Add Goals**: Add new financial goals with validation
2. **Edit Goals**: Modify existing goals
3. **Delete Goals**: Remove goals
4. **Inflation Adjustment**: Automatically adjusts target amounts for inflation
5. **Categorization**: Organize goals by short-term, medium-term, long-term, and retirement
6. **Multiple Goals**: Manage and calculate multiple goals simultaneously
7. **Detailed Breakdown**: Shows original and inflation-adjusted amounts
8. **Totals**: View aggregated totals for all goals
9. **Category Breakdown**: See totals by goal category
10. **Responsive Design**: Works on all screen sizes
11. **Form Validation**: Ensures valid data entry
12. **Persistent Data**: All data is saved to and retrieved from JSON server

This implementation provides a comprehensive solution for planning and tracking financial goals with a clean, user-friendly interface built with Bootstrap. The calculator automatically adjusts target amounts for inflation based on the duration of each goal.

## Possible Goals

1. Building Emergency Fund
2. Purchase Car
3. Purchase Bike
4. Vacation Trip
5. Gadget Purchase/Upgrade (Laptop/Phone/TV etc)
6. Professional Courses/Upskill
7. Wedding Expenses Family
8. Wedding Expenses Self
9. Start a Own Business of 10 Lakh / 50 Lakh / 1 Cr
10. Upgrade Home Interiors / Renovation
11. Health And Wellness Fund (Medical Checkups, Insurance Upgrade)
12. Purchase Furniture and Home Appliances
13. Plan for a Workation (Work + Travel + Experience)
14. Attend International Conferences or Workshops
15. Build Retirement Home
16. Buy Land
17. Buy Flat
18. Invest in Commercial Property for Rental Income or Future Sell
19. Children’s Higher Education Fund
20. Children’s Wedding Expenses Fund
21. Purchase A Yacht / Private Boat / Caravan
22. Acquire Citizenship / Residency in Another Country
23. Invest in Sustainable Agriculture
24. Establish a Skill Development Academy for All Age
25. Establish a Family Owned Business That Lasts Generations
26. Pass on 5 Crore Worth of Assets to Children
27. Create 15 Crore Retirement Corpus for Ultra Luxury Living
28. Generate 2 Lakh + Monthly Passive Income Post Retirement
29. Starting a Blogger career

# Investment Options Calculator with Angular, Bootstrap, and JSON Server

Here's a complete implementation for an investment options calculator that displays different investment vehicles with their expected CAGR returns.

## 1. File Structure
```
src/
├── app/
│   ├── components/
│   │   └── investment-options/
│   │       ├── investment-options.component.ts
│   │       ├── investment-options.component.html
│   │       └── investment-options.component.css
│   ├── models/
│   │   └── investment-option.model.ts
│   ├── services/
│   │   └── investment-option.service.ts
│   ├── app.module.ts
│   └── app-routing.module.ts
```

## 2. Investment Option Model (`investment-option.model.ts`)
```typescript
export interface InvestmentOption {
  id?: number;
  name: string;
  category: 'equity' | 'fixed-income' | 'real-estate' | 'commodities' | 'alternative';
  minCAGR: number;
  maxCAGR: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  liquidity: 'high' | 'medium' | 'low';
  taxEfficiency?: string;
  notes?: string;
}
```

## 3. Investment Option Service (`investment-option.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvestmentOption } from '../models/investment-option.model';

@Injectable({
  providedIn: 'root'
})
export class InvestmentOptionService {
  private apiUrl = 'http://localhost:3000/investmentOptions';

  constructor(private http: HttpClient) { }

  getInvestmentOptions(): Observable<InvestmentOption[]> {
    return this.http.get<InvestmentOption[]>(this.apiUrl);
  }

  addInvestmentOption(option: InvestmentOption): Observable<InvestmentOption> {
    return this.http.post<InvestmentOption>(this.apiUrl, option);
  }

  updateInvestmentOption(id: number, option: InvestmentOption): Observable<InvestmentOption> {
    return this.http.put<InvestmentOption>(`${this.apiUrl}/${id}`, option);
  }

  deleteInvestmentOption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## 4. Investment Options Component

### `investment-options.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { InvestmentOption } from '../../models/investment-option.model';
import { InvestmentOptionService } from '../../services/investment-option.service';

@Component({
  selector: 'app-investment-options',
  templateUrl: './investment-options.component.html',
  styleUrls: ['./investment-options.component.css']
})
export class InvestmentOptionsComponent implements OnInit {
  investmentOptions: InvestmentOption[] = [];
  filteredOptions: InvestmentOption[] = [];
  categories = ['all', 'equity', 'fixed-income', 'real-estate', 'commodities', 'alternative'];
  riskLevels = ['all', 'low', 'medium', 'high', 'very-high'];
  selectedCategory = 'all';
  selectedRisk = 'all';
  searchTerm = '';

  constructor(private investmentOptionService: InvestmentOptionService) { }

  ngOnInit(): void {
    this.loadInvestmentOptions();
  }

  loadInvestmentOptions(): void {
    this.investmentOptionService.getInvestmentOptions().subscribe(options => {
      this.investmentOptions = options;
      this.filteredOptions = options;
    });
  }

  filterOptions(): void {
    this.filteredOptions = this.investmentOptions.filter(option => {
      const matchesCategory = this.selectedCategory === 'all' || option.category === this.selectedCategory;
      const matchesRisk = this.selectedRisk === 'all' || option.riskLevel === this.selectedRisk;
      const matchesSearch = option.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            (option.notes && option.notes.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesCategory && matchesRisk && matchesSearch;
    });
  }

  getRiskClass(riskLevel: string): string {
    switch(riskLevel) {
      case 'low': return 'bg-success text-white';
      case 'medium': return 'bg-info text-white';
      case 'high': return 'bg-warning';
      case 'very-high': return 'bg-danger text-white';
      default: return '';
    }
  }

  getLiquidityClass(liquidity: string): string {
    switch(liquidity) {
      case 'high': return 'text-success';
      case 'medium': return 'text-primary';
      case 'low': return 'text-warning';
      default: return '';
    }
  }
}
```

### `investment-options.component.html`
```html
<div class="container mt-4">
  <div class="card shadow">
    <div class="card-header bg-primary text-white">
      <h3 class="mb-0">Investment Options & Expected Returns</h3>
    </div>
    <div class="card-body">
      <!-- Filters -->
      <div class="row mb-4 g-3">
        <div class="col-md-3">
          <label for="categoryFilter" class="form-label">Category</label>
          <select id="categoryFilter" class="form-select" [(ngModel)]="selectedCategory" (ngModelChange)="filterOptions()">
            <option value="all">All Categories</option>
            <option *ngFor="let cat of categories.slice(1)" [value]="cat">
              {{ cat | titlecase }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <label for="riskFilter" class="form-label">Risk Level</label>
          <select id="riskFilter" class="form-select" [(ngModel)]="selectedRisk" (ngModelChange)="filterOptions()">
            <option value="all">All Risk Levels</option>
            <option *ngFor="let risk of riskLevels.slice(1)" [value]="risk">
              {{ risk | titlecase }}
            </option>
          </select>
        </div>
        <div class="col-md-6">
          <label for="searchInput" class="form-label">Search</label>
          <input type="text" id="searchInput" class="form-control" 
                 [(ngModel)]="searchTerm" (ngModelChange)="filterOptions()" 
                 placeholder="Search investment options...">
        </div>
      </div>

      <!-- Investment Options Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Investment Option</th>
              <th class="text-center">Expected CAGR</th>
              <th class="text-center">Risk Level</th>
              <th class="text-center">Liquidity</th>
              <th class="text-center">Tax Efficiency</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let option of filteredOptions">
              <td>{{ option.name }}</td>
              <td class="text-center">
                <span class="badge bg-light text-dark">
                  {{ option.minCAGR }}% – {{ option.maxCAGR }}%
                </span>
              </td>
              <td class="text-center">
                <span class="badge rounded-pill" [ngClass]="getRiskClass(option.riskLevel)">
                  {{ option.riskLevel | titlecase }}
                </span>
              </td>
              <td class="text-center" [ngClass]="getLiquidityClass(option.liquidity)">
                {{ option.liquidity | titlecase }}
              </td>
              <td class="text-center">
                <span *ngIf="option.taxEfficiency" class="badge bg-light text-dark">
                  {{ option.taxEfficiency }}
                </span>
                <span *ngIf="!option.taxEfficiency">-</span>
              </td>
              <td>{{ option.notes }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Cards -->
      <div class="row mt-4">
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Low Risk Options</h5>
              <p class="card-text fs-4">
                {{ getOptionsByRisk('low').length }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Medium Risk Options</h5>
              <p class="card-text fs-4">
                {{ getOptionsByRisk('medium').length }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">High Risk Options</h5>
              <p class="card-text fs-4">
                {{ getOptionsByRisk('high').length + getOptionsByRisk('very-high').length }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### `investment-options.component.css`
```typescript
// Add to the component class
getOptionsByRisk(riskLevel: string): InvestmentOption[] {
  return this.investmentOptions.filter(option => option.riskLevel === riskLevel);
}
```

```css
.table th {
  font-weight: 600;
  white-space: nowrap;
}

.card {
  border-radius: 0.5rem;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.table-responsive {
  border-radius: 0.5rem;
  overflow: hidden;
}

.table th.text-center, 
.table td.text-center {
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Risk level badges */
.badge {
  padding: 0.5em 0.75em;
  font-size: 0.875em;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .table-responsive {
    overflow-x: auto;
  }
}

/* Summary cards */
.card-body {
  padding: 1.25rem;
}

.card-title {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.card-text {
  font-weight: 600;
}

/* Highlight rows on hover */
.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Fixed column widths */
td:nth-child(1) { width: 25%; } /* Name */
td:nth-child(2) { width: 15%; } /* CAGR */
td:nth-child(3) { width: 12%; } /* Risk */
td:nth-child(4) { width: 12%; } /* Liquidity */
td:nth-child(5) { width: 12%; } /* Tax */
td:nth-child(6) { width: 24%; } /* Notes */
```

## 5. App Module (`app.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { InvestmentOptionsComponent } from './components/investment-options/investment-options.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    InvestmentOptionsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## 6. App Routing Module (`app-routing.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvestmentOptionsComponent } from './components/investment-options/investment-options.component';

const routes: Routes = [
  { path: '', component: InvestmentOptionsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

## 7. JSON Server Setup

Create or update your `db.json` file in the project root:
```json
{
  "investmentOptions": [
    {
      "id": 1,
      "name": "Liquid Mutual Fund",
      "category": "fixed-income",
      "minCAGR": 6,
      "maxCAGR": 7,
      "riskLevel": "low",
      "liquidity": "high",
      "taxEfficiency": "Taxed as per slab",
      "notes": "Good for emergency funds, short-term parking"
    },
    {
      "id": 2,
      "name": "Nifty 50 Index Fund",
      "category": "equity",
      "minCAGR": 12,
      "maxCAGR": 15,
      "riskLevel": "medium",
      "liquidity": "high",
      "taxEfficiency": "LTCG 10% after 1L",
      "notes": "Passive investing in top 50 companies"
    },
    {
      "id": 3,
      "name": "Actively Managed Mutual Funds",
      "category": "equity",
      "minCAGR": 15,
      "maxCAGR": 17,
      "riskLevel": "high",
      "liquidity": "high",
      "taxEfficiency": "LTCG 10% after 1L",
      "notes": "Professional fund management"
    },
    {
      "id": 4,
      "name": "REITs / InvIT",
      "category": "alternative",
      "minCAGR": 6,
      "maxCAGR": 10,
      "riskLevel": "medium",
      "liquidity": "medium",
      "taxEfficiency": "Dividends taxed as per slab",
      "notes": "Real estate investment trusts with regular dividends"
    },
    {
      "id": 5,
      "name": "Blue-Chip US Stocks / Nasdaq Index",
      "category": "equity",
      "minCAGR": 12,
      "maxCAGR": 20,
      "riskLevel": "high",
      "liquidity": "high",
      "taxEfficiency": "LTCG 20% with indexation",
      "notes": "Diversify internationally with top US companies"
    },
    {
      "id": 6,
      "name": "Your Own Business",
      "category": "alternative",
      "minCAGR": 0,
      "maxCAGR": 999,
      "riskLevel": "very-high",
      "liquidity": "low",
      "notes": "Highest potential but requires active management"
    }
  ]
}
```

## 8. Running the Application

1. Start JSON server:
```bash
json-server --watch db.json
```

2. Start Angular application:
```bash
ng serve
```

## Features Implemented

1. **Comprehensive List**: Shows various investment options with their expected returns
2. **Filtering**: Filter by category, risk level, and search terms
3. **Visual Indicators**: Color-coded risk levels and liquidity
4. **Detailed Information**: Includes CAGR ranges, tax efficiency, and notes
5. **Summary Cards**: Quick overview of options by risk level
6. **Responsive Design**: Works on all screen sizes
7. **Persistent Data**: All data is saved to and retrieved from JSON server

This implementation provides a clear comparison of different investment vehicles with their expected returns, risk levels, and other important characteristics to help investors make informed decisions.
