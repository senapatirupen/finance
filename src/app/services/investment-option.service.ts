import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvestmentOption } from '../model/investment-option.model';

@Injectable({
  providedIn: 'root'
})
export class InvestmentOptionService {
  private apiUrl = 'http://localhost:3000/investmentOptions';

  constructor(private http: HttpClient) { }

  getInvestmentOptions(): Observable<InvestmentOption[]> {
    return this.http.get<InvestmentOption[]>(this.apiUrl);
  }

  addInvestmentOption(option: InvestmentOption): Observable<InvestmentOption> {
    return this.http.post<InvestmentOption>(this.apiUrl, option);
  }

  updateInvestmentOption(id: number, option: InvestmentOption): Observable<InvestmentOption> {
    return this.http.put<InvestmentOption>(`${this.apiUrl}/${id}`, option);
  }

  deleteInvestmentOption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}