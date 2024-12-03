import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogformService {

  constructor(private http: HttpClient) { }

  private baseUrlLogForm = environment.API_URL + '/api/LogForm/' // logform

  getDocumentDetails(docID: number): Observable<any> {
    const url = `${this.baseUrlLogForm}get_document_details?docID=${docID}`;
    return this.http.get<any>(url);
  }
  getDocListByFirmDocType(firmId: number, docTypeID: string) {
    const url = `${this.baseUrlLogForm}get_doc_list_by_firm_doc_type?firmId=${firmId}&docTypeIDs=${docTypeID}`;
    return this.http.get<any>(url);
  }
  errorMessages(messageKey: number): Observable<any> {
    const url = `${this.baseUrlLogForm}get_message_property?messageKey=${messageKey}`
    return this.http.get<any>(url);
  }
  getNewFileNumber(firmId: number, receivedDate: string) {
    const url = `${this.baseUrlLogForm}get_new_file_number?firmId=${firmId}&receivedDate=${receivedDate}`
    return this.http.get<any>(url);
  }
  getDocumentType(docCategoryTypeID: number): Observable<any> {
    const url = `${this.baseUrlLogForm}get_document_type?docCategoryTypeID=${docCategoryTypeID}`
    return this.http.get<any>(url);
  }
  constructDocUrl(rowData: any[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlLogForm}construct_doc_url`, rowData, { headers });
  }
  getMessageProperty(messageKey: string): Observable<any> {
    const url = `${this.baseUrlLogForm}get_message_property?messageKey=${messageKey}`
    return this.http.get<any>(url);
  }
}
