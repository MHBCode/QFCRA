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
    formData.append('file', file);

    const encodedIntranetSitePath = encodeURIComponent(intranetSitePath);
    const encodedFilePathAfterDocLib = encodeURIComponent(filePathAfterDocLib);
    const encodedStrFileName = encodeURIComponent(strfileName);
    const encodedStrUserEmailAddress = encodeURIComponent(strUserEmailAddress);

    // Construct the URL with encoded parameters
    const url = `${this.SharepointUrl}upload_file_to_spo?intranetSitePath=${encodedIntranetSitePath}&filePathAfterDocLib=${encodedFilePathAfterDocLib}&strfileName=${encodedStrFileName}&strUserEmailAddress=${encodedStrUserEmailAddress}`;

    return this.http.post(url, formData, {
      headers: new HttpHeaders(),
    });
  }


  deleteFileFromSharepoint(intranetSitePath: string, fullFilePath: string) {
    const encodedIntranetSitePath = encodeURIComponent(intranetSitePath);
    const encodedFullFilePath = encodeURIComponent(fullFilePath);
    const url = `${this.SharepointUrl}delete_file?intranetSitePath=${encodedIntranetSitePath}&fullFilePath=${encodedFullFilePath}`;

    return this.http.delete(url);
  }

}
