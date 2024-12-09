import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable} from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ActionItemsService {

  constructor(private http: HttpClient) { }

  private baseUrlActionItems = environment.API_URL + '/api/ActionItems/';

  getObjectActionItems(objectId:number,objectInstanceId:number,objectInstanceRevNum:number,objectOpTypeId:number): Observable<any> {
    const url = `${this.baseUrlActionItems}get_object_action_items?objectId=${objectId}&objectInstanceId=${objectInstanceId}&objectInstanceRevNum=${objectInstanceRevNum}&objectOpTypeId=${objectOpTypeId}`;  
    return this.http.get<any>(url);
  }

}
