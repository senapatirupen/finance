import { Component, OnInit } from '@angular/core';
import { IncomeService } from '../../services/income.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IncomeSource } from 'src/app/model/income-source.model';

@Component({
  selector: 'app-income-calculator',
  templateUrl: './income-calculator.component.html',
  styleUrls: ['./income-calculator.component.scss']
})
export class IncomeCalculatorComponent implements OnInit {
  incomeSources: IncomeSource[] = [];
  totalInitialIncome = 0;
  totalProjectedIncome = 0;
  totalAmountReceived = 0;
  incomeForm: FormGroup;
  isEditing = false;
  currentEditId: number | null = null;

  constructor(
    private incomeService: IncomeService,
    private fb: FormBuilder
  ) {
    this.incomeForm = this.fb.group({
      sourceName: ['', Validators.required],
      initialMonthlyIncome: [null, [Validators.required, Validators.min(1)]],
      annualGrowthRate: [null, [Validators.required, Validators.min(0)]],
      years: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadIncomeSources();
  }

  loadIncomeSources(): void {
    this.incomeService.getIncomeSources().subscribe(sources => {
      this.incomeSources = sources;
      this.calculateTotalIncome();
    });
  }

  addIncomeSource(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.incomeForm.reset();
  }

  editIncomeSource(source: IncomeSource): void {
    this.isEditing = true;
    this.currentEditId = source.id || null;
    this.incomeForm.patchValue({
      sourceName: source.sourceName,
      initialMonthlyIncome: source.initialMonthlyIncome,
      annualGrowthRate: source.annualGrowthRate,
      years: source.years
    });
  }

  saveIncomeSource(): void {
    if (this.incomeForm.valid) {
      const incomeData = this.incomeForm.value;
      this.calculateIncomeDetails(incomeData);

      if (this.isEditing && this.currentEditId) {
        this.incomeService.updateIncomeSource(this.currentEditId, incomeData)
          .subscribe(() => {
            this.loadIncomeSources();
            this.incomeForm.reset();
          });
      } else {
        this.incomeService.addIncomeSource(incomeData)
          .subscribe(() => {
            this.loadIncomeSources();
            this.incomeForm.reset();
          });
      }
    }
  }

  deleteIncomeSource(id: number): void {
    if (confirm('Are you sure you want to delete this income source?')) {
      this.incomeService.deleteIncomeSource(id).subscribe(() => {
        this.loadIncomeSources();
      });
    }
  }

  calculateIncomeDetails(incomeSource: IncomeSource): void {
    if (incomeSource.initialMonthlyIncome && incomeSource.annualGrowthRate !== null && incomeSource.years) {
      // Calculate projected monthly income after growth
      incomeSource.projectedMonthlyIncome = incomeSource.initialMonthlyIncome * 
        Math.pow(1 + (incomeSource.annualGrowthRate / 100), incomeSource.years);
      
      // Calculate total amount received over the years
      incomeSource.totalAmountReceived = 0;
      let currentMonthlyIncome = incomeSource.initialMonthlyIncome;
      
      for (let year = 0; year < incomeSource.years; year++) {
        incomeSource.totalAmountReceived += currentMonthlyIncome * 12;
        currentMonthlyIncome *= 1 + (incomeSource.annualGrowthRate / 100);
      }
    }
  }

  calculateTotalIncome(): void {
    this.totalInitialIncome = 0;
    this.totalProjectedIncome = 0;
    this.totalAmountReceived = 0;

    this.incomeSources.forEach(source => {
      this.calculateIncomeDetails(source);
      
      if (source.initialMonthlyIncome) this.totalInitialIncome += source.initialMonthlyIncome * 12;
      if (source.projectedMonthlyIncome) this.totalProjectedIncome += source.projectedMonthlyIncome * 12;
      if (source.totalAmountReceived) this.totalAmountReceived += source.totalAmountReceived;
    });
  }
}