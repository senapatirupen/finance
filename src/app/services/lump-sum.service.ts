import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LumpSum } from '../model/lump-sum.model';

@Injectable({
  providedIn: 'root'
})
export class LumpSumService {
  private apiUrl = 'http://localhost:3000/lumpSums';

  constructor(private http: HttpClient) { }

  getLumpSums(): Observable<LumpSum[]> {
    return this.http.get<LumpSum[]>(this.apiUrl);
  }

  addLumpSum(lumpSum: LumpSum): Observable<LumpSum> {
    return this.http.post<LumpSum>(this.apiUrl, lumpSum);
  }

  updateLumpSum(id: number, lumpSum: LumpSum): Observable<LumpSum> {
    return this.http.put<LumpSum>(`${this.apiUrl}/${id}`, lumpSum);
  }

  deleteLumpSum(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}