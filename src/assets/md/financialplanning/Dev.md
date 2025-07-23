Here's a comprehensive implementation for your **Financial Planning Dashboard** with left navigation and dynamic right-side views using Angular, Bootstrap, and JSON Server:

---

### 1. Folder Structure
```
src/
├── app/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   ├── dashboard.component.html
│   │   ├── expense-tracker/
│   │   ├── investment-tracker/
│   │   ├── corpus-calculator/
│   ├── services/
│   │   ├── data.service.ts
│   ├── models/
│   │   ├── expense.model.ts
│   │   ├── investment.model.ts
│   ├── app-routing.module.ts
├── assets/
│   ├── db.json
```

---

### 2. JSON Server Setup (`db.json`)
```json
{
  "expenses": [],
  "investments": [],
  "corpusGoals": []
}
```

---

### 3. Left Navigation Component (`dashboard.component.html`)
```html
<div class="container-fluid">
  <div class="row">
    <!-- Left Navigation -->
    <div class="col-md-2 bg-light sidebar">
      <div class="sidebar-sticky pt-3">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link active" routerLink="/dashboard/expenses">
              <i class="fas fa-wallet me-2"></i> Daily Expenses
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/dashboard/investments">
              <i class="fas fa-chart-line me-2"></i> Investment Tracker
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/dashboard/corpus">
              <i class="fas fa-calculator me-2"></i> Corpus Calculator
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Right Content Area -->
    <div class="col-md-10">
      <router-outlet></router-outlet>
    </div>
  </div>
</div>
```

---

### 4. Routing Configuration (`app-routing.module.ts`)
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  { 
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'expenses', loadChildren: () => import('./components/expense-tracker/expense.module').then(m => m.ExpenseModule) },
      { path: 'investments', loadChildren: () => import('./components/investment-tracker/investment.module').then(m => m.InvestmentModule) },
      { path: 'corpus', loadChildren: () => import('./components/corpus-calculator/corpus.module').then(m => m.CorpusModule) },
      { path: '', redirectTo: 'expenses', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

### 5. Shared Data Service (`data.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Expense Methods
  getExpenses() {
    return this.http.get(`${this.apiUrl}/expenses`);
  }

  // Investment Methods
  getInvestments() {
    return this.http.get(`${this.apiUrl}/investments`);
  }

  // Corpus Methods
  saveCorpusGoal(goal: any) {
    return this.http.post(`${this.apiUrl}/corpusGoals`, goal);
  }
}
```

---

### 6. Dashboard Styling (`dashboard.component.css`)
```css
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 48px 0 0;
  box-shadow: 1px 0 3px rgba(0,0,0,.1);
}

.nav-link {
  font-weight: 500;
  color: #333;
  padding: 0.75rem 1rem;
  border-left: 4px solid transparent;
}

.nav-link.active {
  color: #0d6efd;
  background-color: rgba(13,110,253,.1);
  border-left: 4px solid #0d6efd;
}

.nav-link:hover {
  color: #0d6efd;
}
```

---

### 7. How to Run
1. **Start JSON Server**:
   ```bash
   json-server --watch assets/db.json --port 3000
   ```

2. **Run Angular App**:
   ```bash
   ng serve
   ```

3. Access at:
   ```
   http://localhost:4200/dashboard
   ```

---

### Key Features:
1. **Modular Architecture**:
   - Lazy-loaded feature modules
   - Separate components for each financial tool

2. **Responsive Design**:
   - Bootstrap 5 sidebar navigation
   - Mobile-friendly layout

3. **Centralized Data Service**:
   - Single service handling all HTTP requests
   - Easy to extend with new endpoints

4. **Dynamic Routing**:
   - Nested routes for dashboard views
   - Clean URL structure

---

### Next Steps You Can Add:
1. **Authentication** (if needed later)
2. **Data Visualization** with Charts.js
3. **Export Functionality** (Excel/PDF)
4. **User Preferences** stored in JSON Server

Would you like me to provide the complete code for any specific module (expense tracker, investment tracker, etc.)?