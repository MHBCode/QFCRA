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

  getControllerFirmAddresses(entityID: number, entityTypeID: number, userId: number, opTypeId: number): Observable<any> {
    const url = `${this.baseUrlAddress}get_address_list?entityTypeId=${entityTypeID}&entityId=${entityID}&userId=${userId}&opTypeId=${opTypeId}`;
    return this.http.get<any>(url);
  }

  getCoreFirmAddresses(firmId: number): Observable<any> {
    const url = `${this.baseUrlAddress}get_address_list?objectId=521&objectInstanceId=${firmId}&objectInstanceRevNum=1&sourceObjectID=521&sourceObjectInstanceId=${firmId}&sourceObjectInstanceRevNum=1`
    return this.http.get<any>(url);
  }

  getAddressesTypeHistory(firmId: number, addressTypeId: number) {
    const url = `${this.baseUrlAddress}get_address_type_history?firmId=${firmId}&addressTypeId=${addressTypeId}&valId=false`
    return this.http.get<any>(url);
  }

  editCoreAddress(userId: number, rowData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrlAddress}insert_update_address`, rowData, { headers: headers });
  }
}
