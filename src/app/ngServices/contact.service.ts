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
  getContactDetailsCreateContact(firmId: number, contactId: number, contactAssId: number): Observable<any> {
    const url = `${this.baseUrlContact}get_contact_details_by_contactId?firmId=${firmId}&contactId=${contactId}&contactAssId=${contactAssId}`;
    return this.http.get<any>(url);
  }
  ///////////////////
  deleteContactDetails(objectID: number, contactID: number, contactAssnID: number,userID:number): Observable<any> {
    const url = `${this.baseUrlContact}delete_contact_details?objectID=${objectID}&contactId=${contactID}&contactAssId=${contactAssnID}&userID=${userID}`;
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
  getPopulateAis(firmId: number): Observable<any> {
    const url = `${this.baseUrlContact}get_populate_ais?firmId=${firmId}`
    return this.http.get<any>(url);
  }
  IsMainContact(firmId: number, entityId: number, entityTypeID: number) {
    const url = `${this.baseUrlContact}is_main_contact?firmId=${firmId}&EntityTypeId=${entityTypeID}&EntityId=${entityId}`;
    return this.http.get<number>(url); 
  }
  IsContactTypeExists(firmId: number, entityId: number, entityTypeID: number, contactID: number, contactAssnID: number): Observable<any> {
    const url = `${this.baseUrlContact}is_contact_type_exists?firmId=${firmId}&EntityTypeId=${entityTypeID}&EntityId=${entityId}&ContactID=${contactID}&ContactAssnID=${contactAssnID}`;
    return this.http.get<number>(url); 
  }
  getContactFunctionType(): Observable<any> {
    const url = `${this.baseUrlContact}get_contact_function_types`;
    return this.http.get<any>(url); 
  }
  getSearchMobileNumber(mobileNum: string): Observable<any> {
    const url = `${this.baseUrlContact}get_search_mobile_number?mobileNum=${mobileNum}`;
    return this.http.get<any>(url);
  }
  SearchContactDetailsByPassingParam(firstName: string, familyName: string,firmId:number): Observable<any> {
    const url = `${this.baseUrlContact}search_contact_details_by_passing_param?firstName=${firstName}&familyNam=${familyName}&firmId=${firmId}`;
    return this.http.get<any>(url);
  }
  getContactFunctionsList(contactId: number, contactAssId: number): Observable<any> {
    const url = `${this.baseUrlContact}get_contact_function_list?contactId=${contactId}&contactAssId=${contactAssId}`;
    return this.http.get<any>(url);
  }
}
