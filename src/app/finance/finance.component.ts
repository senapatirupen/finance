import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, HostListener } from '@angular/core';
import 'bootstrap/dist/js/bootstrap.min.js';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss'],
  animations: [
    trigger('hoverEffect', [
      state('normal', style({
        transform: 'scale(1)',
      })),
      state('enlarged', style({
        transform: 'scale(1.2)',
      })),
      transition('normal <=> enlarged', animate('200ms ease-in-out')),
    ]),
  ]
})
export class FinanceComponent implements OnInit {
  externalLink: string = '';
  investmentAmount: number = 0;
  expectedReturnRate: number = 0;
  investmentTenure: number = 0;
  futureValue: number = 0;
  totalInvestedAmount = 0;

  loanAmount: number = 0;
  interestRate: number = 0;
  loanTenure: number = 0;
  emi: number = 0;
  totalInterestPaid: number = 0;
  totalAmountPaid: number = 0;

  annualRateOfReturn: number = 0;
  yearsToDouble: number = 0;

  principalAmount: number = 0;
  finalAmount: number = 0;
  numberOfYears: number = 0;
  cagr: number = 0;

  initialAmount: number = 0;
  inflationRate: number = 0;
  years: number = 0;
  futureAmount: number | null = null;

  principal: number = 0;
  rateOfInterest: number = 0;
  time: number = 0;
  compoundingFrequency: number = 1;
  maturityAmount: number | null = null;
  interestEarned: number | null = null;

  ls_principal: number = 0;
  rateOfReturn: number = 0;
  ls_time: number = 0;
  ls_futureValue: number | null = null;
  ls_interestEarned: number | null = null;

  si_principal: number = 0;
  rate: number = 0;
  si_time: number = 0;
  interest: number | null = null;
  si_totalAmount: number | null = null;

  ci_principal: number = 0;
  ci_rate: number = 0;
  ci_time: number = 0;
  compoundings: number = 1;
  ci_interest: number | null = null;
  totalAmount: number | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  hoverState1 = 'normal';

  toggleHoverState() {
    this.hoverState1 = (this.hoverState1 === 'normal' ? 'enlarged' : 'normal');
  }

  calculateCompoundInterest() {
    const r = this.ci_rate / 100;
    const nt = this.compoundings * this.ci_time;
    const amount = this.ci_principal * Math.pow((1 + r / this.compoundings), nt);
    this.totalAmount = amount;
    this.ci_interest = amount - this.ci_principal;
  }

  calculateInterest() {
    this.interest = (this.si_principal * this.rate * this.si_time) / 100;
    this.si_totalAmount = this.si_principal + this.interest;
  }

  calculateLumpSumFutureValue() {
    if (this.ls_principal && this.rateOfReturn && this.ls_time) {
      const rate = this.rateOfReturn / 100;
      this.ls_futureValue = this.ls_principal * Math.pow((1 + rate), this.ls_time);
      this.ls_interestEarned = this.ls_futureValue - this.ls_principal;
    }
  }

  calculateMaturity() {
    if (this.principal && this.rateOfInterest && this.time && this.compoundingFrequency) {
      const ratePerPeriod = this.rateOfInterest / (this.compoundingFrequency * 100);
      const periods = this.time * this.compoundingFrequency;
      this.maturityAmount = this.principal * Math.pow((1 + ratePerPeriod), periods);
      this.interestEarned = this.maturityAmount - this.principal;
    }
  }

  calculateFutureAmount() {
    if (this.initialAmount && this.inflationRate && this.years) {
      const rate = this.inflationRate / 100;
      this.futureAmount = this.initialAmount * Math.pow(1 + rate, this.years);
    }
  }

  calculateFutureValue(): void {
    const monthlyRate = this.expectedReturnRate / 12 / 100;
    const totalMonths = this.investmentTenure * 12;
    this.totalInvestedAmount = this.investmentAmount! * totalMonths;
    this.futureValue = this.investmentAmount *
      (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
  }

  calculateEmi(): void {
    const monthlyRate = (this.interestRate! / 12) / 100;
    const totalMonths = this.loanTenure! * 12;

    this.emi = (this.loanAmount! * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));
    this.totalAmountPaid = this.emi! * totalMonths;
    this.totalInterestPaid = this.totalAmountPaid! - this.loanAmount!;

  }

  // Function to calculate the number of years to double using the Rule of 72
  calculateYearsToDouble(): void {
    // Ensure the interest rate is a valid positive number
    if (this.annualRateOfReturn <= 0) {
      alert("Interest rate must be a positive number");
      return;
    }
    // Calculate the number of years using the Rule of 72
    this.yearsToDouble = 72 / this.annualRateOfReturn;
  }

  calculateCAGR(): void {
    const numerator = this.finalAmount / this.principalAmount;
    const power = 1 / this.numberOfYears;
    this.cagr = Math.pow(numerator, power) - 1;
    this.cagr = this.cagr * 100; // Convert to percentage
  }

  resetCompoundInterestForm(): void {
    this.ci_principal = 0;
    this.ci_rate = 0;
    this.ci_interest = 0;
    this.ci_time = 0;
    this.totalAmount = 0;
  }

  resetSimpleInterestForm(): void {
    this.si_principal = 0;
    this.rate = 0;
    this.interest = 0;
    this.si_time = 0;
    this.si_totalAmount = 0;
  }

  resetLumpSumForm(): void {
    this.ls_principal = 0;
    this.rateOfReturn = 0;
    this.ls_futureValue = 0;
    this.ls_interestEarned = 0;
    this.ls_time = 0;
  }

  resetFixedDepositForm(): void {
    this.principal = 0;
    this.rateOfInterest = 0;
    this.maturityAmount = 0;
    this.interestEarned = 0;
  }

  resetInflationForm(): void {
    this.initialAmount = 0;
    this.futureAmount = 0;
    this.inflationRate = 0;
  }

  resetSipForm(): void {
    this.investmentAmount = 0;
    this.expectedReturnRate = 0;
    this.investmentTenure = 0;
    this.futureValue = 0;
    this.totalInvestedAmount = 0;
  }

  resetEmiForm(): void {
    this.loanAmount = 0;
    this.interestRate = 0;
    this.loanTenure = 0;
    this.emi = 0;
    this.totalInterestPaid = 0;
    this.totalAmountPaid = 0;
  }

  resetCagrForm(): void {
    this.principalAmount = 0;
    this.finalAmount = 0;
    this.numberOfYears = 0;
    this.cagr = 0;
  }

  openLinkInNewTab(externalLink: string) {
    this.externalLink = externalLink;
    window.open(this.externalLink, '_blank');
  }


  shouldShow: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.shouldShow = window.scrollY > 100; // Adjust this value based on when you want the button to appear
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  shouldShowButton(): boolean {
    return this.shouldShow;
  }

}
