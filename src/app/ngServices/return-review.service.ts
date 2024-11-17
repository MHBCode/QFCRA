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
  
  getReturnReviewDetail(firmId: number,firmRptSchID: number): Observable<any> {
    const url = `${this.returnViewUrl}get_firm_report_schedule_item_detail?firmId=${firmId}&reportSchID=${firmRptSchID}`;
    return this.http.get<any>(url);
  }

  getReturnReviewList(firmId: number): Observable<any> {
    const url = `${this.returnViewUrl}get_report_reviewed_list?firmId=${firmId}`;
    return this.http.get<any>(url);
  }
}






