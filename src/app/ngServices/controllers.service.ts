import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ControllersService {

  constructor(private http: HttpClient) { }

  private baseUrlControllers = environment.API_URL + '/api/OtherEntity/'; //Controllers

  getFIRMControllers(firmId: number): Observable<any> {
    const url = `${this.baseUrlControllers}get_corporate_controller_details_list?firmId=${firmId}`; //https://localhost:7091/api/OtherEntity/get_corporate_controller_details_list?firmId=66
    return this.http.get<any>(url);
  }

   //////// Yazan Controller
  // deleteotherentitydetails(OtherEntityID: number): Observable<any> {
  //   const url = `${this.baseUrlControllers}delete_other_entity_details?otherEntityID=${OtherEntityID}`;
  //   return this.http.delete<any>(url);
  // }
  
  deleteotherentitydetails(otherEntityID: number, relatedEntityID: number, entitySubTypeID: number, output: number): Observable<any> {
    const url = `${this.baseUrlControllers}delete_other_entity_details?otherEntityID=${otherEntityID}&relatedEntityID=${relatedEntityID}&entitySubTypeID=${entitySubTypeID}&output=${output}`;
    return this.http.delete<any>(url);
  }
  
  insertupdateotherentitydetails(saveControllerPopupChangesObj: any): Observable<any> {
    const url = `${this.baseUrlControllers}insert_update_other_entity_details`;
    return this.http.post<any>(url, saveControllerPopupChangesObj); 
  }
}
