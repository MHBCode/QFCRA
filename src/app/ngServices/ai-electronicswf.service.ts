import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiElectronicswfService {
  private aiElectronicsWFUrl = environment.API_URL + '/api/AiElectronicsWF/'; // Base URL
  constructor(private http: HttpClient) { }

  getApprovedIndividuals(firmId: number, status: string): Observable<any> {
    const url = `${this.aiElectronicsWFUrl}get_approved_individuals?firmId=${firmId}&status=${"Approved"}`;  
    return this.http.get<any>(url);
  }
  getWithdrawnIndividualsser(firmId: number, status: string): Observable<any> {
    const url = `${this.aiElectronicsWFUrl}get_approved_individuals?firmId=${firmId}&status=${"Withdrawn"}`;  
    return this.http.get<any>(url);
  }
  getAppliedIndividuals(firmId: number, status: string): Observable<any> {
    const url = `${this.aiElectronicsWFUrl}get_approved_individuals?firmId=${firmId}&status=${"Applied"}`;  
    return this.http.get<any>(url);
  }
  getListObjectAttribute(ObjectID:number,ObjectInstanceID:number,ObjectInstanceRevNum:number,ActiveFlag:boolean,SourceObjectID:number,SourceObjectInstanceID:number,SourceObjectInstanceRevNum:number): Observable<any>{
    const url = `${this.aiElectronicsWFUrl}get_list_object_attribute?ObjectID=${ObjectID}&ObjectInstanceID=${ObjectInstanceID}&ObjectInstanceRevNum=${ObjectInstanceRevNum}&ActiveFlag=${ActiveFlag}&SourceObjectID=${SourceObjectID}&SourceObjectInstanceID=${SourceObjectInstanceID}&SourceObjectInstanceRevNum=${SourceObjectInstanceRevNum}`;  
    return this.http.get<any>(url);
  }
  InsertUpdateObjectAttributes(savecreateResidentStateObj: any): Observable<any> {
    const url = `${this.aiElectronicsWFUrl}insert_update_object_attributes`;
    return this.http.post<any>(url, savecreateResidentStateObj);
  }
}
