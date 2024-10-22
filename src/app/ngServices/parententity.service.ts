import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParententityService {

  constructor(private http: HttpClient) { }

  private baseUrlParentEntity = environment.API_URL + '/api/ParentEntity/'; //ParentEntity

  getRegulatorDetails(otherEntityID : number, entityTypeId: number): Observable<any> {
    const url = `${this.baseUrlParentEntity}get_regulator_details?otherEntityID=${otherEntityID}&entityTypeId=${entityTypeId}`; 
    return this.http.get<any>(url);
  }
  getRegulatorsByCountry(firmsId : number, countryID : number) : Observable<any> {
    const url = `${this.baseUrlParentEntity}get_regulators_by_country?firmsId=${firmsId}&countryID=${countryID}`;
    return this.http.get<any>(url);
  }
}
