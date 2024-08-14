import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirmService {

  private baseUrl = environment.API_URL+'/api/Firms/';  // Base URL 
  private baseUrlContact = environment.API_URL+'/api/Contact/'; // Without FIRMS
  private baseUrlControllers = environment.API_URL+'/api/OtherEntity/'; //Controllers
  private baseUrlRegisteredFund = environment.API_URL+'/api/RegisteredFund/' // Funds
  private baseUrlActivity = environment.API_URL+'/api/Activity/'; //Activities
  private baseUrlWaiver = environment.API_URL+'/api/Waiver/' //Waiver
  private baseUrlRisk = environment.API_URL+'/api/Risk/' //Risk
  private baseUrlNotice = environment.API_URL+'/api/Notice/' //Notice
  private baseUrlApplication = environment.API_URL+'/api/Application/' //Application
  constructor(private http: HttpClient) { }

  getFIRMOPData(firmId:number): Observable<any> {
    const url = `${this.baseUrl}get_operational_data?firmID=${firmId}`;  // Construct full URL
    return this.http.get<any>(url);
  }

  getAssignedFirms(userId: number): Observable<any> {
    const url = `${this.baseUrl}get_assign_firms?userId=${userId}`;  // Construct full URL
    return this.http.get<any>(url);
  }
  getFirmDetails(firmId: number): Observable<any> {
    const url = `${this.baseUrl}get_firm?firmID=${firmId}`;
    return this.http.get<any>(url);
  }
  editFirm(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrl}api/Firms/insert_update_firm_details`, rowData, { headers: headers });
  }
  getFYearEndHistory(firmId:number): Observable<any> {
    const url = `${this.baseUrl}get_firms_end_year_history?firmId=${firmId}&flag=1`;  // Construct full URL https://localhost:7091/api/Firms/get_firms_end_year_history?firmId=66&flag=1
    return this.http.get<any>(url);
  }
  getFirmsNameHistory(firmId: number): Observable<any> {
    const url = `${this.baseUrl}get_firms_name_history?firmId=${firmId}`
    return this.http.get<any>(url);
  }
  getAccountingStandardsHistory(firmId: number): Observable<any> {
    const url = `${this.baseUrl}get_firms_end_year_history?firmId=${firmId}&flag=2`; // Construct full URL https://localhost:7091/api/Firms/get_firms_end_year_history?firmId=66&flag=2
    return this.http.get<any>(url);
  }
  getInactiveUsersHistory(firmId:number): Observable<any> {
    const url = `${this.baseUrl}get_inactive_firm_users?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Firms/get_inactive_firm_users?firmId=66
    return this.http.get<any>(url);
  }
  getAppDetailsLicensedAndAuthHistory(firmId: number, firmAppTypeID: any, getLatestRecord: boolean): Observable<any> {
     const url = `${this.baseUrlApplication}get_application_status?firmId=${firmId}&firmApplTypeID=${firmAppTypeID}&getLatest=${getLatestRecord}`;
     return this.http.get<any>(url);
  }
  getFIRMAuditors(firmId:number): Observable<any> {
    const url = `${this.baseUrl}get_auditors?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Firms/get_auditors?firmID=66
    return this.http.get<any>(url);
  }
  getContactsOfFIRM(firmId:number): Observable<any> {
    const url = `${this.baseUrlContact}get_all_contact_details?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Contact/get_all_contact_details?firmId=66
    return this.http.get<any>(url);
  }
  getFIRMUsersRAFunctions(firmId:number, assiLevel:number): Observable<any> {
    const url = `${this.baseUrl}get_firm_user?firmId=${firmId}`;
    return this.http.get<any>(url);
  } 
  getFIRMControllers(firmId:number): Observable<any> {
    const url = `${this.baseUrlControllers}get_corporate_controller_details_list?firmId=${firmId}`; //https://localhost:7091/api/OtherEntity/get_corporate_controller_details_list?firmId=66
    return this.http.get<any>(url);
  } 
  getFIRMRegisteredFund(firmId:number): Observable<any> {
    const url = `${this.baseUrlRegisteredFund}get_registered_fund_data?firmId=${firmId}`; //https://localhost:7091/api/RegisteredFund/get_registered_fund_data?firmId=69
    return this.http.get<any>(url);
  } 
  getFIRMAdminFees(firmId:number): Observable<any> {
    const url = `${this.baseUrl}get_admin_fee_list?firmId=${firmId}`;  //https://localhost:7091/api/Firms/get_admin_fee_list?firmId=66
    return this.http.get<any>(url);
  }
  getFirmActivityLicensedAndAuthorized(firmId:number,firmAppTypeID: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_firm_activities?firmId=${firmId}&firmApplicationTypeId=${firmAppTypeID}`;  //'https://localhost:7091/api/Activity/get_firm_activities?firmId=66&firmApplicationTypeId=2or3'
    return this.http.get<any>(url);
  }
  getFirmwaiver(firmId:number): Observable<any> {
    const url = `${this.baseUrlWaiver}get_waiver_list?firmId=${firmId}`;  //https://localhost:7091/api/Waiver/get_waiver_list?firmId=86
    return this.http.get<any>(url);
  }
  getFirmRisk(firmId:number): Observable<any> {
    const url = `${this.baseUrlRisk}get_rmp_list?firmId=${firmId}`;  //https://localhost:7091/api/Risk/get_rmp_list?firmId=40
    return this.http.get<any>(url);
  }
  getNotices(firmId:number): Observable<any> {
    const url = `${this.baseUrlNotice}get_firm_notice_response_details?firmId=10&firmNoticeID=4043`; //https://localhost:7091/api/Notice/get_firm_notice_response_details?firmId=10&firmNoticeID=4043
    return this.http.get<any>(url);
  }
}
