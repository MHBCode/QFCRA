import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressesService {
  private baseUrlAddress = environment.API_URL + '/api/Address/' // Address

  constructor(private http: HttpClient) { }

  getControllerCorporateFirmAddresses(entityID: number, entityTypeID: number, userId: number, opTypeId: number): Observable<any> {
    const url = `${this.baseUrlAddress}get_address_list?entityTypeId=${entityTypeID}&entityId=${entityID}&userId=${userId}&opTypeId=${opTypeId}`;
    return this.http.get<any>(url);
  }

  getControllerIndividualAddresses(contactAssId: number, userId: number, opTypeId: number): Observable<any> {
    const url = `${this.baseUrlAddress}get_address_list?contactAssnId=${contactAssId}&userId=${userId}&opTypeId=${opTypeId}`;
    return this.http.get<any>(url);
  }

  getCoreFirmAddresses(firmId: number): Observable<any> {
    const url = `${this.baseUrlAddress}get_address_list?objectId=521&objectInstanceId=${firmId}&objectInstanceRevNum=1&sourceObjectID=521&sourceObjectInstanceId=${firmId}&sourceObjectInstanceRevNum=1`
    return this.http.get<any>(url);
  }

  getContactFirmAddresses(contactAssId: number, userId: number): Observable<any> {
    const url = `${this.baseUrlAddress}get_address_list?contactAssnId=${contactAssId}&userId=${userId}`;
    return this.http.get<any>(url);
  }

  getAddressesTypeHistory(firmId: number | null, addressTypeId: number, entityTypeId: number | null, entityId: number | null, contactAssnID: number | null) {
    let url = `${this.baseUrlAddress}get_address_type_history?addressTypeId=${addressTypeId}&valId=false`;

    if (firmId !== null) {
      url += `&firmId=${firmId}`;
    }
    if (entityTypeId !== null) {
      url += `&entityTypeId=${entityTypeId}`;
    }
    if (entityId !== null) {
      url += `&entityId=${entityId}`;
    }
    if (contactAssnID !== null) {
      url += `&contactAssnId=${contactAssnID}`
    }
    return this.http.get<any>(url);
  }


  editCoreAddress(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlAddress}insert_update_address`, rowData, { headers: headers });
  }
}
