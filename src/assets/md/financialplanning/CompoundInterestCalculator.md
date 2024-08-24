To design a Compound Interest Calculator using Angular, follow these steps:

### 1. **Set Up Angular Project**
If you don't have an Angular project set up yet, you can create one using the Angular CLI.

```bash
ng new compound-interest-calculator
cd compound-interest-calculator
```

### 2. **Generate a Component**
Generate a new component that will serve as the Compound Interest Calculator.

```bash
ng generate component compound-interest-calculator
```

### 3. **Create the HTML Template**

Update the `compound-interest-calculator.component.html` file to include a form for inputting the principal amount, interest rate, time period, and the number of times interest is compounded per year. Display the calculated compound interest and the total amount (principal + interest) below the form.

```html
<div class="container">
  <h2>Compound Interest Calculator</h2>
  <form (ngSubmit)="calculateCompoundInterest()">
    <div>
      <label for="principal">Principal Amount (P):</label>
      <input type="number" [(ngModel)]="principal" name="principal" required />
    </div>
    
    <div>
      <label for="rate">Annual Interest Rate (R):</label>
      <input type="number" [(ngModel)]="rate" name="rate" required />
    </div>
    
    <div>
      <label for="time">Time Period (T in years):</label>
      <input type="number" [(ngModel)]="time" name="time" required />
    </div>

    <div>
      <label for="compoundings">Compounds per Year (n):</label>
      <input type="number" [(ngModel)]="compoundings" name="compoundings" required />
    </div>

    <button type="submit">Calculate</button>
  </form>

  <div *ngIf="interest !== null">
    <h3>Total Principal: {{ principal }}</h3>
    <h3>Interest Earned: {{ interest }}</h3>
    <h3>Total Amount: {{ totalAmount }}</h3>
  </div>
</div>
```

### 4. **Add Logic to the Component**

In `compound-interest-calculator.component.ts`, add the logic to calculate the compound interest and total amount.

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-compound-interest-calculator',
  templateUrl: './compound-interest-calculator.component.html',
  styleUrls: ['./compound-interest-calculator.component.css']
})
export class CompoundInterestCalculatorComponent {
  principal: number = 0;
  rate: number = 0;
  time: number = 0;
  compoundings: number = 1;
  interest: number | null = null;
  totalAmount: number | null = null;

  calculateCompoundInterest() {
    const r = this.rate / 100;
    const nt = this.compoundings * this.time;
    const amount = this.principal * Math.pow((1 + r / this.compoundings), nt);
    this.totalAmount = amount;
    this.interest = amount - this.principal;
  }
}
```

### 5. **Style the Component**

Add some basic styling in the `compound-interest-calculator.component.css` file.

```css
.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

h2, h3 {
  text-align: center;
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
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #0056b3;
}
```

### 6. **Include the Component in Your App**

Add the `CompoundInterestCalculatorComponent` to the `app.component.html` file to include it in your app.

```html
<app-compound-interest-calculator></app-compound-interest-calculator>
```

### 7. **Run the Application**

To see your changes in action, run the application:

```bash
ng serve
```

Visit `http://localhost:4200/` in your browser. You should now see the Compound Interest Calculator, where users can input the principal amount, interest rate, time period, and the number of times the interest is compounded per year. The calculator will output the principal amount, the interest earned, and the total amount after the specified time.

### 8. **Understanding the Formula**

The formula used for calculating compound interest is:

\[ A = P \left(1 + \frac{R}{n}\right)^{nt} \]

Where:
- \( A \) is the total amount (principal + interest).
- \( P \) is the principal amount.
- \( R \) is the annual interest rate (as a decimal).
- \( n \) is the number of times interest is compounded per year.
- \( t \) is the time the money is invested or borrowed for, in years.
- The interest earned is calculated as \( \text{Interest} = A - P \).

This approach provides a clear and functional Compound Interest Calculator that can be easily used and expanded if needed.