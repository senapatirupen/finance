import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Investment } from '../model/investment.model';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private apiUrl = 'http://localhost:3000/investments';
  private investmentsSubject = new BehaviorSubject<Investment[]>([]);
  investments$ = this.investmentsSubject.asObservable();

  // Default CAGR assumptions
  public defaultCagr: Record<string, number> = {
    'Equity': 12,
    'Debt': 7,
    'Gold': 8,
    'Real Estate': 10,
    'FD': 6.5,
    'NPS': 9,
    'Liquid Fund': 5.5
  };

  constructor(private http: HttpClient) {
    this.loadInvestments();
  }

  private loadInvestments(): void {
    this.http.get<Investment[]>(this.apiUrl).subscribe(
      investments => this.investmentsSubject.next(investments)
    );
  }

  calculateFutureValue(investment: Investment, years: number): number {
    if (investment.type === 'Lumpsum') {
      return investment.amount * Math.pow(1 + investment.cagr/100, years);
    } else {
      // SIP calculation
      const n = years * (investment.frequency === 'Monthly' ? 12 : 
                        investment.frequency === 'Quarterly' ? 4 : 1);
      const r = investment.cagr/100;
      const P = investment.amount;
      
      if (investment.frequency === 'Monthly') {
        const monthlyRate = Math.pow(1 + r, 1/12) - 1;
        return P * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
      } else {
        return P * n * (1 + r/2) * (Math.pow(1 + r, years) - 1) / r;
      }
    }
  }

  getSummary(years: number): any {
    const investments = this.investmentsSubject.value;
    let totalInvested = 0;
    let totalFutureValue = 0;
    let byAssetClass: any = {};

    investments.forEach(investment => {
      const invested = investment.type === 'Lumpsum'
        ? investment.amount 
        : investment.amount * investment.durationYears * 
          (investment.frequency === 'Monthly' ? 12 : 
           investment.frequency === 'Quarterly' ? 4 : 1);
      
      const futureValue = this.calculateFutureValue(investment, years);
      
      totalInvested += invested;
      totalFutureValue += futureValue;

      if (!byAssetClass[investment.assetClass]) {
        byAssetClass[investment.assetClass] = { invested: 0, futureValue: 0 };
      }
      byAssetClass[investment.assetClass].invested += invested;
      byAssetClass[investment.assetClass].futureValue += futureValue;
    });

    return {
      totalInvested,
      totalFutureValue,
      byAssetClass,
      xirr: totalInvested > 0 ? 
        (Math.pow(totalFutureValue / totalInvested, 1/years) - 1) * 100 : 0
    };
  }

  addInvestment(investment: Investment): Observable<Investment> {
    if (!investment.cagr) {
      investment.cagr = this.defaultCagr[investment.assetClass];
    }
    return this.http.post<Investment>(this.apiUrl, investment).pipe(
      tap(() => this.loadInvestments())
    );
  }

  // Add other CRUD methods...
}