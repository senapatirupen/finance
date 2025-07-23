import { Component, OnInit } from '@angular/core';
import { EmiService } from '../../services/emi.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMI } from 'src/app/model/emi.model';

@Component({
  selector: 'app-emi-calculator',
  templateUrl: './emi-calculator.component.html',
  styleUrls: ['./emi-calculator.component.scss']
})
export class EmiCalculatorComponent implements OnInit {
  emiData: EMI[] = [];
  totalEmiInterestPaid = 0;
  totalPrincipalPaid = 0;
  totalEMIAmount = 0;
  totalRemainingPrincipal = 0;
  totalInterestToBePaid = 0;
  totalRemainingTenure = 0;
  emiForm: FormGroup;
  isEditing = false;
  currentEditId: number | null = null;

  constructor(
    private emiService: EmiService,
    private fb: FormBuilder
  ) {
    this.emiForm = this.fb.group({
      emiForName: ['', Validators.required],
      principal: [null, [Validators.required, Validators.min(1)]],
      annualInterestRate: [null, [Validators.required, Validators.min(0.01)]],
      totalTenure: [null, [Validators.required, Validators.min(1)]],
      tenuresPaid: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadEMIs();
  }

  loadEMIs(): void {
    this.emiService.getEMIs().subscribe(emis => {
      this.emiData = emis;
      this.calculateAllEMIs();
    });
  }

  addEMI(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.emiForm.reset({ tenuresPaid: 0 });
  }

  editEMI(emi: EMI): void {
    this.isEditing = true;
    this.currentEditId = emi.id || null;
    this.emiForm.patchValue({
      emiForName: emi.emiForName,
      principal: emi.principal,
      annualInterestRate: emi.annualInterestRate,
      totalTenure: emi.totalTenure,
      tenuresPaid: emi.tenuresPaid
    });
  }

  saveEMI(): void {
    if (this.emiForm.valid) {
      const emiData = this.emiForm.value;
      this.calculateSingleEMI(emiData);

      if (this.isEditing && this.currentEditId) {
        this.emiService.updateEMI(this.currentEditId, emiData)
          .subscribe(() => {
            this.loadEMIs();
            this.emiForm.reset({ tenuresPaid: 0 });
          });
      } else {
        this.emiService.addEMI(emiData)
          .subscribe(() => {
            this.loadEMIs();
            this.emiForm.reset({ tenuresPaid: 0 });
          });
      }
    }
  }

  deleteEMI(id: number): void {
    if (confirm('Are you sure you want to delete this EMI?')) {
      this.emiService.deleteEMI(id).subscribe(() => {
        this.loadEMIs();
      });
    }
  }

  calculateSingleEMI(emi: EMI): void {
    if (emi.principal && emi.annualInterestRate && emi.totalTenure !== null && emi.tenuresPaid !== null) {
      const monthlyInterestRate = emi.annualInterestRate / 12 / 100;
      const totalMonths = emi.totalTenure * 12;
      const monthsPaid = emi.tenuresPaid;

      // Calculate EMI using the formula
      emi.emiAmount = (emi.principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / 
                      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

      let remainingPrincipal = emi.principal;
      emi.interestPaidSoFar = 0;
      emi.principalPaidSoFar = 0;

      // Calculate paid amounts
      for (let month = 0; month < monthsPaid; month++) {
        const interestForMonth = remainingPrincipal * monthlyInterestRate;
        const principalForMonth = (emi.emiAmount || 0) - interestForMonth;

        emi.interestPaidSoFar += interestForMonth;
        emi.principalPaidSoFar += principalForMonth;
        remainingPrincipal -= principalForMonth;
      }

      emi.remainingPrincipal = remainingPrincipal;
      emi.remainingTenure = totalMonths - monthsPaid;
      emi.interestToBePaid = 0;

      // Calculate future interest
      let tempPrincipal = emi.remainingPrincipal;
      for (let month = 0; month < (emi.remainingTenure || 0); month++) {
        const interestForMonth = tempPrincipal * monthlyInterestRate;
        const principalForMonth = (emi.emiAmount || 0) - interestForMonth;

        emi.interestToBePaid += interestForMonth;
        tempPrincipal -= principalForMonth;
      }
    }
  }

  calculateAllEMIs(): void {
    this.totalEmiInterestPaid = 0;
    this.totalPrincipalPaid = 0;
    this.totalEMIAmount = 0;
    this.totalRemainingPrincipal = 0;
    this.totalInterestToBePaid = 0;
    this.totalRemainingTenure = 0;

    this.emiData.forEach(emi => {
      this.calculateSingleEMI(emi);
      
      if (emi.interestPaidSoFar) this.totalEmiInterestPaid += emi.interestPaidSoFar;
      if (emi.principalPaidSoFar) this.totalPrincipalPaid += emi.principalPaidSoFar;
      if (emi.emiAmount) this.totalEMIAmount += emi.emiAmount;
      if (emi.remainingPrincipal) this.totalRemainingPrincipal += emi.remainingPrincipal;
      if (emi.interestToBePaid) this.totalInterestToBePaid += emi.interestToBePaid;
      if (emi.remainingTenure) this.totalRemainingTenure += emi.remainingTenure;
    });
  }
}