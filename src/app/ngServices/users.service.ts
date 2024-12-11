import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private baseUrl = environment.API_URL+'/api/Users/';  // Base URL'
  private baseUrlAppRoles = environment.API_URL+'/api/AppRoles/';  // Approles URL
  
  constructor(private http: HttpClient) { }

  getAllUsersData(): Observable<any> {
    const url = `${this.baseUrl}get_users`;  // Construct full URL
    return this.http.get<any>(url);
  }
  getAllAppRoles(): Observable<any> {
    const url = `${this.baseUrlAppRoles}get_app_roles`;  // Construct full URL
    return this.http.get<any>(url);
  }
  getAppRoleByUserId(userId: number) {
    const url = `${this.baseUrlAppRoles}get_app_roles?userId=${userId}`;
    return this.http.get<any>(url);
  }
  saveUserAcess(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlAppRoles}save_user_access`, rowData, { headers: headers });
  }
  getUsersHierarchyByParent(userId: number):Observable<any> {
    const url = `${this.baseUrl}get_users_hierarchy_by_parent?userId=${userId}`
    return this.http.get<any>(url);
  }
  isUserHasRestrictedAccess(userId: number,firmId: number,objectID: number) {
    const url = `${this.baseUrl}is_user_has_restricted_access?userId=${userId}&firmId=${firmId}&objectID=${objectID}`;
    return this.http.get<any>(url);
  }
  getUsers():Observable<any> {
    const url = `${this.baseUrl}get_users`
    return this.http.get<any>(url);
  }
}
