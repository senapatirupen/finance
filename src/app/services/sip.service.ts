import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SIP } from '../model/sip.model';

@Injectable({
  providedIn: 'root'
})
export class SipService {
  private apiUrl = 'http://localhost:3000/sips';

  constructor(private http: HttpClient) { }

  getSIPs(): Observable<SIP[]> {
    return this.http.get<SIP[]>(this.apiUrl);
  }

  addSIP(sip: SIP): Observable<SIP> {
    return this.http.post<SIP>(this.apiUrl, sip);
  }

  updateSIP(id: number, sip: SIP): Observable<SIP> {
    return this.http.put<SIP>(`${this.apiUrl}/${id}`, sip);
  }

  deleteSIP(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}