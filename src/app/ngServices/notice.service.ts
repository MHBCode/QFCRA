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


  getNoticesList(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = params[key];
    
      if (value !== null && value !== undefined) {
        if (!isNaN(value) && typeof value !== 'string') {
          httpParams = httpParams.set(key, String(value));
        } else {
          httpParams = httpParams.set(key, value);
        }
      }
    });
    
    const url = `${this.baseUrlNotice}get_notice_list`;
    return this.http.get<any>(url, { params: httpParams });
  }

  getNoticeTypes(): Observable<any> {
    const url = `${this.baseUrlNotice}get_notice_types`;
    return this.http.get<any>(url);
  }

  getNoticeNames(noticeTypeID:number): Observable<any> {
    const url = `${this.baseUrlNotice}get_notice_templates?noticeTypeID=${noticeTypeID}`;
    return this.http.get<any>(url);
  }

}
