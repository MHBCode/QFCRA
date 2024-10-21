import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoticeService {

  constructor(private http: HttpClient) { }

  private baseUrlNotice = environment.API_URL + '/api/Notice/' //Notice

  getNotices(firmId: number): Observable<any> {
    const url = `${this.baseUrlNotice}get_firm_notice_response_details?firmId=10&firmNoticeID=4043`; //https://localhost:7091/api/Notice/get_firm_notice_response_details?firmId=10&firmNoticeID=4043
    return this.http.get<any>(url);
  }
}
