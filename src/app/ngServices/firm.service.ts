import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirmService {

  private baseUrl = environment.API_URL+'/api/Firms/';  // Base URL 
  private baseUrlContact = environment.API_URL+'/api/Contact/'; // Without FIRMS
  constructor(private http: HttpClient) { }

  getFIRMOPData(firmId:number): Observable<any> {
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
  editFirm(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrl}api/Firms/insert_update_firm_details`, rowData, { headers: headers });
  }
  getFYearEndHistory(firmId:number): Observable<any> {
    const url = `${this.baseUrl}get_firms_end_year_history?firmId=${firmId}&flag=1`;  // Construct full URL https://localhost:7091/api/Firms/get_firms_end_year_history?firmId=66&flag=1
    return this.http.get<any>(url);
  }
  getFIRMAuditors(firmId:number): Observable<any> {
    const url = `${this.baseUrl}get_auditors?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Firms/get_auditors?firmID=66
    return this.http.get<any>(url);
  }
  getContactsOfFIRM(firmId:number): Observable<any> {
    const url = `${this.baseUrlContact}get_all_contact_details?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Contact/get_all_contact_details?firmId=66
    return this.http.get<any>(url);
  }
  getFIRMUsersRAFunctions(firmId:number, assiLevel:number): Observable<any> {
    const url = `${this.baseUrl}get_firm_user?firmId=${firmId}`;
    return this.http.get<any>(url);
  }
}
