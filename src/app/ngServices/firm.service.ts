import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
  private baseUrlLogForm = environment.API_URL + '/api/LogForm/' // logform
  private baseUrlObjectWF = environment.API_URL + '/api/ObjectWF/' // Object WF
  private baseUrlParentEntity = environment.API_URL + '/api/ParentEntity/'; //ParentEntity

  constructor(private http: HttpClient) { }

  isFirmLicensed(firmId: number): Observable<any> {
    const url = `${this.baseUrlApplication}is_firmLicensed?firmId=${firmId}`
    return this.http.get<any>(url);
  }

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
  getAllFirms(): Observable<any> {
    const url = `${this.baseUrl}get_firms`;
    return this.http.get<any>(url);
  } 
  isQFCNumExist(qfcNum:string, firmId: number,): Observable<any> {
    const url = `${this.baseUrl}is_existing_qfc?qfcNum=${qfcNum}&firmId=${firmId}`;
    return this.http.get<any>(url);
  }
  isFirmNameExist(firmName: string, firmId: number) {
    const url = `${this.baseUrl}is_exist_firm_name?firmName=${firmName}firmId=${firmId}`;
    return this.http.get<any>(url);
  }
  isFirmNameExistForNewFirm(firmName: string) {
    const url = `${this.baseUrl}is_exist_firm_name?firmName=${firmName}`;
    return this.http.get<any>(url);
  }
  isQFCNumExistForNewFirm(qfcNum:string): Observable<any> {
    const url = `${this.baseUrl}is_existing_qfc?qfcNum=${qfcNum}`; // NO FIRM ID
    return this.http.get<any>(url);
  }
  getFirmAddresses(firmId: number): Observable<any> {
    const url = `${this.baseUrlAddress}get_address_list?objectId=521&objectInstanceId=${firmId}&objectInstanceRevNum=1&sourceObjectID=521&sourceObjectInstanceId=${firmId}&sourceObjectInstanceRevNum=1`
    return this.http.get<any>(url);
  }
  getAddressesTypeHistory(firmId: number, addressTypeId: number) {
    const url = `${this.baseUrlAddress}get_address_type_history?firmId=${firmId}&addressTypeId=${addressTypeId}&valId=false`
    return this.http.get<any>(url);
  }
  editFirm(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrl}insert_update_firm_form`, rowData, { headers: headers });
  }
  editAppDetails(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlApplication}insert_update_application`, rowData, { headers: headers });
  }
  editCoreAddress(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlAddress}insert_update_address`, rowData, { headers: headers });
  }
  editLicenseScope(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlActivity}save_update_licensed_scope`, rowData, { headers: headers });
  }
  editAuthorizedScope(rowData: any): Observable<any> {
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
  /// Yazan 

  getFirmsAlphabetically(filterDataObj: any): Observable<any> {
    
    let params = new HttpParams()
      .set('firmId', filterDataObj.FirmID)
      .set('OperationalStatusId', 0)
      .set('AuthorisationCaseOfficerId', 0)
      .set('SupervisionCaseOfficerId', 0)
      .set('QFCNumber', filterDataObj.QFCNumber)
      .set('userId', 0)
      .set('RelevantPerson', 0)
      .set('CSVAuthorisationStatus',filterDataObj.CSVAuthorisationStatus.toString())
      .set('CSVLicenseStatus', filterDataObj.CSVLicenseStatus.toString())
      .set('CSVLegalStatus', 0)
      .set('CSVPrudentialCategory',filterDataObj.CSVPrudentialCategory.toString())
      .set('CSVSectorTypes', filterDataObj.CSVSectorTypes.toString())
      .set('LoginuserId', 30)
      .set('CSVSupCategories', 0)
      .set('CSVFirmTypes', filterDataObj.CSVFirmTypes.toString())
      .set('CSVFirmStatus', filterDataObj.CSVFirmStatus.toString())
      .set('startChar', filterDataObj.startChar.toString())
      console.log('HTTP Params:', params.toString());
    return this.http.get<any>(`${this.baseUrl}get_firms_alphabetically`, { params });
  }
  getAccountingStandardsHistory(firmId: number): Observable<any> {
    const url = `${this.baseUrl}get_firms_end_year_history?firmId=${firmId}&flag=2`; // Construct full URL https://localhost:7091/api/Firms/get_firms_end_year_history?firmId=66&flag=2
    return this.http.get<any>(url);
  }
  getInactiveUsersHistory(firmId: number): Observable<any> {
    const url = `${this.baseUrl}get_inactive_firm_users?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Firms/get_inactive_firm_users?firmId=66
    return this.http.get<any>(url);
  }
  getAppDetailsLicensedAndAuthHistory(firmId: number, firmAppTypeID: number, getLatestRecord: boolean): Observable<any> {
    const url = `${this.baseUrlApplication}get_application_status?firmId=${firmId}&firmApplTypeID=${firmAppTypeID}&getLatest=${getLatestRecord}`;
    return this.http.get<any>(url);
  }
  getCurrentAppDetailsLicensedAndAuth(firmId: number, applicationTypeId: number): Observable<any> {
    const url = `${this.baseUrlApplication}get_application_status_current?firmId=${firmId}&applicationTypeId=${applicationTypeId}`;
    return this.http.get<any>(url);
  }
  getApplications(firmId: number, applicationTypeId: number): Observable<any> {
    const url = `${this.baseUrlApplication}get_applications?firmId=${firmId}&applicationTypeId=${applicationTypeId}`;
    return this.http.get<any>(url);
  }
  getAssignLevelUsers() {
    const url = `${this.baseUrl}get_assign_level_users`;
    return this.http.get<any>(url);
  }
  getFirmActivityLicensed(firmId: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_firm_activities?firmId=${firmId}&firmApplicationTypeId=2`;  //'https://localhost:7091/api/Activity/get_firm_activities?firmId=66&firmApplicationTypeId=2' 2: Licensed
    return this.http.get<any>(url);
  }
  getFirmActivityAuthorized(firmId: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_firm_activities?firmId=${firmId}&firmApplicationTypeId=3`;  //'https://localhost:7091/api/Activity/get_firm_activities?firmId=66&firmApplicationTypeId=3' 3:Authorized
    return this.http.get<any>(url);
  }
  getScopeNum(firmId: number,scopeRevNum: number,applicationTypeId: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_firm_activities?firmId=${firmId}&firmScopeRevNo=${scopeRevNum}&firmApplicationTypeId=${applicationTypeId}`;  //'https://localhost:7091/api/Activity/get_firm_activities?firmId=66&firmApplicationTypeId=2' 2: Licensed
    return this.http.get<any>(url);
  }
  getCurrentScopeRevNum(firmId: number, activityCategoryId: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_current_scope_revNum?firmId=${firmId}&activityCategoryId=${activityCategoryId}`;
    return this.http.get<any>(url);
  }
  getDocumentDetails(docID: number): Observable<any> {
    const url = `${this.baseUrlLogForm}get_document_details?docID=${docID}`;
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

  getRevision(scopeID: number): Observable<any> {
    const url = `${this.baseUrlObjectWF}get_revision?objectId=524&objectInstanceId=${scopeID}`
    return this.http.get<any>(url);
  }


  getDocument(scopeId: number, scopeRevNum: number): Observable<any> {
    const url = `${this.baseUrlObjectWF}get_document?objectId=524&objectInstanceId=${scopeId}&ObjectInstanceRevNum=${scopeRevNum}`
    return this.http.get<any>(url);
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

  getPrudReturnTypes(prudCategoryID: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_prud_ret_type?prudCatId=${prudCategoryID}`;
    return this.http.get<any>(url);
  }

  getAllProducts(activityId: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_available_products?activityTypeID=${activityId}`;
    return this.http.get<any>(url);
  }

  getFirmStatusValidation(firmId: number, statusId: number, statusDate: string, firmOpType: number): Observable<any> {
    const params = new HttpParams()
      .set('firmId', firmId.toString())
      .set('currentFirmApplStatusTypeID', statusId.toString())
      .set('currentFirmApplStatusDate', statusDate)
      .set('firmOpType', firmOpType.toString());

    return this.http.get<any>(`${this.baseUrl}is_valid_firm_current_status_date`, { params });
  }

  getFIRMAuditors(firmId: number): Observable<any> {
    const url = `${this.baseUrl}get_auditors?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Firms/get_auditors?firmID=66
    return this.http.get<any>(url);
  }
  getContactsOfFIRM(firmId: number): Observable<any> {
    const url = `${this.baseUrlContact}get_all_contact_details?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Contact/get_all_contact_details?firmId=66
    return this.http.get<any>(url);
  }
  getContactDetails(firmId: number, contactId: number, contactAssId: number): Observable<any> {
    const url = `${this.baseUrlContact}get_contact_details_by_contactId?firmId=${firmId}&contactId=${contactId}&contactAssId=${contactAssId}`;
    return this.http.get<any>(url);
  }
  ///////////////////
  deleteContactDetails(contactID: number, contactAssnID: number, output: boolean): Observable<any> {
    const url = `${this.baseUrlContact}delete_contact_details?contactId=${contactID}&contactAssId=${contactAssnID}&output=${output}`;
    return this.http.delete<any>(url);
  }
  saveContactDetails(contactDetails: any): Observable<any> {
    const url = `${this.baseUrlContact}save_update_contact_form`;
    return this.http.post<any>(url, contactDetails);
  }
  getFIRMUsersRAFunctions(firmId: number, assiLevel: number): Observable<any> {
    const url = `${this.baseUrl}get_firm_user?firmId=${firmId}`;
    return this.http.get<any>(url);
  }
  getFIRMControllers(firmId: number): Observable<any> {
    const url = `${this.baseUrlControllers}get_corporate_controller_details_list?firmId=${firmId}`; //https://localhost:7091/api/OtherEntity/get_corporate_controller_details_list?firmId=66
    return this.http.get<any>(url);
  }
  //////// Yazan Auditors  
  savefirmauditors(firmAuditorsObj): Observable<any> {
    const url = `${this.baseUrl}save_firm_auditors`;
    return this.http.post<any>(url, firmAuditorsObj);
  }  
  //////// Yazan Controller
  deleteotherentitydetails(OtherEntityID: number): Observable<any> {
    const url = `${this.baseUrlControllers}delete_other_entity_details?otherEntityID=${OtherEntityID}`;
    return this.http.delete<any>(url);
  }
  insertupdateotherentitydetails(saveControllerPopupChangesObj: any): Observable<any> {
    const url = `${this.baseUrlControllers}insert_update_other_entity_details`;
    return this.http.post<any>(url, saveControllerPopupChangesObj); 
  }
  saveupdatecontactform(saveControllerPopupChangesIndividualObj: any): Observable<any> {
    const url = `${this.baseUrlContact}save_update_contact_form`;
    return this.http.post<any>(url, saveControllerPopupChangesIndividualObj); 
  }
  getobjecttypetableEdit(userId: number,objectTypeTable: string,objectOpTypeId: number): Observable<any> {
    const url = `${this.baseUrlSecurity}get_object_type_table?firmId=${userId}&objectTypeTable=${objectTypeTable}&objectOpTypeId=${objectOpTypeId}`; 
    return this.http.get<any>(url);
  }
  getRegulatorDetails(otherEntityID : number, entityTypeId: number): Observable<any> {
    const url = `${this.baseUrlParentEntity}get_regulator_details?otherEntityID=${otherEntityID}&entityTypeId=${entityTypeId}`; 
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
    return this.http.get<any>(`${this.baseUrl}get_firms_list`, { params });
  }

  errorMessages(messageKey: number): Observable<any> {
    const url = `${this.baseUrlLogForm}get_message_property?messageKey=${messageKey}`
    return this.http.get<any>(url);
  }

}
