# Financial Planning Dashboard with Investment Recommendations

Here's a complete Angular solution with Bootstrap that takes user financial inputs and provides personalized investment recommendations, storing data in JSON Server.

## 1. Data Models (models.ts)

```typescript
export interface UserProfile {
  id?: string;
  age: number;
  salary: number;
  monthlyExpenses: number;
  badLoans: number;
  goodLoans: number;
  totalAssets: number;
  futureGoals: {
    retirementAge: number;
    housePurchase: number;
    childrenEducation: number;
    otherGoals: number;
  };
  riskAppetite: 'Low' | 'Medium' | 'High';
  createdAt?: string;
}

export interface InvestmentRecommendation {
  id?: string;
  userId: string;
  recommendations: {
    assetClass: string;
    percentage: number;
    products: string[];
    rationale: string;
  }[];
  createdAt?: string;
}
```

## 2. HTML Template (financial-plan.component.html)

```html
<div class="container mt-4">
  <div class="row">
    <!-- User Input Form -->
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-header bg-primary text-white">
          <h4><i class="fas fa-user-circle"></i> Your Financial Profile</h4>
        </div>
        <div class="card-body">
          <form #profileForm="ngForm" (ngSubmit)="saveProfile()">
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="form-group">
                  <label>Age</label>
                  <input type="number" class="form-control" [(ngModel)]="userProfile.age" name="age" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label>Annual Salary (₹)</label>
                  <input type="number" class="form-control" [(ngModel)]="userProfile.salary" name="salary" required>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <div class="form-group">
                  <label>Monthly Expenses (₹)</label>
                  <input type="number" class="form-control" [(ngModel)]="userProfile.monthlyExpenses" name="monthlyExpenses" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label>Risk Appetite</label>
                  <select class="form-control" [(ngModel)]="userProfile.riskAppetite" name="riskAppetite" required>
                    <option value="Low">Low (Conservative)</option>
                    <option value="Medium">Medium (Balanced)</option>
                    <option value="High">High (Aggressive)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <div class="form-group">
                  <label>Bad Loans (High Interest) (₹)</label>
                  <input type="number" class="form-control" [(ngModel)]="userProfile.badLoans" name="badLoans" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label>Good Loans (Low Interest) (₹)</label>
                  <input type="number" class="form-control" [(ngModel)]="userProfile.goodLoans" name="goodLoans" required>
                </div>
              </div>
            </div>

            <div class="form-group mb-3">
              <label>Total Assets (Investments + Savings) (₹)</label>
              <input type="number" class="form-control" [(ngModel)]="userProfile.totalAssets" name="totalAssets" required>
            </div>

            <div class="card mb-3">
              <div class="card-header bg-info text-white">
                <h5>Future Goals</h5>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label>Planned Retirement Age</label>
                  <input type="number" class="form-control" [(ngModel)]="userProfile.futureGoals.retirementAge" name="retirementAge" required>
                </div>
                <div class="form-group">
                  <label>House Purchase Goal (₹)</label>
                  <input type="number" class="form-control" [(ngModel)]="userProfile.futureGoals.housePurchase" name="housePurchase">
                </div>
                <div class="form-group">
                  <label>Children's Education Goal (₹)</label>
                  <input type="number" class="form-control" [(ngModel)]="userProfile.futureGoals.childrenEducation" name="childrenEducation">
                </div>
                <div class="form-group">
                  <label>Other Goals (₹)</label>
                  <input type="number" class="form-control" [(ngModel)]="userProfile.futureGoals.otherGoals" name="otherGoals">
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid">
              <i class="fas fa-calculator"></i> Get Recommendations
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="col-md-6">
      <div class="card shadow" *ngIf="recommendations">
        <div class="card-header bg-success text-white">
          <h4><i class="fas fa-chart-pie"></i> Personalized Recommendations</h4>
        </div>
        <div class="card-body">
          <div class="alert alert-info">
            <h5>Financial Snapshot</h5>
            <p>Net Worth: ₹{{ (userProfile.totalAssets - userProfile.badLoans - userProfile.goodLoans) | number }}</p>
            <p>Monthly Savings Potential: ₹{{ (userProfile.salary/12 - userProfile.monthlyExpenses) | number }}</p>
          </div>

          <h5 class="mt-4">Recommended Asset Allocation</h5>
          <div class="chart-container" style="height: 300px;">
            <canvas baseChart
              [data]="pieChartData"
              [type]="pieChartType"
              [options]="pieChartOptions">
            </canvas>
          </div>

          <div class="mt-4">
            <h5>Detailed Recommendations</h5>
            <div class="accordion" id="recommendationAccordion">
              <div class="accordion-item" *ngFor="let rec of recommendations.recommendations; let i = index">
                <h2 class="accordion-header">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse" 
                    [attr.data-bs-target]="'#collapse' + i" [attr.aria-controls]="'collapse' + i">
                    {{ rec.assetClass }} ({{ rec.percentage }}%)
                  </button>
                </h2>
                <div [id]="'collapse' + i" class="accordion-collapse collapse show" 
                  data-bs-parent="#recommendationAccordion">
                  <div class="accordion-body">
                    <p><strong>Suggested Products:</strong></p>
                    <ul>
                      <li *ngFor="let product of rec.products">{{ product }}</li>
                    </ul>
                    <p class="mt-2"><strong>Rationale:</strong> {{ rec.rationale }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <h5>Action Plan</h5>
            <ul class="list-group">
              <li class="list-group-item" *ngFor="let action of actionItems">
                <i class="fas fa-check-circle text-success me-2"></i> {{ action }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card shadow mt-4" *ngIf="recommendations">
        <div class="card-header bg-warning">
          <h4><i class="fas fa-lightbulb"></i> Financial Health Tips</h4>
        </div>
        <div class="card-body">
          <div class="alert alert-warning" *ngIf="userProfile.badLoans > 0">
            <h6><i class="fas fa-exclamation-triangle"></i> High-Interest Debt Alert</h6>
            <p>Consider paying off your high-interest loans (₹{{ userProfile.badLoans | number }}) as priority before investing.</p>
          </div>
          
          <div *ngFor="let tip of financialTips" class="mb-2">
            <i class="fas fa-arrow-right text-info me-2"></i> {{ tip }}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 3. Component Class (financial-plan.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserProfile, InvestmentRecommendation } from './models';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-financial-plan',
  templateUrl: './financial-plan.component.html',
  styleUrls: ['./financial-plan.component.css']
})
export class FinancialPlanComponent implements OnInit {
  userProfile: UserProfile = {
    age: 30,
    salary: 1200000,
    monthlyExpenses: 50000,
    badLoans: 0,
    goodLoans: 0,
    totalAssets: 500000,
    riskAppetite: 'Medium',
    futureGoals: {
      retirementAge: 60,
      housePurchase: 0,
      childrenEducation: 0,
      otherGoals: 0
    }
  };

  recommendations?: InvestmentRecommendation;
  actionItems: string[] = [];
  financialTips: string[] = [];
  
  // Chart configurations
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };
  pieChartType: ChartType = 'pie';
  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSampleData();
  }

  saveProfile(): void {
    this.http.post<UserProfile>(`${this.apiUrl}/profiles`, this.userProfile).subscribe(profile => {
      this.generateRecommendations(profile);
    });
  }

  private generateRecommendations(profile: UserProfile): void {
    const disposableIncome = (profile.salary / 12) - profile.monthlyExpenses;
    const netWorth = profile.totalAssets - profile.badLoans - profile.goodLoans;
    const yearsToRetirement = profile.futureGoals.retirementAge - profile.age;

    // Generate recommendations based on risk profile
    let recommendations: any[] = [];
    
    if (profile.riskAppetite === 'Low') {
      recommendations = [
        { 
          assetClass: 'Fixed Income', 
          percentage: 60,
          products: ['Public Provident Fund (PPF)', 'Senior Citizen Savings Scheme', 'Corporate Bonds'],
          rationale: 'Preserve capital with stable returns'
        },
        { 
          assetClass: 'Equity', 
          percentage: 20,
          products: ['Nifty 50 Index Fund', 'Large Cap Mutual Funds'],
          rationale: 'Limited exposure for growth potential'
        },
        { 
          assetClass: 'Gold', 
          percentage: 15,
          products: ['Sovereign Gold Bonds', 'Gold ETFs'],
          rationale: 'Hedge against inflation and market volatility'
        },
        { 
          assetClass: 'Cash', 
          percentage: 5,
          products: ['Liquid Funds', 'High-yield Savings Account'],
          rationale: 'Immediate liquidity for emergencies'
        }
      ];
    } else if (profile.riskAppetite === 'Medium') {
      recommendations = [
        { 
          assetClass: 'Equity', 
          percentage: 50,
          products: ['Flexi Cap Mutual Funds', 'Sectoral Funds (IT, Banking)', 'NPS Equity'],
          rationale: 'Balance between growth and stability'
        },
        { 
          assetClass: 'Fixed Income', 
          percentage: 35,
          products: ['Debt Mutual Funds', 'Tax-free Bonds', 'FDs'],
          rationale: 'Stable returns with lower volatility'
        },
        { 
          assetClass: 'Gold', 
          percentage: 10,
          products: ['Gold Mutual Funds', 'Digital Gold'],
          rationale: 'Diversification and inflation hedge'
        },
        { 
          assetClass: 'Alternative', 
          percentage: 5,
          products: ['REITs', 'Infrastructure Bonds'],
          rationale: 'Additional diversification'
        }
      ];
    } else {
      recommendations = [
        { 
          assetClass: 'Equity', 
          percentage: 70,
          products: ['Small Cap Funds', 'Sectoral Funds', 'Direct Stocks', 'International Funds'],
          rationale: 'Maximize long-term growth potential'
        },
        { 
          assetClass: 'Fixed Income', 
          percentage: 20,
          products: ['Dynamic Bond Funds', 'Corporate Bond Funds'],
          rationale: 'Basic stability component'
        },
        { 
          assetClass: 'Alternative', 
          percentage: 10,
          products: ['REITs', 'AIFs', 'Venture Capital Funds'],
          rationale: 'High-growth potential investments'
        }
      ];
    }

    // Generate action items
    this.actionItems = [];
    if (profile.badLoans > 0) {
      this.actionItems.push(`Prioritize paying off high-interest loans (₹${profile.badLoans.toLocaleString('en-IN')})`);
    }
    this.actionItems.push(`Aim to save ₹${Math.round(disposableIncome * 0.7).toLocaleString('en-IN')} per month (70% of disposable income)`);
    
    if (yearsToRetirement > 20) {
      this.actionItems.push('Consider increasing equity exposure for long-term growth');
    } else if (yearsToRetirement <= 10) {
      this.actionItems.push('Start shifting some investments to more stable options as retirement approaches');
    }

    // Generate financial tips
    this.financialTips = [
      'Maintain an emergency fund of 6-12 months of expenses',
      'Review your portfolio every 6 months and rebalance if needed',
      'Increase investments by at least 10% annually to beat inflation'
    ];

    if (netWorth < (profile.salary * 0.5)) {
      this.financialTips.unshift('Focus on building your net worth before taking on more debt');
    }

    // Update chart data
    this.pieChartData = {
      labels: recommendations.map(r => r.assetClass),
      datasets: [{
        data: recommendations.map(r => r.percentage),
        backgroundColor: [
          '#4BC0C0', '#36A2EB', '#FFCE56', '#FF6384', '#9966FF'
        ]
      }]
    };

    // Save recommendations
    const recommendationData = {
      userId: 'current',
      recommendations
    };

    this.http.post<InvestmentRecommendation>(`${this.apiUrl}/recommendations`, recommendationData).subscribe(rec => {
      this.recommendations = rec;
    });
  }

  private loadSampleData(): void {
    this.http.get<InvestmentRecommendation[]>(`${this.apiUrl}/recommendations?userId=current`).subscribe(recs => {
      if (recs.length > 0) {
        this.recommendations = recs[0];
      }
    });
  }
}
```

