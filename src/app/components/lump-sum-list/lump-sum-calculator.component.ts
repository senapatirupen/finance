import { Component, OnInit } from '@angular/core';
import { LumpSumService } from '../../services/lump-sum.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LumpSum } from 'src/app/model/lump-sum.model';

@Component({
  selector: 'app-lump-sum-calculator',
  templateUrl: './lump-sum-calculator.component.html',
  styleUrls: ['./lump-sum-calculator.component.scss']
})
export class LumpSumCalculatorComponent implements OnInit {
  investments: LumpSum[] = [];
  totalFutureValue = 0;
  totalPrincipal = 0;
  totalInterest = 0;
  lumpSumForm: FormGroup;
  isEditing = false;
  currentEditId: number | null = null;

  constructor(
    private lumpSumService: LumpSumService,
    private fb: FormBuilder
  ) {
    this.lumpSumForm = this.fb.group({
      investmentName: ['', Validators.required],
      principalAmount: [null, [Validators.required, Validators.min(1)]],
      duration: [null, [Validators.required, Validators.min(1)]],
      expectedReturn: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadInvestments();
  }

  loadInvestments(): void {
    this.lumpSumService.getLumpSums().subscribe(investments => {
      this.investments = investments;
      this.calculateInvestments();
    });
  }

  addInvestment(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.lumpSumForm.reset();
  }

  editInvestment(investment: LumpSum): void {
    this.isEditing = true;
    this.currentEditId = investment.id || null;
    this.lumpSumForm.patchValue({
      investmentName: investment.investmentName,
      principalAmount: investment.principalAmount,
      duration: investment.duration,
      expectedReturn: investment.expectedReturn
    });
  }

  saveInvestment(): void {
    if (this.lumpSumForm.valid) {
      const investmentData = this.lumpSumForm.value;
      this.calculateSingleInvestment(investmentData);

      if (this.isEditing && this.currentEditId) {
        this.lumpSumService.updateLumpSum(this.currentEditId, investmentData)
          .subscribe(() => {
            this.loadInvestments();
            this.lumpSumForm.reset();
          });
      } else {
        this.lumpSumService.addLumpSum(investmentData)
          .subscribe(() => {
            this.loadInvestments();
            this.lumpSumForm.reset();
          });
      }
    }
  }

  deleteInvestment(id: number): void {
    if (confirm('Are you sure you want to delete this investment?')) {
      this.lumpSumService.deleteLumpSum(id).subscribe(() => {
        this.loadInvestments();
      });
    }
  }

  calculateInvestments(): void {
    this.totalFutureValue = 0;
    this.totalPrincipal = 0;
    this.totalInterest = 0;

    this.investments.forEach(investment => {
      this.calculateSingleInvestment(investment);
      
      if (investment.futureValue) this.totalFutureValue += investment.futureValue;
      if (investment.principalAmount) this.totalPrincipal += investment.principalAmount;
      if (investment.totalInterest) this.totalInterest += investment.totalInterest;
    });
  }

  private calculateSingleInvestment(investment: LumpSum): void {
    const principal = investment.principalAmount || 0;
    const duration = investment.duration || 0;
    const expectedReturn = investment.expectedReturn || 0;

    // Calculate future value using compound interest formula: FV = P(1 + r)^n
    investment.futureValue = principal * Math.pow(1 + (expectedReturn / 100), duration);
    
    // Calculate total interest
    investment.totalInterest = (investment.futureValue || 0) - principal;
  }
}