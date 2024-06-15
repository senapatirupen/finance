import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-investment-psychology',
  templateUrl: './investment-psychology.component.html',
  styleUrls: ['./investment-psychology.component.scss']
})
export class InvestmentPsychologyComponent implements OnInit {

  incomeForm!: FormGroup;

  sipData: any[] = [];
  totalFutureValue: number = 0;
  totalInvestment: number = 0;
  totalInterestPaid: number = 0;

  emiData: any[] = [];
  totalEmiInterestPaid: number = 0;
  totalPrincipalPaid: number = 0;
  totalEMIAmount: number = 0;
  totalRemainingPrincipal: number = 0;
  totalInterestToBePaid: number = 0;
  totalRemainingTenure: number = 0;

  incomeSources: any[] = [];
  totalInitialIncome: number = 0;
  totalProjectedIncome: number = 0;
  totalAmountReceived: number = 0;

  expenses: any[] = [];
  totalInitialExpenses: number = 0;
  totalProjectedExpenses: number = 0;
  totalAmountSpent: number = 0;

  annualExpenses: any[] = [];
  totalInitialAnnualExpenses: number = 0;
  totalProjectedAnnualExpenses: number = 0;
  aTotalAmountSpent: number | null = 0;

  externalLink: string = ''
  investmentType: string = 'Spending Vs Investing';

  constructor(private router: Router, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.loadChildComponent(this.investmentType);
    this.createForm();
  }

  loadChildComponent(investmentType: string): void {
    this.router.navigate(['/psychology/' + investmentType]);
  }

  openLinkInNewTab(externalLink: string) {
    this.externalLink = externalLink;
    window.open(this.externalLink, '_blank');
  }

  createForm() {
    this.incomeForm = this.formBuilder.group({
      source: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      frequency: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.incomeForm.valid) {
      console.log(this.incomeForm.value);
      // You can send this form data to your backend or handle it as needed
    } else {
      // Handle invalid form
    }
  }


  addSIP() {
    this.sipData.push({
      investmentOnName: '',
      monthlyInvestment: null,
      duration: null,
      expectedReturn: null,
      futureValue: null,
      totalInvestment: null,
      totalInterestPaid: null
    });
  }

  removeSIP(index: number) {
    this.sipData.splice(index, 1);
    this.calculateSIP();
  }

  calculateSIP() {
    this.totalFutureValue = 0;
    this.totalInvestment = 0;
    this.totalInterestPaid = 0;

    this.sipData.forEach(sip => {
      const monthlyInvestment = parseFloat(sip.monthlyInvestment.toString() || '0');
      const duration = parseFloat(sip.duration.toString() || '0');
      const expectedReturn = parseFloat(sip.expectedReturn.toString() || '0');

      const monthlyReturn = expectedReturn / 12 / 100;
      const totalMonths = duration * 12;

      // Calculate future value using the formula for compound interest
      const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn);
      sip.futureValue = futureValue;

      // Calculate total investment
      const totalInvestment = monthlyInvestment * totalMonths;
      sip.totalInvestment = totalInvestment;

      // Calculate total interest paid
      const totalInterestPaid = futureValue - totalInvestment;
      sip.totalInterestPaid = totalInterestPaid;

      this.totalFutureValue += futureValue;
      this.totalInvestment += totalInvestment;
      this.totalInterestPaid += totalInterestPaid;
    });
  }

  addEMI() {
    this.emiData.push({
      emiForName: '',
      principal: null,
      annualInterestRate: null,
      totalTenure: null,
      tenuresPaid: 0,  // Set default value to zero
      emiAmount: null,
      principalPaidSoFar: null,
      interestPaidSoFar: null,
      remainingPrincipal: null,
      interestToBePaid: null,
      remainingTenure: null
    });
  }

  removeEMI(index: number) {
    this.emiData.splice(index, 1);
    this.calculateAllEMIs();
  }

