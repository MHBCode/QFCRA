import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = 'https://localhost:7091/api/Dashboard/';

  constructor(private _http: HttpClient) { }

  getDashboardFirms(userId: number) {
    const url = `${this.baseUrl}get_rpt_firms_dashboard?userId=${userId}`;
    return this._http.get<any>(url);
  }
  
}
