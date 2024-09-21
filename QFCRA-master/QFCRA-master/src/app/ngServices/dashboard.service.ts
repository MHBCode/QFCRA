import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = environment.API_URL+'/api/Dashboard/';

  constructor(private _http: HttpClient) { }

  getDashboardFirms(userId: number) {
    const url = `${this.baseUrl}get_rpt_firms_dashboard?userId=${userId}`;
    return this._http.get<any>(url);
  }
  
}
