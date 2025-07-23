import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IncomeSource } from '../model/income-source.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private apiUrl = 'http://localhost:3000/incomeSources';

  constructor(private http: HttpClient) { }

  getIncomeSources(): Observable<IncomeSource[]> {
    return this.http.get<IncomeSource[]>(this.apiUrl);
  }

  addIncomeSource(incomeSource: IncomeSource): Observable<IncomeSource> {
    return this.http.post<IncomeSource>(this.apiUrl, incomeSource);
  }

  updateIncomeSource(id: number, incomeSource: IncomeSource): Observable<IncomeSource> {
    return this.http.put<IncomeSource>(`${this.apiUrl}/${id}`, incomeSource);
  }

  deleteIncomeSource(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}