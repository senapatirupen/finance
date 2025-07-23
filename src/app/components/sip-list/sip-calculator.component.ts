import { Component, OnInit } from '@angular/core';
import { SipService } from '../../services/sip.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SIP } from 'src/app/model/sip.model';

@Component({
  selector: 'app-sip-calculator',
  templateUrl: './sip-calculator.component.html',
  styleUrls: ['./sip-calculator.component.scss']
})
export class SipCalculatorComponent implements OnInit {
  sipData: SIP[] = [];
  totalFutureValue = 0;
  totalInvestment = 0;
  totalInterestPaid = 0;
  sipForm: FormGroup;
  isEditing = false;
  currentEditId: number | null = null;

  constructor(
    private sipService: SipService,
    private fb: FormBuilder
  ) {
    this.sipForm = this.fb.group({
      investmentOnName: ['', Validators.required],
      monthlyInvestment: [null, [Validators.required, Validators.min(1)]],
      duration: [null, [Validators.required, Validators.min(1)]],
      expectedReturn: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadSIPs();
  }

  loadSIPs(): void {
    this.sipService.getSIPs().subscribe(sips => {
      this.sipData = sips;
      this.calculateSIP();
    });
  }

  addSIP(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.sipForm.reset();
  }

  editSIP(sip: SIP): void {
    this.isEditing = true;
    this.currentEditId = sip.id || null;
    this.sipForm.patchValue({
      investmentOnName: sip.investmentOnName,
      monthlyInvestment: sip.monthlyInvestment,
      duration: sip.duration,
      expectedReturn: sip.expectedReturn
    });
  }

  saveSIP(): void {
    if (this.sipForm.valid) {
      const sipData = this.sipForm.value;
      this.calculateSingleSIP(sipData);

      if (this.isEditing && this.currentEditId) {
        this.sipService.updateSIP(this.currentEditId, sipData).subscribe(() => {
          this.loadSIPs();
          this.sipForm.reset();
        });
      } else {
        this.sipService.addSIP(sipData).subscribe(() => {
          this.loadSIPs();
          this.sipForm.reset();
        });
      }
    }
  }

  deleteSIP(id: number): void {
    if (confirm('Are you sure you want to delete this SIP?')) {
      this.sipService.deleteSIP(id).subscribe(() => {
        this.loadSIPs();
      });
    }
  }

  calculateSIP(): void {
    this.totalFutureValue = 0;
    this.totalInvestment = 0;
    this.totalInterestPaid = 0;

    this.sipData.forEach(sip => {
      this.calculateSingleSIP(sip);
      
      if (sip.futureValue) this.totalFutureValue += sip.futureValue;
      if (sip.totalInvestment) this.totalInvestment += sip.totalInvestment;
      if (sip.totalInterestPaid) this.totalInterestPaid += sip.totalInterestPaid;
    });
  }

  private calculateSingleSIP(sip: SIP): void {
    const monthlyInvestment = sip.monthlyInvestment || 0;
    const duration = sip.duration || 0;
    const expectedReturn = sip.expectedReturn || 0;

    const monthlyReturn = expectedReturn / 12 / 100;
    const totalMonths = duration * 12;

    // Calculate future value using the formula for compound interest
    sip.futureValue = monthlyInvestment * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn);

    // Calculate total investment
    sip.totalInvestment = monthlyInvestment * totalMonths;

    // Calculate total interest paid
    sip.totalInterestPaid = (sip.futureValue || 0) - (sip.totalInvestment || 0);
  }
}