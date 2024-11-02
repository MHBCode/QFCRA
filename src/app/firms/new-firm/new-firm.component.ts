import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import flatpickr from 'flatpickr';
import * as constants from 'src/app/app-constants';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import { FirmService } from '../firm.service';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';

@Component({
  selector: 'new-firm',
  templateUrl: './new-firm.component.html',
  styleUrls: ['./new-firm.component.scss']
})
export class NewFirmComponent implements OnInit {
  showErrorAlert(messageKey: number) {
    this.logForm.errorMessages(messageKey).subscribe(
      (response) => {
        Swal.fire({
          text: response.response,
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      },
    );
  }

  showFirmDetailsSaveSuccessAlert(messageKey: number) {
    this.logForm.errorMessages(messageKey).subscribe(
      (response) => {
        Swal.fire({
          title: 'Success!',
          text: response.response,
          icon: 'success',
          confirmButtonText: 'Ok',
        });
      },
    );
  }


  @ViewChildren('dateInputs') dateInputs: QueryList<ElementRef<HTMLInputElement>>;

  /* todays date */
  now = new Date();
  isoString = this.now.toISOString();

  /* collapse sections button */
  isCollapsed: { [key: string]: boolean } = {};

  /*dropdowns arrays*/
  allCountries: any = [];
  allQFCLicenseStatus: any = [];
  allAuthorisationStatus: any = [];
  allLegalStatus: any = [];
  allFinYearEnd: any = [];
  allFinAccStd: any = [];
  allFirmTypes: any = [];
  allAddressTypes: any = [];

  /* flags */
  hasValidationErrors: boolean = false;
  canAddNewAddress: boolean = true;
  disableAddressFields: boolean = false;
  isAllAddressesAdded: boolean;
  invalidAddress: boolean;
  /* Firm Details Object */
  FirmDetails = {
    FirmName: '',
    QFCNum: '',
    Code: '',
    LegalStatusTypeID: 0,
    QFCTradingName: '',
    PrevTradingName: '',
    PlaceOfIncorporation: '',
    CountyOfIncorporation: 0,
    DifferentIncorporationDate: null,
    IncorporationDate: null,
    FinYearEndID: 0,
    FinYearEndEffectiveDate: null,
    AccStdID: 0,
    AccStdEffectiveDate: null,
    WebsiteLink: '',
    FirmLicApplDate: this.isoString,
    FirmAuthApplDate: this.isoString
  };

  /* Application Details Object */
  applicationDetails = {
    selectedFirmTypeID: 0,
    LicenseStatusTypeID: 0,
    AuthorisationStatusTypeID: 0,
    dateOfApplication: null,
    LicensedDate: null,
    AuthorizationDate: null,
    firmApplDate: null,
  };

  /* Comments Object */
  comments = {
    FirmApplicationDataComments: '',
    PublicRegisterComments: '',
  };

  /* Application Details */
  selectedFirmTypeID: number;
  QFCDateApplicationLabel: string = 'Date Application';


  /* Addresses */
  newAddress: any = {};
  addedAddresses: any = [];

  /* error messages */
  errorMessages: { [key: string]: string } = {};

  constructor(
    private firmService: FirmService,
    private securityService: SecurityService,
    private logForm: LogformService,
    private router: Router,
    private flatpickrService: FlatpickrService) { }


  ngOnInit(): void {
    this.populateLegalStatus();
    this.populateCountries();
    this.populateFinYearEnd();
    this.populateFinAccStd();
    this.populateFirmAppTypes();
    this.populateQFCLicenseStatus();
    this.populateAuthorisationStatus();
    this.populateAddressTypes();
    this.onPageload();
  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }

  onPageload(): void {
    // Set default selected values
    this.selectedFirmTypeID = 2;
    this.applicationDetails.LicenseStatusTypeID = constants.FirmLicenseApplStatusType.Application;
    this.applicationDetails.AuthorisationStatusTypeID = constants.FirmAuthorizationApplStatusType.Application;
    // Set default dates to today's date
    let formattedDate = this.formatDateToCustomFormat(this.isoString);
    this.applicationDetails.dateOfApplication = formattedDate;
    this.applicationDetails.LicensedDate = formattedDate;
    this.applicationDetails.AuthorizationDate = formattedDate;
    this.onLicenseStatusChange(this.applicationDetails.LicenseStatusTypeID);
  }

  createFirm() {
    const userId = 30;
    this.hasValidationErrors = false;

    // QFC VALIDATION SPECIAL CASES
    if (this.FirmDetails.QFCNum) {
      this.FirmDetails.QFCNum = this.padNumber(this.FirmDetails.QFCNum);
    }
    
    if (this.selectedFirmTypeID === 2 && this.applicationDetails.LicenseStatusTypeID === constants.FirmLicenseApplStatusType.Licensed) {
      if (this.FirmDetails.QFCNum == null || this.FirmDetails.QFCNum === '') {
        this.getErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.ENTER_QFCNUMBER);
        this.hasValidationErrors = true;
      }
    }

    if (this.selectedFirmTypeID === 3 && this.applicationDetails.AuthorisationStatusTypeID === constants.FirmAuthorizationApplStatusType.Authorised) {
      if (this.FirmDetails.QFCNum == null || this.FirmDetails.QFCNum === '') {
        this.getErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.ENTER_QFCNUMBER);
        this.hasValidationErrors = true;
      }
    }

    // Validate QFC Number
    this.validateQFCNum().then(() => {
      return this.validateFirmName();
    }).then(() => {
      // Continue with the rest of the validations only after QFC validation is complete
      // FIRM NAME VALIDATION
      this.FirmDetails.FirmName = this.FirmDetails.FirmName.trim();
      if (!this.FirmDetails.FirmName) {
        this.getErrorMessages('FirmName', constants.Firm_CoreDetails_Messages.ENTER_FIRMNAME);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['FirmName'];
      }

      // QFC VALIDATION
      if (this.FirmDetails.QFCNum) {
        this.FirmDetails.QFCNum = this.padNumber(this.FirmDetails.QFCNum);
      }

      // LEGAL STATUS VALIDATION
      if (this.FirmDetails.LegalStatusTypeID == 0) {
        this.getErrorMessages('LegalStatusTypeID', constants.Firm_CoreDetails_Messages.ENTER_LEGAL_STATUS);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['LegalStatusTypeID'];
      }

      // APPLICATION DETAILS SECTION VALIDATION
      if (!this.applicationDetails.dateOfApplication) {
        this.getErrorMessages('DateOfApplication', constants.Firm_CoreDetails_Messages.ENTER_DATE_OF_APPLICATION);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['DateOfApplication'];
      }

      if (!this.applicationDetails.LicensedDate) {
        this.getErrorMessages('LicensedDate', constants.FirmActivitiesEnum.ENTER_VALID_DATE, "QFC License Status date");
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['LicensedDate'];
      }

      if (!this.applicationDetails.AuthorizationDate && this.selectedFirmTypeID === 3) {
        this.getErrorMessages('AuthorisationDate', constants.FirmActivitiesEnum.ENTER_VALID_DATE, "Authorisation Status date");
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['AuthorisationDate'];
      }

      // ADDRESS TYPE VALIDATION
      this.invalidAddress = this.addedAddresses.find(address => !address.AddressTypeID || address.AddressTypeID === 0);
      if (this.invalidAddress) {
        this.getErrorMessages('AddressTypeID', constants.AddressControlMessages.SELECT_ADDRESSTYPE);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['AddressTypeID'];
      }

      this.setAdditionalFirmDetails();

      // Step 2: Handle Validation Errors
      if (this.hasValidationErrors) {
        this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
        return; // Prevent further action if validation fails
      }

      // Step 3: Create New Firm (Save)
      const firmObj = this.prepareFirmObject(userId);
      this.saveFirmDetails(firmObj, userId);
      this.showFirmDetailsSaveSuccessAlert(constants.Firm_CoreDetails_Messages.FIRMDETAILS_SAVED_SUCCESSFULLY);
    })
  }

