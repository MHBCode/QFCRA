import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportScheduleService {
  constructor(private http: HttpClient) { }

  private baseUrlRpt = environment.API_URL + '/api/ReportSchedule/'

  getFirmReportSchedule(firmId: number): Observable<any> {
    const url = `${this.baseUrlRpt}get_firm_report_scheduling?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  getReportPeriodTypes(): Observable<any> {
    const url = `${this.baseUrlRpt}get_rpt_period_types`;
    return this.http.get<any>(url);
  }

  getFinancialReportingPeriod(firmId: number,firmRptSchID: number): Observable<any> {
    const url = `${this.baseUrlRpt}get_financial_reporting_period?firmId=${firmId}&firmRptSchID=${firmRptSchID}`;
    return this.http.get<any>(url);
  }

  getFirmReportScheduledItemDetail(firmId: number,firmRptSchID: number): Observable<any> {
    const url = `${this.baseUrlRpt}get_firm_report_schedule_item_detail?firmId=${firmId}&reportSchID=${firmRptSchID}`;
    return this.http.get<any>(url);
  }

}

