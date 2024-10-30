import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { FirmService } from './firm.service'; // Assuming FirmService makes the HTTP call
import { DateUtilService } from '../shared/date-util/date-util.service';
import { LogformService } from '../ngServices/logform.service';
import Swal from 'sweetalert2';
import { SecurityService } from '../ngServices/security.service';
import * as constants from 'src/app/app-constants';
import { ApplicationService } from '../ngServices/application.service';

@Injectable({
  providedIn: 'root',
})
export class FirmDetailsService {
  firmDetails: any;
  assignedUserRoles: any[] = [];
  private isFirmLicensedSubject = new BehaviorSubject<boolean>(false);
  private isFirmAuthorisedSubject = new BehaviorSubject<boolean>(false);

  // Expose these as Observables to components
  isFirmLicensed$ = this.isFirmLicensedSubject.asObservable();
  isFirmAuthorised$ = this.isFirmAuthorisedSubject.asObservable();

  errorMessages: { [key: string]: string } = {};

  constructor(private firmService: FirmService, private dateUtilService: DateUtilService, private logForm: LogformService, private securityService: SecurityService, private applicationService: ApplicationService) { }

  loadFirmDetails(firmId: number): Observable<any> {
    return new Observable(observer => {
      this.firmService.getFirmDetails(firmId).subscribe(
        data => {
          const firmDetails = data.response;
          const selectedFirmTypeID = firmDetails.AuthorisationStatusTypeID != 0 ? 3 : 2;
          const dateOfApplication = firmDetails.AuthorisationStatusTypeID > 0
            ? this.dateUtilService.formatDateToCustomFormat(firmDetails.FirmAuthApplDate)
            : this.dateUtilService.formatDateToCustomFormat(firmDetails.FirmLicApplDate);
          const formattedLicenseApplStatusDate = this.dateUtilService.formatDateToCustomFormat(firmDetails.LicenseApplStatusDate);
          const formattedAuthApplStatusDate = this.dateUtilService.formatDateToCustomFormat(firmDetails.AuthApplStatusDate);
          const AuthorisationStatusTypeLabelDescFormatted = firmDetails.AuthorisationStatusTypeLabelDesc.replace(/:/g, '');
          const LicenseStatusTypeLabelDescFormatted = firmDetails.LicenseStatusTypeLabelDesc.replace(/:/g, '');

          // Emitting the processed data
          observer.next({
            firmDetails,
            selectedFirmTypeID,
            dateOfApplication,
            formattedLicenseApplStatusDate,
            formattedAuthApplStatusDate,
            AuthorisationStatusTypeLabelDescFormatted,
            LicenseStatusTypeLabelDescFormatted
          });
        },
        error => {
          observer.error('Error fetching firm details');
        }
      );
    });
  }

  // Added by Moe
  checkFirmLicense(firmId: number) {
    this.applicationService.isFirmLicensed(firmId).subscribe(
      (response) => {
        this.isFirmLicensedSubject.next(response.response);
      },
      (error) => {
        console.error('Error checking firm license:', error);
        this.isFirmLicensedSubject.next(false);
      }
    );
  }

  // Added by Moe
  checkFirmAuthorisation(firmId: number) {
    this.applicationService.isFirmAuthorised(firmId).subscribe(
      (response) => {
        this.isFirmAuthorisedSubject.next(response.response);
      },
      (error) => {
        console.error('Error checking firm authorisation:', error);
        this.isFirmAuthorisedSubject.next(false);
      }
    );
  }


  // Added by Moe
  loadAssignedUserRoles(userId: number): Observable<any> {
    return this.securityService.getUserRoles(userId).pipe(
      tap((assignedRoles) => {
        this.assignedUserRoles = assignedRoles.response;
        console.log('Assigned roles:', this.assignedUserRoles);
      }),
      error => {
        console.error('Error fetching assigned roles:', error);
        return (error);
      }
    );
  }

  getErrorMessages(fieldName: string, msgKey: number, activity?: any, customMessage?: string,placeholderValue?: string): Observable<void> {
    return new Observable(observer => {
      this.logForm.errorMessages(msgKey).subscribe(
        response => {
          let errorMessage = (customMessage ? customMessage + " " : "") + response.response;

          // Replace placeholder values if provided
          if (placeholderValue) {
            errorMessage = errorMessage.replace("#Date#", placeholderValue)
              .replace("##DateFieldLabel##", placeholderValue)
              .replace("#ApplicationDate#", placeholderValue);
          }

          // Store in the errorMessages object and the provided activity
          this.errorMessages[fieldName] = errorMessage;
          if (activity) {
            activity.errorMessages[fieldName] = errorMessage;
          }

          observer.next();
        },
        error => {
          console.error(error);
          observer.error(error);
        }
      );
    });
  }

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

  padNumber(value: string): string {
    const strValue = value.toString();
    return strValue.padStart(5, '0'); // Ensure the value has a length of 5 digits
  }

  getCountries(): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(constants.countries).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Countries dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

  getAddressTypes(): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(constants.addressTypes).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Address Types dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

  getAuthorisationStatus(): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(constants.authorisationStatus).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Authorisation Status dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

  getQFCLicenseStatus(): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(constants.qfcLicenseStatus).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching QFC License Status dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

  getFirmAppTypes(): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(constants.firmAppTypes).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Firm Application Types dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

  getFinAccStd(): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(constants.FinAccStd).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Fin Acc Std dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

  getFinYearEnd(): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(constants.FinYearEnd).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Fin Year End dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

  getLegalStatus(): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(constants.legalStatus).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Legal Status dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

}
