import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportScheduleService {
  constructor(private http: HttpClient) { }

  private baseUrlWaiver = environment.API_URL + '/api/ReportSchedule/'

  getFirmReportSchedule(firmId: number): Observable<any> {
    const url = `${this.baseUrlWaiver}get_firm_report_scheduling?firmId=${firmId}`;
    return this.http.get<any>(url);
  }
}