  // Function to set additional firm details
  setAdditionalFirmDetails() {
    if (this.selectedFirmTypeID === 3) {
      this.applicationDetails.firmApplDate = this.formatDateToCustomFormat(this.FirmDetails.FirmAuthApplDate)

    } else if (this.selectedFirmTypeID === 2) {
      this.applicationDetails.firmApplDate = this.formatDateToCustomFormat(this.FirmDetails.FirmLicApplDate)
      this.applicationDetails.AuthorisationStatusTypeID = 0;
      this.applicationDetails.AuthorizationDate = null;
    }

    if (
      this.FirmDetails.LegalStatusTypeID === 1 ||
      this.FirmDetails.LegalStatusTypeID === 2 ||
      this.FirmDetails.LegalStatusTypeID === 7 ||
      this.FirmDetails.LegalStatusTypeID === 8
    ) {
      this.FirmDetails.PlaceOfIncorporation = constants.PLACE_OF_INCORPORATION_QFC;
    }

    if (this.selectedFirmTypeID === 2) { // Licensed firm type
      if (this.applicationDetails.LicenseStatusTypeID === constants.FirmLicenseApplStatusType.Application) {
        this.applicationDetails.LicensedDate = this.applicationDetails.firmApplDate;
      } else {
        this.applicationDetails.LicensedDate = this.applicationDetails.LicensedDate;
        this.applicationDetails.AuthorizationDate = null;
      }
    }
  }


