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

  getJournalDataDetails(firmId: number, supJournalID: number): Observable<any> {
    const url = `${this.baseUrlJournal}get_supervision_journal?firmId=${firmId}&supJournalID=${supJournalID}`;
    return this.http.get<any>(url);
  }

  getSupJournalSubjectData(supJournalID: number): Observable<any> {
    const url = `${this.baseUrlJournal}get_supervision_journal_subject_data?supJournalID=${supJournalID}`;
    return this.http.get<any>(url);
  }

  getSupJournalSubjectTypes(firmId: number) {
    const url = `${this.baseUrlJournal}get_supervision_journal_subject_types?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  getAllRequiredIndividuals(firmId: number) {
    const url = `${this.baseUrlJournal}get_all_required_individuals?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  getAllApprovedIndividuals(firmId: number) {
    const url = `${this.baseUrlJournal}get_all_approved_individuals?firmId=${firmId}`;
    return this.http.get<any>(url);
  }

  saveSupJournalData(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlJournal}save_sup_journal_data`, rowData, { headers: headers });
  }

  insertUpdateJournalSup(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlJournal}inser_update_journal_supervision`, rowData, { headers: headers });
  }

  deleteJournalData(rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<any>(`${this.baseUrlJournal}delete_journal_data`, {
      headers: headers,
      body: rowData
    });
  }

}
