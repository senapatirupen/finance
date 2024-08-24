Designing a Fixed Deposit (FD) calculator in Angular involves creating an interface where users can input details such as the principal amount, interest rate, and duration. The calculator will then compute the maturity amount and the interest earned. Here's how you can create a simple FD calculator:

### Step 1: Set Up the Angular Project (if not already done)

If you haven't already set up an Angular project, follow these steps:

1. **Install Angular CLI:**
   ```bash
   npm install -g @angular/cli
   ```

2. **Create a new Angular project:**
   ```bash
   ng new fd-calculator
   cd fd-calculator
   ```

3. **Serve the project:**
   ```bash
   ng serve
   ```

   The Angular project should now be running at `http://localhost:4200/`.

### Step 2: Create a Component for the FD Calculator

1. **Generate a new component:**
   ```bash
   ng generate component fd-calculator
   ```

2. **Modify the `fd-calculator.component.html` file:**

   ```html
   <div class="container">
     <h1>Fixed Deposit Calculator</h1>
     <form (ngSubmit)="calculateMaturity()">
       <div>
         <label for="principal">Principal Amount:</label>
         <input type="number" id="principal" [(ngModel)]="principal" name="principal" required>
       </div>
       <div>
         <label for="rateOfInterest">Rate of Interest (% per annum):</label>
         <input type="number" id="rateOfInterest" [(ngModel)]="rateOfInterest" name="rateOfInterest" required>
       </div>
       <div>
         <label for="time">Time (years):</label>
         <input type="number" id="time" [(ngModel)]="time" name="time" required>
       </div>
       <div>
         <label for="compoundingFrequency">Compounding Frequency:</label>
         <select id="compoundingFrequency" [(ngModel)]="compoundingFrequency" name="compoundingFrequency">
           <option value="1">Annually</option>
           <option value="2">Semi-Annually</option>
           <option value="4">Quarterly</option>
           <option value="12">Monthly</option>
         </select>
       </div>
       <button type="submit">Calculate Maturity</button>
     </form>

     <div *ngIf="maturityAmount !== null">
       <h2>Maturity Amount: {{ maturityAmount | currency }}</h2>
       <h2>Interest Earned: {{ interestEarned | currency }}</h2>
     </div>
   </div>
   ```

3. **Add styles to `fd-calculator.component.css` for basic layout:**

   ```css
   .container {
     max-width: 400px;
     margin: auto;
     padding: 20px;
     border: 1px solid #ccc;
     border-radius: 5px;
   }

   h1 {
     text-align: center;
     margin-bottom: 20px;
   }

   div {
     margin-bottom: 15px;
   }

   label {
     display: block;
     margin-bottom: 5px;
   }

   input,
   select {
     width: 100%;
     padding: 8px;
     box-sizing: border-box;
   }

   button {
     width: 100%;
     padding: 10px;
     background-color: #007bff;
     color: white;
     border: none;
     border-radius: 5px;
     cursor: pointer;
   }

   button:hover {
     background-color: #0056b3;
   }

   h2 {
     text-align: center;
     color: #28a745;
   }
   ```

### Step 3: Implement the Logic in the Component

1. **Update `fd-calculator.component.ts` to calculate the maturity amount:**

   ```typescript
   import { Component } from '@angular/core';

   @Component({
     selector: 'app-fd-calculator',
     templateUrl: './fd-calculator.component.html',
     styleUrls: ['./fd-calculator.component.css']
   })
   export class FdCalculatorComponent {
     principal: number = 0;
     rateOfInterest: number = 0;
     time: number = 0;
     compoundingFrequency: number = 1;
     maturityAmount: number | null = null;
     interestEarned: number | null = null;

     calculateMaturity() {
       if (this.principal && this.rateOfInterest && this.time && this.compoundingFrequency) {
         const ratePerPeriod = this.rateOfInterest / (this.compoundingFrequency * 100);
         const periods = this.time * this.compoundingFrequency;
         this.maturityAmount = this.principal * Math.pow((1 + ratePerPeriod), periods);
         this.interestEarned = this.maturityAmount - this.principal;
       }
     }
   }
   ```

### Step 4: Test the Application

1. **Ensure your Angular development server is running:**

   ```bash
   ng serve
   ```

2. **Navigate to `http://localhost:4200/` in your browser** to see the FD calculator.

### Step 5: Explanation of the Logic

- **Formula for Maturity Amount Calculation:**

  The maturity amount for an FD is calculated using the compound interest formula:
  \[
  \text{Maturity Amount} = \text{Principal} \times \left(1 + \frac{\text{Rate of Interest}/100}{\text{Compounding Frequency}}\right)^{\text{Compounding Frequency} \times \text{Time}}
  \]

  - `Principal`: The initial amount invested.
  - `Rate of Interest`: The annual interest rate.
  - `Time`: The investment duration in years.
  - `Compounding Frequency`: The number of times interest is compounded per year (e.g., 1 for annual, 2 for semi-annual, 4 for quarterly, 12 for monthly).

- **Interest Earned:**
  \[
  \text{Interest Earned} = \text{Maturity Amount} - \text{Principal}
  \]

This setup will give you a functional FD calculator using Angular, allowing users to input various parameters and see the maturity amount and interest earned.