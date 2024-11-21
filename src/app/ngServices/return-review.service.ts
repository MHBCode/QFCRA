import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ReturnReviewService {
  constructor(private http: HttpClient) { }

  private returnViewUrl = environment.API_URL + '/api/ReturnView/';  
  private objectWFUrl = environment.API_URL + '/api/ObjectWF/';
  
  getReturnReviewDetail(firmId: number,firmRptSchID: number): Observable<any> {
    const url = `${this.returnViewUrl}get_firm_report_schedule_item_detail?firmId=${firmId}&reportSchID=${firmRptSchID}`;
    return this.http.get<any>(url);
  }

  getReturnReviewList(firmId: number): Observable<any> {
    const url = `${this.returnViewUrl}get_report_reviewed_list?firmId=${firmId}`;
    return this.http.get<any>(url);
  }
  getReturnReviewRevision(objectId: number,objectInstanceId: number): Observable<any> {
    const url = `${this.objectWFUrl}get_revision?objectId=${objectId}&objectInstanceId=${objectInstanceId}`;
    return this.http.get<any>(url);
  }
  getReturnReviewDetilas(params: { firmRptReviewId: number; firmRptReviewRevNum: number; roleId: number; objectOpTypeId: number }): Observable<any> {
    const httpParams = new HttpParams()
      .set('firmRptReviewId', params.firmRptReviewId.toString())
      .set('firmRptReviewRevNum', params.firmRptReviewRevNum.toString())
      .set('roleId', params.roleId.toString())
      .set('objectOpTypeId', params.objectOpTypeId.toString());
  
    return this.http.get<any>(`${this.returnViewUrl}get_rpt_review_details`, { params: httpParams });
  }
  getReportingBasis(firmId:number,firmRptShcItemID:number): Observable<any> {
    const url = `${this.returnViewUrl}get_reporting_basis?firmId=${firmId}&firmRptShcItemID=${firmRptShcItemID}`;
    return this.http.get<any>(url);
  }
  getRegulatorData(firmId:number): Observable<any> {
    const url = `${this.returnViewUrl}get_regulator_data?firmId=${firmId}`;
    return this.http.get<any>(url);
  }
}