  // Function to prepare the firm object for saving
  prepareFirmObject(userId: number) {
    return {
      firmDetails: {
        firmID: 0,
        firmName: this.FirmDetails.FirmName,
        qfcNumber: this.FirmDetails.QFCNum,
        firmCode: this.FirmDetails.Code,
        legalStatusTypeID: this.FirmDetails.LegalStatusTypeID,
        qfcTradingName: this.FirmDetails.QFCTradingName,
        prevTradingName: this.FirmDetails.PrevTradingName,
        placeOfIncorporation: this.FirmDetails.PlaceOfIncorporation,
        countyOfIncorporation: this.FirmDetails.CountyOfIncorporation || 0,
        webSiteAddress: this.FirmDetails.WebsiteLink,
        firmApplDate: this.convertDateToYYYYMMDD(this.applicationDetails.firmApplDate),
        firmApplTypeID: this.selectedFirmTypeID,
        licenseStatusTypeID: this.applicationDetails.LicenseStatusTypeID,
        licensedDate: this.convertDateToYYYYMMDD(this.applicationDetails.LicensedDate),
        authorisationStatusTypeID: this.applicationDetails.AuthorisationStatusTypeID || 0,
        authorisationDate: this.convertDateToYYYYMMDD(this.applicationDetails.AuthorizationDate),
        createdBy: userId,
        finYearEndTypeID: this.FirmDetails.FinYearEndID || 0,
        firmAccountingDataID: 0,
        firmApplicationDataComments: this.comments.FirmApplicationDataComments || '',
        firmYearEndEffectiveFrom: this.convertDateToYYYYMMDD(this.FirmDetails.FinYearEndEffectiveDate) || null,
        finAccStandardTypeID: this.FirmDetails.AccStdID || 0,
        finAccStandardID: 0, 
        firmAccountingEffectiveFrom: this.convertDateToYYYYMMDD(this.FirmDetails.AccStdEffectiveDate) || null,
        dateOfIncorporation: this.convertDateToYYYYMMDD(this.FirmDetails.IncorporationDate),
        differentIncorporationDate: this.FirmDetails.DifferentIncorporationDate == null ? false : this.FirmDetails.DifferentIncorporationDate,
        firmNameAsinFactSheet: this.FirmDetails.FirmName,
        requiresCoOp: '',
        prComments: this.comments.PublicRegisterComments || ''
      },
      addressList: this.addedAddresses.map(address => {
        return {
          firmID: 0,
          countryID: Number(address.CountryID) || 0,
          addressTypeID: address.AddressTypeID || 0,
          sameAsTypeID: address.SameAsTypeID || null,
          lastModifiedBy: userId, // must be dynamic
          addressAssnID: address.AddressAssnID || null,
          entityTypeID: address.EntityTypeID || 1,
          entityID: address.EntityID || 0,
          addressID: address.AddressID?.toString() || '',
          addressLine1: address.AddressLine1 || '',
          addressLine2: address.AddressLine2 || '',
          addressLine3: address.AddressLine3 || '',
          addressLine4: address.AddressLine4 || '',
          city: address.City || '',
          province: address.Province || '',
          postalCode: address.PostalCode || '',
          phoneNumber: address.PhoneNum || '',
          phoneExt: address.PhoneExt || '',
          faxNumber: address.FaxNum || '',
          lastModifiedDate: address.LastModifiedDate || this.isoString, // Default to current date
          addressState: 2, // New address state is 2
          fromDate: address.FromDate || null,
          toDate: address.ToDate || null,
          objectID: address.ObjectID || 521,
          objectInstanceID: address.ObjectInstanceID || 0,
          objectInstanceRevNumber: address.ObjectInstanceRevNum || 1,
          sourceObjectID: address.SourceObjectID || 521,
          sourceObjectInstanceID: address.SourceObjectInstanceID || 0,
          sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNum || 1,
          objAis: null,
        };
      }),
      objFirmNameHistory: null
    };
  }

