import { Component, OnInit } from '@angular/core';
import 'bootstrap/dist/js/bootstrap.min.js';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss']
})
export class FinanceComponent implements OnInit {
  externalLink: string = '';
  investmentAmount: number = 0;
  expectedReturnRate: number = 0;
  investmentTenure: number = 0;
  futureValue: number = 0;

  loanAmount: number = 0;
  interestRate: number = 0;
  loanTenure: number = 0;
  emi: number =0;
  totalInterestPaid: number = 0;
  totalAmountPaid: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  calculateFutureValue(): void {
    const monthlyRate = this.expectedReturnRate / 12 / 100;
    const totalMonths = this.investmentTenure * 12;

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

  resetSipForm(): void {
    this.investmentAmount = 0;
    this.expectedReturnRate = 0;
    this.investmentTenure = 0;
    this.futureValue = 0;
  }

  resetEmiForm(): void {
    this.loanAmount = 0;
    this.interestRate = 0;
    this.loanTenure = 0;
    this.emi = 0;
    this.totalInterestPaid = 0;
    this.totalAmountPaid = 0;
  }

  openLinkInNewTab(externalLink: string) {
    this.externalLink = externalLink;
    window.open(this.externalLink, '_blank');
  }

}
