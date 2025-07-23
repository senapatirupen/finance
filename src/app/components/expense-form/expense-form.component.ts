import { Component, Input, OnInit } from '@angular/core';
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
  categories = ['Housing', 'Food', 'Transportation', 'Healthcare', 'Entertainment', 'Utilities', 'Other'];
  defaultInflationRates: {[key: string]: number} = {
    'Housing': 5,
    'Food': 6,
    'Transportation': 7,
    'Healthcare': 8,
    'Entertainment': 4,
    'Utilities': 5,
    'Other': 5
  };
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
      description: [''],
      inflationRate: [null]
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

    // Set default inflation rate when category changes
    this.expenseForm.get('category')?.valueChanges.subscribe(category => {
      if (category && !this.expenseForm.get('inflationRate')?.value) {
        this.expenseForm.get('inflationRate')?.setValue(this.defaultInflationRates[category]);
      }
    });
  }

  loadExpense(id: number): void {
    this.expenseService.getExpenses().subscribe(expenses => {
      const expense = expenses.find(e => e.id === id);
      if (expense) {
        this.expenseForm.patchValue({
          category: expense.category,
          amount: expense.amount,
          date: expense.date,
          description: expense.description,
          inflationRate: expense.inflationRate || this.defaultInflationRates[expense.category] || 5
        });
      }
    });
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const expenseData: Expense = this.expenseForm.value;

      if (this.isEditMode && this.expenseId) {
        this.expenseService.updateExpense(this.expenseId, expenseData)
          .subscribe(() => this.router.navigate(['/planning/expenses']));
      } else {
        this.expenseService.addExpense(expenseData)
          .subscribe(() => this.router.navigate(['/planning/expenses']));
      }
    }
  }

  onCancel(): void {
    this.location.back();
  }
}