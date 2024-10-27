import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from 'src/app/ngServices/security.service';
import { FirmService } from '../firm.service';
import { AddressesService } from 'src/app/ngServices/addresses.service';
import * as constants from 'src/app/app-constants';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { ApplicationService } from 'src/app/ngServices/application.service';
import { FirmDetailsService } from '../firmsDetails.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import Swal from 'sweetalert2';
import { LogformService } from 'src/app/ngServices/logform.service';

@Component({
  selector: 'app-core-details',
  templateUrl: './core-details.component.html',
  styleUrls: ['./core-details.component.scss', '../firms.scss']
})
export class CoreDetailsComponent implements OnInit {
  errorMessages: { [key: string]: string } = {};
  activity: any = { errorMessages: {} };
  controlsPermissions: any = [];
  firmId: number = 0;
  isLoading: boolean = false;
  firmAddresses: any = [];
  existingAddresses: any = [];
  isEditModeCore: boolean = false;
  objectOpType = constants.ObjectOpType.View;
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;
  isFirmLicensed: boolean;
  isFirmAuthorised: boolean;
  ActivityLicensed: any = [{}];
  activeSection: string = 'Licensed';
  tabIndex: number = 0; // 0 for Licensed, 1 for Authorized
  isEditModeLicense: boolean = false;
  isEditModeAuth: boolean = false;
  ActivityAuth: any = [{}];
  firmDetails: any;
  hasValidationErrors: boolean = false;
  invalidAddress: boolean;
  invalidActivity: boolean;
  isUserAllowed: boolean | null = null;
  formattedLicenseApplStatusDate: any;
  formattedAuthApplStatusDate: any;
  firmNamesHistory: any = [];
  selectedFirmTypeID: number;
  firmAppDetailsCurrentLicensed: any;
  firmAppDetailsCurrentAuthorized: any;
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  Page = FrimsObject;
  userId = 30;
  loading: boolean;
  assignedUserRoles: any = [];
  isFirmAMLSupervisor: boolean = false;
  isFirmSupervisor: boolean = false;
  assignedLevelUsers: any = [];
  FIRMRA: any[] = [];
  dateOfApplication: any;
  isCollapsed: { [key: string]: boolean } = {};
  disableAddressFields: boolean = false;
  newAddress: any = {};
  allCountries: any = [];
  allAddressTypes: any = [];
  callAddressType: boolean = false;
  firmAddressesTypeHistory: any = [];
  canAddNewAddress: boolean = true;
  AuthorisationStatusTypeLabelDescFormatted: any;
  LicenseStatusTypeLabelDescFormatted: any;
  selectedFile: File | null = null;
  allAuthorisationStatus: any = [];
  allQFCLicenseStatus: any = [];
  licenseStatusDates: { [key: number]: string | null } = {};
  authorisationStatusDates: { [key: number]: string | null } = {};
  allFirmTypes: any = [];
  callAppDetails: boolean = false;
  firmAppDetailsLicensed: any[] = [];
  firmAppDetailsAuthorization: any[] = [];
  callPrevFirmName: boolean = false;
  allFinAccStd: any = [];
  firmAccountingStandardHistory: any = [];
  callAccStandard: boolean = false;
  allFinYearEnd: any = [];
  firmFYearHistory: any = [];
  callFYear: boolean = false;
  allLegalStatus: any = [];


  // Aicha : Document 
  callUploadDoc: boolean = false;
  fileError: string = '';

  constructor(
    private securityService: SecurityService,
    private router: Router,
    private route: ActivatedRoute,
    private firmService: FirmService,
    private addressService: AddressesService,
    private applicationService: ApplicationService,
    private firmDetailsService: FirmDetailsService,
    private dateUtilService: DateUtilService,
    private cdr: ChangeDetectorRef,
    private logForm: LogformService,
  ) {

  }

