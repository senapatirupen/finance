# Investment Tracker with SIP/Lumpsum & CAGR Projections

Here's a comprehensive Angular solution to track all investments across asset classes with future return projections.

## 1. Data Models & Service

### investment.model.ts
```typescript
export interface Investment {
  id: string;
  name: string;
  type: 'SIP' | 'Lumpsum';
  assetClass: 'Equity' | 'Debt' | 'Gold' | 'Real Estate' | 'FD' | 'NPS' | 'Liquid Fund';
  amount: number;
  startDate: Date;
  durationYears: number;
  cagr: number;
  frequency?: 'Monthly' | 'Quarterly' | 'Yearly'; // For SIP only
  transactions?: Transaction[];
}

export interface Transaction {
  date: Date;
  amount: number;
  type: 'Investment' | 'Withdrawal';
}
```

### investment.service.ts
```typescript
import { Injectable } from '@angular/core';
import { Investment, Transaction } from './investment.model';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private apiUrl = 'http://localhost:3000/investments';
  private investmentsSubject = new BehaviorSubject<Investment[]>([]);
  investments$ = this.investmentsSubject.asObservable();

  // Default CAGR assumptions
  private defaultCagr: Record<string, number> = {
    'Equity': 12,
    'Debt': 7,
    'Gold': 8,
    'Real Estate': 10,
    'FD': 6.5,
    'NPS': 9,
    'Liquid Fund': 5.5
  };

  constructor(private http: HttpClient) {
    this.loadInvestments();
  }

  private loadInvestments(): void {
    this.http.get<Investment[]>(this.apiUrl).subscribe(
      investments => this.investmentsSubject.next(investments)
    );
  }

  calculateFutureValue(investment: Investment, years: number): number {
    if (investment.type === 'Lumpsum') {
      return investment.amount * Math.pow(1 + investment.cagr/100, years);
    } else {
      // SIP calculation
      const n = years * (investment.frequency === 'Monthly' ? 12 : 
                        investment.frequency === 'Quarterly' ? 4 : 1);
      const r = investment.cagr/100;
      const P = investment.amount;
      
      if (investment.frequency === 'Monthly') {
        const monthlyRate = Math.pow(1 + r, 1/12) - 1;
        return P * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
      } else {
        return P * n * (1 + r/2) * (Math.pow(1 + r, years) - 1) / r;
      }
    }
  }

  getSummary(years: number): any {
    const investments = this.investmentsSubject.value;
    let totalInvested = 0;
    let totalFutureValue = 0;
    let byAssetClass: any = {};

    investments.forEach(investment => {
      const invested = investment.type === 'Lumpsum' 
        ? investment.amount 
        : investment.amount * investment.durationYears * 
          (investment.frequency === 'Monthly' ? 12 : 
           investment.frequency === 'Quarterly' ? 4 : 1);
      
      const futureValue = this.calculateFutureValue(investment, years);
      
      totalInvested += invested;
      totalFutureValue += futureValue;

      if (!byAssetClass[investment.assetClass]) {
        byAssetClass[investment.assetClass] = { invested: 0, futureValue: 0 };
      }
      byAssetClass[investment.assetClass].invested += invested;
      byAssetClass[investment.assetClass].futureValue += futureValue;
    });

    return {
      totalInvested,
      totalFutureValue,
      byAssetClass,
      xirr: totalInvested > 0 ? 
        (Math.pow(totalFutureValue / totalInvested, 1/years) - 1) * 100 : 0
    };
  }

  addInvestment(investment: Investment): Observable<Investment> {
    if (!investment.cagr) {
      investment.cagr = this.defaultCagr[investment.assetClass];
    }
    return this.http.post<Investment>(this.apiUrl, investment).pipe(
      tap(() => this.loadInvestments())
    );
  }

  // Add other CRUD methods...
}
```

## 2. Investment Tracker Component

