import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisteredfundService {

  constructor(private http: HttpClient) { }

  private baseUrlRegisteredFund = environment.API_URL + '/api/RegisteredFund/' // Funds

  getFIRMRegisteredFund(firmId: number): Observable<any> {
    const url = `${this.baseUrlRegisteredFund}get_registered_fund_data?firmId=${firmId}`; //https://localhost:7091/api/RegisteredFund/get_registered_fund_data?firmId=69
    return this.http.get<any>(url);
  }
}
