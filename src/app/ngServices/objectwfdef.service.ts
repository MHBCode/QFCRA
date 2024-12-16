import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ObjectwfdefService {

  constructor(private http: HttpClient) { }

  private baseUrlObjectWFDef = environment.API_URL + '/api/ObjectWFDef/'

  getDefaultWorkflowDetails(objectID:number,userID:number): Observable<any> {
    const url = `${this.baseUrlObjectWFDef}get_default_workflow_details?objectID=${objectID}&userID=${userID}`
    return this.http.get<any>(url);
  }
}