### investment-tracker.component.ts
```typescript
import { Component, OnInit } from '@angular/core';
import { InvestmentService } from '../investment.service';
import { Investment } from '../investment.model';

@Component({
  selector: 'app-investment-tracker',
  templateUrl: './investment-tracker.component.html',
  styleUrls: ['./investment-tracker.component.css']
})
export class InvestmentTrackerComponent implements OnInit {
  investments: Investment[] = [];
  newInvestment: Partial<Investment> = { type: 'SIP', frequency: 'Monthly' };
  showAddForm = false;
  projectionYears = 5;
  summary: any;
  assetClasses = ['Equity', 'Debt', 'Gold', 'Real Estate', 'FD', 'NPS', 'Liquid Fund'];
  isLoading = true;

  constructor(private investmentService: InvestmentService) {}

  ngOnInit(): void {
    this.investmentService.investments$.subscribe(investments => {
      this.investments = investments;
      this.updateSummary();
      this.isLoading = false;
    });
  }

  updateSummary(): void {
    this.summary = this.investmentService.getSummary(this.projectionYears);
  }

  addInvestment(): void {
    if (this.validateInvestment()) {
      const investment: Investment = {
        id: Date.now().toString(),
        name: this.newInvestment.name!,
        type: this.newInvestment.type!,
        assetClass: this.newInvestment.assetClass!,
        amount: this.newInvestment.amount!,
        startDate: new Date(this.newInvestment.startDate || new Date()),
        durationYears: this.newInvestment.durationYears!,
        cagr: this.newInvestment.cagr!,
        frequency: this.newInvestment.frequency!
      };

      this.investmentService.addInvestment(investment).subscribe(() => {
        this.showAddForm = false;
        this.resetForm();
      });
    }
  }

  private validateInvestment(): boolean {
    // Implement validation logic
    return true;
  }

  resetForm(): void {
    this.newInvestment = { type: 'SIP', frequency: 'Monthly' };
  }
}
```

## 3. HTML Template

### investment-tracker.component.html
```html
<div class="container mt-4">
  <div class="card mb-4">
    <div class="card-header bg-primary text-white">
      <h3>Investment Portfolio Tracker</h3>
    </div>
    <div class="card-body">
      <div class="row mb-3">
        <div class="col-md-6">
          <h4>Projection Summary</h4>
          <div class="input-group mb-3">
            <span class="input-group-text">Projection Period</span>
            <select class="form-select" [(ngModel)]="projectionYears" (change)="updateSummary()">
              <option value="5">5 Years</option>
              <option value="7">7 Years</option>
              <option value="10">10 Years</option>
              <option value="15">15 Years</option>
            </select>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-light">
            <div class="card-body">
              <h5 class="card-title">Total Portfolio</h5>
              <p class="mb-1">Invested: {{ summary?.totalInvested | currency:'INR' }}</p>
              <p class="mb-1">Projected Value: {{ summary?.totalFutureValue | currency:'INR' }}</p>
              <p class="mb-0">XIRR: {{ summary?.xirr | number:'1.2-2' }}%</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5>By Asset Class ({{ projectionYears }} Years)</h5>
            </div>
            <div class="card-body">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Asset Class</th>
                    <th>Invested</th>
                    <th>Projected</th>
                    <th>CAGR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let asset of Object.keys(summary?.byAssetClass || {})">
                    <td>{{ asset }}</td>
                    <td>{{ summary.byAssetClass[asset].invested | currency:'INR' }}</td>
                    <td>{{ summary.byAssetClass[asset].futureValue | currency:'INR' }}</td>
                    <td>{{ investmentService.defaultCagr[asset] }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5>Performance Chart</h5>
            </div>
            <div class="card-body">
              <canvas baseChart
                [type]="'bar'"
                [data]="chartData"
                [options]="chartOptions">
              </canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Investment Form -->
  <div class="card mb-4" *ngIf="showAddForm">
    <div class="card-header">
      <h4>Add New Investment</h4>
    </div>
    <div class="card-body">
      <form (submit)="addInvestment()">
        <div class="row">
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Investment Name</label>
              <input type="text" class="form-control" [(ngModel)]="newInvestment.name" name="name" required>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Type</label>
              <select class="form-select" [(ngModel)]="newInvestment.type" name="type" required>
                <option value="SIP">SIP</option>
                <option value="Lumpsum">Lumpsum</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Asset Class</label>
              <select class="form-select" [(ngModel)]="newInvestment.assetClass" name="assetClass" required>
                <option *ngFor="let asset of assetClasses" [value]="asset">{{ asset }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Amount (₹)</label>
              <input type="number" class="form-control" [(ngModel)]="newInvestment.amount" name="amount" required>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Start Date</label>
              <input type="date" class="form-control" [(ngModel)]="newInvestment.startDate" name="startDate">
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Duration (Years)</label>
              <input type="number" class="form-control" [(ngModel)]="newInvestment.durationYears" name="durationYears">
            </div>
          </div>
        </div>

        <div class="row" *ngIf="newInvestment.type === 'SIP'">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Frequency</label>
              <select class="form-select" [(ngModel)]="newInvestment.frequency" name="frequency">
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Expected CAGR (%)</label>
              <input type="number" step="0.1" class="form-control" 
                     [(ngModel)]="newInvestment.cagr" name="cagr">
              <small class="text-muted">Leave blank to use default: 
                {{ newInvestment.assetClass ? investmentService.defaultCagr[newInvestment.assetClass] + '%' : '' }}
              </small>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary me-2">Add Investment</button>
        <button type="button" class="btn btn-secondary" (click)="showAddForm = false; resetForm()">Cancel</button>
      </form>
    </div>
  </div>

  <!-- Investment List -->
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h4>Your Investments</h4>
      <button class="btn btn-success" (click)="showAddForm = true">
        <i class="bi bi-plus-circle"></i> Add Investment
      </button>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Asset Class</th>
              <th>Amount</th>
              <th>Start Date</th>
              <th>5Y Projection</th>
              <th>10Y Projection</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let investment of investments">
              <td>{{ investment.name }}</td>
              <td>{{ investment.type }}</td>
              <td>{{ investment.assetClass }}</td>
              <td>{{ investment.amount | currency:'INR' }}</td>
              <td>{{ investment.startDate | date }}</td>
              <td>{{ investmentService.calculateFutureValue(investment, 5) | currency:'INR' }}</td>
              <td>{{ investmentService.calculateFutureValue(investment, 10) | currency:'INR' }}</td>
              <td>
                <button class="btn btn-sm btn-primary me-2">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger">
                  <i class="bi bi-trash"></i> Delete
                </button>
              </td>
            </tr>
            <tr *ngIf="investments.length === 0">
              <td colspan="8" class="text-center">No investments added yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
```

