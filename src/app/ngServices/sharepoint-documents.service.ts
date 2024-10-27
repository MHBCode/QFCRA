import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharepointDocumentsService {

  constructor(private http: HttpClient) { }

  private SharepointUrl = environment.SHAREPOINT_API_URL + '/api/SharePoint/';

  uploadFileToSharepoint(file: File, intranetSitePath: string, filePathAfterDocLib: string, strfileName: string, strUserEmailAddress: string) {
    const formData = new FormData();

    // Append the file only to FormData
    formData.append('file', file);

    const url = `${this.SharepointUrl}upload_file_to_spo?intranetSitePath=${encodeURIComponent(intranetSitePath)}&filePathAfterDocLib=${encodeURIComponent(filePathAfterDocLib)}&strfileName=${encodeURIComponent(strfileName)}&strUserEmailAddress=${encodeURIComponent(strUserEmailAddress)}`;

    return this.http.post(url, formData, {
      headers: new HttpHeaders({
        
      }),
    });
  }



  // uploadFileToSharepoint(file: File, intranetSitePath: string, filePathAfterDocLib: string, strfileName: string, strUserEmailAddress: string): Observable<any> {
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  //   // Create the payload with all necessary parameters
  //   const payload = {
  //     file,
  //     intranetSitePath,
  //     filePathAfterDocLib,
  //     strfileName,
  //     strUserEmailAddress
  //   };
  //   return this.http.post<any>(`${this.SharepointUrl}upload_file_to_spo`, payload, { headers });
  // }
}