  calculateEMI(emi: any) {
    if (emi.principal && emi.annualInterestRate && emi.totalTenure !== null && emi.tenuresPaid !== null) {
      const monthlyInterestRate = emi.annualInterestRate / 12 / 100;
      const totalMonths = emi.totalTenure * 12;
      const monthsPaid = emi.tenuresPaid;

      // Calculate EMI using the formula
      emi.emiAmount = (emi.principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

      let remainingPrincipal = emi.principal;
      emi.interestPaidSoFar = 0;
      emi.principalPaidSoFar = 0;

      for (let month = 0; month < monthsPaid; month++) {
        const interestForMonth = remainingPrincipal * monthlyInterestRate;
        const principalForMonth = emi.emiAmount - interestForMonth;

        emi.interestPaidSoFar += interestForMonth;
        emi.principalPaidSoFar += principalForMonth;
        remainingPrincipal -= principalForMonth;
      }

      emi.remainingPrincipal = remainingPrincipal;
      emi.remainingTenure = totalMonths - monthsPaid;
      emi.interestToBePaid = 0;

      for (let month = 0; month < emi.remainingTenure; month++) {
        const interestForMonth = remainingPrincipal * monthlyInterestRate;
        const principalForMonth = emi.emiAmount - interestForMonth;

        emi.interestToBePaid += interestForMonth;
        remainingPrincipal -= principalForMonth;
      }
    }
  }

  calculateAllEMIs() {
    this.totalEmiInterestPaid = 0;
    this.totalPrincipalPaid = 0;
    this.totalEMIAmount = 0;
    this.totalRemainingPrincipal = 0;
    this.totalInterestToBePaid = 0;
    this.totalRemainingTenure = 0;

    this.emiData.forEach(emi => {
      this.calculateEMI(emi);

      this.totalEmiInterestPaid += emi.interestPaidSoFar;
      this.totalPrincipalPaid += emi.principalPaidSoFar;
      this.totalEMIAmount += emi.emiAmount;
      this.totalRemainingPrincipal += emi.remainingPrincipal;
      this.totalInterestToBePaid += emi.interestToBePaid;
      this.totalRemainingTenure += emi.remainingTenure;
    });
  }

  addIncomeSource() {
    this.incomeSources.push({
      sourceName: '',
      initialMonthlyIncome: null,
      annualGrowthRate: null,
      years: null,
      projectedMonthlyIncome: null,
      totalAmountReceived: null
    });
  }

  removeIncomeSource(index: number) {
    this.incomeSources.splice(index, 1);
    this.calculateTotalIncome();
  }

  calculateIncomeDetails(incomeSource: any) {
    if (incomeSource.initialMonthlyIncome && incomeSource.annualGrowthRate && incomeSource.years) {
      incomeSource.projectedMonthlyIncome = incomeSource.initialMonthlyIncome * Math.pow(1 + incomeSource.annualGrowthRate / 100, incomeSource.years);
      incomeSource.totalAmountReceived = 0;
      let monthlyIncome = incomeSource.initialMonthlyIncome;
      for (let i = 0; i < incomeSource.years; i++) {
        incomeSource.totalAmountReceived += monthlyIncome * 12;
        monthlyIncome *= 1 + incomeSource.annualGrowthRate / 100;
      }
    }
  }

  calculateTotalIncome() {
    this.totalInitialIncome = 0;
    this.totalProjectedIncome = 0;
    this.totalAmountReceived = 0;

    this.incomeSources.forEach(incomeSource => {
      this.calculateIncomeDetails(incomeSource);
      this.totalInitialIncome += incomeSource.initialMonthlyIncome * 12;
      this.totalProjectedIncome += incomeSource.projectedMonthlyIncome * 12;
      this.totalAmountReceived += incomeSource.totalAmountReceived;
    });
  }

  addExpense() {
    this.expenses.push({
      expenseName: '',
      initialMonthlyExpense: null,
      annualGrowthRate: null,
      years: null,
      projectedMonthlyExpense: null,
      totalAmountSpent: null
    });
  }

  removeExpense(index: number) {
    this.expenses.splice(index, 1);
    this.calculateTotalExpenses();
  }

  calculateExpenseDetails(expense: any) {
    if (expense.initialMonthlyExpense && expense.annualGrowthRate && expense.years) {
      expense.projectedMonthlyExpense = expense.initialMonthlyExpense * Math.pow(1 + expense.annualGrowthRate / 100, expense.years);
      expense.totalAmountSpent = 0;
      let monthlyExpense = expense.initialMonthlyExpense;
      for (let i = 0; i < expense.years; i++) {
        expense.totalAmountSpent += monthlyExpense * 12;
        monthlyExpense *= 1 + expense.annualGrowthRate / 100;
      }
    }
  }

  calculateTotalExpenses() {
    this.totalInitialExpenses = 0;
    this.totalProjectedExpenses = 0;
    this.totalAmountSpent = 0;

    this.expenses.forEach(expense => {
      this.calculateExpenseDetails(expense);
      this.totalInitialExpenses += expense.initialMonthlyExpense * 12;
      this.totalProjectedExpenses += expense.projectedMonthlyExpense * 12;
      this.totalAmountSpent += expense.totalAmountSpent;
    });
  }

  addAnnualExpense() {
    this.annualExpenses.push({
      expenseName: '',
      initialAnnualExpense: null,
      annualGrowthRate: null,
      years: null,
      projectedAnnualExpense: null,
      aTotalAmountSpent: null
    });
  }

  removeAnnualExpense(index: number) {
    this.annualExpenses.splice(index, 1);
    this.calculateTotalAnnualExpenses();
  }

  calculateAnnualExpenseDetails(annualExpense: any) {
    if (annualExpense.initialAnnualExpense && annualExpense.annualGrowthRate && annualExpense.years) {
      annualExpense.projectedAnnualExpense = annualExpense.initialAnnualExpense * Math.pow(1 + annualExpense.annualGrowthRate / 100, annualExpense.years);
      annualExpense.aTotalAmountSpent = 0;
      let yearlyExpense = annualExpense.initialAnnualExpense;
      for (let i = 0; i < annualExpense.years; i++) {
        annualExpense.aTotalAmountSpent += yearlyExpense;
        yearlyExpense *= 1 + annualExpense.annualGrowthRate / 100;
      }
    }
  }

  calculateTotalAnnualExpenses() {
    this.totalInitialAnnualExpenses = 0;
    this.totalProjectedAnnualExpenses = 0;
    this.aTotalAmountSpent = 0;

    this.annualExpenses.forEach(annualExpense => {
      this.calculateAnnualExpenseDetails(annualExpense);
      this.totalInitialAnnualExpenses += annualExpense.initialAnnualExpense;
      this.totalProjectedAnnualExpenses += annualExpense.projectedAnnualExpense;
      this.aTotalAmountSpent += annualExpense.aTotalAmountSpent;
    });
  }

}
