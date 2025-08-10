import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IncomeSource } from '../model/income-source.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private apiUrl = 'http://localhost:3000/incomeSources';
  // private apiUrl = 'assets/data/db.json';

  constructor(private http: HttpClient) { }

  getIncomeSources(): Observable<IncomeSource[]> {
    return this.http.get<IncomeSource[]>(this.apiUrl);
  }

  // getIncomeSources(): Observable<IncomeSource[]> {
  //   return this.http.get<{ incomeSources: IncomeSource[] }>(this.apiUrl)
  //                  .pipe(map(data => data.incomeSources));
  // }

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