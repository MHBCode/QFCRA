import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ObjectwfService {

  constructor(private http: HttpClient) { }

  private baseUrlObjectWF = environment.API_URL + '/api/ObjectWF/' // Object WF

  getRevision(scopeID: number): Observable<any> {
    const url = `${this.baseUrlObjectWF}get_revision?objectId=524&objectInstanceId=${scopeID}`
    return this.http.get<any>(url);
  }

  getDocument(objectId: number, scopeId: number, scopeRevNum: number): Observable<any> {
    const url = `${this.baseUrlObjectWF}get_document?objectId=${objectId}&objectInstanceId=${scopeId}&ObjectInstanceRevNum=${scopeRevNum}`
    return this.http.get<any>(url);
  }

  insertDocument(rowData: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlObjectWF}insert_update_schedulink`, rowData, { headers: headers });
  }

  deleteDocument(docId: number, objectId: number, objectInstanceId: number, objRevNumber: number): Observable<any> {
    const url = `${this.baseUrlObjectWF}delete_document?docID=${docId}&objectId=${objectId}&objectInstanceId=${objectInstanceId}&ObjectInstanceRevNum=${objRevNumber}`
    return this.http.delete<any>(url);
  }


}
