import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WaiverService {

  constructor(private http: HttpClient) { }

  private baseUrlWaiver = environment.API_URL + '/api/Waiver/' //Waiver

  getFirmwaiver(firmId: number, roleId: number | null = null, objectOpType: number | null = null): Observable<any> {
    const url = `${this.baseUrlWaiver}get_waiver_list?firmId=${firmId}${
      roleId !== null ? `&roleId=${roleId}` : ''
    }${objectOpType !== null ? `&objectOpType=${objectOpType}` : ''}`;
    return this.http.get<any>(url);
  }
  
}
