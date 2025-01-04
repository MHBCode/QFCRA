import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RulesService {

  constructor(private http: HttpClient) { }

  private baseUrlRules = environment.API_URL + '/api/Rules/'

  getProvisionDescByProvisionRange(legislationId: number, partTypeId: number, provisionFrom: string ,provisionTo : string,provisionFromId : number,provisionToId:number ): Observable<any> {
    const url = `${this.baseUrlRules}get_provision_desc_by_provision_range?legislationId=${legislationId}&partTypeId=${partTypeId}&provisionFrom=${provisionFrom}&provisionTo=${provisionTo}&provisionFromId=${provisionFromId}&provisionToId=${provisionToId}`;
    return this.http.get<any>(url);
  }
  
}
