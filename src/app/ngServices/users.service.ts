import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  userId = 10044;
  private baseUrl = environment.API_URL+'/api/Users/';  // Base URL'
  private baseUrlAppRoles = environment.API_URL+'/api/AppRoles/';  // Approles URL
  
  constructor(private http: HttpClient) { }

  getUserByAccess(userId: number): Observable<any> {
    const url = `${this.baseUrl}get_users`;  // Construct full URL
    return this.http.get<any>(url);
  }
  getAllAppRoles(): Observable<any> {
    const url = `${this.baseUrlAppRoles}get_app_roles`;  // Construct full URL
    return this.http.get<any>(url);
  }
}