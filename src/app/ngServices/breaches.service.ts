import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BreachesService {

  constructor(private http: HttpClient) { }

  private baseUrlBreaches = environment.API_URL + '/api/Breach/'


  getBreachesList(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = params[key];
    
      if (value !== null && value !== undefined) {
        if (!isNaN(value) && typeof value !== 'string') {
          httpParams = httpParams.set(key, String(value));
        } else {
          httpParams = httpParams.set(key, value);
        }
      }
    });
    
    const url = `${this.baseUrlBreaches}get_breach_list`;
    return this.http.get<any>(url, { params: httpParams });
  }
  
}