  // Function to save firm details
  saveFirmDetails(firmObj: any, userId: number) {
    console.log("Final firm object to be sent:", firmObj);

    this.firmService.editFirm(userId, firmObj).subscribe(
      response => {
        console.log('Row edited successfully:', response);
        // Once the firm is successfully saved, fetch the last created firm
        this.firmService.getAllFirms().subscribe(
          response => {
            console.log('Firms Response:', response);
            let Allfirms = response.response; // Cast to the appropriate type
            console.log(Allfirms);
            // Sort firms by FirmID in descending order to get the latest firm
            const lastCreatedFirm = Allfirms.sort((a, b) => b.FirmID - a.FirmID)[0];
            // Navigate to the view-firm page with the last created firm's ID
            this.router.navigate([`home/view-firm/${lastCreatedFirm.FirmID}`]);
          },
          error => {
            console.error('Error fetching firms:', error);
          }
        );
      },
      error => {
        console.error('Error editing row:', error);
      }
    );
  }


  cancelFirm() {
    // this.FirmDetails = {};
    this.errorMessages = {}
    this.resetCollapsibleSections();
    this.router.navigate(['/firms']);
  }

  // Function to reset the collapsible sections
  resetCollapsibleSections() {
    this.isCollapsed['firmDetailsSection'] = false;
    this.isCollapsed['appDetailsSection'] = false;
    this.isCollapsed['pressReleaseSection'] = false;
    this.isCollapsed['commentsSection'] = false;
    this.isCollapsed['addressesSection'] = false;
  }

  onLegalStatusChange(value: number) {
    this.FirmDetails.LegalStatusTypeID = value;
    if (value == 1 || value == 2 || value == 7 || value == 8) {
      this.FirmDetails.PlaceOfIncorporation = constants.PLACE_OF_INCORPORATION_QFC;
    } else {
      this.FirmDetails.PlaceOfIncorporation = '';
    }
  }

  onFirmAppTypeChange(selectedFirmTypeID: number) {
    if (selectedFirmTypeID == 2) {
      this.selectedFirmTypeID = 2;
    } else {
      if (selectedFirmTypeID == 3) {
        this.selectedFirmTypeID = 3;
        this.applicationDetails.AuthorisationStatusTypeID = constants.FirmAuthorizationApplStatusType.Application
        this.applicationDetails.AuthorizationDate = this.applicationDetails.dateOfApplication;
      }
    }
  }

