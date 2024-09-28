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
  isValidFirmAMLSupervisor(firmId: number,userId: number) {
    const url = `${this.baseUrlSecurity}is_valid_firm_aml_supervisor?FirmID=${firmId}&UserID=${userId}`
    return this.http.get<any>(url);
  }
  isValidFirmSupervisor(firmId: number,userId: number) {
    const url = `${this.baseUrlSecurity}is_firm_supervisor?FirmID=${firmId}&UserID=${userId}`
    return this.http.get<any>(url);
  }
  getAppRoleAccess(userId: number,objectId: number,OpType: number) {
    const url = `${this.baseUrlSecurity}get_app_role_access?userId=${userId}&objectId=${objectId}&objectOpTypeId=${OpType}`;
    return this.http.get<any>(url);
  }
}
