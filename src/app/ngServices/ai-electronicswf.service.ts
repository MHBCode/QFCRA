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
}