  onDateOfApplicationChange(newDate: string) {
    if (newDate) {
      // Update dates based on the new date of application
      if (this.selectedFirmTypeID === 2 && this.applicationDetails.LicenseStatusTypeID == constants.FirmLicenseApplStatusType.Application) {
        this.applicationDetails.dateOfApplication = newDate;
        this.applicationDetails.LicensedDate = newDate;
      } else if (this.selectedFirmTypeID === 3 && this.applicationDetails.AuthorisationStatusTypeID == constants.FirmAuthorizationApplStatusType.Application) {
        this.applicationDetails.dateOfApplication = newDate;
        this.applicationDetails.AuthorizationDate = newDate;

        // Update LicensedDate only if LicenseStatusTypeID is "Application"
        if (this.applicationDetails.LicenseStatusTypeID == constants.FirmLicenseApplStatusType.Application) {
          this.applicationDetails.LicensedDate = newDate;
        }
      }
    } else {
      // If the date of application is cleared, set the related dates to null
      this.applicationDetails.dateOfApplication = null;

      if (this.selectedFirmTypeID === 2) {
        this.applicationDetails.LicensedDate = null;
      } else if (this.selectedFirmTypeID === 3) {
        this.applicationDetails.AuthorizationDate = null;
        this.applicationDetails.LicensedDate = null; // Clear LicensedDate only if it was linked to the application date
      }
    }
  }

  onLicenseStatusChange(selectedValue: number) {
    // Find the selected option based on the value passed in
    const selectedOption = this.allQFCLicenseStatus.find(option => option.FirmApplStatusTypeID == selectedValue);

    if (selectedOption) {
      this.QFCDateApplicationLabel = `Date ${selectedOption.FirmApplStatusTypeDesc}`;
    }

    if (selectedOption.FirmApplStatusTypeID == constants.FirmLicenseApplStatusType.Application) {
      this.applicationDetails.LicensedDate = this.applicationDetails.dateOfApplication;
    }
  }

  toggleCollapse(section: string) {
    this.isCollapsed[section] = !this.isCollapsed[section];
  }

  populateCountries() {
    this.securityService.getObjectTypeTable(constants.countries).subscribe(data => {
      this.allCountries = data.response;
    }, error => {
      console.error('Error Fetching Countries dropdown: ', error);
    })
  }

  populateLegalStatus() {
    this.securityService.getObjectTypeTable(constants.legalStatus).subscribe(data => {
      this.allLegalStatus = data.response;
    }, error => {
      console.error('Error Fetching Legal Status dropdown: ', error);
    })
  }

  populateQFCLicenseStatus() {
    this.securityService.getObjectTypeTable(constants.qfcLicenseStatus).subscribe(data => {
      this.allQFCLicenseStatus = data.response;
    }, error => {
      console.error('Error Fetching QFC License Status dropdown: ', error);
    })
  }

  populateAuthorisationStatus() {
    this.securityService.getObjectTypeTable(constants.authorisationStatus).subscribe(data => {
      this.allAuthorisationStatus = data.response;
    }, error => {
      console.error('Error Fetching Authorisation Status dropdown: ', error);
    })
  }

  populateFinYearEnd() {
    this.securityService.getObjectTypeTable(constants.FinYearEnd).subscribe(data => {
      this.allFinYearEnd = data.response;
    }, error => {
      console.error('Error Fetching Fin Year End dropdown: ', error);
    })
  }

  populateFinAccStd() {
    this.securityService.getObjectTypeTable(constants.FinAccStd).subscribe(data => {
      this.allFinAccStd = data.response;
    }, error => {
      console.error('Error Fetching Fin Acc Std dropdown: ', error);
    })
  }

  populateFirmAppTypes() {
    this.securityService.getObjectTypeTable(constants.firmAppTypes).subscribe(data => {
      this.allFirmTypes = data.response;
    }, error => {
      console.error('Error Fetching Firm Application Types dropdown: ', error);
    })
  }

