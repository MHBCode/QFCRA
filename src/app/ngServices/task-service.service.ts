import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TaskServiceService {
  private baseUrl = environment.API_URL + '/api/Task/';  // Base URL
  private baseUrlFirms = environment.API_URL + '/api/Firms/';

  constructor(private http: HttpClient) { }

  getAssignedTaskReminders(userId: number): Observable<any> {
    const url = `${this.baseUrl}get_task-reminder_list?userId=${userId}`; 
    return this.http.get<any>(url);
  }
  getMyTasksAsSecondaryCaseOfficer(userId: number): Observable<any> { // Shadow Supervisor
    const url = `${this.baseUrl}get_my_tasks_secondary_officer?userId=${userId}`;  
    return this.http.get<any>(url);
  }
  getMyTasksAssignedByUser(userId: number): Observable<any> { 
    const url = `${this.baseUrl}get_tasks_assigned_by_user?userId=${userId}`;  
    return this.http.get<any>(url);
  }
  saveReminderNote(note: any): Observable<any> {
    const url = `${this.baseUrl}insert_reminder_note`;
    return this.http.post<any>(url, note);
  }
  getMyTaskByObjectDetails(objectId: number,objectInstanceId: number, objectInstanceRevNum: number): Observable<any> {
    const url = `${this.baseUrl}get_my_task_by_object_details?ObjectID=${objectId}&ObjectInstanceID=${objectInstanceId}&ObjectInstanceRevNum=${objectInstanceRevNum}`;  
    return this.http.get<any>(url);
  }
  getAllFirms() {
    const url = `${this.baseUrlFirms}get_firms`;  
    return this.http.get<any>(url);
  }
  createReminder(reminder: any) {
    const url = `${this.baseUrl}insert_personal_reminder`;
    return this.http.post<any>(url, reminder);
  }
  private showExportButtonSubject = new BehaviorSubject<boolean>(false);
  showExportButton$ = this.showExportButtonSubject.asObservable();

  setShowExportButton(value: boolean) {
    this.showExportButtonSubject.next(value);
  }
}
