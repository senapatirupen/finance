import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-future-projection',
  templateUrl: './future-projection.component.html',
  styleUrls: ['./future-projection.component.scss']
})
export class FutureProjectionComponent implements OnChanges {
  @Input() currentAmount: number = 0;
  inflationRate: number = 3; // Default 3%
  fiveYearProjection: number = 0;
  tenYearProjection: number = 0;

  constructor(private expenseService: ExpenseService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentAmount'] || changes['inflationRate']) {
      this.calculateProjections();
    }
  }

  calculateProjections(): void {
    this.fiveYearProjection = this.expenseService.calculateFutureExpense(
      this.currentAmount, 
      5, 
      this.inflationRate / 100
    );
    
    this.tenYearProjection = this.expenseService.calculateFutureExpense(
      this.currentAmount, 
      10, 
      this.inflationRate / 100
    );
  }

  updateInflationRate(): void {
    this.calculateProjections();
  }
}