  populateAddressTypes() {
    this.securityService.getObjectTypeTable(constants.addressTypes).subscribe(data => {
      this.allAddressTypes = data.response;
      // Add an address if none exists
      if (this.addedAddresses.length === 0) {
        this.addNewAddress();
      }
      console.log('Added Addresses', this.addedAddresses);
      this.checkCanAddNewAddress();
    }, error => {
      console.error('Error Fetching Address Types dropdown: ', error);
    })
  }

  addNewAddress() {
    const totalAddressTypes = this.allAddressTypes.length;

    // Ensure there are unused address types
    if (this.addedAddresses.length < totalAddressTypes) {
      // Ensure the last added address is marked as selected
      if (this.addedAddresses.length > 0) {
        this.addedAddresses[this.addedAddresses.length - 1].isAddressTypeSelected = true;
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
        LastModifiedDate: this.isoString,
        addressState: 0,
        FromDate: null,
        ToDate: null,
        Valid: true,
        isAddressTypeSelected: false // Initially false
      };

      this.addedAddresses.unshift(newAddress); // Add new address at the beginning
      this.checkCanAddNewAddress(); // Re-evaluate if more addresses can be added
    }
  }

  checkCanAddNewAddress() {
    const totalAddressTypes = this.allAddressTypes.length;

    // Check if all addedAddresses have a selected AddressTypeID
    const allTypesSelected = this.addedAddresses.every(address => address.AddressTypeID !== 0);

    // Enable "Add Address" button only if all types are selected and there are unused address types
    this.canAddNewAddress = allTypesSelected && this.addedAddresses.length < totalAddressTypes;
    this.isAllAddressesAdded = this.addedAddresses.length >= totalAddressTypes;
  }

  onAddressTypeChange(event: any, index: number) {
    const selectedTypeID = Number(event.target.value); // Convert the selected value to a number
    const currentAddress = this.addedAddresses[index];

    if (!currentAddress) {
      console.error('No current address found at index:', index);
      return;
    }

    // Check if the selected type is already in use by another address
    const isDuplicate = this.addedAddresses.some((address, i) => {
      return i !== index && address.AddressTypeID === selectedTypeID;
    });

    if (isDuplicate) {
      // Show an alert message if a duplicate is found
      this.showErrorAlert(constants.AddressControlMessages.DUPLICATE_ADDRESSTYPES);

      // Reset the dropdown to default ("Select" option)
      event.target.value = "0";
      currentAddress.AddressTypeID = 0;  // Also reset the AddressTypeID in the model
      currentAddress.AddressTypeDesc = ''; // Reset the description as well
    } else {
      // If not a duplicate, update the current address
      const selectedAddressType = this.allAddressTypes.find(type => type.AddressTypeID === selectedTypeID);
      if (selectedAddressType) {
        currentAddress.AddressTypeID = selectedAddressType.AddressTypeID;
        currentAddress.AddressTypeDesc = selectedAddressType.AddressTypeDesc;
      }
      currentAddress.isAddressTypeSelected = true; // Disable the dropdown after selection
    }

    // Check if the "Add Address" button should be enabled
    this.checkCanAddNewAddress();
  }