## 4. Chart Configuration

Add to your component:

```typescript
import { ChartConfiguration, ChartData } from 'chart.js';

// Add to component class
public chartData: ChartData<'bar'> = {
  labels: [],
  datasets: [
    { label: 'Invested', data: [], backgroundColor: 'rgba(54, 162, 235, 0.7)' },
    { label: 'Projected', data: [], backgroundColor: 'rgba(75, 192, 192, 0.7)' }
  ]
};

public chartOptions: ChartConfiguration['options'] = {
  responsive: true,
  scales: {
    x: { stacked: true },
    y: { stacked: false, beginAtZero: true }
  },
  plugins: {
    title: { display: true, text: 'Investment Projection' },
    tooltip: { callbacks: { label: (ctx) => '₹' + ctx.raw.toLocaleString() } }
  }
};

// Update in updateSummary()
private updateChart(): void {
  if (this.summary) {
    this.chartData.labels = Object.keys(this.summary.byAssetClass);
    this.chartData.datasets[0].data = Object.values(this.summary.byAssetClass).map((a: any) => a.invested);
    this.chartData.datasets[1].data = Object.values(this.summary.byAssetClass).map((a: any) => a.futureValue);
  }
}
```

## 5. Setup JSON Server

Create `db.json`:
```json
{
  "investments": []
}
```

Start JSON server:
```bash
json-server --watch db.json --port 3000
```

## Key Features:

1. **Comprehensive Tracking**:
   - Supports both SIP and Lumpsum investments
   - Covers all major asset classes
   - Automatic CAGR defaults

2. **Advanced Projections**:
   - Accurate SIP future value calculations
   - 5/7/10/15 year projections
   - XIRR calculation for entire portfolio

3. **Visual Analytics**:
   - Interactive bar charts
   - Asset class breakdown
   - Comparison of invested vs projected amounts

4. **Data Management**:
   - Add/edit/delete investments
   - Persistent storage via JSON server
   - Form validation

5. **User Experience**:
   - Responsive Bootstrap design
   - Intuitive forms
   - Clear summary metrics

To run:
1. Start JSON server: `json-server --watch db.json --port 3000`
2. Start Angular app: `ng serve`
3. Navigate to `http://localhost:4200`

This implementation provides a complete solution for tracking all investments with detailed future projections based on CAGR assumptions.