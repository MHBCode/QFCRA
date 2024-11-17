import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  constructor(private http: HttpClient) { }

  private baseUrlJournal = environment.API_URL + '/api/Journal/'

  getJournalData(firmId: number): Observable<any> {
    const url = `${this.baseUrlJournal}get_supervision_journal?firmId=${firmId}`;
    return this.http.get<any>(url);
  }
  
}
