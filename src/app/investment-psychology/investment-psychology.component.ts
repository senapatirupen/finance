import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-investment-psychology',
  templateUrl: './investment-psychology.component.html',
  styleUrls: ['./investment-psychology.component.scss']
})
export class InvestmentPsychologyComponent implements OnInit {

  investmentType: string = 'Spending Vs Investing';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadChildComponent(this.investmentType);
  }

  loadChildComponent(investmentType: string): void {
    this.router.navigate(['/psychology/'+investmentType]);
  }

}
