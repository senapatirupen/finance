Designing a Lump Sum Investment Calculator in Angular involves creating an interface where users can input details such as the principal amount, expected rate of return, and the investment duration. The calculator will then compute the future value of the investment based on these inputs. Here's how you can create a Lump Sum Investment Calculator:

### Step 1: Set Up the Angular Project

If you haven't already set up an Angular project, follow these steps:

1. **Install Angular CLI:**
   ```bash
   npm install -g @angular/cli
   ```

2. **Create a new Angular project:**
   ```bash
   ng new lump-sum-calculator
   cd lump-sum-calculator
   ```

3. **Serve the project:**
   ```bash
   ng serve
   ```

   The Angular project should now be running at `http://localhost:4200/`.

### Step 2: Create a Component for the Lump Sum Calculator

1. **Generate a new component:**
   ```bash
   ng generate component lump-sum-calculator
   ```

2. **Modify the `lump-sum-calculator.component.html` file:**

   ```html
   <div class="container">
     <h1>Lump Sum Investment Calculator</h1>
     <form (ngSubmit)="calculateFutureValue()">
       <div>
         <label for="principal">Principal Amount:</label>
         <input type="number" id="principal" [(ngModel)]="principal" name="principal" required>
       </div>
       <div>
         <label for="rateOfReturn">Expected Rate of Return (% per annum):</label>
         <input type="number" id="rateOfReturn" [(ngModel)]="rateOfReturn" name="rateOfReturn" required>
       </div>
       <div>
         <label for="time">Investment Duration (years):</label>
         <input type="number" id="time" [(ngModel)]="time" name="time" required>
       </div>
       <button type="submit">Calculate Future Value</button>
     </form>

     <div *ngIf="futureValue !== null">
       <h2>Future Value: {{ futureValue | currency }}</h2>
       <h2>Interest Earned: {{ interestEarned | currency }}</h2>
     </div>
   </div>
   ```

3. **Add styles to `lump-sum-calculator.component.css` for a basic layout:**

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

   input {
     width: 100%;
     padding: 8px;
     box-sizing: border-box;
   }

   button {
     width: 100%;
     padding: 10px;
     background-color: #28a745;
     color: white;
     border: none;
     border-radius: 5px;
     cursor: pointer;
   }

   button:hover {
     background-color: #218838;
   }

   h2 {
     text-align: center;
     color: #007bff;
   }
   ```

### Step 3: Implement the Logic in the Component

1. **Update `lump-sum-calculator.component.ts` to calculate the future value:**

   ```typescript
   import { Component } from '@angular/core';

   @Component({
     selector: 'app-lump-sum-calculator',
     templateUrl: './lump-sum-calculator.component.html',
     styleUrls: ['./lump-sum-calculator.component.css']
   })
   export class LumpSumCalculatorComponent {
     principal: number = 0;
     rateOfReturn: number = 0;
     time: number = 0;
     futureValue: number | null = null;
     interestEarned: number | null = null;

     calculateFutureValue() {
       if (this.principal && this.rateOfReturn && this.time) {
         const rate = this.rateOfReturn / 100;
         this.futureValue = this.principal * Math.pow((1 + rate), this.time);
         this.interestEarned = this.futureValue - this.principal;
       }
     }
   }
   ```

### Step 4: Test the Application

1. **Ensure your Angular development server is running:**

   ```bash
   ng serve
   ```

2. **Navigate to `http://localhost:4200/` in your browser** to see the Lump Sum Investment Calculator in action.

### Step 5: Explanation of the Logic

- **Formula for Future Value Calculation:**

  The future value of a lump sum investment is calculated using the compound interest formula:
  \[
  \text{Future Value} = \text{Principal} \times \left(1 + \frac{\text{Rate of Return}}{100}\right)^{\text{Time}}
  \]

  - `Principal`: The initial amount invested.
  - `Rate of Return`: The expected annual return rate.
  - `Time`: The investment duration in years.

- **Interest Earned:**
  \[
  \text{Interest Earned} = \text{Future Value} - \text{Principal}
  \]

This setup will give you a functional Lump Sum Investment Calculator using Angular, allowing users to input various parameters and see the future value of their investment and the interest earned over the investment period.