import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirmService {

  private baseUrl = 'https://localhost:7091/api/Firms/';  // Base URL

  constructor(private http: HttpClient) { }

  getAssignedFirms(userId: number): Observable<any> {
    const url = `${this.baseUrl}get_assign_firms?userId=${userId}`;  // Construct full URL
    return this.http.get<any>(url);
  }
  getFirmDetails(firmId: number): Observable<any> {
    const url = `${this.baseUrl}get_firm?firmID=${firmId}`;
    return this.http.get<any>(url);
  }
}
