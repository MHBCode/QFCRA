import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LogformService } from '../ngServices/logform.service';
import Swal from 'sweetalert2';
import * as constants from 'src/app/app-constants';
import { Observable } from 'rxjs';
import { SecurityService } from '../ngServices/security.service';
import { UsersService } from '../ngServices/users.service';

@Injectable({
  providedIn: 'root'
})
export class SupervisionService {
  errorMessages: { [key: string]: string } = {};
  constructor(
    private http: HttpClient,
    private logForm: LogformService,
    private securityService: SecurityService,
    private userService: UsersService,
  ) { }

  showErrorAlert(messageKey: number, icon: any, isLoading?: boolean) {
    this.logForm.errorMessages(messageKey).subscribe(
      response => {
        Swal.fire({
          text: response.response,
          icon: icon,
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

  getErrorMessages(fieldName: string, msgKey: number, customMessage?: string, placeholderValue?: string, rpt?: any): Observable<void> {
    return new Observable(observer => {
      this.logForm.errorMessages(msgKey).subscribe(
        response => {
          let errorMessage = (customMessage ? customMessage + " " : "") + response.response;

          if (placeholderValue) {
            errorMessage = errorMessage.replace("##DateFieldLabel##", placeholderValue)
              .replace("#", placeholderValue)
          }

          // Store the updated error message
          this.errorMessages[fieldName] = errorMessage;

          if (rpt) {
            rpt.errorMessages[fieldName] = errorMessage;
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


  // Supervision
  populateFirmRptClassificationTypes(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.firmRptClassificationTypes, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching FirmRptClassificationTypes options: ', error);
          observer.error(error);
        }
      );
    });
  }

  populateFirmRptClassificationTypesForDNFBPs(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.firmRptClassificationTypesForDNFBPs, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching FirmRptClassificationTypesForDNFBPs options: ', error);
          observer.error(error);
        }
      );
    });
  }

  populateFirmRptBasisTypes(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.firmRptBasisTypes, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching FirmRptBasisTypes options: ', error);
          observer.error(error);
        }
      );
    });
  }

  // Journal
  populateJournalEntryTypes(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.journalEntryTypes, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Journal Entry Types options: ', error);
          observer.error(error);
        }
      );
    });
  }


  populateJournalExternalAuditors(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.externalAuditors, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching External Auditors options: ', error);
          observer.error(error);
        }
      );
    });
  }

  // Enforcement Actions
  populateEnfActionsAuth(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.enfActionsAuth, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Enf Actions Auth options: ', error);
          observer.error(error);
        }
      );
    });
  }

  populateEnfActionsDNFBP(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.enfActionsDNFBP, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Enf Actions DNFBP options: ', error);
          observer.error(error);
        }
      );
    });
  }

  populateFirmTypes(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.firmTypes, OpTypeId).subscribe(
        data => {
          // Filter out the option with FirmTypeDesc "Licensed"
          const filteredResponse = data.response.filter(item => item.FirmTypeDesc !== "Licensed");

          observer.next(filteredResponse);
        },
        error => {
          console.error('Error Fetching Firm Types options: ', error);
          observer.error(error);
        }
      );
    });
  }

  populateFirmNamesAuthorised(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.authorisedFirmNames, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Firm Names Authorised options: ', error);
          observer.error(error);
        }
      );
    });
  }

  populateFirmNamesDNFBP(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.dnfbpsFirmNames, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Firm Names DNFBP options: ', error);
          observer.error(error);
        }
      );
    });
  }


  // Reporting Schedule
  populateFirmRptSubmissionTypes(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.firmRptSubmissionTypes, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Submission Types options: ', error);
          observer.error(error);
        }
      );
    });
  }

  populateReportTypes(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.reportDocTypes, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Report Types options: ', error);
          observer.error(error);
        }
      );
    });
  }

  populateNotRequiredTypes(userId: number, OpTypeId: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.firmRptNReqReasonTypes, OpTypeId).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Not Required Types options: ', error);
          observer.error(error);
        }
      );
    });
  }

  // Co-Supervisors (Top menu)
  getFunctionRoles(userId: number,OpType: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.firmUserAssnTypes, OpType).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Firm User Assn Types dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

  getCoSupervisorsUsers(userId: number,OpType: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.CoSupervisorsUsers, OpType).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Co-Supervisors users dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

  getReasons(userId: number,OpType: number): Observable<any[]> {
    return new Observable(observer => {
      this.securityService.getObjectTypeTable(userId, constants.firmUserAssnReasonTypes, OpType).subscribe(
        data => {
          observer.next(data.response);
        },
        error => {
          console.error('Error Fetching Reasons dropdown:', error);
          observer.error(error);
        }
      );
    });
  }

  isUserHasRestrictedAccess(userId: number, firmId: number, objectID: number): Observable<boolean> {
    return new Observable(observer => {
      this.userService.isUserHasRestrictedAccess(userId, firmId, objectID).subscribe(
        response => {
          observer.next(response.response.Column1);
          observer.complete();
        },
        error => {
          console.error('Error checking restricted access:', error);
          observer.error(error);
        }
      );
    });
  }


  isNullOrEmpty(value: any): boolean {
    return value === null || value === '' || value === "";
  }

  showPopupAlert(msgKey: number, isLoading: boolean, replacementText?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.logForm.errorMessages(msgKey).subscribe((response) => {
        let message = response.response;
        if (replacementText) {
          message = message.replace('#REPLACEMENTEXT#', replacementText);
        }

        Swal.fire({
          html: message,
          showCancelButton: true,
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          isLoading = false;
          resolve(result.isConfirmed);
        });
      });
    });
  }



}
