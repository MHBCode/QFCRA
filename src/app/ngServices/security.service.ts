import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private baseUrlSecurity = environment.API_URL + '/api/Security/' // Security
  constructor(private http: HttpClient) { }

  getUserRoles(userId: number): Observable<any> {
    const url = `${this.baseUrlSecurity}get_user_roles?userId=${userId}`
    return this.http.get<any>(url);
  }
  isValidFirmAMLSupervisor(firmId: number, userId: number) {
    const url = `${this.baseUrlSecurity}is_valid_firm_aml_supervisor?FirmID=${firmId}&UserID=${userId}`
    return this.http.get<any>(url);
  }
  isValidFirmSupervisor(firmId: number | null = null, userId: number) {
    const url = `${this.baseUrlSecurity}is_firm_supervisor?UserID=${userId}${firmId !== null ? `&FirmID=${firmId}` : ''}`
    return this.http.get<any>(url);
  }
  isValidSupervisor(firmId: number, userId: number) {
    const url = `${this.baseUrlSecurity}is_valid_supervisor?FirmID=${firmId}&UserID=${userId}`
    return this.http.get<any>(url);
  }
  isUserDirector(userId: number) {
    const url = `${this.baseUrlSecurity}is_director_user?userID=${userId}`
    return this.http.get<any>(url);
  }
  getAppRoleAccess(userId: number, objectId: number, OpType?: number) {
    let url = `${this.baseUrlSecurity}get_app_role_access?userId=${userId}&objectId=${objectId}`;
    if (objectId !== 80) {
      url += `&objectOpTypeId=${OpType}`;
    }
    return this.http.get<any>(url);
  }
  isUserAllowedToAccessFirm(userId: number, firmId: number, objectId: number) {
    const url = `${this.baseUrlSecurity}is_user_allowed_to_browse_firm_detail?userID=${userId}&FirmID=${firmId}&objectID=${objectId}`
    return this.http.get<any>(url);
  }
  getObjectTypeTable(userId: number, dropdown: string, OpTypeId: number): Observable<any> {
    const url = `${this.baseUrlSecurity}get_object_type_table?userId=${userId}&objectTypeTable=${dropdown}&objectOpTypeId=${OpTypeId}&objectID=9999`
    return this.http.get<any>(url);
  }
  getUsersInRole(objectId: number,roleId:number): Observable<any> {
    const url = `${this.baseUrlSecurity}get_users_in_role?objectId=${objectId}&roleId=${roleId}`
    return this.http.get<any>(url);
  }
}
