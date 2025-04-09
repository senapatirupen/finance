Here’s a **Home Loan Part Payment Calculator** built using **Angular**. It takes inputs like **loan amount, interest rate, tenure, and yearly part payments**, then calculates the **expected vs actual interest paid**, **tenure reduction**, and **interest savings**.  

I will provide a **complete Angular component** that includes:  
✅ HTML form for input fields  
✅ TypeScript logic to calculate the EMI, interest savings, and reduced tenure  
✅ Display results in a structured format  

### **Home Loan Part Payment Calculator (Angular)**
I'll provide the **Angular TypeScript Component (`home-loan-calculator.component.ts`)** and the **HTML Template (`home-loan-calculator.component.html`)** below.  

---

### **1️⃣ Angular Component (TypeScript)**
Create a new Angular component `home-loan-calculator.component.ts`:  

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-home-loan-calculator',
  templateUrl: './home-loan-calculator.component.html',
  styleUrls: ['./home-loan-calculator.component.css']
})
export class HomeLoanCalculatorComponent {
  loanAmount: number = 5000000; // Default ₹50 Lakhs
  interestRate: number = 8; // Default 8% per annum
  tenure: number = 20; // Default 20 years
  partPaymentPerYear: number = 100000; // Default ₹1 Lakh per year

  expectedInterestPaid: number = 0;
  actualInterestPaid: number = 0;
  expectedTenure: number = 0;
  actualTenure: number = 0;
  interestSaved: number = 0;
  tenureReduced: number = 0;

  calculateLoan() {
    let principal = this.loanAmount;
    let monthlyRate = this.interestRate / 100 / 12;
    let totalMonths = this.tenure * 12;

    // Calculate standard EMI (Equated Monthly Installment)
    let emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
              (Math.pow(1 + monthlyRate, totalMonths) - 1);

    // Expected Interest Paid (Without Part Payment)
    this.expectedInterestPaid = emi * totalMonths - principal;
    this.expectedTenure = this.tenure;

    // Calculate New Loan Details After Part Payment
    let remainingPrincipal = principal;
    let newTenureMonths = 0;
    let totalInterestPaid = 0;
    
    for (let i = 0; i < totalMonths; i++) {
      let interestComponent = remainingPrincipal * monthlyRate;
      let principalComponent = emi - interestComponent;
      totalInterestPaid += interestComponent;

      remainingPrincipal -= principalComponent;

      // Apply yearly part payment at the end of every 12th month
      if ((i + 1) % 12 === 0 && remainingPrincipal > 0) {
        remainingPrincipal -= this.partPaymentPerYear;
        if (remainingPrincipal < 0) remainingPrincipal = 0;
      }

      newTenureMonths++;
      if (remainingPrincipal <= 0) break; // Loan is fully paid off
    }

    this.actualInterestPaid = totalInterestPaid;
    this.actualTenure = Math.floor(newTenureMonths / 12);
    this.tenureReduced = this.expectedTenure - this.actualTenure;
    this.interestSaved = this.expectedInterestPaid - this.actualInterestPaid;
  }
}
```

---

### **2️⃣ HTML Template (`home-loan-calculator.component.html`)**
This will create an interactive UI where users can enter values and see real-time calculations.  

```html
<div class="container">
  <h2>🏡 Home Loan Part Payment Calculator</h2>

  <div class="input-group">
    <label>🏠 Loan Amount (₹):</label>
    <input type="number" [(ngModel)]="loanAmount">
  </div>

  <div class="input-group">
    <label>📈 Interest Rate (% per annum):</label>
    <input type="number" [(ngModel)]="interestRate">
  </div>

  <div class="input-group">
    <label>📅 Loan Tenure (Years):</label>
    <input type="number" [(ngModel)]="tenure">
  </div>

  <div class="input-group">
    <label>💰 Part Payment Per Year (₹):</label>
    <input type="number" [(ngModel)]="partPaymentPerYear">
  </div>

  <button (click)="calculateLoan()">Calculate</button>

  <div class="result" *ngIf="expectedInterestPaid">
    <h3>📊 Loan Comparison</h3>
    <p><strong>Expected Interest Paid (No Prepayment):</strong> ₹{{ expectedInterestPaid | number }}</p>
    <p><strong>Actual Interest Paid (With Prepayment):</strong> ₹{{ actualInterestPaid | number }}</p>
    <p><strong>Expected Loan Tenure:</strong> {{ expectedTenure }} years</p>
    <p><strong>Actual Loan Tenure After Prepayment:</strong> {{ actualTenure }} years</p>
    <p><strong>🟢 Interest Saved:</strong> ₹{{ interestSaved | number }}</p>
    <p><strong>⏳ Tenure Reduced:</strong> {{ tenureReduced }} years</p>
  </div>
</div>
```

---

### **3️⃣ CSS for Styling (`home-loan-calculator.component.css`)**
(Optional, but enhances UI)  

```css
.container {
  max-width: 500px;
  margin: auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #d4edda;
  border-left: 5px solid #28a745;
  border-radius: 5px;
}
```

---

### **How It Works**
✅ **User Inputs:**  
- Loan Amount  
- Interest Rate  
- Loan Tenure (Years)  
- Part Payment Amount Per Year  

✅ **Calculations Performed:**  
- Expected **EMI, Total Interest, and Tenure** without prepayment  
- Actual **Interest Paid and Loan Tenure** after yearly part payments  
- **Interest Saved & Tenure Reduced**  

✅ **Output Results:**  
- Expected **vs** Actual Interest Paid  
- Expected **vs** Actual Loan Tenure  
- **Interest Savings & Tenure Reduction**  

---

### **How to Run This in Angular**
1. **Create a new Angular component**  
   ```sh
   ng generate component home-loan-calculator
   ```
2. **Replace `home-loan-calculator.component.ts` and `.html` with the above code**  
3. **Import `FormsModule` in `app.module.ts`**  
   ```typescript
   import { FormsModule } from '@angular/forms';
   ```
   Add it in `imports: [FormsModule]`  
4. **Run the Angular project**  
   ```sh
   ng serve
   ```

---

### **Final Thoughts**
With this Angular-based **Home Loan Part Payment Calculator**, users can instantly visualize **how making yearly prepayments reduces tenure and saves interest**.  

Would you like any **additional features** (like charts or an amortization table)? 😊