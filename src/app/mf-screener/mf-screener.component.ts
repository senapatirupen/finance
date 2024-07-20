import { Component, OnInit } from '@angular/core';
import { MutualFundService } from '../services/mutual-fund.service';

@Component({
  selector: 'app-mf-screener',
  templateUrl: './mf-screener.component.html',
  styleUrls: ['./mf-screener.component.scss']
})
export class MfScreenerComponent implements OnInit {
  mutualFundData: any[] = [];
  searchText: string = '';

  constructor(private fundService: MutualFundService) { }

  ngOnInit(): void {
    this.loadFundDetails();
  }

  loadFundDetails() {
    this.fundService.getMutualFundData().subscribe(
      (data) => {
        // Adjust based on actual data structure
        this.mutualFundData = data.data.result;
        // Precompute values to avoid complex template expressions
        this.mutualFundData.forEach(fund => {
          fund.option = fund.values.find((v:any) => v.filter === 'option')?.strVal;
          fund.sector = fund.values.find((v:any) => v.filter === 'sector')?.strVal;
          fund.aum = fund.values.find((v:any) => v.filter === 'aum')?.doubleVal;
          fund.ret3y = fund.values.find((v:any) => v.filter === 'ret3y')?.doubleVal;
          fund.expRatio = fund.values.find((v:any) => v.filter === 'expRatio')?.doubleVal;
        });
      },
      (error) => {
        console.error('Error fetching fund details:', error);
      }
    );
  }

  filteredFunds() {
    if (!this.searchText) {
      return this.mutualFundData;
    }
    return this.mutualFundData.filter(fund =>
      fund.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
