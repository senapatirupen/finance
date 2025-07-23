import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Expense } from 'src/app/model/expense.model';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss'],
  providers: [DatePipe]
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  totalExpenses = 0;
  categoryTotals: {category: string, amount: number, inflationRate: number}[] = [];
  inflationRate = 6; // Default inflation rate for summary calculations
  summaryProjections = {
    fiveYears: 0,
    tenYears: 0
  };
  categoryProjections: {
    category: string, 
    currentAmount: number,
    fiveYears: number,
    tenYears: number,
    inflationRate: number
  }[] = [];

  constructor(
    private expenseService: ExpenseService,
    private datePipe: DatePipe,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses()
      .subscribe(expenses => {
        this.expenses = expenses;
        this.totalExpenses = this.expenseService.getTotalExpenses(expenses);
        this.categoryTotals = this.expenseService.getCategoryTotals(expenses);
        this.calculateProjections();
      });
  }

  loadExpensesByDate(): void {
    this.expenseService.getExpensesByMonth(this.currentYear, this.currentMonth)
      .subscribe(expenses => {
        this.expenses = expenses;
        this.totalExpenses = this.expenseService.getTotalExpenses(expenses);
        this.categoryTotals = this.expenseService.getCategoryTotals(expenses);
        this.calculateProjections();
      });
  }

  calculateProjections(): void {
    // Calculate summary projections
    this.summaryProjections.fiveYears = this.expenseService.calculateFutureValue(
      this.totalExpenses, 5, this.inflationRate
    );
    this.summaryProjections.tenYears = this.expenseService.calculateFutureValue(
      this.totalExpenses, 10, this.inflationRate
    );

    // Calculate category-wise projections
    this.categoryProjections = this.categoryTotals.map(category => ({
      category: category.category,
      currentAmount: category.amount,
      fiveYears: this.expenseService.calculateFutureValue(
        category.amount, 5, category.inflationRate
      ),
      tenYears: this.expenseService.calculateFutureValue(
        category.amount, 10, category.inflationRate
      ),
      inflationRate: category.inflationRate
    }));
  }

  changeMonth(offset: number): void {
    const date = new Date(this.currentYear, this.currentMonth - 1 + offset, 1);
    this.currentMonth = date.getMonth() + 1;
    this.currentYear = date.getFullYear();
    this.loadExpenses();
  }

  editExpense(expense: Expense): void {
    this.router.navigate(['/planning/expenses/edit', expense.id]);
  }

  deleteExpense(id?: number): void {
    if (id === undefined) return;
    
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe(() => {
        this.loadExpenses();
      });
    }
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'MMM d, y') || '';
  }

  addNewExpense(): void {
    this.router.navigate(['/planning/expenses/new']);
  }

  updateInflationRate(): void {
    this.calculateProjections();
  }
}