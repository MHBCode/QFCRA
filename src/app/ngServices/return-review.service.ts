import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ReturnReviewService {
  constructor(private http: HttpClient) { }

  private baseUrlRpt = environment.API_URL + '/api/ReturnView/'
  
  getReturnReviewDetail(firmId: number,firmRptSchID: number): Observable<any> {
    const url = `${this.baseUrlRpt}get_firm_report_schedule_item_detail?firmId=${firmId}&reportSchID=${firmRptSchID}`;
    return this.http.get<any>(url);
  }
}






