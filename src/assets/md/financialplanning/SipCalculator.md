To display the total future value, total investment, and total interest paid after each SIP input, we can add a section below each SIP input where these values are shown. Here's how you can modify the HTML template to achieve this:

**sip-calculator.component.html**:
```html
<div class="container mt-5">
    <h2 class="text-center mb-4">SIP Calculator</h2>
    <form (ngSubmit)="calculateSIP()">
        <div *ngFor="let sip of sipData; let i = index" class="sip-input">
            <h4>SIP {{ i + 1 }}</h4>
            <div class="form-group">
                <label for="monthlyInvestment{{i}}">Monthly Investment (INR):</label>
                <input type="number" class="form-control" id="monthlyInvestment{{i}}" name="monthlyInvestment{{i}}" [(ngModel)]="sip.monthlyInvestment" required>
            </div>
            <div class="form-group">
                <label for="duration{{i}}">Duration (in years):</label>
                <input type="number" class="form-control" id="duration{{i}}" name="duration{{i}}" [(ngModel)]="sip.duration" required>
            </div>
            <div class="form-group">
                <label for="expectedReturn{{i}}">Expected Annual Return (%):</label>
                <input type="number" class="form-control" id="expectedReturn{{i}}" name="expectedReturn{{i}}" [(ngModel)]="sip.expectedReturn" required>
            </div>
            <div class="sip-summary">
                <p>Total Future Value: {{ sip.futureValue | currency:'INR':true:'1.0-2' }}</p>
                <p>Total Investment: {{ sip.totalInvestment | currency:'INR':true:'1.0-2' }}</p>
                <p>Total Interest Paid: {{ sip.totalInterestPaid | currency:'INR':true:'1.0-2' }}</p>
            </div>
            <button type="button" class="btn btn-danger" (click)="removeSIP(i)">Remove SIP</button>
            <hr>
        </div>
        <button type="button" class="btn btn-primary btn-block" (click)="addSIP()">Add SIP</button>
        <button type="submit" class="btn btn-success btn-block mt-3">Calculate SIP</button>
    </form>
    <div *ngIf="totalFutureValue !== null" class="mt-4">
        <h4>Total Future Value of SIPs: {{ totalFutureValue | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Investment: {{ totalInvestment | currency:'INR':true:'1.0-2' }}</h4>
        <h4>Total Interest Paid: {{ totalInterestPaid | currency:'INR':true:'1.0-2' }}</h4>
    </div>
</div>
```

With this modification, each SIP input will display the total future value, total investment, and total interest paid for that SIP. The overall total future value, total investment, and total interest paid for all SIPs will still be displayed at the bottom of the calculator. Adjust the styles and formatting as needed to fit your application's design.