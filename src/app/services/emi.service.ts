import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EMI } from '../model/emi.model';

@Injectable({
  providedIn: 'root'
})
export class EmiService {
  private apiUrl = 'http://localhost:3000/emis';

  constructor(private http: HttpClient) { }

  getEMIs(): Observable<EMI[]> {
    return this.http.get<EMI[]>(this.apiUrl);
  }

  addEMI(emi: EMI): Observable<EMI> {
    return this.http.post<EMI>(this.apiUrl, emi);
  }

  updateEMI(id: number, emi: EMI): Observable<EMI> {
    return this.http.put<EMI>(`${this.apiUrl}/${id}`, emi);
  }

  deleteEMI(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}