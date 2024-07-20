import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MutualFundService {
  private jsonUrl = 'assets/mf_data.json';

  constructor(private http: HttpClient) { }

  getMutualFundData(): Observable<any> {
    return this.http.get<any>(this.jsonUrl);
  }
}