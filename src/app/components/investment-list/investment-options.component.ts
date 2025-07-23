import { Component, OnInit } from '@angular/core';
import { InvestmentOptionService } from '../../services/investment-option.service';
import { InvestmentOption } from 'src/app/model/investment-option.model';

@Component({
  selector: 'app-investment-options',
  templateUrl: './investment-options.component.html',
  styleUrls: ['./investment-options.component.scss']
})
export class InvestmentOptionsComponent implements OnInit {
  investmentOptions: InvestmentOption[] = [];
  filteredOptions: InvestmentOption[] = [];
  categories = ['all', 'equity', 'fixed-income', 'real-estate', 'commodities', 'alternative'];
  riskLevels = ['all', 'low', 'medium', 'high', 'very-high'];
  selectedCategory = 'all';
  selectedRisk = 'all';
  searchTerm = '';

  constructor(private investmentOptionService: InvestmentOptionService) { }

  ngOnInit(): void {
    this.loadInvestmentOptions();
  }

  loadInvestmentOptions(): void {
    this.investmentOptionService.getInvestmentOptions().subscribe(options => {
      this.investmentOptions = options;
      this.filteredOptions = options;
    });
  }

  filterOptions(): void {
    this.filteredOptions = this.investmentOptions.filter(option => {
      const matchesCategory = this.selectedCategory === 'all' || option.category === this.selectedCategory;
      const matchesRisk = this.selectedRisk === 'all' || option.riskLevel === this.selectedRisk;
      const matchesSearch = option.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            (option.notes && option.notes.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesCategory && matchesRisk && matchesSearch;
    });
  }

  getRiskClass(riskLevel: string): string {
    switch(riskLevel) {
      case 'low': return 'bg-success text-white';
      case 'medium': return 'bg-info text-white';
      case 'high': return 'bg-warning';
      case 'very-high': return 'bg-danger text-white';
      default: return '';
    }
  }

  getLiquidityClass(liquidity: string): string {
    switch(liquidity) {
      case 'high': return 'text-success';
      case 'medium': return 'text-primary';
      case 'low': return 'text-warning';
      default: return '';
    }
  }

  getOptionsByRisk(riskLevel: string): InvestmentOption[] {
    return this.investmentOptions.filter(option => option.riskLevel === riskLevel);
  }

}