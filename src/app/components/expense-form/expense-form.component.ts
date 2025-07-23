import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Expense } from 'src/app/model/expense.model';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  categories = ['Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare', 'Entertainment', 'Other'];
  isEditMode = false;
  expenseId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.expenseForm = this.fb.group({
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.expenseId = +params['id'];
        this.loadExpense(this.expenseId);
      }
    });
  }

  loadExpense(id: number): void {
    this.expenseService.getExpenses().subscribe(expenses => {
      const expense = expenses.find(e => Number(e.id) === id);
      if (expense) {
        this.expenseForm.patchValue({
          category: expense.category,
          amount: expense.amount,
          date: expense.date,
          description: expense.description
        });
      }
    });
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const expenseData: Expense = this.expenseForm.value;

      if (this.isEditMode && this.expenseId) {
        this.expenseService.updateExpense(this.expenseId, expenseData)
          .subscribe(() => this.navigateToExpenseList());
      } else {
        this.expenseService.addExpense(expenseData)
          .subscribe(() => this.navigateToExpenseList());
      }
    }
  }

  navigateToExpenseList(): void {
    this.router.navigate(['/planning/expenses']);
  }

  onCancel(): void {
    this.location.back();
  }
}