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

  constructor() { }

  ngOnInit(): void {
  }

  hoverState1 = 'normal';

  toggleHoverState() {
    this.hoverState1 = (this.hoverState1 === 'normal' ? 'enlarged' : 'normal');
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
