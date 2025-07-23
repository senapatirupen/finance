import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-future-projection',
  templateUrl: './future-projection.component.html',
  styleUrls: ['./future-projection.component.scss']
})
export class FutureProjectionComponent implements OnChanges {
  @Input() currentAmount: number = 0;
  @Input() category?: string; // Optional category for specific projections
  @Input() customInflationRate?: number; // Allow parent to set inflation rate
  
  inflationRate: number = 6; // Default to 6% (updated from 3%)
  fiveYearProjection: number = 0;
  tenYearProjection: number = 0;
  yearlyBreakdown: {year: number, amount: number}[] = [];

  // Default inflation rates by category
  private defaultInflationRates: {[key: string]: number} = {
    'Housing': 5,
    'Food': 6,
    'Transportation': 7,
    'Healthcare': 8,
    'Entertainment': 4,
    'Utilities': 5,
    'Other': 5
  };

  constructor(private expenseService: ExpenseService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentAmount'] || changes['inflationRate'] || changes['category'] || changes['customInflationRate']) {
      this.updateInflationRateBasedOnInputs();
      this.calculateProjections();
      this.generateYearlyBreakdown();
    }
  }

  private updateInflationRateBasedOnInputs(): void {
    if (this.customInflationRate !== undefined) {
      this.inflationRate = this.customInflationRate;
    } else if (this.category && this.defaultInflationRates[this.category]) {
      this.inflationRate = this.defaultInflationRates[this.category];
    }
    // Otherwise, keep the default 6%
  }

  calculateProjections(): void {
    this.fiveYearProjection = this.expenseService.calculateFutureValue(
      this.currentAmount, 
      5, 
      this.inflationRate / 100
    );
    
    this.tenYearProjection = this.expenseService.calculateFutureValue(
      this.currentAmount, 
      10, 
      this.inflationRate / 100
    );
  }

  generateYearlyBreakdown(): void {
    this.yearlyBreakdown = [];
    for (let year = 1; year <= 10; year++) {
      this.yearlyBreakdown.push({
        year,
        amount: this.expenseService.calculateFutureValue(
          this.currentAmount,
          year,
          this.inflationRate / 100
        )
      });
    }
  }

  updateInflationRate(): void {
    this.calculateProjections();
    this.generateYearlyBreakdown();
  }
}