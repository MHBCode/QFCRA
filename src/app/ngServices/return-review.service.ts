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
  getReturnReviewDetilas(firmRptReviewId: number, firmRptReviewRevNum: number, roleId: number, objectOpTypeId: number ): Observable<any> {
    const url =`${this.returnViewUrl}get_rpt_review_details?firmRptReviewId=${firmRptReviewId}&firmRptReviewRevNum=${firmRptReviewRevNum}&roleId=${roleId}&objectOpTypeId=${objectOpTypeId}`
    return this.http.get<any>(url);
  }
  getReportingBasis(firmId:number): Observable<any> {
    const url = `${this.returnViewUrl}get_reporting_basis?firmId=${firmId}`;
    return this.http.get<any>(url);
  }
  getRegulatorData(firmId:number): Observable<any> {
    const url = `${this.returnViewUrl}get_regulator_data?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  isFirmRptSchExists(rptSchItemID: number): Observable<any> {
    const url = `${this.returnViewUrl}is_firm_rptSchItem_exists?rptSchItemID=${rptSchItemID}`;
    return this.http.get<any>(url);
  }

  SaveNewRevisonNum(
    rptObjectId: number,
    rptReviewID: number,
    rptReviewRevNum: number,
    userId: number,
    roleId: number
  ): Observable<any> {
    const url = `${this.returnViewUrl}SaveNewRevisonNum?rptObjectId=${rptObjectId}&rptReviewID=${rptReviewID}&rptReviewRevNum=${rptReviewRevNum}&userId=${userId}&roleId=${roleId}`;
    console.log('Request URL:', url);
    return this.http.post<any>(url, {}); 
  }
  getReportsReceived(firmId: number,userId:number): Observable<any> {
    const url = `${this.returnViewUrl}get_reports_received?firmId=${firmId}&userId=${userId}`;
    return this.http.get<any>(url); 
  }
  getReportsReceivedDocSubTypes(docTypeId: number): Observable<any> {
    const url = `${this.returnViewUrl}get_reports_received_doc_sub_types?docTypeId=${docTypeId}`;
    return this.http.get<any>(url); 
  }
  
  saveUpdateFirmReportReview(ReportReviewDetails: any): Observable<any> {
    const url = `${this.returnViewUrl}save_update_firm_report_review`
    return this.http.post<any>(url, ReportReviewDetails);
  }
  saveCommentsToPublish(commitListDetails: any): Observable<any> {
    const url = `${this.returnViewUrl}save_comments_to_publish`
    return this.http.post<any>(url, commitListDetails);
  }
  
}
