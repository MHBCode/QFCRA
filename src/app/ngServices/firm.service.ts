import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirmService {

  private baseUrlFirms = environment.API_URL + '/api/Firms/';  // Base URL


  constructor(private http: HttpClient) { }

  getFIRMOPData(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_operational_data?firmID=${firmId}`;  // Construct full URL
    return this.http.get<any>(url);
  }

  getAssignedFirms(userId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_assign_firms?userId=${userId}`;  // Construct full URL
    return this.http.get<any>(url);
  }
  getFirmDetails(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_firm?firmID=${firmId}`;
    return this.http.get<any>(url);
  }
  getAllFirms(): Observable<any> {
    const url = `${this.baseUrlFirms}get_firms`;
    return this.http.get<any>(url);
  }
  isQFCNumExist(qfcNum: string, firmId: number,): Observable<any> {
    const url = `${this.baseUrlFirms}is_existing_qfc?qfcNum=${qfcNum}&firmId=${firmId}`;
    return this.http.get<any>(url);
  }
  isFirmNameExist(firmName: string, firmId: number) {
    const url = `${this.baseUrlFirms}is_exist_firm_name?firmName=${firmName}firmId=${firmId}`;
    return this.http.get<any>(url);
  }
  isFirmNameExistForNewFirm(firmName: string) {
    const url = `${this.baseUrlFirms}is_exist_firm_name?firmName=${firmName}`;
    return this.http.get<any>(url);
  }
  isQFCNumExistForNewFirm(qfcNum: string): Observable<any> {
    const url = `${this.baseUrlFirms}is_existing_qfc?qfcNum=${qfcNum}`; // NO FIRM ID
    return this.http.get<any>(url);
  }
  editFirm(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlFirms}insert_update_firm_form`, rowData, { headers: headers });
  }
  getFYearEndHistory(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_firms_end_year_history?firmId=${firmId}&flag=1`;  // Construct full URL https://localhost:7091/api/Firms/get_firms_end_year_history?firmId=66&flag=1
    return this.http.get<any>(url);
  }
  getFirmsNameHistory(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_firms_name_history?firmId=${firmId}`
    return this.http.get<any>(url);
  }
  /// Yazan 

  getFirmsAlphabetically(filterDataObj: any): Observable<any> {

    let params = new HttpParams()
      .set('firmId', filterDataObj.FirmID)
      .set('AuthorisationCaseOfficerId', filterDataObj.AuthorisationCaseOfficerId.toString())
      .set('SupervisionCaseOfficerId', filterDataObj.SupervisionCaseOfficerId.toString())
      .set('QFCNumber', filterDataObj.QFCNumber)
      .set('CSVAuthorisationStatus', filterDataObj.CSVAuthorisationStatus.toString())
      .set('userId', 0)
      .set('RelevantPerson', filterDataObj.RelevantPerson)
      .set('CSVLicenseStatus', filterDataObj.CSVLicenseStatus.toString())
      .set('CSVLegalStatus', filterDataObj.CSVLegalStatus.toString())
      .set('CSVPrudentialCategory', filterDataObj.CSVPrudentialCategory)
      .set('CSVSectorTypes', filterDataObj.CSVSectorTypes.toString())
      .set('LoginuserId', 30)
      .set('CSVSupCategories', filterDataObj.CSVSupCategories.toString())
      .set('CSVFirmTypes', filterDataObj.CSVFirmTypes.toString())
      .set('CSVFirmStatus', filterDataObj.CSVFirmStatus.toString())
      .set('startChar', filterDataObj.startChar.toString())
    console.log('HTTP Params:', params.toString());
    return this.http.get<any>(`${this.baseUrlFirms}get_firms_alphabetically`, { params });
  }
  getAccountingStandardsHistory(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_firms_end_year_history?firmId=${firmId}&flag=2`; // Construct full URL https://localhost:7091/api/Firms/get_firms_end_year_history?firmId=66&flag=2
    return this.http.get<any>(url);
  }
  getInactiveUsersHistory(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_inactive_firm_users?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Firms/get_inactive_firm_users?firmId=66
    return this.http.get<any>(url);
  }

  getAssignLevelUsers() {
    const url = `${this.baseUrlFirms}get_assign_level_users`;
    return this.http.get<any>(url);
  }

  getFirmStatusValidation(firmId: number, statusId: number, statusDate: string, firmOpType: number): Observable<any> {
    const params = new HttpParams()
      .set('firmId', firmId.toString())
      .set('currentFirmApplStatusTypeID', statusId.toString())
      .set('currentFirmApplStatusDate', statusDate)
      .set('firmOpType', firmOpType.toString());

    return this.http.get<any>(`${this.baseUrlFirms}is_valid_firm_current_status_date`, { params });
  }

  getFIRMAuditors(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_auditors?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Firms/get_auditors?firmID=66
    return this.http.get<any>(url);
  }
  getFIRMUsersRAFunctions(firmId: number, assiLevel: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_firm_user?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  //////// Yazan Auditors  
  savefirmauditors(firmAuditorsObj): Observable<any> {
    const url = `${this.baseUrlFirms}save_firm_auditors`;
    return this.http.post<any>(url, firmAuditorsObj);
  }

  getFIRMAdminFees(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_admin_fee_list?firmId=${firmId}`;  //https://localhost:7091/api/Firms/get_admin_fee_list?firmId=66
    return this.http.get<any>(url);
  }

  getFirmsList(criteria: any): Observable<any> {
    let params = new HttpParams();
    console.log("foim-service getFirmsList",)
    if (criteria.firmName && criteria.firmName !== 'all') {
      params = params.append('FirmName', criteria.firmName);
    }
    if (criteria.qfcNumber) {
      params = params.append('QFCNumber', criteria.qfcNumber);
    }
    if (criteria.firmType !== undefined) {
      params = params.append('CSVFirmTypes', criteria.firmType.toString());
    }
    if (criteria.firmStatus !== undefined) {
      params = params.append('CSVFirmStatus', criteria.firmStatus.toString());
    }
    if (criteria.legalStatus && criteria.legalStatus !== 'all') {
      params = params.append('CSVLegalStatus', criteria.legalStatus);
    }
    if (criteria.prudentialCategory !== undefined) {
      params = params.append('CSVPrudentialCategory', criteria.prudentialCategory.toString());
    }
    if (criteria.sectors !== undefined) {
      params = params.append('CSVSectorTypes', criteria.sectors.toString());
    }
    if (criteria.authorisationStatus && criteria.authorisationStatus !== 'all') {
      params = params.append('CSVAuthorisationStatus', criteria.authorisationStatus);
    }
    console.log("foim-service getFirmsList", params)
    return this.http.get<any>(`${this.baseUrlFirms}get_firms_list`, { params });
  }

  // supervision pages

  getClientClassification(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_client_classification?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  getOperationalData(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_operational_data?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  getRPTBasis(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_firm_rpt_basis?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  getSupervisionCategory(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}get_sup_category_details?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  getLegalStatusTypeID(firmId: number) {
    const url = `${this.baseUrlFirms}get_firm_legal_status_type_by_firm_id?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  saveSupervision(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlFirms}insert_update_supervision_data`, rowData, { headers: headers });
  }

  saveSupCategory(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlFirms}insert_update_sup_category_data`, rowData, { headers: headers });
  }

  checkisFirmAuthorised(firmId: number): Observable<any> {
    const url = `${this.baseUrlFirms}is_firm_authorised?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  isFirmAuthorisedForWaivers(firmId: number) {
    const url = `${this.baseUrlFirms}is_firm_authorised_for_waivers?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  getFirmUserSearch(firmId: number, assnLevelId: number, UserID: number, displayHistory: boolean, userId: number) {
    const url = `${this.baseUrlFirms}get_firm_user_search?firmId=${firmId}&assnLevelId=${assnLevelId}&userId=${UserID}&displayHistory=${displayHistory}&loginuserId=${userId}`;
    return this.http.get<any>(url);
  }

  saveUpdateFirmUser(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlFirms}insert_update_firm_users`, rowData, { headers: headers });
  }

  saveUpdateAllFirmUser(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlFirms}insert_update_all_firm_user`, rowData, { headers: headers });
  }

  deleteFirmUser(deletefirmUserObj: any): Observable<any> {
    const url = `${this.baseUrlFirms}delete_firm_users`;
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: deletefirmUserObj,
    };
    return this.http.delete<any>(url, options);
  }

  isRoleExist(firmId: string, newRoleID: string) {
    const url = `${this.baseUrlFirms}is_role_exist?firmId=${firmId}&role=${newRoleID}`;
    return this.http.get<any>(url);
  }

  isUserSupervisorForTheFirm(firmId: number, userId: number) {
    const url = `${this.baseUrlFirms}is_user_supervisor_for_the_firm?firmId=${firmId}&userId=${userId}`;
    return this.http.get<any>(url);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isNullOrEmpty(value: any): boolean {
    return value === null || value === '';
  }
  
  removeHtmlTags(input: string | null | undefined): string {
    // Check if input is null or undefined
    if (!input) {
      return ''; // Return an empty string if input is null or undefined
    }
    // This regex will remove all HTML tags
    return input.replace(/<[^>]*>/g, '');
  }

}
