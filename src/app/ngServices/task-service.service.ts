import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskServiceService {
  private baseUrl = 'https://localhost:7091/api/Task/';  // Base URL

  constructor(private http: HttpClient) { }

  getAssignedTaskReminders(userId: number): Observable<any> {
    const url = `${this.baseUrl}get-task-reminder-list?userId=${userId}`;  // Construct full URL
    return this.http.get<any>(url);
  }
}
