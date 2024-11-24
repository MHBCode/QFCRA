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
  private baseUrlObjectWF = environment.API_URL + '/api/ObjectWF/' // Object WF
  getFIRMRegisteredFund(userId: number,firmId: number, registeredFundID: number | null = null): Observable<any> {
    const url = `${this.baseUrlRegisteredFund}get_registered_fund_data?userId=${userId}&firmId=${firmId}${registeredFundID !== null ? `&registeredFundID=${registeredFundID}` : ''}`;
    return this.http.get<any>(url);
  }
  getFIRMRegisteredFundDetials(userId: number,firmId: number, registeredFundID: number): Observable<any> {
    const url = `${this.baseUrlRegisteredFund}get_registered_fund_data?userId=${userId}&firmId=${firmId}&registeredFundID=${registeredFundID}`;
    return this.http.get<any>(url);
  }
  getRegisteredFundStatus(registeredFundID:number): Observable<any>{
    const url = `${this.baseUrlRegisteredFund}get_registered_fund_status?registeredFundID=${registeredFundID}`;
    return this.http.get<any>(url);
  }
  getSubFundData(registeredFundID:number): Observable<any>{
    const url = `${this.baseUrlRegisteredFund}get_sub_fund_data?registeredFundID=${registeredFundID}`;
    return this.http.get<any>(url);
  }
  deleteRegisteredFund(registeredFundID:number): Observable<any>{
    const url = `${this.baseUrlRegisteredFund}delete_registered_fund?registeredFundID=${registeredFundID}`;
    return this.http.delete<any>(url);
  }
  saveUpdateRegisteredFund(saveUpdateRegisteredFundObj: any):Observable<any>{
    const url = `${this.baseUrlRegisteredFund}save_update_registered_fund`;
    return this.http.post<any>(url,saveUpdateRegisteredFundObj);
  }
  getDocument(objectId: number, objectInstanceId: number): Observable<any> {
    const url = `${this.baseUrlObjectWF}get_document?objectId=${objectId}&objectInstanceId=${objectInstanceId}&ObjectInstanceRevNum=${1}`
    return this.http.get<any>(url);
  }
}
