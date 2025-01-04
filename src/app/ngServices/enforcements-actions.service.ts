import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnforcementsActionsService {

  constructor(private http: HttpClient) { }

  private baseUrlEnforcement = environment.API_URL + '/api/EnforcementActions/';

  getEnforcementDetails(userId: number, enfID: number): Observable<any> {
    const url = `${this.baseUrlEnforcement}get_enforcement_data?userId=${userId}&enforcementAndDisciplinaryActnID=${enfID}`; 
    return this.http.get<any>(url);
  }

  getAllRelatedIndividuals(firmId: number,firmTypeID: number) {
    const url = `${this.baseUrlEnforcement}get_related_individuals?firmId=${firmId}&firmtypeID=${firmTypeID}`;
    return this.http.get<any>(url);
  }

  saveEnforcement(enfObj: any): Observable<any> {
    const url = `${this.baseUrlEnforcement}save_enforcement_data`; 
    return this.http.post<any>(url,enfObj);
  }


  getEnfData(userId: number,firmId: number | null = null, enforcementAndDisciplinaryActnID: number | null = null): Observable<any> {
    const url = `${this.baseUrlEnforcement}get_enforcement_data?userId=${userId}${firmId !== null ? `&firmId=${firmId}` : ''}${enforcementAndDisciplinaryActnID !== null ? `&enforcementAndDisciplinaryActnID=${enforcementAndDisciplinaryActnID}` : ''}`;
    return this.http.get<any>(url);
  }

}
