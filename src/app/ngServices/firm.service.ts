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
  isQFCNumExist(qfcNum:string, firmId: number,): Observable<any> {
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
  isQFCNumExistForNewFirm(qfcNum:string): Observable<any> {
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
      .set('SupervisionCaseOfficerId',filterDataObj.SupervisionCaseOfficerId.toString())
      .set('QFCNumber', filterDataObj.QFCNumber)
      .set('CSVAuthorisationStatus', filterDataObj.CSVAuthorisationStatus.toString())
      .set('userId', 0)
      .set('RelevantPerson', filterDataObj.RelevantPerson)
      .set('CSVLicenseStatus', filterDataObj.CSVLicenseStatus.toString())
      .set('CSVLegalStatus',filterDataObj.CSVLegalStatus.toString())
      .set('CSVPrudentialCategory',filterDataObj.CSVPrudentialCategory)
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
     console.log("foim-service getFirmsList", )
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


}
