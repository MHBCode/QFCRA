import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RiskService {

  constructor(private http: HttpClient) { }

  private baseUrlRisk = environment.API_URL + '/api/Risk/' //Risk

  getFirmRisk(firmId: number): Observable<any> {
    const url = `${this.baseUrlRisk}get_rmp_list?firmId=${firmId}`;  //https://localhost:7091/api/Risk/get_rmp_list?firmId=40
    return this.http.get<any>(url);
  }

  // supervision
  getCreditRatings(firmId: number): Observable<any> {
    const url = `${this.baseUrlRisk}get_credit_ratings_data?firmId=${firmId}`;  //https://localhost:7091/api/Risk/get_rmp_list?firmId=40
    return this.http.get<any>(url);
  }


}
