import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
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

  getRegulatorPeriodTypes(docTypeId: number): Observable<any> {
    const url = `${this.baseUrlRpt}get_regular_rpt_period_types?docTypeId=${docTypeId}`;
    return this.http.get<any>(url);
  }

  getFinancialReportingPeriod(firmId: number, firmRptSchID: number): Observable<any> {
    const url = `${this.baseUrlRpt}get_financial_reporting_period?firmId=${firmId}&firmRptSchID=${firmRptSchID}`;
    return this.http.get<any>(url);
  }

  getFirmReportScheduledItemDetail(firmId: number, firmRptSchID: number, constructDocUrl: boolean): Observable<any> {
    const url = `${this.baseUrlRpt}get_firm_report_schedule_item_detail?firmId=${firmId}&reportSchID=${firmRptSchID}&constructDocUrl=${constructDocUrl}`;
    return this.http.get<any>(url);
  }
  getFinancialYearEnd(firmId: number) {
    const url = `${this.baseUrlRpt}get_financial_year_end?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  getLicensedOrAuthorisedDate(firmId: number) {
    const url = `${this.baseUrlRpt}get_licensed_or_authorised_date_of_firm?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  isReportingScheduleGenerated(firmId: number, firmReportingFrom: string, firmReportingTo: string, flag: number): Promise<boolean> {
    const url = `${this.baseUrlRpt}is_reporting_schedule_generated?firmId=${firmId}&firmReportingFrom=${firmReportingFrom}&firmReportingTo=${firmReportingTo}&ValidateFlag=${flag}`;

    return this.http.get<any>(url).pipe(
      map((response: any) => response.response.Column1 === 1) 
    ).toPromise();
  }

  validateReportingSchedule(firmId: number, firmReportingFrom: string, firmReportingTo: string): Observable<number> {
    const url = `${this.baseUrlRpt}validate_reporting_schedule?firmId=${firmId}&firmReportingFrom=${firmReportingFrom}&firmReportingTo=${firmReportingTo}`;

    return this.http.get<{ response: { Column1: number } }>(url).pipe(
      map((response) => response.response.Column1),
      catchError((error) => {
        console.error('Error validating reporting schedule:', error);
        return of(-1); // Return a default value or an error code
      })
    );
  }

  getfirmStandardReportScheduledItemDetail(firmId: number,reportScheduleFrom: string, reportScheduleTo: string, rptScheduleType: number, financialYearEndTypeID: number) {
    const url = `${this.baseUrlRpt}get_firm_standard_report_scheduled_item_detail?firmID=${firmId}&reportingScheduleFrom=${reportScheduleFrom}&reportingScheduleTo=${reportScheduleTo}&rptScheduleType=${rptScheduleType}&financialYearEndTypeID=${financialYearEndTypeID}`;
    return this.http.get<any>(url);
  }

  getReportNameForAdditionalSchedules(docTypeID: number, rptPeriodTypeID: number, rptPeriodFromDate: string, rptPeriodToDate: string, rptDueDate: string) {
    const url = `${this.baseUrlRpt}get_report_name_for_additional_schedules?docTypeID=${docTypeID}&rptPeriodTypeID=${rptPeriodTypeID}&rptPeriodFromDate=${rptPeriodFromDate}&rptPeriodToDate=${rptPeriodToDate}&rptDueDate=${rptDueDate}`;
    return this.http.get<any>(url);
  }

  getObjectSignatories(rptItemID: number, docID: number) {
    const url = `${this.baseUrlRpt}get_object_signatories?objectInstanceID=${rptItemID}&docID=${docID}`;
    return this.http.get<any>(url);
  }

  publishRptSch(reports: any) {
    const url = `${this.baseUrlRpt}publish_reporting_schedule`;
    return this.http.post<any>(url, reports);
  }

  saveReportSchedule(rptObj: any) {
    const url = `${this.baseUrlRpt}save_update_firm_reporting_schedule`;
    return this.http.post<any>(url, rptObj);
  }

  deleteRptSch(obj: any) {
    const url = `${this.baseUrlRpt}delete_reporting_schedule`;
    return this.http.delete<any>(url, obj);
  }

}

