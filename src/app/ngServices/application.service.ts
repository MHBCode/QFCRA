import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  constructor(private http: HttpClient) { }

  private baseUrlApplication = environment.API_URL + '/api/Application/' //Application


  isFirmLicensed(firmId: number): Observable<any> {
    const url = `${this.baseUrlApplication}is_firmLicensed?firmId=${firmId}`
    return this.http.get<any>(url);
  }

  isFirmAuthorised(firmId: number): Observable<any> {
    const url = `${this.baseUrlApplication}is_firmAuthorized?firmId=${firmId}`
    return this.http.get<any>(url);
  }
  
  editAppDetails(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlApplication}insert_update_application`, rowData, { headers: headers });
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
}
