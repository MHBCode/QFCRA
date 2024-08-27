import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirmService {

  private baseUrl = environment.API_URL + '/api/Firms/';  // Base URL
  private baseUrlContact = environment.API_URL + '/api/Contact/'; // Without FIRMS
  private baseUrlControllers = environment.API_URL + '/api/OtherEntity/'; //Controllers
  private baseUrlRegisteredFund = environment.API_URL + '/api/RegisteredFund/' // Funds
  private baseUrlActivity = environment.API_URL + '/api/Activity/'; //Activities
  private baseUrlWaiver = environment.API_URL + '/api/Waiver/' //Waiver
  private baseUrlRisk = environment.API_URL + '/api/Risk/' //Risk
  private baseUrlNotice = environment.API_URL + '/api/Notice/' //Notice
  private baseUrlApplication = environment.API_URL + '/api/Application/' //Application
  private baseUrlAddress = environment.API_URL + '/api/Address/' // Address
  private baseUrlSecurity = environment.API_URL + '/api/Security/' // Security

  constructor(private http: HttpClient) { }

  getFIRMOPData(firmId: number): Observable<any> {
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
  getFirmAddresses(entityId: number): Observable<any> {
    const url = `${this.baseUrlAddress}get_address_list?entityTypeId=1&entityId=${entityId}`
    return this.http.get<any>(url);
  }
  getAddressesTypeHistory(firmId: number, addressTypeId: number) {
    const url = `${this.baseUrlAddress}get_address_type_history?firmId=${firmId}&addressTypeId=${addressTypeId}&valId=false`
    return this.http.get<any>(url);
  }
  editFirm(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrl}insert_update_firm_details`, rowData, { headers: headers });
  }
  editScope(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlActivity}save_update_author_scope`, rowData, { headers: headers });
  }
  getFYearEndHistory(firmId: number): Observable<any> {
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
  getInactiveUsersHistory(firmId: number): Observable<any> {
    const url = `${this.baseUrl}get_inactive_firm_users?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Firms/get_inactive_firm_users?firmId=66
    return this.http.get<any>(url);
  }
  getAppDetailsLicensedAndAuthHistory(firmId: number, firmAppTypeID: any, getLatestRecord: boolean): Observable<any> {
    const url = `${this.baseUrlApplication}get_application_status?firmId=${firmId}&firmApplTypeID=${firmAppTypeID}&getLatest=${getLatestRecord}`;
    return this.http.get<any>(url);
  }
  getFirmActivityLicensedAndAuthorized(firmId: number, firmAppTypeID: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_firm_activities?firmId=${firmId}&firmApplicationTypeId=${firmAppTypeID}`;  //'https://localhost:7091/api/Activity/get_firm_activities?firmId=66&firmApplicationTypeId=2or3' 2: Licensed, 3:Authorized
    return this.http.get<any>(url);
  }
  getActivityCategories(): Observable<any> {
    const url = `${this.baseUrlActivity}get_activity_categories`;
    return this.http.get<any>(url);
  }
  getAuthActivityTypes(categoryId: number): Observable<any> { //BasedOnCategoryID
    const url = `${this.baseUrlActivity}get_activity_types?activityCategoryId=${categoryId}`
    return this.http.get<any>(url);
  }
  getLicActivityTypes(): Observable<any> {
    const url = `${this.baseUrlActivity}get_activity_types?activityCategoryId=1`
    return this.http.get<any>(url);
  }
  getFirmScopeIdAndRevNum(firmId: number): Observable<{ scopeId: number; scopeRevNum: number }> {
    const url = `${this.baseUrlActivity}get_firm_activities?firmId=${firmId}&firmApplicationTypeId=3`;
    return this.http.get<any>(url).pipe(
      map(response => {
        const firstItem = response.response?.[0];
        if (firstItem) {
          return {
            scopeId: firstItem.FirmScopeID,
            scopeRevNum: firstItem.ScopeRevNum
          };
        }
        throw new Error('No data found');
      })
    );
  }


  getIslamicFinance(firmId: number): Observable<any> {
    return this.getFirmScopeIdAndRevNum(firmId).pipe(
      switchMap(({ scopeId, scopeRevNum }) => {  // Destructure the object
        const url = `${this.baseUrlActivity}get_islamic_finance?firmId=${firmId}&firmScopeID=${scopeId}&scopeRevNo=${scopeRevNum}`;
        return this.http.get<any>(url);
      })
    );
  }

  getObjectTypeTable(dropdown: string): Observable<any> {
    const url = `${this.baseUrlSecurity}get_object_type_table?objectTypeTable=${dropdown}`
    return this.http.get<any>(url);
  }

  getPrudReturnTypes(): Observable<any> {
    const url = `${this.baseUrlActivity}get_prud_ret_type?prudCatId=1`;
    return this.http.get<any>(url);
  }

  getAllProducts(activityId: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_available_products?activityTypeID=${activityId}`;
    return this.http.get<any>(url);
  }

  getFIRMAuditors(firmId: number): Observable<any> {
    const url = `${this.baseUrl}get_auditors?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Firms/get_auditors?firmID=66
    return this.http.get<any>(url);
  }
  getContactsOfFIRM(firmId: number): Observable<any> {
    const url = `${this.baseUrlContact}get_all_contact_details?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Contact/get_all_contact_details?firmId=66
    return this.http.get<any>(url);
  }
  getFIRMUsersRAFunctions(firmId: number, assiLevel: number): Observable<any> {
    const url = `${this.baseUrl}get_firm_user?firmId=${firmId}`;
    return this.http.get<any>(url);
  }
  getFIRMControllers(firmId: number): Observable<any> {
    const url = `${this.baseUrlControllers}get_corporate_controller_details_list?firmId=${firmId}`; //https://localhost:7091/api/OtherEntity/get_corporate_controller_details_list?firmId=66
    return this.http.get<any>(url);
  }
  getFIRMRegisteredFund(firmId: number): Observable<any> {
    const url = `${this.baseUrlRegisteredFund}get_registered_fund_data?firmId=${firmId}`; //https://localhost:7091/api/RegisteredFund/get_registered_fund_data?firmId=69
    return this.http.get<any>(url);
  }

  getFIRMAdminFees(firmId: number): Observable<any> {
    const url = `${this.baseUrl}get_admin_fee_list?firmId=${firmId}`;  //https://localhost:7091/api/Firms/get_admin_fee_list?firmId=66
    return this.http.get<any>(url);
  }
  getFirmwaiver(firmId: number): Observable<any> {
    const url = `${this.baseUrlWaiver}get_waiver_list?firmId=${firmId}`;  //https://localhost:7091/api/Waiver/get_waiver_list?firmId=86
    return this.http.get<any>(url);
  }
  getFirmRisk(firmId: number): Observable<any> {
    const url = `${this.baseUrlRisk}get_rmp_list?firmId=${firmId}`;  //https://localhost:7091/api/Risk/get_rmp_list?firmId=40
    return this.http.get<any>(url);
  }
  getNotices(firmId: number): Observable<any> {
    const url = `${this.baseUrlNotice}get_firm_notice_response_details?firmId=10&firmNoticeID=4043`; //https://localhost:7091/api/Notice/get_firm_notice_response_details?firmId=10&firmNoticeID=4043
    return this.http.get<any>(url);
  }
}
