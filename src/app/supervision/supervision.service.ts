import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { LogformService } from '../ngServices/logform.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SupervisionService {

  constructor(private http: HttpClient,private logForm: LogformService) { }

  showErrorAlert(messageKey: number, isLoading?: boolean) {
    this.logForm.errorMessages(messageKey).subscribe(
      response => {
        Swal.fire({
          text: response.response,
          icon: 'error',
          confirmButtonText: 'Ok',
        });

        // If isLoading was passed in, set it to false
        if (isLoading !== undefined) {
          isLoading = false;
        }
      },
      error => {
        console.error(`Failed to load error message for message key ${messageKey}.`, error);
      }
    );
  }

}
