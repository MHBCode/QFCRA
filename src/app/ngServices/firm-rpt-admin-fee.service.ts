import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class FirmRptAdminFeeService {
  private baseUrlAdminFee = environment.API_URL + '/api/FirmRptAdminFee/';  // Base URL


  constructor(private http: HttpClient) { }

  getAdminFeeDetials(firmRptFeeID: number): Observable<any> {
    const url = `${this.baseUrlAdminFee}get_admin_fee_list?firmRptFeeID=${firmRptFeeID}`; 
    return this.http.get<any>(url);
  }
  getAdminFeeList(firmId: number): Observable<any> {
    const url = `${this.baseUrlAdminFee}get_admin_fee_list?firmId=${firmId}`; 
    return this.http.get<any>(url);
  }
  getResubmissionHistoryList(firmRptSchItemId: number,firmRptReviewId:number,firmRptReviewRevId:number,firmRptAdminFeeID:number): Observable<any> {
    const url = `${this.baseUrlAdminFee}get_resubmission_history_list?firmRptSchItemId=${firmRptSchItemId}&firmRptReviewId=${firmRptReviewId}&firmRptReviewRevId=${firmRptReviewRevId}&firmRptAdminFeeID=${firmRptAdminFeeID}`; 
    return this.http.get<any>(url);
  }
  getCalculatedFee(adminFeeRateID:number,day:number): Observable<any> {
    const url = `${this.baseUrlAdminFee}get_calculated_fee?adminFeeRateID=${adminFeeRateID}&day=${day}`; 
    return this.http.get<any>(url);
  }
}