  ngOnInit(): void {
    this.firmService.scrollToTop();
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadFirmDetails(this.firmId);
      this.loadFirmAdresses();
      this.populateCountries();
      this.populateAddressTypes();
      this.populateQFCLicenseStatus();
      this.populateFirmAppTypes();
      this.populateFinAccStd();
      this.populateFinYearEnd();
      this.populateLegalStatus();
      this.loadCurrentAppDetails();
    })
  }

  loadFirmAdresses() {
    this.isLoading = true;
    this.addressService.getFirmAddresses(this.firmId).subscribe(
      data => {
        this.firmAddresses = data.response;
        this.isLoading = false;
      }, error => {
        console.error('Error Fetching Firm Addresses', error);
        this.isLoading = false;
      })
  }

  loadFirmDetails(firmId: number) {
    this.firmDetailsService.loadFirmDetails(firmId).subscribe(
      data => {
        debugger
        this.firmDetails = data.firmDetails;
        this.selectedFirmTypeID = this.firmDetails.AuthorisationStatusTypeID != 0 ? 3 : 2;
        this.dateOfApplication = this.firmDetails.AuthorisationStatusTypeID > 0 ? this.firmDetails.FirmAuthApplDate : this.firmDetails.FirmLicApplDate;
        this.formattedLicenseApplStatusDate = data.formattedLicenseApplStatusDate;
        this.formattedAuthApplStatusDate = data.formattedAuthApplStatusDate;
        this.AuthorisationStatusTypeLabelDescFormatted = data.AuthorisationStatusTypeLabelDescFormatted;
        this.LicenseStatusTypeLabelDescFormatted = data.LicenseStatusTypeLabelDescFormatted;

        this.applySecurityOnPage(this.Page.CoreDetail, this.isEditModeCore);
      },
      error => {
        console.error(error);
      }
    );
  }

  editFirm() {
    this.isLoading = true;
    this.existingAddresses = this.firmAddresses.filter(address => address.Valid);

    // If form is not in edit mode, toggle it to edit mode
    if (!this.isEditModeCore) {
      this.objectOpType = constants.ObjectOpType.Edit; //Not used
      this.isEditModeCore = true;
      this.applySecurityOnPage(this.Page.CoreDetail, this.isEditModeCore);
      this.isLoading = false;
      return;
    }
  }

  async saveFirm() {
    this.isLoading = true;
    // Start validations
    this.hasValidationErrors = false;
    // this.existingAddresses = this.firmAddresses.filter(address => address.Valid);
    // Synchronous firm-level validation checks
    this.validateFirmDetails(); // Perform existing validation logic synchronously

    // If validation errors exist, stop the process
    if (this.hasValidationErrors) {
      this.showError(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.isLoading = false;
      return;
    }

    try {
      // Perform asynchronous QFC number validation first
      await this.validateQFCNum();

      // If there were errors in QFC validation, stop further execution
      if (this.hasValidationErrors) {
        throw new Error('QFC validation failed');
      }

      // Perform async application date validation only if QFC validation passes
      await this.ApplicationDateValidationCheckDuplicates();

      // Check for validation errors after async validation
      if (this.hasValidationErrors) {
        throw new Error('Application date validation failed');
      }

      // Set additional firm details if all validations passed
      this.setAdditionalFirmDetails();

      // Check if there are any new validation errors
      if (this.hasValidationErrors) {
        this.showError(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
        this.isLoading = false;
        return;
      }

      // Prepare firm object and save the firm details
      const firmObj = this.prepareFirmObject(this.userId);
      this.saveFirmDetails(firmObj, this.userId);

      // Toggle off edit mode after saving
      this.isEditModeCore = false;
      this.applySecurityOnPage(this.Page.CoreDetail, this.isEditModeCore);
      this.isLoading = false;
    } catch (error) {
      if (error.message !== 'Cancelled by user') {
        console.error('Validation or Save Process failed:', error);
        this.showError(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
        this.isLoading = false;
      }
    }
  }


  getControlVisibility(controlName: string): boolean {
    const control = this.controlsPermissions.find(c => c.ControlName === controlName);
    return control ? control.ShowProperty === 1 : false;
  }

  getControlEnablement(controlName: string): boolean {
    const control = this.controlsPermissions.find(c => c.ControlName === controlName);
    return control ? control.EnableProperty === 1 : false;
  }

  applySecurityOnPage(objectId: FrimsObject, Mode: boolean) {
    this.maskCommandActionsControlsScope();
    this.loading = true;
    const currentOpType = Mode ? ObjectOpType.Edit : ObjectOpType.View;

    // Apply backend permissions for the current object (e.g., CoreDetail or Scope)
    this.applyAppSecurity(this.userId, objectId, currentOpType).then(() => {
      let firmType = this.firmDetails.FirmTypeID;


      if (this.assignedUserRoles) {
        const isMacroPrudentialGroup = this.assignedUserRoles.some(role => role.AppRoleId === 9013 || role.AppRoleId === 2005);
        if (isMacroPrudentialGroup) {
          this.loading = false;
          return;
        }
      }

      if (this.isFirmSupervisor) {
        this.loading = false;
        return; // No need to hide the button for Firm supervisor
      } else if (this.IsValidRSGMember()) {
        this.loading = false;
        return; // No need to hide the button for RSG Member
      } else if (this.isFirmAMLSupervisor || this.IsValidAMLDirector()) {
        if (firmType === 1) {
          this.hideActionButton(); // Hide button for AML Team
        }
      } else if (this.IsValidAMLSupervisor() && !this.IsAMLSupervisorAssignedToFirm()) {
        if (firmType === 1) {
          this.hideActionButton(); // Hide button if no AML supervisor is assigned
        }
      } else {
        this.hideActionButton(); // Default: hide the button
      }
      this.loading = false;
    });
  }

  applyAppSecurity(userId: number, objectId: number, OpType: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.securityService.getAppRoleAccess(userId, objectId, OpType).subscribe(
        (response) => {
          this.controlsPermissions = response.response;
          resolve(); // Resolve the promise after fetching data
        },
        (error) => {
          console.error('Error fetching app role access: ', error);
          reject(error); // Reject the promise if there's an error
        }
      );
    });
  }

  IsValidRSGMember(): boolean {
    if (this.assignedUserRoles) {
      return this.assignedUserRoles.some(role => role.AppRoleId === 5001);
    }
    return false;
  }

  isValidFirmAMLSupervisor(firmId: number, userId: number): void {
    this.securityService.isValidFirmAMLSupervisor(firmId, userId).subscribe((response) => {
      this.isFirmAMLSupervisor = response.response;
    });
  }

  IsValidAMLDirector(): boolean {
    if (this.assignedUserRoles) {
      return this.assignedUserRoles.some(role => role.AppRoleId === 2007);
    }
    return false;
  }

  IsValidAMLSupervisor(): boolean {
    if (this.assignedUserRoles) {
      return this.assignedUserRoles.some(role => role.AppRoleId === 3009);
    }
    return false;
  }

  IsAMLSupervisorAssignedToFirm(): boolean {
    if (this.assignedLevelUsers) {
      if (this.FIRMRA.length > 0) {
        return this.assignedLevelUsers.some(levelUser => levelUser.FirmUserAssnTypeID === 7 || levelUser.FirmUserAssnTypeID === 8 || levelUser.FirmUserAssnTypeID === 9)
      }
    }
    return false;
  }

  maskCommandActionsControlsScope() {
    this.hideCreateBtn = false;
    this.hideEditBtn = false;
    this.hideDeleteBtn = false;
    this.hideReviseBtn = false;
    if (this.tabIndex === 0) { //Licensed
      if (!(this.firmService.isNullOrEmpty(this.ActivityLicensed[0].FirmScopeID)) && this.ActivityLicensed[0].FirmScopeID) {
        this.hideCreateBtn = true;
      }
      if (this.firmDetails.LicenseStatusTypeID === constants.FirmLicenseApplStatusType.Application) {
        this.hideReviseBtn = true;
      }
      else if (!(this.isFirmLicensed)) {
        this.hideCreateBtn = true;
        this.hideEditBtn = true;
        this.hideDeleteBtn = true;
        this.hideReviseBtn = true;
      }
    }

    if (this.tabIndex === 1) { //Authorised
      if (!(this.firmService.isNullOrEmpty(this.ActivityAuth[0]?.FirmScopeID)) && this.ActivityAuth[0].FirmScopeID) {
        this.hideCreateBtn = true;
      }
      if (this.firmDetails.AuthorisationStatusTypeID === constants.FirmAuthorizationApplStatusType.Application) {
        this.hideReviseBtn = true;
      }
      else if (!(this.isFirmAuthorised)) {
        this.hideCreateBtn = true;
        this.hideEditBtn = true;
        this.hideDeleteBtn = true;
        this.hideReviseBtn = true;
      }
    }
    if (!this.hideCreateBtn) {
      this.hideEditBtn = true;
      this.hideDeleteBtn = true;
      this.hideReviseBtn = true;
    }
  }

  isNullOrEmpty(value) {
    return this.firmService.isNullOrEmpty(value);
  }
  hideActionButton() {
    this.hideEditBtn = true;
    this.hideSaveBtn = true;
    this.hideCancelBtn = true;
    this.hideCreateBtn = true;
    this.hideDeleteBtn = true;
    this.hideReviseBtn = true;
  }

  checkFirmAuthorisation() {
    this.applicationService.isFirmAuthorised(this.firmId).subscribe(
      (response) => {
        this.isFirmAuthorised = response.response;
      }, error => {
        console.error('Error checking firm authorisation:', error);
        this.isFirmLicensed = false;
      }
    )
  }

  validateFirmDetails() {
    // FIRM NAME VALIDATION
    this.firmDetails.FirmName = this.firmDetails.FirmName.trim();
    if (!this.firmDetails.FirmName) {
      this.loadErrorMessages('FirmName', constants.Firm_CoreDetails_Messages.ENTER_FIRMNAME);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['FirmName'];
    }

    // QFC VALIDATION SPECIAL CASES
    if (this.firmDetails.QFCNum) {
      this.firmDetails.QFCNum = this.firmDetailsService.padNumber(this.firmDetails.QFCNum);
    }

    if (this.selectedFirmTypeID === 2 && this.firmDetails.LicenseStatusTypeID === constants.FirmLicenseApplStatusType.Licensed) {
      if (!this.firmDetails.QFCNum) {
        this.loadErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.ENTER_QFCNUMBER);
        this.hasValidationErrors = true;
      }
    }

    if (this.selectedFirmTypeID === 3 && this.firmDetails.AuthorisationStatusTypeID === constants.FirmAuthorizationApplStatusType.Authorised) {
      if (!this.firmDetails.QFCNum) {
        this.loadErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.ENTER_QFCNUMBER);
        this.hasValidationErrors = true;
      }
    }

    // LEGAL STATUS VALIDATION
    if (this.firmDetails.LegalStatusTypeID == 0) {
      this.loadErrorMessages('LegalStatusTypeID', constants.Firm_CoreDetails_Messages.ENTER_LEGAL_STATUS);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['LegalStatusTypeID'];
    }

    // DATE OF INCORPORATION VALIDATION
    if (this.firmDetails.DifferentIncorporationDate && !this.firmDetails.DateOfIncorporation) {
      this.loadErrorMessages('DateOfIncorporation', constants.FirmActivitiesEnum.DATEOFINCORPORATION_ERROR); // Adjust the message key as needed
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['DateOfIncorporation'];
    }

    // FINANCIAL YEAR END EFFECTIVE FROM VALIDATION
    if (!this.firmDetails.FirmFinYearEndEffectiveFrom && this.firmDetails.FinYearEndTypeID > 0) {
      this.loadErrorMessages('FYearEndDate', constants.InvoicesMessages.INVALID_DATA, "Financial Year End Effective From");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['FYearEndDate'];
    }

    // ACCOUNTING STANDARDS EFFECTIVE FROM VALIDATION
    if (!this.firmDetails.FinAccStdTypeEffectiveFrom && this.firmDetails.FinAccStdTypeID > 0) {
      this.loadErrorMessages('AccStandDate', constants.InvoicesMessages.INVALID_DATA, "Accounting Standards Effective From");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['AccStandDate'];
    }

    // PREV. FIRM NAME EFFECTIVE TO VALIDATION
    if (this.firmNamesHistory[0]?.FirmNameHistoryID && (!this.firmNamesHistory[0].DateEffectiveTo)) {
      this.loadErrorMessages('PrevFirmNameEffectiveTo', constants.InvoicesMessages.INVALID_DATA, "Prev Firm Name Effective To");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['PrevFirmNameEffectiveTo'];
    }

    // APPLICATION DETAILS SECTION VALIDATION
    if (!this.dateOfApplication || this.dateOfApplication == '01/Jan/0001') {
      this.loadErrorMessages('DateOfApplication', constants.Firm_CoreDetails_Messages.ENTER_DATE_OF_APPLICATION);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['DateOfApplication'];
    }

    if (!this.formattedLicenseApplStatusDate) {
      this.loadErrorMessages('LicensedDate', constants.FirmActivitiesEnum.ENTER_VALID_DATE, "QFC License Status date");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['LicensedDate'];
    }

    if (!this.formattedAuthApplStatusDate) {
      this.loadErrorMessages('AuthorisationDate', constants.FirmActivitiesEnum.ENTER_VALID_DATE, "Authorisation Status date");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['AuthorisationDate'];
    }

    // ADDRESS TYPE VALIDATION
    this.invalidAddress = this.firmAddresses.find(address => !address.AddressTypeID || address.AddressTypeID === 0);
    if (this.invalidAddress) {
      this.loadErrorMessages('AddressTypeID', constants.AddressControlMessages.SELECT_ADDRESSTYPE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['AddressTypeID'];
    }
  }

  loadErrorMessages(fieldName: string, msgKey: number, activity?: any) {
    this.firmDetailsService.getErrorMessages(fieldName, msgKey, activity).subscribe(
      () => {
        console.log(`Error message for ${fieldName} loaded successfully`);
      },
      error => {
        console.error(`Error loading error message for ${fieldName}:`, error);
      }
    );
  }

  showError(messageKey: number) {
    this.firmDetailsService.showErrorAlert(messageKey, this.isLoading);
  }


  validateQFCNum(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.isEditModeCore) {
        // If not, toggle to edit mode and resolve the promise
        this.isEditModeCore = true;
        resolve();
        return;
      }
      if (this.firmDetails.QFCNum) {
        if (!this.isPositiveNonDecimal(this.firmDetails.QFCNum)) {
          this.loadErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.INVALID_QFCNUMBER);
          this.hasValidationErrors = true;
          resolve(); // Proceed with validation, but hasValidationErrors is true
        } else {
          this.isQFCNumExist(this.firmDetails.QFCNum, this.firmId).then(isExist => {
            if (isExist) {
              this.loadErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.QFCNUMBEREXISTS);
              this.hasValidationErrors = true;
            } else {
              delete this.errorMessages['QFCNum'];
            }
            resolve(); // Proceed with validation
          }).catch(error => {
            console.error('Error checking QFC number existence', error);
            this.showError(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
            this.hasValidationErrors = true;
            resolve(); // Proceed with validation, but hasValidationErrors is true
          });
        }
      } else {
        resolve(); // If no QFCNum, proceed with validation
      }
    });
  }

  isQFCNumExist(qfcNum: string, firmId: number): Promise<boolean> {
    return this.firmService.isQFCNumExist(qfcNum, firmId).toPromise().then(response => {
      return response.response.Column1 === 1;
    });
  }

  isPositiveNonDecimal(value: string): boolean {
    const regex = /^[0-9][0-9]*$/;
    return regex.test(value);
  }


  async ApplicationDateValidationCheckDuplicates(): Promise<void> {
    if (this.firmId) {
      let LicenceOrAuthorisation = 2; // 2 for Licensing
      let enteredLicenseStatusID = this.firmDetails.LicenseStatusTypeID;
      let enteredLicenseStatusName = this.firmDetails.LicenseStatusTypeDesc;
      let enteredLicenseDate = this.formattedLicenseApplStatusDate;

      // Perform License Validation and await the result
      const licenseValid = await this.performApplnStatusValidation(LicenceOrAuthorisation, enteredLicenseStatusID, enteredLicenseStatusName, enteredLicenseDate);
      if (!licenseValid) {
        throw new Error('License validation failed');
      }

      // Perform Authorization Validation
      LicenceOrAuthorisation = 3; // 3 for Authorization
      let enteredAuthorisationStatusID = this.firmDetails.AuthorisationStatusTypeID;
      let enteredAuthorisationStatusName = this.firmDetails.AuthorisationStatusTypeDesc;
      let enteredAuthorisationDate = this.formattedAuthApplStatusDate;

      const authorisationValid = await this.performApplnStatusValidation(LicenceOrAuthorisation, enteredAuthorisationStatusID, enteredAuthorisationStatusName, enteredAuthorisationDate);
      if (!authorisationValid) {
        throw new Error('Authorization validation failed');
      }
    }
  }


  setAdditionalFirmDetails() {
    if (this.firmDetails?.AuthorisationStatusTypeID > 0) {
      this.firmDetails.firmApplDate = this.firmDetails.FirmAuthApplDate
        ? this.dateUtilService.formatDateToCustomFormat(this.firmDetails.FirmAuthApplDate)
        : null;
    } else {
      this.firmDetails.firmApplDate = this.firmDetails.FirmLicApplDate
        ? this.dateUtilService.formatDateToCustomFormat(this.firmDetails.FirmLicApplDate)
        : null;
    }

    if (this.selectedFirmTypeID === 2) { // 2: Licensed for firm app type dropdown
      if (this.firmDetails.LicenseStatusTypeID === constants.FirmLicenseApplStatusType.Application) { // 4: Application option in QFC License Status (Core Details)
        this.formattedLicenseApplStatusDate = this.firmDetails.firmApplDate;
      } else {
        this.formattedLicenseApplStatusDate = this.formattedLicenseApplStatusDate;
      }
    }

    if (this.selectedFirmTypeID === 3) { // 3: Authorization for firm app type dropdown
      if (this.formattedLicenseApplStatusDate != null) {
        this.formattedLicenseApplStatusDate = this.formattedLicenseApplStatusDate;
      } else {
        if (this.formattedAuthApplStatusDate != null) {
          this.formattedLicenseApplStatusDate = this.formattedAuthApplStatusDate;
        } else {
          this.formattedLicenseApplStatusDate = null;
        }
      }
    }

  }

  performApplnStatusValidation(LicenceOrAuthorisation: number, enteredApplnStatusID: number, enteredApplnStatusName: string, enteredApplnStatusDate: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firmService.getFirmStatusValidation(this.firmId, enteredApplnStatusID, enteredApplnStatusDate, LicenceOrAuthorisation)
        .subscribe((response) => {
          if (response.isSuccess && response.response) {
            const { OldFirmApplStatusTypeDesc, OldFirmApplStatusDate, DuplicatePresentType } = response.response;

            if (DuplicatePresentType === 0) {
              resolve(true); // Validation passes
            } else {
              let msgKey: number;
              let placeholderValue: string = '';

              if (DuplicatePresentType === 1) {
                msgKey = (LicenceOrAuthorisation === 3)
                  ? constants.Firm_CoreDetails_Messages.SAME_AUTHORISATION_STATUS_ON_TWO_DATES
                  : constants.Firm_CoreDetails_Messages.SAME_LICENSED_STATUS_ON_TWO_DATES;
                placeholderValue = this.dateUtilService.formatDateToCustomFormat(OldFirmApplStatusDate);
              } else if (DuplicatePresentType === 2) {
                msgKey = (LicenceOrAuthorisation === 3)
                  ? constants.Firm_CoreDetails_Messages.TWO_AUTHORISATION_STATUS_ON_SAME_DATE
                  : constants.Firm_CoreDetails_Messages.TWO_LICENSED_STATUS_ON_SAME_DATE;
                placeholderValue = `${OldFirmApplStatusTypeDesc} and ${enteredApplnStatusName}`;
              } else if (DuplicatePresentType === 3) {
                msgKey = 3917;
              }

              // Show the validation popup
              this.showApplnStatusValidationPopup(msgKey, placeholderValue)
                .then((confirmed) => {
                  if (confirmed) {
                    // User clicked "Ok", continue validation
                    if (LicenceOrAuthorisation === 2) {
                      LicenceOrAuthorisation = 3; // Switch to authorization validation
                      const authStatusID = this.firmDetails.AuthorisationStatusTypeID;
                      const authStatusName = this.firmDetails.AuthorisationStatusTypeDesc;
                      const authDate = this.formattedAuthApplStatusDate;

                      this.performApplnStatusValidation(LicenceOrAuthorisation, authStatusID, authStatusName, authDate)
                        .then((authorisationValid) => {
                          if (authorisationValid) {
                            this.completeSave(); // Proceed with save if valid
                          }
                        });
                    } else {
                      this.completeSave(); // Proceed with save if no further validation is required
                    }
                  } else {
                    resolve(false); // Validation failed but user confirmed (so stop)
                  }
                })
                .catch((error) => {
                  reject(error); // Handle rejection
                });
            }
          } else {
            resolve(false); // Resolve as false if validation fails
          }
        }, (error) => {
          console.error('Validation error:', error);
          resolve(false); // Resolve as false on error
        });
    });
  }


  prepareFirmObject(userId: number) {
    return {
      firmDetails: {
        firmID: this.firmId,
        firmName: this.firmDetails.FirmName,
        qfcNumber: this.firmDetails.QFCNum,
        firmCode: this.firmDetails.FirmCode,
        legalStatusTypeID: this.firmDetails.LegalStatusTypeID,
        qfcTradingName: this.firmDetails.QFCTradingName,
        prevTradingName: this.firmDetails.PrevTradingName,
        placeOfIncorporation: this.firmDetails.PlaceOfIncorporation,
        countyOfIncorporation: this.firmDetails.CountyOfIncorporation,
        webSiteAddress: this.firmDetails.WebSiteAddress,
        firmApplDate: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.firmApplDate),
        firmApplTypeID: this.selectedFirmTypeID,
        licenseStatusTypeID: this.firmDetails.LicenseStatusTypeID,
        licensedDate: this.dateUtilService.convertDateToYYYYMMDD(this.formattedLicenseApplStatusDate),
        authorisationStatusTypeID: this.firmDetails.AuthorisationStatusTypeID,
        authorisationDate: this.dateUtilService.convertDateToYYYYMMDD(this.formattedAuthApplStatusDate),
        createdBy: this.firmDetails.CreatedBy,
        finYearEndTypeID: this.firmDetails.FinYearEndTypeID,
        firmAccountingDataID: this.firmDetails.FirmAccountingDataID,
        firmApplicationDataComments: this.firmDetails.FirmApplicationDataComments || '',
        firmYearEndEffectiveFrom: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.FirmFinYearEndEffectiveFrom),
        finAccStandardTypeID: this.firmDetails.FinAccStdTypeID,
        finAccStandardID: this.firmDetails.FirmAccountingStandardID ?? 0,
        firmAccountingEffectiveFrom: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.FinAccStdTypeEffectiveFrom) ?? null,
        dateOfIncorporation: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
        differentIncorporationDate: this.firmDetails.DifferentIncorporationDate,
        firmNameAsinFactSheet: this.firmDetails.FirmNameAsinFactSheet || '',
        requiresCoOp: this.firmDetails.RequiresCoOp || '',
        prComments: this.firmDetails.PublicRegisterComments || ''
      },
      addressList: this.existingAddresses.map(address => {
        let addressState: number;

        if (address.isRemoved) {
          addressState = 4; // Deleted address
        } else if (address.AddressID === null) {
          addressState = 2; // New address
        } else {
          addressState = 6; // Modified address
        }

        return {
          firmID: this.firmId,
          countryID: Number(address.CountryID) || 0,
          addressTypeID: address.AddressTypeID || 0,
          sameAsTypeID: address.SameAsTypeID || null,
          lastModifiedBy: userId, // must be dynamic
          addressAssnID: address.AddressAssnID || null,
          entityTypeID: address.EntityTypeID || 1,
          entityID: address.EntityID || this.firmId,
          addressID: address.AddressID?.toString() || '',
          addressLine1: address.AddressLine1 || '',
          addressLine2: address.AddressLine2 || '',
          addressLine3: address.AddressLine3 || '',
          addressLine4: address.AddressLine4 || '',
          city: address.City || '',
          province: address.Province || '',
          postalCode: address.PostalCode || '',
          phoneNumber: address.PhoneNumber || '',
          phoneExt: address.PhoneExt || '',
          faxNumber: address.FaxNumber || '',
          lastModifiedDate: address.LastModifiedDate || this.currentDate, // Default to current date
          addressState: addressState, // New address state is 2, existing modified or unchanged is 6, 4 is delete
          fromDate: address.FromDate || null,
          toDate: address.ToDate || null,
          objectID: address.ObjectID || this.Page.CoreDetail,
          objectInstanceID: address.ObjectInstanceID || this.firmId,
          objectInstanceRevNumber: address.ObjectInstanceRevNumber || 1,
          sourceObjectID: address.SourceObjectID || this.Page.CoreDetail,
          sourceObjectInstanceID: address.SourceObjectInstanceID || this.firmId,
          sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNumber || 1,
          objAis: null,
        };
      }),
      objFirmNameHistory: null
    };
  }

  completeSave() {
    const firmObj = this.prepareFirmObject(this.userId);

    // Save Firm Details using the editFirm service
    this.saveFirmDetails(firmObj, this.userId);
    this.isEditModeCore = false;
    this.applySecurityOnPage(this.Page.CoreDetail, this.isEditModeCore);
  }

  // Function to save firm details
  saveFirmDetails(firmObj: any, userId: number) {
    this.isLoading = true;

    this.firmService.editFirm(userId, firmObj).subscribe(
      response => {
        this.loadPrevFirmAndDate();
        this.loadFirmDetails(this.firmId);
        this.loadCurrentAppDetails();
        this.loadFirmAdresses();
        this.resetCollapsibleSections();
        this.cdr.detectChanges();

        this.showFirmDetailsSaveSuccessAlert(constants.Firm_CoreDetails_Messages.FIRMDETAILS_SAVED_SUCCESSFULLY);
        this.isEditModeCore = false;
        this.isLoading = false;
      },
      error => {
        console.error('Error editing row:', error);
        this.isLoading = false;
      }
    );
  }

  cancelEditFirm() {
    Swal.fire({
      text: 'Are you sure you want to cancel your changes ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.objectOpType = constants.ObjectOpType.View; // Not used
        this.isEditModeCore = false;
        this.applySecurityOnPage(this.Page.CoreDetail, this.isEditModeCore);
        this.errorMessages = {};
        this.selectedFile = null;
        this.resetCollapsibleSections();
        this.loadPrevFirmAndDate();
        this.loadFirmDetails(this.firmId);
        this.loadCurrentAppDetails();
        this.loadFirmAdresses();
      }
    });
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

  loadPrevFirmAndDate() {
    this.isLoading = true;
    this.firmService.getFirmsNameHistory(this.firmId).subscribe(
      data => {
        this.firmNamesHistory = data.response;
        this.cdr.detectChanges();
        this.isLoading = false;
      }, error => {
        console.error(error)
        this.isLoading = false;
      },
    );
  }

  loadCurrentAppDetails() {
    this.isLoading = true;
    this.applicationService.getCurrentAppDetailsLicensedAndAuth(this.firmId, 2).subscribe(data => {
      this.firmAppDetailsCurrentLicensed = data.response;
      this.isLoading = false;
    }, error => {
      console.log(error)
      this.isLoading = false;
    })

    this.applicationService.getCurrentAppDetailsLicensedAndAuth(this.firmId, 3).subscribe(data => {
      this.firmAppDetailsCurrentAuthorized = data.response;
      this.isLoading = false;
    }, error => {
      console.log(error)
      this.isLoading = false;
    })
  }
  // Popups when you click save
  showApplnStatusValidationPopup(messageKey: number, placeholder: string, onConfirmed?: () => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logForm.errorMessages(messageKey).subscribe(
        (response) => {
          const messageWithPlaceholder = response.response.replace("{0}", placeholder);
          this.isLoading = false;
          // Display the popup
          Swal.fire({
            html: messageWithPlaceholder,
            showCancelButton: true,
            confirmButtonText: 'Ok',
            cancelButtonText: 'Cancel',
            reverseButtons: false
          }).then((result) => {
            if (result.isConfirmed) {
              if (onConfirmed) {
                onConfirmed(); // Execute additional logic when "Ok" is clicked
              }
              resolve(true); // Proceed, resolving with 'true' to indicate confirmation
            } else {
              reject(new Error('Cancelled by user')); // Reject with an error if "Cancel" is clicked
            }
          });
        },
        (error) => {
          console.error('Error fetching error message:', error);
          reject(error); // Reject if there is an error fetching the message
        }
      );
    });
  }

  resetCollapsibleSections() {
    this.isCollapsed['firmDetailsSection'] = false;
    this.isCollapsed['appDetailsSection'] = false;
    this.isCollapsed['pressReleaseSection'] = false;
    this.isCollapsed['commentsSection'] = false;
    this.isCollapsed['addressesSection'] = false;
  }

  onSameAsTypeChange(selectedTypeID: number) {
    const numericTypeID = Number(selectedTypeID);
    if (selectedTypeID && selectedTypeID != 0) {
      // flag to disable address fields after you select exisiting address type from same on as type field
      this.disableAddressFields = true;
      const selectedAddress = this.existingAddresses.find(address => address.AddressTypeID === numericTypeID);
      if (selectedAddress) {
        this.populateNewAddressFields(selectedAddress);
      }
    } else {
      // enable address fields if 'select' is selected
      this.disableAddressFields = false;
    }
  }
  populateNewAddressFields(address: any) {
    this.newAddress.AddressLine1 = address.AddressLine1;
    this.newAddress.AddressLine2 = address.AddressLine2;
    this.newAddress.AddressLine3 = address.AddressLine2;
    this.newAddress.AddressLine4 = address.AddressLine2;
    this.newAddress.City = address.City;
    this.newAddress.CountryID = address.CountryID;
    this.newAddress.State = address.State;
    this.newAddress.ZipCode = address.ZipCode;
    this.newAddress.Province = address.Province;
    this.newAddress.PostalCode = address.PostalCode;
    this.newAddress.PhoneNumber = address.PhoneNumber;
    this.newAddress.FaxNumber = address.FaxNumber;
  }

  populateCountries() {
    this.firmDetailsService.getCountries().subscribe(
      countries => {
        this.allCountries = countries;
      },
      error => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  populateAddressTypes() {
    this.firmDetailsService.getAddressTypes().subscribe(
      addressTypes => {
        this.allAddressTypes = addressTypes;
      },
      error => {
        console.error('Error fetching address types:', error);
      }
    );
  }

  populateAuthorisationStatus() {
    this.firmDetailsService.getAuthorisationStatus().subscribe(
      authorisationStatus => {
        this.allAuthorisationStatus = authorisationStatus;
      },
      error => {
        console.error('Error fetching authorisation statuses:', error);
      }
    );
  }

  onAddressTypeChange(event: any, address: any) {
    const selectedAddressTypeId = Number(event.target.value);

    if (selectedAddressTypeId === 0) {
      // Do nothing if the "Select" option is chosen
      address.AddressTypeID = 0;
      address.AddressTypeDesc = '';
      return;
    }

    // Get all valid addresses
    const validAddresses = this.firmAddresses.filter(addr => addr.Valid);

    // Check if the selected address type already exists in valid addresses
    const isDuplicate = validAddresses.some(addr => addr.AddressTypeID === selectedAddressTypeId);

    if (isDuplicate) {
      // Show an alert message if duplicate is found
      this.showError(constants.AddressControlMessages.DUPLICATE_ADDRESSTYPES);

      // Reset the dropdown to default ("Select" option)
      event.target.value = "0";
      address.AddressTypeID = 0;  // Also reset the AddressTypeID in the model
      address.AddressTypeDesc = ''; // Reset the description as well
      return;
    }

    // Update the AddressTypeID and AddressTypeDesc based on the selection
    const selectedAddressType = this.allAddressTypes.find(type => type.AddressTypeID === selectedAddressTypeId);

    if (selectedAddressType) {
      // Update the Address model
      address.AddressTypeID = selectedAddressType.AddressTypeID;
      address.AddressTypeDesc = selectedAddressType.AddressTypeDesc;
    }
  }


  getAddressTypeHistory(addressTypeId: number) {
    this.callAddressType = true;
    this.addressService.getAddressesTypeHistory(this.firmId, addressTypeId).subscribe(
      data => {
        this.firmAddressesTypeHistory = data.response;
      }, error => {
        console.error('Error Fetching Firm History Addresses Type', error);
      })
    setTimeout(() => {
      const popupWrapper = document.querySelector('.addressHistoryPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .addressHistoryPopup not found');
      }
    }, 0)
  }

  closeAddressTypeHistory() {
    this.callAddressType = false;
    const popupWrapper = document.querySelector('.addressHistoryPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .addressHistoryPopup not found');
    }
  }


  removeAddress(index: number) {
    Swal.fire({
      text: 'Are you sure you want to delete this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.errorMessages = {};
        if (index > -1 && index < this.firmAddresses.length) {
          const address = this.firmAddresses[index];
          if (!address.AddressID) { // means newly added address
            // If the address doesn't have an AddressID, completely remove it from the array
            this.firmAddresses.splice(index, 1);
          } else {
            // Otherwise, just mark it as removed
            address.isRemoved = true;
          }
          // Re-check if all address types have been added after removal
          const validAddressCount = this.firmAddresses.filter(addr => addr.Valid && !addr.isRemoved).length;
          this.canAddNewAddress = validAddressCount < this.allAddressTypes.length;
        }
      }
      // No action needed if the user cancels
    });
  }


  get filteredFirmAddresses() {
    return this.firmAddresses.filter(addr => !addr.isRemoved);
  }


  addNewAddress() {

    // Define the total number of address types
    const totalAddressTypes = this.allAddressTypes.length;

    // Get the count of valid addresses
    const validAddressCount = this.firmAddresses.filter(addr => addr.Valid && !addr.isRemoved).length;

    // Check if the number of valid addresses is equal to the number of address types
    if (validAddressCount >= totalAddressTypes) {
      // Disable the button if all address types are added
      this.canAddNewAddress = false;
      return;
    }

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
      LastModifiedBy: 0, //todo _userId;
      LastModifiedDate: this.currentDate,
      addressState: 2,
      FromDate: null,
      ToDate: null,
      Valid: true,
    };

    // Add the new address to the list
    this.firmAddresses.unshift(this.newAddress);

    // Update the count of valid addresses
    const updatedValidAddressCount = this.firmAddresses.filter(addr => addr.Valid && !addr.isRemoved).length;

    // Disable the button if the count of valid addresses matches the number of address types
    this.canAddNewAddress = updatedValidAddressCount < totalAddressTypes;
  }

  toggleCollapse(section: string) {
    this.isCollapsed[section] = !this.isCollapsed[section];
  }


  onLicenseStatusChange(selectedValue: any) {
    const numericValue = Number(selectedValue);

    if (isNaN(numericValue) || !this.firmId) {
      console.error('Invalid value or firm ID');
      return;
    }

    this.firmService.getFirmStatusValidation(this.firmId, numericValue, this.currentDate, 2)
      .subscribe(response => {
        if (response.isSuccess && response.response) {
          const { OldFirmApplStatusTypeDesc, OldFirmApplStatusDate, IsFirmApplStatusGroupChanged } = response.response;

          const selectedOption = this.allQFCLicenseStatus.find(option => option.FirmApplStatusTypeID === numericValue);
          let statusDescription = OldFirmApplStatusTypeDesc || selectedOption?.FirmApplStatusTypeDesc || '';

          // Remove any trailing colon
          statusDescription = statusDescription.trim().replace(/:$/, '');

          // Update license status label
          this.LicenseStatusTypeLabelDescFormatted = `Date ${statusDescription}`;

          this.formattedLicenseApplStatusDate = OldFirmApplStatusDate !== '1900-01-01T00:00:00'
            ? this.dateUtilService.formatDateToCustomFormat(OldFirmApplStatusDate)
            : null;

          this.licenseStatusDates[numericValue] = this.formattedLicenseApplStatusDate;

          let messagePromises: Promise<string>[] = [];
          if (this.firmDetails.FirmTypeID !== 2) {
            if (this.formattedLicenseApplStatusDate) {
              messagePromises.push(this.getNotePopupMessage(3917));
            }
          } else {
            if (this.firmId !== null) {
              if (IsFirmApplStatusGroupChanged > 0) {
                if (IsFirmApplStatusGroupChanged == 1) {
                  messagePromises.push(this.getNotePopupMessage(3913));
                } else if (IsFirmApplStatusGroupChanged == 2) {
                  messagePromises.push(this.getNotePopupMessage(3914));
                }
              }
              if (this.formattedAuthApplStatusDate) {
                messagePromises.push(this.getNotePopupMessage(3917));
              }
            }
          }
          Promise.all(messagePromises).then((messages: string[]) => {
            if (messages.length > 0) {
              this.showCombinedPopup(messages);
            }
          });
        } else {
          // Handle error or default case
          const selectedOption = this.allQFCLicenseStatus.find(option => option.FirmApplStatusTypeID === numericValue);
          let statusDescription = selectedOption?.FirmApplStatusTypeDesc || '';

          // Remove any trailing colon
          statusDescription = statusDescription.trim().replace(/:$/, '');

          this.LicenseStatusTypeLabelDescFormatted = `Date ${statusDescription}`;
          this.formattedLicenseApplStatusDate = null;
        }
      });
  }

  onAuthorizedStatusChange(selectedValue: any) {
    const numericValue = Number(selectedValue);

    if (isNaN(numericValue) || !this.firmId) {
      console.error('Invalid value or firm ID');
      return;
    }

    if (!this.isFirmLicensed) {
      const statusTypes = {
        [constants.FirmAuthorizationApplStatusType.Application]: constants.FirmLicenseApplStatusType.Application,
        [constants.FirmAuthorizationApplStatusType.ApplicationWithdrawn]: constants.FirmLicenseApplStatusType.ApplicationWithdrawn,
        [constants.FirmAuthorizationApplStatusType.Rejected]: constants.FirmLicenseApplStatusType.Rejected,
        [constants.FirmAuthorizationApplStatusType.Authorised]: constants.FirmLicenseApplStatusType.Licensed,
        [constants.FirmAuthorizationApplStatusType.AuthorisedWithdrawnVoluntary]: constants.FirmLicenseApplStatusType.LicensedWithdrawn,
        [constants.FirmAuthorizationApplStatusType.AuthorisedWithdrawnInvoluntary]: constants.FirmLicenseApplStatusType.LicensedWithdrawnInvolunatary,
      };

      const QFCLicStatus = this.allQFCLicenseStatus.find(option => option.FirmApplStatusTypeID === statusTypes[numericValue]);
      if (QFCLicStatus) {
        this.firmDetails.LicenseStatusTypeID = QFCLicStatus.FirmApplStatusTypeID;
      }
    }

    this.firmService.getFirmStatusValidation(this.firmId, numericValue, this.currentDate, 3)
      .subscribe(response => {
        if (response.isSuccess && response.response) {
          const { OldFirmApplStatusTypeDesc, OldFirmApplStatusDate, IsFirmApplStatusGroupChanged } = response.response;

          // Fallback to selected option's description if no status description is returned
          const selectedOption = this.allAuthorisationStatus.find(option => option.FirmApplStatusTypeID === numericValue);
          const statusDescription = OldFirmApplStatusTypeDesc || selectedOption?.FirmApplStatusTypeDesc || '';

          // Update auth status label
          this.AuthorisationStatusTypeLabelDescFormatted = `Date ${statusDescription}`;

          // Ensure that the date is null if OldFirmApplStatusDate is invalid or equal to 1900-01-01
          if (OldFirmApplStatusDate && OldFirmApplStatusDate !== '1900-01-01T00:00:00') {
            this.formattedAuthApplStatusDate = this.dateUtilService.formatDateToCustomFormat(OldFirmApplStatusDate);
          } else {
            this.formattedAuthApplStatusDate = null; // Set to null if date is invalid
          }

          // Save the current status and date
          this.authorisationStatusDates[numericValue] = this.formattedAuthApplStatusDate;
          let messagePromises: Promise<string>[] = [];
          if (this.firmId !== null) {
            if (IsFirmApplStatusGroupChanged > 0) {
              if (IsFirmApplStatusGroupChanged == 1) {
                messagePromises.push(this.getNotePopupMessage(3913));
              } else if (IsFirmApplStatusGroupChanged == 2) {
                messagePromises.push(this.getNotePopupMessage(3914));
              }
            }
            if (this.formattedAuthApplStatusDate) {
              messagePromises.push(this.getNotePopupMessage(3917));
            }
          }
          // Once all the messages are retrieved, show them in a combined popup
          Promise.all(messagePromises).then((messages: string[]) => {
            if (messages.length > 0) {
              this.showCombinedPopup(messages);
            }
          });
        } else {
          // Handle error or default case
          const selectedOption = this.allAuthorisationStatus.find(option => option.FirmApplStatusTypeID === numericValue);
          this.AuthorisationStatusTypeLabelDescFormatted = `Date ${selectedOption?.FirmApplStatusTypeDesc || ''}`;
          this.formattedAuthApplStatusDate = null; // Ensure it's set to null
        }
      });
  }

  onFirmApplicationTypeChange(selectedFirmTypeID: number) {
    const applicationAuthStatus = this.allAuthorisationStatus.find(
      option => option.FirmApplStatusTypeID === constants.FirmAuthorizationApplStatusType.Application
    );
    const applicationLicStatus = this.allQFCLicenseStatus.find(
      option => option.FirmApplStatusTypeID === constants.FirmLicenseApplStatusType.Application
    );

    // Only apply this logic if the firm is not licensed
    if (!this.isFirmLicensed) {
      // Set License Status to Application if not already set or it's currently set to Application
      if (applicationLicStatus) {
        this.firmDetails.LicenseStatusTypeID = applicationLicStatus?.FirmApplStatusTypeID;
        this.formattedLicenseApplStatusDate = this.dateOfApplication;
        this.LicenseStatusTypeLabelDescFormatted = `Date ${applicationLicStatus?.FirmApplStatusTypeDesc}`;
      }

      // Set Authorisation Status to Application if not already set or it's currently set to Application
      if (applicationAuthStatus) {
        this.firmDetails.AuthorisationStatusTypeID = applicationAuthStatus?.FirmApplStatusTypeID;
        this.formattedAuthApplStatusDate = this.dateOfApplication;
        this.AuthorisationStatusTypeLabelDescFormatted = `Date ${applicationAuthStatus?.FirmApplStatusTypeDesc}`;
      }
    }

    // If the firm is already licensed, handle switching between License and Authorisation
    if (this.isFirmLicensed) {
      if (selectedFirmTypeID == 2) { // Switching to License
        if (this.firmDetails.LicenseStatusTypeID === constants.FirmLicenseApplStatusType.Application) {
          this.formattedLicenseApplStatusDate = this.dateOfApplication;
        }
      }

      if (selectedFirmTypeID == 3) { // Switching to Authorisation
        if (this.firmDetails.AuthorisationStatusTypeID === constants.FirmAuthorizationApplStatusType.Application || !this.firmDetails.AuthorisationStatusTypeID) {
          this.firmDetails.AuthorisationStatusTypeID = applicationAuthStatus?.FirmApplStatusTypeID;
          this.formattedAuthApplStatusDate = this.dateOfApplication;
          this.AuthorisationStatusTypeLabelDescFormatted = `Date ${applicationAuthStatus?.FirmApplStatusTypeDesc}`;
        }
      }
    }
  }

  onDateOfApplicationChange(newDate: string) {
    if (newDate && this.firmDetails.LicenseStatusTypeID == constants.FirmLicenseApplStatusType.Application) {
      this.dateOfApplication = newDate;
      this.formattedLicenseApplStatusDate = newDate;
      // if date of application is null
    } else if (!newDate && this.firmDetails.LicenseStatusTypeID == constants.FirmLicenseApplStatusType.Application) {
      this.dateOfApplication = newDate;
      this.formattedLicenseApplStatusDate = newDate;
    }
    if (newDate && this.firmDetails.AuthorisationStatusTypeID == constants.FirmAuthorizationApplStatusType.Application) {
      this.dateOfApplication = newDate;
      this.formattedAuthApplStatusDate = newDate;
      // if date of application is null
    } else if (!newDate && this.firmDetails.AuthorisationStatusTypeID == constants.FirmAuthorizationApplStatusType.Application) {
      this.dateOfApplication = newDate;
      this.formattedAuthApplStatusDate = newDate;
    }
  }

  getApplicationDetailsHistory() {
    this.callAppDetails = true;
    this.applicationService.getAppDetailsLicensedAndAuthHistory(this.firmId, 2, false).subscribe(
      data => {
        this.firmAppDetailsLicensed = data.response;
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    this.applicationService.getAppDetailsLicensedAndAuthHistory(this.firmId, 3, false).subscribe(
      data => {
        this.firmAppDetailsAuthorization = data.response;
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    setTimeout(() => {
      const popupWrapper = document.querySelector('.ApplicationDetailsPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class not found');
      }
    }, 0)
  }

  closeApplicationDetails() {
    this.callAppDetails = false;
    const popupWrapper = document.querySelector(".ApplicationDetailsPopUp") as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }


  getPrevFirmName() {
    this.callPrevFirmName = true;
    this.firmService.getFirmsNameHistory(this.firmId).subscribe(
      data => {
        this.firmNamesHistory = data.response;
      },
      error => {
        console.error('Error fetching firm details', error);
      })
    setTimeout(() => {
      const popupWrapper = document.querySelector('.prevFirmNamePopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .prevFirmNamePopUp not found');
      }
    }, 0);
  }

  closePrevFirmName() {
    this.callPrevFirmName = false;
    const popupWrapper = document.querySelector(".prevFirmNamePopUp") as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }

  populateQFCLicenseStatus() {
    this.firmDetailsService.getQFCLicenseStatus().subscribe(
      qfcLicenseStatus => {
        this.allQFCLicenseStatus = qfcLicenseStatus;
      },
      error => {
        console.error('Error fetching QFC License statuses:', error);
      }
    );
  }


  populateFirmAppTypes() {
    this.firmDetailsService.getFirmAppTypes().subscribe(
      firmAppTypes => {
        this.allFirmTypes = firmAppTypes;
      },
      error => {
        console.error('Error fetching Firm Application types:', error);
      }
    );
  }

  populateFinAccStd() {
    this.firmDetailsService.getFinAccStd().subscribe(
      finAccStd => {
        this.allFinAccStd = finAccStd;
      },
      error => {
        console.error('Error fetching Financial Account Standards:', error);
      }
    );
  }

  populateFinYearEnd() {
    this.firmDetailsService.getFinYearEnd().subscribe(
      finYearEnd => {
        this.allFinYearEnd = finYearEnd;
      },
      error => {
        console.error('Error fetching Financial Year Ends:', error);
      }
    );
  }

  populateLegalStatus() {
    this.firmDetailsService.getLegalStatus().subscribe(
      legalStatus => {
        this.allLegalStatus = legalStatus;
      },
      error => {
        console.error('Error fetching Legal Statuses:', error);
      }
    );
  }

  onLegalStatusChange(value: number) {
    this.firmDetails.LegalStatusTypeID = value;
    if (value == 1 || value == 2 || value == 7 || value == 8) {
      this.firmDetails.PlaceOfIncorporation = constants.PLACE_OF_INCORPORATION_QFC;
    } else {
      this.firmDetails.PlaceOfIncorporation = '';
    }
  }

  getAccountingStandardHistory() {
    this.callAccStandard = true;
    this.firmService.getAccountingStandardsHistory(this.firmId).subscribe(
      data => {
        this.firmAccountingStandardHistory = data.response;
      },
      error => {
        console.error('Error fetching firm details', error);
      })
    setTimeout(() => {
      const popupWrapper = document.querySelector('.accountingStandardsPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .accountingStandardPopUp not found');
      }
    }, 0);
  }

  closeAccountingStandard() {
    this.callAccStandard = false;
    const popupWrapper = document.querySelector(".accountingStandardsPopUp") as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }

  getNotePopupMessage(messageKey: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.logForm.errorMessages(messageKey).subscribe(
        (response) => resolve(response.response), // Resolve with the message
        (error) => reject(error) // Reject in case of error
      );
    });
  }


  getFYearHistory() {
    this.callFYear = true;
    this.firmService.getFYearEndHistory(this.firmId).subscribe(
      data => {
        this.firmFYearHistory = data.response;
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    setTimeout(() => {
      const popupWrapper = document.querySelector('.popup-wrapper') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .popup-wrapper not found');
      }
    }, 0);
  }
  closeFYearHistory() {
    this.callFYear = false;
    const popupWrapper = document.querySelector('.popup-wrapper') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .popup-wrapper not found');
    }
  }


  // Method to show a SweetAlert with combined messages for Authorisation type change
  showCombinedPopup(messages: string[]) {
    Swal.fire({
      html: messages.join('<br>'), // Combine the messages with a line break
      showCancelButton: false,
      confirmButtonText: 'Ok',
    });
  }

  // Method to show a SweetAlert for QFC Licensed type change
  showPopupLicenseTypeChange(messages: string[]) {
    Swal.fire({
      html: messages.join('<br>'), // Combine the messages with a line break
      showCancelButton: false,
      confirmButtonText: 'Ok',
    });
  }

  // [Aicha] : Documents Functions to be moved to document component later
  selectDocument() {
    this.callUploadDoc = true;
    setTimeout(() => {
      const popupWrapper = document.querySelector('.selectDocumentPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .selectDocumentPopUp not found');
      }
    }, 0)
  }

  closeSelectDocument() {
    this.callUploadDoc = false;
    const popupWrapper = document.querySelector(".selectDocumentPopUp") as HTMLElement;
    setTimeout(() => {
      if (popupWrapper) {
        popupWrapper.style.display = 'none';
      } else {
        console.error('Element with class not found');
      }
    }, 0)
  }

  uploadDocument() {
    if (!this.selectedFile) {
      this.showError(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.firmDetailsService.getErrorMessages('uploadDocument', constants.DocumentAttechment.selectDocument);
    } else {
      delete this.errorMessages['uploadDocument'];
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile = file;
        this.fileError = ''; // Clear any previous error message
      } else {
        this.fileError = 'Please select a valid PDF file.';
        this.selectedFile = null;
      }
    }
  }
  
  confirmUpload() {
    if (this.selectedFile) {
      // Display the selected file name in the main section
      const uploadedDocumentsDiv = document.getElementById('uploaded-documents');
      if (uploadedDocumentsDiv) {
        uploadedDocumentsDiv.textContent = `Uploaded Document: ${this.selectedFile.name}`;
      }
      this.closeSelectDocument();
    } else {
      console.error('No valid PDF file selected.');
    }
  }


}