import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient) { }
  
  private baseUrlContact = environment.API_URL + '/api/Contact/'; // Without FIRMS

  getContactsOfFIRM(firmId: number): Observable<any> {
    const url = `${this.baseUrlContact}get_all_contact_details?firmId=${firmId}`;  // Construct full URL https://localhost:7091/api/Contact/get_all_contact_details?firmId=66
    return this.http.get<any>(url);
  }
  getContactDetails(firmId: number, contactId: number, contactAssId: number): Observable<any> {
    const url = `${this.baseUrlContact}get_contact_details_by_contactId?firmId=${firmId}&contactId=${contactId}&contactAssId=${contactAssId}`;
    return this.http.get<any>(url);
  }
  ///////////////////
  deleteContactDetails(contactID: number, contactAssnID: number, output: boolean): Observable<any> {
    const url = `${this.baseUrlContact}delete_contact_details?contactId=${contactID}&contactAssId=${contactAssnID}&output=${output}`;
    return this.http.delete<any>(url);
  }
  saveContactDetails(contactDetails: any): Observable<any> {
    const url = `${this.baseUrlContact}save_update_contact_form`;
    return this.http.post<any>(url, contactDetails);
  }
  saveupdatecontactform(saveControllerPopupChangesIndividualObj: any): Observable<any> {
    const url = `${this.baseUrlContact}save_update_contact_form`;
    return this.http.post<any>(url, saveControllerPopupChangesIndividualObj); 
  }
  getEntityTypesByFrimsId(firmId: number): Observable<any> {
    const url = `${this.baseUrlContact}get_entity_types_by_firmId?firmId=${firmId}`
    return this.http.get<any>(url);
  }
}
