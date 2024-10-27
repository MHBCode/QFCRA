import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private http: HttpClient) { }

  private baseUrlActivity = environment.API_URL + '/api/Activity/'; //Activities

  editLicenseScope(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlActivity}save_update_licensed_scope`, rowData, { headers: headers });
  }
  
  editAuthorizedScope(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlActivity}save_update_author_scope`, rowData, { headers: headers });
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

  getIslamicFinance(firmId: number,scopeId:number,scopeRevNum:number): Observable<any> {
    const url = `${this.baseUrlActivity}get_islamic_finance?firmId=${firmId}&firmScopeID=${scopeId}&scopeRevNo=${scopeRevNum}`
    return this.http.get<any>(url);
  }

  getPrudReturnTypes(prudCategoryID: string): Observable<any> {
    const url = `${this.baseUrlActivity}get_prud_ret_type?prudCatId=${prudCategoryID}`;
    return this.http.get<any>(url);
  }

  getPrudentialCategoryDetails(firmId: number, firmScopeID: number,firmScopeRevNo: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_prudential_category?firmId=${firmId}&firmScopeID=${firmScopeID}&firmScopeRevNo=${firmScopeRevNo}`;
    return this.http.get<any>(url);
  }

  getSectorDetails(firmId: number, firmScopeID: number,firmScopeRevNo: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_sector_details?firmId=${firmId}&firmScopeID=${firmScopeID}&firmScopeRevNo=${firmScopeRevNo}`;
    return this.http.get<any>(url);
  }

  getAllProducts(activityId: number): Observable<any> {
    const url = `${this.baseUrlActivity}get_available_products?activityTypeID=${activityId}`;
    return this.http.get<any>(url);
  }

  isParentActivity(activityType: number) {
    const url = `${this.baseUrlActivity}is_parent_activity?activityType=${activityType}`;
    return this.http.get<any>(url);
  }

  getSubActivities(activityTypeID: number) {
    const url = `${this.baseUrlActivity}get_activity_in_hirerchy?activityTypeID=${activityTypeID}`;
    return this.http.get<any>(url);
  }
}