  removeAddress(index: number) {
    if (this.addedAddresses.length > 1) {
      Swal.fire({
        text: 'Are you sure you want to delete this record?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.addedAddresses.splice(index, 1);
          this.checkCanAddNewAddress();
        }
      });
    }
  }

  onSameAsTypeChange(selectedTypeID: any, index: number) {
    const numericTypeID = Number(selectedTypeID); // Convert the selected value to a number
    const currentAddress = this.addedAddresses[index];

    if (!currentAddress) {
      console.error('No current address found at index:', index);
      return;
    }

    if (numericTypeID && numericTypeID != 0) {
      // Find the selected address from the list
      const selectedAddress = this.addedAddresses.find(address => address.AddressTypeID == numericTypeID);
      if (selectedAddress) {
        this.populateNewAddressFields(currentAddress, selectedAddress);
        currentAddress.isFieldsDisabled = true; // Disable the fields for the current address
      }
    } else {
      // If 'Select' is chosen, enable the address fields
      currentAddress.isFieldsDisabled = false;
    }
  }

  // Updated to accept the target address to populate fields for
  populateNewAddressFields(targetAddress: any, sourceAddress: any) {
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

  getAvailableSameAsTypeOptions(index: number) {
    return this.addedAddresses.filter((address, i) => i !== index && address.AddressTypeID !== 0);
  }

  padNumber(value: string): string {
    const strValue = value.toString();
    return strValue.padStart(5, '0'); // Ensure the value has a length of 5 digits
  }

  validateQFCNum(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.FirmDetails.QFCNum) {
        if (!this.isPositiveNonDecimal(this.FirmDetails.QFCNum)) {
          this.getErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.INVALID_QFCNUMBER);
          this.hasValidationErrors = true;
          resolve(); // Proceed with validation, but hasValidationErrors is true
        } else {
          this.isQFCNumExist(this.FirmDetails.QFCNum).then(isExist => {
            if (isExist) {
              this.getErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.QFCNUMBEREXISTS);
              this.hasValidationErrors = true;
            } else {
              delete this.errorMessages['QFCNum'];
            }
            resolve(); // Proceed with validation
          }).catch(error => {
            console.error('Error checking QFC number existence', error);
            this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
            this.hasValidationErrors = true;
            resolve(); // Proceed with validation, but hasValidationErrors is true
          });
        }
      } else {
        resolve(); // If no QFCNum, proceed with validation
        delete this.errorMessages['QFCNum'];
      }
    });
  }

  validateFirmName(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.FirmDetails.FirmName) {
        this.isFirmNameExist(this.FirmDetails.FirmName).then(isExist => {
          if (isExist) {
            this.getErrorMessages('FirmName', constants.Firm_CoreDetails_Messages.FIRMEXIST);
            this.hasValidationErrors = true;
          } else {
            delete this.errorMessages['FirmName'];
          }
          resolve(); // Proceed with validation
        }).catch(error => {
          console.error('Error checking Firm name existence', error);
          this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
          this.hasValidationErrors = true;
          resolve(); // Proceed with validation, but hasValidationErrors is true
        });
      } else {
        resolve(); // If no Firm Name, proceed with validation
      }
    });
  }

  isPositiveNonDecimal(value: string): boolean {
    const regex = /^[0-9][0-9]*$/;
    return regex.test(value);
  }

  isQFCNumExist(qfcNum: string): Promise<boolean> {
    return this.firmService.isQFCNumExistForNewFirm(qfcNum).toPromise().then(response => {
      return response.response.Column1 === 1;
    });
  }

  isFirmNameExist(firmName: string): Promise<boolean> {
    return this.firmService.isFirmNameExistForNewFirm(firmName).toPromise().then(response => {
      return response.response.Column1 === 1;
    });
  }

  formatDateToCustomFormat(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  convertDateToYYYYMMDD(dateStr: string | Date): string | null {

    if (!dateStr) {
      return null; // Return null if the input is invalid or empty
    }
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    if (isNaN(date.getTime())) {
      console.error('Invalid date format:', dateStr);
      return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');

    // Only return the date in YYYY-MM-DD format, stripping the time part
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  }

  getErrorMessages(fieldName: string, msgKey: number, placeholderValue?: string) {
    this.logForm.errorMessages(msgKey).subscribe(
      (response) => {
        let errorMessage = response.response;
        // If a placeholder value is provided, replace the placeholder with the actual value
        if (placeholderValue) {
          errorMessage = errorMessage.replace("#Date#", placeholderValue).replace("##DateFieldLabel##", placeholderValue).replace("#ApplicationDate#", placeholderValue);
        }
        this.errorMessages[fieldName] = errorMessage;
      },
      (error) => {
        console.error(`Failed to load error message for ${fieldName}.`, error);
      }
    );
  }
}


