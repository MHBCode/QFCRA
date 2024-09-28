import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskServiceService {
  private baseUrl = environment.API_URL + '/api/Task/';  // Base URL

  constructor(private http: HttpClient) { }

  getAssignedTaskReminders(userId: number): Observable<any> {
    const url = `${this.baseUrl}get_task-reminder_list?userId=${userId}`;  // Construct full URL
    return this.http.get<any>(url);
  }
  saveReminderNote(note: any): Observable<any> {
    const url = `${this.baseUrl}insert_reminder_note`;
    return this.http.post<any>(url, note);
  }
}
