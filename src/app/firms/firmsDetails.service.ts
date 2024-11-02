import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { FirmService } from './firm.service'; // Assuming FirmService makes the HTTP call
import { DateUtilService } from '../shared/date-util/date-util.service';
import { LogformService } from '../ngServices/logform.service';
import Swal from 'sweetalert2';
import { SecurityService } from '../ngServices/security.service';
import * as constants from 'src/app/app-constants';
import { ApplicationService } from '../ngServices/application.service';
import { AddressesService } from '../ngServices/addresses.service';

@Injectable({
  providedIn: 'root',
})
export class FirmDetailsService {
  private isFirmLicensedSubject = new BehaviorSubject<boolean>(false);
  private isFirmAuthorisedSubject = new BehaviorSubject<boolean>(false);

  // Expose these as Observables to components
  isFirmLicensed$ = this.isFirmLicensedSubject.asObservable();
  isFirmAuthorised$ = this.isFirmAuthorisedSubject.asObservable();

  errorMessages: { [key: string]: string } = {};

  newAddress: any = {};

  currentDate = new Date();

  constructor(
    private firmService: FirmService,
    private dateUtilService: DateUtilService,
    private logForm: LogformService,
    private securityService: SecurityService,
    private applicationService: ApplicationService,
    private addressService: AddressesService
  ) { }

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
          observer.error('Error fetching firm details: ' + error);
        }
      );
    });
  }

  loadAssignedUserRoles(userId: number): Observable<any> {
    return new Observable(observer => {
      this.securityService.getUserRoles(userId).subscribe(
        data => {
          const assignedUserRoles = data.response;  // Process data if needed
          observer.next({ assignedUserRoles });
        },
        error => {
          observer.error('Error fetching assigned user roles: ' + error);
        }
      );
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  addNewAddressOnEditMode(targetArray: any[], allAddressTypes: any[], currentDate: string): { canAddNewAddress: boolean, newAddress: any } {
    const totalAddressTypes = allAddressTypes.length;
    const validAddressCount = targetArray.filter(addr => addr.Valid && !addr.isRemoved).length;

    if (validAddressCount >= totalAddressTypes) {
      return { canAddNewAddress: false, newAddress: null };
    }

    // Reset newAddress with default values
    this.newAddress = {
      AddressID: null,
      AddressTypeID: 0,
      AddressTypeDesc: '',
      AddressLine1: '',
      AddressLine2: '',
      AddressLine3: '',
      AddressLine4: '',
      City: '',
      Province: '',
      CountryID: 0,
      CountryName: '',
      PostalCode: '',
      PhoneNumber: '',
      FaxNumber: '',
      LastModifiedBy: 0,
      LastModifiedDate: currentDate,
      addressState: 2, // New entry state
      FromDate: null,
      ToDate: null,
      Valid: true,
    };

    targetArray.unshift(this.newAddress);

    const updatedValidAddressCount = targetArray.filter(addr => addr.Valid && !addr.isRemoved).length;
    return { canAddNewAddress: updatedValidAddressCount < totalAddressTypes, newAddress: this.newAddress };
  }

  removeAddressOnEditMode(index: number, targetArray: any[], totalAddressTypes: number, errorMessages: any): Promise<{ canAddNewAddress: boolean; updatedArray: any[] }> {
    return Swal.fire({
      text: 'Are you sure you want to delete this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        errorMessages = {}; // Reset error messages
        if (index > -1 && index < targetArray.length) {
          const address = targetArray[index];
          if (!address.AddressID) { // Check for newly added address
            // Remove directly if no AddressID
            targetArray.splice(index, 1);
          } else {
            // Mark existing address as removed
            address.isRemoved = true;
          }

          // Calculate the updated valid address count
          const validAddressCount = targetArray.filter(addr => addr.Valid && !addr.isRemoved).length;
          const canAddNewAddress = validAddressCount < totalAddressTypes;

          return { canAddNewAddress, updatedArray: targetArray };
        }
      }
      // Return the current state if the user cancels
      return { canAddNewAddress: true, updatedArray: targetArray };
    });
  }

  onSameAsTypeChangeOnEditMode(selectedTypeID: number, targetArray: any[], newAddress: any): void {
    const numericTypeID = Number(selectedTypeID);

    if (numericTypeID && numericTypeID !== 0) {
      const selectedAddress = targetArray.find(address => address.AddressTypeID === numericTypeID);
      if (selectedAddress) {
        this.populateNewAddressFieldsOnEditMode(selectedAddress, newAddress); // Directly populate newAddress
      }
    }
  }

  populateNewAddressFieldsOnEditMode(sourceAddress: any, targetAddress: any): void {
    Object.assign(targetAddress, {
      AddressLine1: sourceAddress.AddressLine1,
      AddressLine2: sourceAddress.AddressLine2,
      AddressLine3: sourceAddress.AddressLine2,
      AddressLine4: sourceAddress.AddressLine2,
      City: sourceAddress.City,
      CountryID: sourceAddress.CountryID,
      State: sourceAddress.State,
      ZipCode: sourceAddress.ZipCode,
      Province: sourceAddress.Province,
      PostalCode: sourceAddress.PostalCode,
      PhoneNumber: sourceAddress.PhoneNumber,
      FaxNumber: sourceAddress.FaxNumber
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  addNewAddressOnCreateMode(targetArray: any[], allAddressTypes: any[], currentDate: string) {

    const totalAddressTypes = allAddressTypes.length;

    if (targetArray.length > 0 && targetArray[targetArray.length - 1].AddressTypeID === 0) {
      return; // Exit without adding if the last added address has AddressTypeID of 0
  }

    // Ensure there are unused address types
    if (targetArray.length < totalAddressTypes) {
      // Ensure the last added address is marked as selected
      if (targetArray.length > 0) {
        targetArray[targetArray.length - 1].isAddressTypeSelected = true;
      }

      const newAddress = {
        AddressID: null,
        AddressTypeID: 0, // Default value, ensuring it's not selected yet
        AddressTypeDesc: '',
        AddressLine1: '',
        AddressLine2: '',
        AddressLine3: '',
        AddressLine4: '',
        City: '',
        Province: '',
        CountryID: 0,
        CountryName: '',
        PostalCode: '',
        PhoneNum: '',
        FaxNum: '',
        LastModifiedBy: 0,
        LastModifiedDate: currentDate,
        addressState: 0,
        FromDate: null,
        ToDate: null,
        Valid: true,
        isAddressTypeSelected: false // Initially false
      };

      targetArray.unshift(newAddress); // Add new address at the beginning
      this.checkCanAddNewAddressOnCreateMode(targetArray, allAddressTypes); // Re-evaluate if more addresses can be added
    }
  }

  checkCanAddNewAddressOnCreateMode(targetArray: any[], allAddressTypes: any[]): { canAddNewAddressOnCreate: boolean, isAllAddressesAddedOnCreate: boolean } {
    const totalAddressTypes = allAddressTypes.length;

    // Check if all addresses have a selected AddressTypeID
    const allTypesSelected = targetArray.every(address => address.AddressTypeID !== 0);

    // Calculate flags based on conditions
    const canAddNewAddressOnCreate = allTypesSelected && targetArray.length < totalAddressTypes;
    const isAllAddressesAddedOnCreate = targetArray.length >= totalAddressTypes;

    return { canAddNewAddressOnCreate, isAllAddressesAddedOnCreate };
  }

  removeAddressOnCreateMode(index: number, targetArray: any[], allAddressTypes: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (targetArray.length > 1) {
        Swal.fire({
          text: 'Are you sure you want to delete this record?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ok',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            targetArray.splice(index, 1);
            this.checkCanAddNewAddressOnCreateMode(targetArray, allAddressTypes);
            resolve();
          } else {
            reject('Operation canceled by user');
          }
        });
      } else {
        reject('Minimum one address is required');
      }
    });
  }


  onSameAsTypeChangeOnCreateMode(selectedTypeID: any, index: number, targetArray: any[]) {
    const numericTypeID = Number(selectedTypeID); // Convert the selected value to a number
    const currentAddress = targetArray[index];

    if (!currentAddress) {
      console.error('No current address found at index:', index);
      return;
    }

    if (numericTypeID && numericTypeID != 0) {
      // Find the selected address from the list
      const selectedAddress = targetArray.find(address => address.AddressTypeID == numericTypeID);
      if (selectedAddress) {
        this.populateNewAddressFieldsOnCreateMode(currentAddress, selectedAddress);
        currentAddress.isFieldsDisabled = true; // Disable the fields for the current address
      }
    } else {
      // If 'Select' is chosen, enable the address fields
      currentAddress.isFieldsDisabled = false;
    }
  }

  // Updated to accept the target address to populate fields for
  populateNewAddressFieldsOnCreateMode(targetAddress: any, sourceAddress: any) {
    targetAddress.AddressLine1 = sourceAddress.AddressLine1;
    targetAddress.AddressLine2 = sourceAddress.AddressLine2;
    targetAddress.AddressLine3 = sourceAddress.AddressLine3;
    targetAddress.AddressLine4 = sourceAddress.AddressLine4;
    targetAddress.City = sourceAddress.City;
    targetAddress.CountryID = sourceAddress.CountryID;
    targetAddress.State = sourceAddress.State;
    targetAddress.ZipCode = sourceAddress.ZipCode;
    targetAddress.Province = sourceAddress.Province;
    targetAddress.PostalCode = sourceAddress.PostalCode;
    targetAddress.PhoneNum = sourceAddress.PhoneNum;
    targetAddress.FaxNum = sourceAddress.FaxNum;
  }

  getAvailableSameAsTypeOptionsOnCreateMode(index: number, targetArray: any[]) {
    return targetArray.filter((address, i) => i !== index && address.AddressTypeID !== 0);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Added by Moe
  loadFirmAddresses(firmId: number): Observable<any> {
    return new Observable(observer => {
      this.addressService.getCoreFirmAddresses(firmId).subscribe(
        data => {
          const firmAddresses = data.response;
          observer.next({ firmAddresses });
        },
        error => {
          observer.error('Error fetching firm addresses: ' + error);
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





  getErrorMessages(fieldName: string, msgKey: number, activity?: any, customMessage?: string, placeholderValue?: string): Observable<void> {
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
