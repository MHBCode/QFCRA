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

  getRevisions(objectId:number,objectInstanceId: number): Observable<any> {
    const url = `${this.baseUrlObjectWF}get_revision?objectId=${objectId}&objectInstanceId=${objectInstanceId}`
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
  getDocumentType(docTypeId: number): Observable<any> {
    const url = `${this.baseUrlObjectWF}get_document_type?docTypeID=${docTypeId}`
    return this.http.get<any>(url);
  }
  getUserObjectWfTasks(ObjectWFStatusID: number): Observable<any> {
    const url = `${this.baseUrlObjectWF}get_user_object_wf_tasks?ObjectWFStatusID=${ObjectWFStatusID}`
    return this.http.get<any>(url);
  }
  getObjectWorkflow(objectId:number,objectInstanceId:number,objectInstanceRevNum:number): Observable<any> {
    const url = `${this.baseUrlObjectWF}get_object_workflow?objectId=${objectId}&objectInstanceId=${objectInstanceId}&objectInstanceRevNum=${objectInstanceRevNum}`
    return this.http.get<any>(url);
  } 
  getWorkflowTaskRoles(objectTaskTypeID:number,objectID:number,notificationFlag:number,objectWFTaskDefID:number): Observable<any> {
      const url = `${this.baseUrlObjectWF}get_workflow_task_roles?objectTaskTypeID=${objectTaskTypeID}&objectID=${objectID}&notificationFlag=${notificationFlag}&objectWFTaskDefID=${objectWFTaskDefID}`
      return this.http.get<any>(url); 
  }
  getUserWorkFlowDetails(ObjectWFStatusID:number): Observable<any> {
    const url = `${this.baseUrlObjectWF}get_user_workflow_details?ObjectWFStatusID=${ObjectWFStatusID}`
    return this.http.get<any>(url); 
  }

}
