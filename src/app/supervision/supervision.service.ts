import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { LogformService } from '../ngServices/logform.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupervisionService {
  errorMessages: { [key: string]: string } = {};
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
  getErrorMessages(fieldName: string, msgKey: number, customMessage?: string, placeholderValue?: string): Observable<void> {
    return new Observable(observer => {
      this.logForm.errorMessages(msgKey).subscribe(
        response => {
          let errorMessage = (customMessage ? customMessage + " " : "") + response.response;

          // Store in the errorMessages object and the provided activity
          this.errorMessages[fieldName] = errorMessage;
 
          observer.next();
        },
        error => {
          console.error(error);
          observer.error(error);
        }
      );
    });
  }
}