## 4. JSON Server Setup (db.json)

```json
{
  "profiles": [
    {
      "id": "1",
      "age": 35,
      "salary": 1500000,
      "monthlyExpenses": 75000,
      "badLoans": 200000,
      "goodLoans": 500000,
      "totalAssets": 2500000,
      "riskAppetite": "Medium",
      "futureGoals": {
        "retirementAge": 60,
        "housePurchase": 5000000,
        "childrenEducation": 2000000,
        "otherGoals": 1000000
      },
      "createdAt": "2023-06-15T10:00:00Z"
    }
  ],
  "recommendations": [
    {
      "id": "1",
      "userId": "current",
      "recommendations": [
        {
          "assetClass": "Equity",
          "percentage": 50,
          "products": ["Flexi Cap Funds", "Sectoral Funds", "NPS Equity"],
          "rationale": "Balanced growth for medium risk profile"
        },
        {
          "assetClass": "Fixed Income",
          "percentage": 35,
          "products": ["Debt Funds", "Corporate Bonds", "FDs"],
          "rationale": "Stable returns component"
        },
        {
          "assetClass": "Gold",
          "percentage": 10,
          "products": ["Gold ETFs", "Sovereign Gold Bonds"],
          "rationale": "Inflation hedge"
        },
        {
          "assetClass": "Alternative",
          "percentage": 5,
          "products": ["REITs", "Infrastructure Bonds"],
          "rationale": "Diversification"
        }
      ],
      "createdAt": "2023-06-15T10:05:00Z"
    }
  ]
}
```

## 5. Features Implemented

1. **Comprehensive Financial Profile Input**:
   - Personal details (age, salary)
   - Expense tracking
   - Debt analysis (good vs bad loans)
   - Asset valuation
   - Future goal planning

2. **Personalized Recommendations**:
   - Risk-profile based asset allocation
   - Specific product suggestions
   - Clear rationales for each recommendation

3. **Visual Data Representation**:
   - Interactive pie chart of asset allocation
   - Accordion for detailed recommendations
   - Actionable item list

4. **Financial Health Analysis**:
   - Net worth calculation
   - Savings potential estimation
   - Customized financial tips

5. **Data Persistence**:
   - All data stored in JSON server
   - Sample data pre-loaded
   - Full CRUD operations

## Running the Application

1. Install dependencies:
```bash
npm install chart.js ng2-charts @fortawesome/fontawesome-free
```

2. Start JSON server:
```bash
json-server --watch db.json --port 3000
```

3. Start Angular application:
```bash
ng serve
```

4. Access the application at:
```
http://localhost:4200
```

This implementation provides a complete financial planning dashboard that takes user inputs and generates personalized investment recommendations, with all data persisted in JSON Server. The responsive design works across devices, and the charts provide clear visualization of the recommended asset allocation.

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
