import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';  // Import ActivatedRoute
import { FirmService } from 'src/app/ngServices/firm.service';  // Import FirmService
import flatpickr from 'flatpickr';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as constants from 'src/app/app-constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-firm-page',
  templateUrl: './view-firm-page.component.html',
  styleUrls: ['./view-firm-page.component.scss']
})
export class ViewFirmPageComponent implements OnInit {

  userId = 10044; // Replace with dynamic userId as needed
  errorMessages: { [key: string]: string } = {};
  /* for Auditors */
  IsViewAuditorVisible: boolean = false;
  IsCreateAuditorVisible: boolean = false;
  IsEditAuditorVisible: boolean = false;
  canAddNewAddress: boolean = true;
  disableAddressFields: boolean = false;
  isLicensed: boolean;
  selectedAuditor: any = null;
  categorizedData = [];
  selectedAuditorNameFromSelectBox: string = 'select';
  flatpickrInstance: any;
  initialized = false;
  @ViewChildren('auditorRadio') auditorRadios!: QueryList<any>;
  @ViewChildren('dateInputs') dateInputs: QueryList<ElementRef<HTMLInputElement>>;
  /* */
  callFYear: boolean = false;
  callInactiveUsers: boolean = false;
  callAppDetails: boolean = false;
  callPrevFirmName: boolean = false;
  callAccStandard: boolean = false;
  callUploadDoc: boolean = false;
  callAddressType: boolean = false;
  callLicScopePrev: boolean = false;
  callAuthScopePrev: boolean = false;
  menuId: Number = 0;
  menuWidth: string = '2%';
  dataWidth: string = '98%';
  width1: string = '15%';
  width2: string = '2%';
  widthData1: string = '98%';
  widthData2: string = '85%';
  firmId: number = 0;  // Add firmId property
  ASSILevel: number = 4;
  firmDetails: any = {};  // Add firmDetails property
  dateOfApplication: any;
  existingAddresses: any = [];
  firmApp: any = {};
  firmOPDetails: any;
  prudReturnTypesDropdown: any = [];
  firmFYearHistory: any = [];
  firmNamesHistory: any = [];
  firmAccountingStandardHistory: any = [];
  firmAddresses: any = [];
  appDetails: any = [];
  applicationTypeId: number;
  selectedFirmTypeID: number;
  originalFirmAddresses: any = [];
  firmAddressesTypeHistory: any = [];
  ActivityLicensed: any = [{}];
  ActivityAuth: any = [{}];
  AuthTableDocument: any = [];
  islamicFinance: any = {};
  activityCategories: any[] = [];
  licensedActivities: any = [];
  AuthRegulatedActivities: any = [];
  AllProducts: any[] = [];
  firmInactiveUsers: any[] = [];
  firmAppDetailsLicensed: any[] = [];
  firmAppDetailsAuthorization: any[] = [];
  firmAppDetailsCurrentLicensed: any;
  firmAppDetailsCurrentAuthorized: any;
  FIRMAuditors: any[] = [];
  FIRMContacts: any[] = [];
  FIRMControllers: any[] = [];
  FIRMControllersIndividual: any[] = [];
  RegisteredFund: any[] = [];
  FIRMRA: any[] = [];
  FirmAdminFees: any[] = [];
  FirmWaivers: any;
  FIRMRMP: any;
  FIRMNotices: any;
  usedAddressTypes: Set<string> = new Set();
  newAddress: any = {};
  newActivity: any = {};
  allowEditFirmDetails: string | boolean = false;
  /* for scope */
  allowEditLicScopeDetails: string | boolean = false;
  allowEditAuthScopeDetails: string | boolean = false;
  showPermittedActivitiesTable: string | boolean = false;
  isIslamicFinanceChecked: boolean = true;
  disableApplicationDate: boolean = true;
  showVaryBtn: boolean = true;
  scopeRevNum: number;
  selectedCategory: number;
  selectedActivity: string;
  documentDetails: any = {};
  LicPrevRevNumbers: any = [];
  AuthPrevRevNumbers: any = [];
  existingActivities: any = [];
  currentLicRevisionNumber: number | null = null;
  lastLicRevisionNumber: number | null = null;
  currentAuthRevisionNumber: number | null = null;
  lastAuthRevisionNumber: number | null = null;

  displayInactiveContacts: boolean = false;

  selectedStatusId: number | null = null;
  selectedAuthStatusId: number | null = null;
  licenseStatusDates: { [key: number]: string | null } = {};
  authorisationStatusDates: { [key: number]: string | null } = {};

  /*dropdowns arrays*/
  allCountries: any = [];
  allQFCLicenseStatus: any = [];
  allAuthorisationStatus: any = [];
  allLegalStatus: any = [];
  allFinYearEnd: any = [];
  allFinAccStd: any = [];
  allFirmTypes: any = [];
  allAddressTypes: any = [];
  allPrudentialCategoryTypes: any = [];
  allAuthorisationCategoryTypes: any = [];
  activeTab: string = '';

  isCollapsed: { [key: string]: boolean } = {};
  selectedFile: File | null = null;
  fileError: string = '';
  categoriesWithProducts: any[] = [];

  objFirmScope: any = {};
  lstFirmActivities: any = [];
  objectProductActivity: any = [];
  objPrudentialCategory: any = {};
  objSector: any = {};
  lstFirmScopeCondition: any = [];
  objFirmIslamicFinance: any = {};
  rstFirmSector: boolean;
  firmSectorID: any;

  // flags validations
  hasValidationErrors: boolean = false;
  invalidAddress: boolean;
  invalidActivity: boolean;

  //Contact Popup 
  isPopupVisible: boolean = false;
  isEditable: boolean = false; // Controls the readonly state of the input fields
  selectedContact: any = null;
  /* current date */
  now = new Date();
  currentDate = this.now.toISOString();

  constructor(
    private router: Router,
    private route: ActivatedRoute,  // Inject ActivatedRoute
    private firmService: FirmService,  // Inject FirmService
    private el: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.scrollToTop();

    this.route.params.subscribe(params => {
      this.firmId = +params['id']; // Retrieve the firm ID from the route parameters
      console.log(`Loaded firm with ID: ${this.firmId}`);
      this.loadFirmDetails(this.firmId);  // Fetch the firm details
      this.loadPrevFirmAndDate();
      this.loadCurrentAppDetails();
      this.loadFirmOPDetails(this.firmId); // Fetch Operational Data
      this.loadAssiRA();
      this.loadAdminFees();
      this.loadFirmAdresses();
      this.loadActivitiesLicensed();
      this.loadActivitiesAuthorized();
      this.loadScopeOfAuth();
      this.loadRegulatedActivities();
      this.loadIslamicFinance();
      this.loadActivityCategories();
      this.loadActivitiesTypesForLicensed();
      this.populateCountries();
      this.populateQFCLicenseStatus();
      this.populateAuthorisationStatus();
      this.populateLegalStatus();
      this.populateFinYearEnd();
      this.populateFinAccStd();
      this.populateFirmAppTypes();
      this.populateAddressTypes();
      this.populatePrudentialCategoryTypes();
      this.populateAuthorisationCategoryTypes();
      this.checkFirmLicense();
    });
  }

  ngAfterViewInit() {
    // Ensure the query list is available
    this.dateInputs.changes.subscribe(() => {
      this.initializeFlatpickr();
    });
    // Initialize Flatpickr if already available
    this.initializeFlatpickr();
  }

  initializeFlatpickr() {
    this.dateInputs.forEach((input: ElementRef<HTMLInputElement>) => {
      flatpickr(input.nativeElement, {
        allowInput: true,
        dateFormat: 'd/M/Y', // Adjust date format as needed
        onChange: (selectedDates, dateStr) => {
          console.log('Selected Date:', selectedDates);
          console.log('Formatted Date String:', dateStr);
          input.nativeElement.value = dateStr;
        }
      });
    });
  }

  scrollToTop(): void {
    console.log('scrollToTop called');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleCollapse(section: string) {
    this.isCollapsed[section] = !this.isCollapsed[section];
  }

  toggleMenu(inputNumber: Number) {
    if (this.menuId == 0) {
      this.menuId = inputNumber;
      this.menuWidth = this.width1;
      this.dataWidth = this.widthData2;
    } else if (this.menuId == inputNumber) {
      this.menuId = 0;
    }
    else {
      this.menuId = inputNumber;
    }
  }

  toggleFulMenu() {
    if (this.menuWidth !== this.width2) {
      this.menuWidth = this.width2;
      this.dataWidth = this.widthData1;
    } else {
      this.menuWidth = this.width1;
      this.dataWidth = this.widthData2;
    }
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
    // Get all section elements
    const sections = this.el.nativeElement.getElementsByTagName('section');

    // Loop through all section elements and set display to none
    for (let i = 0; i < sections.length; i++) {
      this.renderer.setStyle(sections[i], 'display', 'none');
    }
    console.log('yes its', tabId)
    const neededSection = document.getElementById(tabId);
    this.renderer.setStyle(neededSection, 'display', 'flex');

    if (tabId == 'CD') {

    }

    if (tabId == 'Scope') {
      this.isCollapsed['LicensedSection'] = true
    }

    if (tabId == 'Auditors' && this.FIRMAuditors.length === 0) {
      this.loadAuditors();
    }
    if (tabId == 'Contacts' && this.FIRMContacts.length === 0) {
      this.loadContacts();
    }
    if (tabId == 'Controllers' && this.FIRMControllers.length === 0) {
      this.loadControllers();
    }
    if (tabId == 'Controllers' && this.FIRMControllersIndividual.length === 0) {
      this.loadControllersIndividual();
    }
    if (tabId == 'SPRegFunds' && this.RegisteredFund.length === 0) {
      this.loadRegisteredFund();
    }
    if (tabId == 'SPWaivers') {
      this.loadWaivers();
    }
    if (tabId == 'SPRMPs') {
      this.loadRMPs();
    }
    if (tabId == 'SPNotices') {
      this.loadNotices();
    }
  }



  async editFirm() {
    this.existingAddresses = this.firmAddresses.filter(address => address.Valid);

    if (!this.allowEditFirmDetails) {
      // Toggle to edit mode if the form is not in edit mode
      this.allowEditFirmDetails = true;
      return;
    }

    // Start validations
    this.hasValidationErrors = false;

    // Synchronous firm-level validation checks
    this.validateFirmDetails(); // This function performs the existing validation logic synchronously

    if (this.hasValidationErrors) {
      this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      return;
    }

    // Perform async validations (like QFC number)
    try {
      // Await for QFC validation
      await this.validateQFCNum();

      // Check for application date duplicates and other async validation
      await this.ApplicationDateValidationCheckDuplicates();

      if (this.hasValidationErrors) {
        throw new Error('Validation errors exist');
      }

      // After all validations have passed, proceed with saving the firm details
      this.setAdditionalFirmDetails();

      if (this.hasValidationErrors) {
        this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
        return;
      }

      // Save Firm Details
      const firmObj = this.prepareFirmObject(this.userId);
      this.saveFirmDetails(firmObj, this.userId);

      // Toggle off edit mode after saving
      this.allowEditFirmDetails = false;
    } catch (error) {
      if (error.message !== 'Cancelled by user') {
        console.error('Validation or Save Process failed:', error);
        this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      }
    }
  }


  async ApplicationDateValidationCheckDuplicates(): Promise<void> {
    if (this.firmId) {
      let LicenceOrAuthorisation = 2; // 2 for Licensing
      let enteredLicenseStatusID = this.firmDetails.LicenseStatusTypeID;
      let enteredLicenseStatusName = this.firmDetails.LicenseStatusTypeDesc;
      let enteredLicenseDate = this.firmDetails.LicensedDate;

      // Perform License Validation and await the result
      const licenseValid = await this.performApplnStatusValidation(LicenceOrAuthorisation, enteredLicenseStatusID, enteredLicenseStatusName, enteredLicenseDate);
      if (!licenseValid) {
        throw new Error('License validation failed');
      }

      // Perform Authorization Validation
      LicenceOrAuthorisation = 3; // 3 for Authorization
      let enteredAuthorisationStatusID = this.firmDetails.AuthorisationStatusTypeID;
      let enteredAuthorisationStatusName = this.firmDetails.AuthorisationStatusTypeDesc;
      let enteredAuthorisationDate = this.firmDetails.AuthorisationDate;

      const authorisationValid = await this.performApplnStatusValidation(LicenceOrAuthorisation, enteredAuthorisationStatusID, enteredAuthorisationStatusName, enteredAuthorisationDate);
      if (!authorisationValid) {
        throw new Error('Authorization validation failed');
      }
    }
  }


  validateFirmDetails() {
    // FIRM NAME VALIDATION
    this.firmDetails.FirmName = this.firmDetails.FirmName.trim();
    if (!this.firmDetails.FirmName) {
      this.getErrorMessages('FirmName', constants.Firm_CoreDetails_Messages.ENTER_FIRMNAME);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['FirmName'];
    }

    // QFC VALIDATION SPECIAL CASES
    if (this.firmDetails.QFCNum) {
      this.firmDetails.QFCNum = this.padNumber(this.firmDetails.QFCNum);
    }

    if (this.selectedFirmTypeID === 2 && this.firmDetails.LicenseStatusTypeID === constants.FirmLicenseApplStatusType.Licensed) {
      if (!this.firmDetails.QFCNum) {
        this.getErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.ENTER_QFCNUMBER);
        this.hasValidationErrors = true;
      }
    }

    if (this.selectedFirmTypeID === 3 && this.firmDetails.AuthorisationStatusTypeID === constants.FirmAuthorizationApplStatusType.Authorised) {
      if (!this.firmDetails.QFCNum) {
        this.getErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.ENTER_QFCNUMBER);
        this.hasValidationErrors = true;
      }
    }

    // LEGAL STATUS VALIDATION
    if (this.firmDetails.LegalStatusTypeID == 0) {
      this.getErrorMessages('LegalStatusTypeID', constants.Firm_CoreDetails_Messages.ENTER_LEGAL_STATUS);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['LegalStatusTypeID'];
    }

    // DATE OF INCORPORATION VALIDATION
    if (this.firmDetails.DifferentIncorporationDate && !this.firmDetails.DateOfIncorporation) {
      this.getErrorMessages('DateOfIncorporation', constants.FirmActivitiesEnum.DATEOFINCORPORATION_ERROR); // Adjust the message key as needed
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['DateOfIncorporation'];
    }

    // FINANCIAL YEAR END EFFECTIVE FROM VALIDATION
    if (!this.firmDetails.FirmFinYearEndEffectiveFrom && this.firmDetails.FinYearEndTypeID > 0) {
      this.getErrorMessages('FYearEndDate', constants.InvoicesMessages.INVALID_DATA, "Financial Year End Effective From");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['FYearEndDate'];
    }

    // ACCOUNTING STANDARDS EFFECTIVE FROM VALIDATION
    if (!this.firmDetails.FinAccStdTypeEffectiveFrom && this.firmDetails.FinAccStdTypeID > 0) {
      this.getErrorMessages('AccStandDate', constants.InvoicesMessages.INVALID_DATA, "Accounting Standards Effective From");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['AccStandDate'];
    }

    // PREV. FIRM NAME EFFECTIVE TO VALIDATION
    if (this.firmNamesHistory[0]?.FirmNameHistoryID && (!this.firmNamesHistory[0].DateEffectiveTo)) {
      this.getErrorMessages('PrevFirmNameEffectiveTo', constants.InvoicesMessages.INVALID_DATA, "Prev Firm Name Effective To");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['PrevFirmNameEffectiveTo'];
    }

    // APPLICATION DETAILS SECTION VALIDATION
    if (!this.dateOfApplication) {
      this.getErrorMessages('DateOfApplication', constants.Firm_CoreDetails_Messages.ENTER_DATE_OF_APPLICATION);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['DateOfApplication'];
    }

    if (!this.firmDetails.LicensedDate) {
      this.getErrorMessages('LicensedDate', constants.FirmActivitiesEnum.ENTER_VALID_DATE, "QFC License Status date");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['LicensedDate'];
    }

    if (!this.firmDetails.AuthorisationDate) {
      this.getErrorMessages('AuthorisationDate', constants.FirmActivitiesEnum.ENTER_VALID_DATE, "Authorisation Status date");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['AuthorisationDate'];
    }

    // ADDRESS TYPE VALIDATION
    this.invalidAddress = this.firmAddresses.find(address => !address.AddressTypeID || address.AddressTypeID === 0);
    if (this.invalidAddress) {
      this.getErrorMessages('AddressTypeID', constants.AddressControlMessages.SELECT_ADDRESSTYPE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['AddressTypeID'];
    }
  }

  performApplnStatusValidation(LicenceOrAuthorisation: number, enteredApplnStatusID: number, enteredApplnStatusName: string, enteredApplnStatusDate: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firmService.getFirmStatusValidation(this.firmId, enteredApplnStatusID, enteredApplnStatusDate, LicenceOrAuthorisation)
        .subscribe((response) => {
          if (response.isSuccess && response.response) {
            const { OldFirmApplStatusTypeDesc, OldFirmApplStatusDate, DuplicatePresentType } = response.response;

            if (DuplicatePresentType === 0) {
              resolve(true); // Validation Pass
            } else {
              let msgKey: number;
              let placeholderValue: string = '';

              if (DuplicatePresentType === 1) {
                msgKey = (LicenceOrAuthorisation === 3)
                  ? constants.Firm_CoreDetails_Messages.SAME_AUTHORISATION_STATUS_ON_TWO_DATES
                  : constants.Firm_CoreDetails_Messages.SAME_LICENSED_STATUS_ON_TWO_DATES;
                placeholderValue = this.formatDateToCustomFormat(OldFirmApplStatusDate);
              } else if (DuplicatePresentType === 2) {
                msgKey = (LicenceOrAuthorisation === 3)
                  ? constants.Firm_CoreDetails_Messages.TWO_AUTHORISATION_STATUS_ON_SAME_DATE
                  : constants.Firm_CoreDetails_Messages.TWO_LICENSED_STATUS_ON_SAME_DATE;
                placeholderValue = `${OldFirmApplStatusTypeDesc} and ${enteredApplnStatusName}`;
              } else if (DuplicatePresentType === 3) {
                msgKey = 3917;
              }

              // Show the validation popup and run additional validation or save logic when "Ok" is clicked
              this.showApplnStatusValidationPopup(msgKey, placeholderValue, () => {
                if (LicenceOrAuthorisation === 2) {
                  // Perform additional validation for Authorization
                  LicenceOrAuthorisation = 3; // 3 for Authorization
                  const authStatusID = this.firmDetails.AuthorisationStatusTypeID;
                  const authStatusName = this.firmDetails.AuthorisationStatusTypeDesc;
                  const authDate = this.firmDetails.AuthorisationDate;

                  this.performApplnStatusValidation(LicenceOrAuthorisation, authStatusID, authStatusName, authDate)
                    .then((authorisationValid) => {
                      if (authorisationValid) {
                        this.completeSave(); // Save if everything is valid
                      }
                    });
                } else {
                  // If no further validation is needed, directly save
                  this.completeSave();
                }
              })
                .then(() => {
                  resolve(false); // Validation failed but user confirmed
                })
                .catch(() => {
                  reject(); // Cancel clicked, stop the process
                });
            }
          } else {
            resolve(false); // Validation failed (if response is invalid)
          }
        }, (error) => {
          console.error('Validation error:', error);
          resolve(false); // Resolve as false if there's an error
        });
    });
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
    this.newAddress.PhoneNum = address.PhoneNum;
    this.newAddress.FaxNum = address.FaxNum;
  }

  // Function to set additional firm details
  setAdditionalFirmDetails() {
    if (this.firmDetails?.AuthorisationStatusTypeID > 0) {
      this.firmDetails.firmApplDate = this.firmDetails.FirmAuthApplDate
        ? this.formatDateToCustomFormat(this.firmDetails.FirmAuthApplDate)
        : null;
    } else {
      this.firmDetails.firmApplDate = this.firmDetails.FirmLicApplDate
        ? this.formatDateToCustomFormat(this.firmDetails.FirmLicApplDate)
        : null;
    }

    if (this.selectedFirmTypeID === 2) { // 2: Licensed for firm app type dropdown
      if (this.firmDetails.LicenseStatusTypeID === constants.FirmLicenseApplStatusType.Application) { // 4: Application option in QFC License Status (Core Details)
        this.firmDetails.LicensedDate = this.firmDetails.firmApplDate;
      } else {
        this.firmDetails.LicensedDate = this.firmDetails.LicensedDate;
      }
    }

    if (this.selectedFirmTypeID === 3) { // 3: Authorization for firm app type dropdown
      if (this.firmDetails.LicensedDate != null) {
        this.firmDetails.LicensedDate = this.firmDetails.LicensedDate;
      } else {
        if (this.firmDetails.AuthorisationDate != null) {
          this.firmDetails.LicensedDate = this.firmDetails.AuthorisationDate;
        } else {
          this.firmDetails.LicensedDate = null;
        }
      }
    }
  }

  // Function to prepare the firm object for saving
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
        firmApplDate: this.convertDateToYYYYMMDD(this.firmDetails.firmApplDate),
        firmApplTypeID: this.selectedFirmTypeID,
        licenseStatusTypeID: this.firmDetails.LicenseStatusTypeID,
        licensedDate: this.convertDateToYYYYMMDD(this.firmDetails.LicensedDate),
        authorisationStatusTypeID: this.firmDetails.AuthorisationStatusTypeID,
        authorisationDate: this.convertDateToYYYYMMDD(this.firmDetails.AuthorisationDate),
        createdBy: this.firmDetails.CreatedBy,
        finYearEndTypeID: this.firmDetails.FinYearEndTypeID,
        firmAccountingDataID: this.firmDetails.FirmAccountingDataID,
        firmApplicationDataComments: this.firmDetails.FirmApplicationDataComments || '',
        firmYearEndEffectiveFrom: this.convertDateToYYYYMMDD(this.firmDetails.FirmFinYearEndEffectiveFrom),
        finAccStandardTypeID: this.firmDetails.FinAccStdTypeID,
        finAccStandardID: this.firmDetails.FirmAccountingStandardID ?? 0,
        firmAccountingEffectiveFrom: this.convertDateToYYYYMMDD(this.firmDetails.FinAccStdTypeEffectiveFrom) ?? null,
        dateOfIncorporation: this.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
        differentIncorporationDate: this.firmDetails.DifferentIncorporationDate,
        firmNameAsinFactSheet: this.firmDetails.FirmNameAsinFactSheet || '',
        requiresCoOp: this.firmDetails.RequiresCoOp || '',
        prComments: this.firmDetails.PublicRegisterComments || ''
      },
      addressList: this.existingAddresses.map(address => {
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
          phoneNumber: address.PhoneNum || '',
          phoneExt: address.PhoneExt || '',
          faxNumber: address.FaxNum || '',
          lastModifiedDate: address.LastModifiedDate || this.currentDate, // Default to current date
          addressState: address.addressState, // New address state is 2, existing is 6
          fromDate: address.FromDate || null,
          toDate: address.ToDate || null,
          objectID: address.ObjectID || 521,
          objectInstanceID: address.ObjectInstanceID || this.firmId,
          objectInstanceRevNumber: address.ObjectInstanceRevNum || 1,
          sourceObjectID: address.SourceObjectID || 521,
          sourceObjectInstanceID: address.SourceObjectInstanceID || this.firmId,
          sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNum || 1,
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
  }

  // Function to save firm details
  saveFirmDetails(firmObj: any, userId: number) {
    console.log("Final firm object to be sent:", firmObj);

    this.firmService.editFirm(userId, firmObj).subscribe(
      response => {
        console.log('Row edited successfully:', response);
        this.loadPrevFirmAndDate();
        this.loadFirmDetails(this.firmId);
        this.loadCurrentAppDetails();
        this.loadFirmAdresses();
        this.resetCollapsibleSections();
        this.cdr.detectChanges();

        this.showFirmDetailsSaveSuccessAlert(constants.Firm_CoreDetails_Messages.FIRMDETAILS_SAVED_SUCCESSFULLY);
        this.allowEditFirmDetails = false;
      },
      error => {
        console.error('Error editing row:', error);
      }
    );
  }


  cancelEditFirm() {
    Swal.fire({
      title: 'Alert',
      text: 'Are you sure you want to cancel your changes ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.allowEditFirmDetails = false;
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

  // Function to reset the collapsible sections
  resetCollapsibleSections() {
    this.isCollapsed['firmDetailsSection'] = false;
    this.isCollapsed['appDetailsSection'] = false;
    this.isCollapsed['pressReleaseSection'] = false;
    this.isCollapsed['commentsSection'] = false;
    this.isCollapsed['addressesSection'] = false;
  }

  isPositiveNonDecimal(value: string): boolean {
    const regex = /^[0-9][0-9]*$/;
    return regex.test(value);
  }


  editLicenseScope() {
    const userId = 10044; // Replace with dynamic userId as needed
    if (this.ActivityLicensed[0].ScopeRevNum) {
      // Check if the current date is greater than the ScopeLicensedDate
      if (this.ActivityLicensed[0].ScopeLicensedDate !== null && this.ActivityLicensed[0].ScopeLicensedDate !== '') {
        if (this.currentDate > this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate)) {
          this.disableApplicationDate = false;  // Enable the field
        } else {
          this.disableApplicationDate = true;  // Disable the field
        }
      } else {
        this.disableApplicationDate = true;  // Enable if no licensed date is present
      }

      // Vary Scope Button Visibility
      if (this.isNullOrEmpty(this.ActivityLicensed[0].ScopeLicensedDate) || this.currentDate < this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate)) {
        this.showVaryBtn = false;
      }

      // If the form is not in edit mode, toggle to edit mode
      if (!this.allowEditLicScopeDetails) {
        this.allowEditLicScopeDetails = true;
        return; // Exit the function to prevent running validations
      }

      // If the form is in edit mode, proceed with validations and saving

      this.hasValidationErrors = false;

      // APPLICATION DATE VALIDATION
      if (this.ActivityLicensed[0].ScopeAppliedDate == null || this.ActivityLicensed[0].ScopeAppliedDate == '') {
        this.getErrorMessages('ScopeAppliedDate', constants.FirmActivitiesEnum.ENTER_VALID_APPLICATIONDATE);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['ScopeAppliedDate'];
      }

      if (this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeAppliedDate) < this.convertDateToYYYYMMDD(this.firmDetails.FirmLicApplDate)) {
        this.getErrorMessages('ScopeAppliedDateLessThanFirmLicApplDate', constants.FirmActivitiesEnum.APPLICATIONDATE_LATER_COREDETAIL, this.formatDateToCustomFormat(this.firmDetails.FirmLicApplDate));
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['ScopeAppliedDateLessThanFirmLicApplDate'];
      }

      // EFFECTIVE DATE VALIDATION
      if (this.ActivityLicensed[0].ScopeEffectiveDate) {
        if (this.ActivityLicensed[0].ScopeEffectiveDate == null || this.ActivityLicensed[0].ScopeEffectiveDate == '') {
          this.getErrorMessages('ScopeEffectiveDate', constants.FirmActivitiesEnum.ENTER_VALID_SCOPEEFFECTIVEDATE);
          this.hasValidationErrors = true;
        } else {
          delete this.errorMessages['ScopeEffectiveDate'];
        }
      }
      if (this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeEffectiveDate) < this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeAppliedDate)) {
        this.getErrorMessages('ScopeEffectiveDateLessThanApplicationDate', constants.FirmActivitiesEnum.ENTER_EFFECTIVEDATE_LATER_APPLICATIONDATE);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['ScopeEffectiveDateLessThanApplicationDate'];
      }

      // ACTIVITY TYPE VALIDATION
      this.invalidActivity = this.ActivityLicensed.find(activity => activity.ActivityTypeID == 0);
      if (this.invalidActivity) {
        this.getErrorMessages('ActivityTypeIDCORRECTION', constants.FirmActivitiesEnum.CORRECT_PERMITTEDACTIVITIES);
        this.getErrorMessages('ActivityTypeID', constants.FirmActivitiesEnum.SELECT_ACTIVITIES);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['ActivityTypeID'];
        delete this.errorMessages['ActivityTypeIDCORRECTION'];
      }

      // Step 2: Handle Validation Errors
      if (this.hasValidationErrors) {
        this.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS);
        return; // Prevent further action if validation fails
      }

      this.ActivityLicensed.forEach(activityLic => {
        const selectedActivity = this.licensedActivities.find(activity => activity.ActivityTypeID === +activityLic.ActivityTypeID);
        if (selectedActivity) {
          activityLic.ActivityTypeDesc = selectedActivity.ActivityTypeDesc;
        }
      });

      this.existingActivities = this.ActivityLicensed;

      // Step 3: Save License Scope Details

      const updatedLicenseScope = this.prepareLicenseScopeObject(userId);
      this.saveLicenseScopeDetails(updatedLicenseScope, userId);
      this.showFirmScopeSaveSuccessAlert(constants.FirmActivitiesEnum.ACTIVITIES_SAVED_SUCCESSFULLY);
    }
  }
  prepareLicenseScopeObject(userId: number) {
    return {
      objFirmScope: {
        firmScopeID: this.ActivityLicensed[0].FirmScopeID,
        scopeRevNum: this.ActivityLicensed[0].ScopeRevNum,
        firmID: this.ActivityLicensed[0].FirmID,
        objectID: 524,
        createdBy: userId, //recheck
        docReferenceID: this.ActivityLicensed[0].docReferenceID ?? null,
        firmApplTypeID: 2, // licensed
        docIDs: this.ActivityLicensed[0].DocID,
        generalConditions: this.ActivityLicensed[0].GeneralConditions,
        effectiveDate: this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeEffectiveDate),
        scopeCertificateLink: this.ActivityLicensed[0].ScopeCertificateLink,
        applicationDate: this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeAppliedDate),
        licensedOrAuthorisedDate: this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate),
      },
      lstFirmActivities: this.existingActivities.map(activityLic => ({
        createdBy: userId, //recheck
        firmScopeTypeID: activityLic.FirmScopeTypeID,
        activityTypeID: Number(activityLic.ActivityTypeID),
        effectiveDate: this.convertDateToYYYYMMDD(activityLic.ScopeEffectiveDate),
        firmActivityConditions: activityLic.Column1,
        productTypeID: null,
        appliedDate: this.convertDateToYYYYMMDD(activityLic.ScopeAppliedDate),
        withDrawnDate: this.convertDateToYYYYMMDD(activityLic.WithdrawnDate),
        objectProductActivity: null,
        activityDetails: activityLic.FirmActivityDetails
      }))
    };
  }

  saveLicenseScopeDetails(updatedLicenseScope: any, userId: number) {
    console.log('Updated License Scope:', updatedLicenseScope);

    this.firmService.editLicenseScope(userId, updatedLicenseScope).subscribe(
      response => {
        console.log('License scope updated successfully:', response);
        this.loadActivitiesLicensed(); // Reload license scope details
        this.allowEditLicScopeDetails = false; // Toggle edit mode off
        this.disableApplicationDate = true;
      },
      error => {
        console.error('Error updating license scope:', error);
      }
    );
  }

  varyLicenseScope() {
    Swal.fire({
      title: 'Alert',
      text: 'Are you sure you want to vary the scope?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        // todo, vary scope button function goes here
      }
    });
  }

  cancelEditLicScope() {
    Swal.fire({
      title: 'Alert',
      text: 'Are you sure you want to cancel your changes ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.allowEditLicScopeDetails = false;
        this.disableApplicationDate = true;
        this.errorMessages = {};
        this.loadActivitiesLicensed();
      }
    });
  }


  editAuthScope() {


    // If the form is not in edit mode, toggle to edit mode
    if (!this.allowEditAuthScopeDetails) {
      this.allowEditAuthScopeDetails = true;
      return; // Exit the function to prevent running validations
    }
    this.updateOrSaveFirmScope();
  }


  updateOrSaveFirmScope() {
    console.log("Data To Update Or Save Firm Scope:", this.ActivityAuth);

    if (!this.ActivityAuth || this.ActivityAuth.length === 0) {
        console.log('Firm activity scope not found');
        return;
    }

    this.ActivityAuth.forEach(firmData => {
        if (!firmData.FirmScopeID) {
            console.log('FirmScopeID is missing for FirmID:', firmData.FirmID);
            return;
        }
        debugger
        const firmScopeData = {
            objFirmScope: {
                firmScopeID: firmData.FirmScopeID,
                scopeRevNum: firmData.ScopeRevNum,
                firmID: firmData.FirmID,
                // objectID: firmData.ObjectID,
                createdBy: 30, // this will be change cuse there is no user 
                docReferenceID: firmData.DocID,
                // firmApplTypeID: 3,
                // docIDs: firmData.DocIDs,
                generalConditions: firmData.GeneralConditions,
                effectiveDate: this.currentDate, 
                scopeCertificateLink: firmData.ScopeCertificateLink,
                // applicationDate: firmData.ApplicationDate,
                // licensedOrAuthorisedDate: firmData.LicensedDate
            },
            lstFirmActivities: [
                {
                    // createdBy: firmData.CreatedBy,
                    // firmScopeTypeID: firmData.FirmScopeTypeID,
                    activityTypeID: firmData.ActivityTypeID,
                    effectiveDate: this.currentDate,
                    // firmActivityConditions: firmData.FirmActivityConditions,
                    // productTypeID: firmData.ProductTypeID,
                    // appliedDate: firmData.AppliedDate,
                    // withDrawnDate: firmData.WithDrawnDate,
                    objectProductActivity: [
                        {
                            // productTypeID: firmData.ProductTypeID,
                            // appliedDate: firmData.AppliedDate,
                            // withDrawnDate: firmData.WithDrawnDate,
                            effectiveDate: firmData.EffectiveDate,
                            // firmScopeTypeID: firmData.FirmScopeTypeID
                        }
                    ],
                    // activityDetails: firmData.ActivityDetails
                }
            ],
            objPrudentialCategory: {
                firmPrudentialCategoryID: firmData.FirmPrudentialCategoryID,
                firmID: firmData.FirmID,
                prudentialCategoryTypeID: firmData.PrudentialCategoryTypeID,
                firmScopeID: firmData.FirmScopeID,
                scopeRevNum: firmData.ScopeRevNum,
                lastModifiedByID: 30, // this will be change cuse there is no user
                effectiveDate: this.currentDate, // Ensure date is valid
                // expirationDate: firmData.ExpirationDate,
                lastModifiedDate: this.currentDate,
                authorisationCategoryTypeID: firmData.AuthorisationCategoryTypeID
            },
            objSector: {
                firmSectorID: firmData.FirmSectorID.toString()  , 
                sectorTypeID: firmData.SectorTypeID,  // this will be change cuse there is no user
                lastModifiedByID: 30, // this will be change cuse there is no user
                effectiveDate: this.currentDate,
            },
            lstFirmScopeCondition: [
                {
                    scopeConditionTypeId: 1,
                    lastModifiedBy: 30, // this will be change cuse there is no user
                    restriction: 1
                }
            ],
            objFirmIslamicFinance: {
                iFinFlag: true,
                iFinTypeId: this.islamicFinance.IFinTypeId,
                iFinTypeDesc: this.islamicFinance.IFinTypeDesc,
                endorsement: this.islamicFinance.Endorsement,
                savedIFinTypeID: 2,
                scopeRevNum: firmData.ScopeRevNum,
                lastModifiedBy: 30 // this will be change cuse there is no user
            },
            resetFirmSector: true,
            firmSectorID: firmData.FirmSectorID.toString(),
             obj: {} 
        };

        console.log('FirmScopeData to be sent:', firmScopeData);

        this.firmService.editAuthorizedScope(10044, firmScopeData).subscribe(
            response => {
                console.log('Firm scope updated successfully for FirmID:', firmData.FirmID, response);
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: `Firm scope saved successfully for FirmID: ${firmData.FirmID}`,
              });
            },
            error => {
                console.error('Error updating firm scope for FirmID:', firmData.FirmID, error);
                console.log('Error details:', error.error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: `Failed to save firm scope for FirmID: ${firmData.FirmID}.`,
              });
            }
        );
    });
}



  cancelEditAuthScope() {
    this.allowEditAuthScopeDetails = false;
  }


  onLegalStatusChange(value: number) {
    this.firmDetails.LegalStatusTypeID = value;
    if (value == 1 || value == 2 || value == 7 || value == 8) {
      this.firmDetails.PlaceOfIncorporation = constants.PLACE_OF_INCORPORATION_QFC;
    } else {
      this.firmDetails.PlaceOfIncorporation = '';
    }
  }

  padNumber(value: string): string {
    const strValue = value.toString();
    return strValue.padStart(5, '0'); // Ensure the value has a length of 5 digits
  }


  validateQFCNum(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.allowEditFirmDetails) {
        // If not, toggle to edit mode and resolve the promise
        this.allowEditFirmDetails = true;
        resolve();
        return;
      }
      if (this.firmDetails.QFCNum) {
        if (!this.isPositiveNonDecimal(this.firmDetails.QFCNum)) {
          this.getErrorMessages('QFCNum', constants.Firm_CoreDetails_Messages.INVALID_QFCNUMBER);
          this.hasValidationErrors = true;
          resolve(); // Proceed with validation, but hasValidationErrors is true
        } else {
          this.isQFCNumExist(this.firmDetails.QFCNum, this.firmId).then(isExist => {
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
      }
    });
  }

  validateFirmName(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.allowEditFirmDetails) {
        // If not, toggle to edit mode and resolve the promise
        this.allowEditFirmDetails = true;
        resolve();
        return;
      }
      if (this.firmDetails.FirmName) {
        this.isFirmNameExist(this.firmDetails.FirmName).then(isExist => {
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


  isQFCNumExist(qfcNum: string, firmId: number): Promise<boolean> {
    return this.firmService.isQFCNumExist(qfcNum, firmId).toPromise().then(response => {
      return response.response.Column1 === 1;
    });
  }

  isFirmNameExist(firmName: string): Promise<boolean> {
    return this.firmService.isFirmNameExist(firmName, this.firmId).toPromise().then(response => {
      return response.response.Column1 === 1;
    });
  }



  // Method to load firm details
  loadFirmDetails(firmId: number) {
    this.firmService.getFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.response;
        this.selectedFirmTypeID = this.firmDetails.AuthorisationStatusTypeID != 0 ? 3 : 2;
        this.dateOfApplication = this.firmDetails.AuthorisationStatusTypeID > 0 ? this.formatDateToCustomFormat(this.firmDetails.FirmAuthApplDate) : this.formatDateToCustomFormat(this.firmDetails.FirmLicApplDate);
        // this.firmDetails.AuthorisationDate = this.formatDateToCustomFormat(this.firmDetails.FirmAuthApplDate);
        // this.firmDetails.LicensedDate = this.formatDateToCustomFormat(this.firmDetails.FirmLicApplDate);
        this.getFirmTypes();
        this.loadPrevFirmAndDate();
        console.log('Firm details:', this.firmDetails);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }
  loadFirmOPDetails(firmId: number) {
    this.firmService.getFIRMOPData(firmId).subscribe(
      data => {
        this.firmOPDetails = data.response;
        console.log('2) Firm Operational details:', this.firmOPDetails);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }
  loadAuditors() {
    this.firmService.getFIRMAuditors(this.firmId).subscribe(
      data => {
        this.FIRMAuditors = data.response;
        console.log('Firm Auditors details:', this.FIRMAuditors);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }
  loadContacts() {
    this.firmService.getContactsOfFIRM(this.firmId).subscribe(
      data => {
        this.FIRMContacts = data.response;
        console.log('Firm FIRM Contacts details:', this.FIRMContacts);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }
  confirmDelete() {
    console.log("confirmDelete called: ", this.selectedContact)
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this contact?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteContact(true); // Just pass output here, no need for ": boolean"
      }
    });
  }
  deleteContact(output: boolean) {
    console.log(this.selectedContact.ContactID, this.selectedContact.ContactAssnID, "contactID , contactAssnID")
    this.firmService.deleteContactDetails(this.selectedContact.ContactID, this.selectedContact.ContactAssnID, output).subscribe(
      (response) => {
        console.log('Contact deleted successfully', response);
        Swal.fire(
          'Deleted!',
          'The contact has been deleted.',
          'success'
        );
        this.closeContactPopup();
        this.loadContacts();  // Reload contacts after deletion
      },
      (error) => {
        console.error('Error deleting contact', error);
        Swal.fire(
          'Error!',
          'There was an issue deleting the contact.',
          'error'
        );
      }
    );
  }
  onRowClick(contact: any): void {
    // Reset the selected contact and hide the popup until data is loaded
    this.selectedContact = {};
    this.isPopupVisible = false;

    // Fetch contact details based on selected row
    this.firmService.getContactDetails(this.firmId, contact.ContactID, contact.ContactAssnID).subscribe(
      data => {
        if (data && data.response) {
          this.selectedContact = data.response; // Assign the received data to selectedContact
          console.log("Selected contact: ", this.selectedContact); // Log to check data
          this.isPopupVisible = true; // Show the popup after data is loaded
          this.cdr.detectChanges(); // Trigger change detection to update the view
        } else {
          console.error('No contact data received:', data);
          this.isPopupVisible = false; // Hide popup if no data is received
        }
      },
      error => {
        console.error('Error fetching contact details', error);
        this.isPopupVisible = false; // Hide popup if there's an error
      }
    );
  }
  get filteredContacts() {
    if (this.displayInactiveContacts) {
      return this.FIRMContacts;
    } else {
      return this.FIRMContacts.filter(contact => contact.ContactTypeDesc !== 'Contact- No Longer');
    }
  }
  
  // Method to handle the checkbox change
  onInactiveContactsToggle(event: any): void {
    this.displayInactiveContacts = event.target.checked;
  }
  closeContactPopup() {
    this.isPopupVisible = false;
  }
  saveContactPopupChanges(): void {
    // Prepare the selectedContact object (which is bound to the form) to be saved
    const contactDetails = {
      firmId: this.firmId, // Ensure firmId is correctly passed
      contactID: this.selectedContact?.contactID,
      title: this.selectedContact?.title,
      firstName: this.selectedContact?.firstName,
      secondName: this.selectedContact?.secondName,
      thirdName: this.selectedContact?.thirdName,
      familyName: this.selectedContact?.familyName,
      countryOfResidence: this.selectedContact?.countryOfResidence,
      createdBy: this.selectedContact?.createdBy,
      dateOfBirth: this.selectedContact?.dateOfBirth,
      fullName: this.selectedContact?.fullName,
      lastModifiedBy: this.selectedContact?.lastModifiedBy,
      nationalID: this.selectedContact?.nationalID,
      nationality: this.selectedContact?.nationality,
      passportNum: this.selectedContact?.passportNum,
      placeOfBirth: this.selectedContact?.placeOfBirth,
      previousName: this.selectedContact?.previousName,
      isExists: this.selectedContact?.isExists,
      nameInPassport: this.selectedContact?.nameInPassport,
      contactAddnlInfoTypeID: this.selectedContact?.contactAddnlInfoTypeID,
      isFromContact: this.selectedContact?.isFromContact,
      countryofBirth: this.selectedContact?.countryofBirth,
      juridictionID: this.selectedContact?.juridictionID,
      objectID: this.selectedContact?.objectID,
      isPeP: this.selectedContact?.isPeP,
    };

    console.log("Data to be saved:", contactDetails);

    this.firmService.saveContactDetails(contactDetails).subscribe(
      (response) => {
        console.log('Contact saved successfully:', response);
        Swal.fire('Saved!', 'The contact details have been saved.', 'success');
        this.closeContactPopup();
        this.loadContacts(); // Reload the contacts list after saving
      },
      (error) => {
        console.error('Error saving contact details:', error);
        Swal.fire('Error!', 'There was an issue saving the contact.', 'error');
      }
    );
  }



  enableEditing() {
    this.isEditable = true;
  }

  UpdateContactPopupChange() {

    this.closeContactPopup();
  }
  // loadControllers() {
  //   this.firmService.getFIRMControllers(this.firmId).subscribe(
  //     data => {
  //       this.FIRMControllers = data.response;
  //       console.log('Firm FIRM Controllers details:', this.FIRMControllers);
  //     },
  //     error => {
  //       console.error('Error fetching firm controllers', error);
  //     }
  //   );
  // }
  loadControllers(): void {
    this.firmService.getFIRMControllers(this.firmId).subscribe(
      data => {
        if (data && Array.isArray(data.response)) {
          this.FIRMControllers = data.response.filter(controller =>
            [
              constants.EntityType.ParentEntity,
              constants.EntityType.CorporateController,
              constants.EntityType.Head_Office,
              constants.EntityType.IndividualController,
            ].includes(controller.EntityTypeID)
          );
          console.log('Filtered Firm FIRM Controllers details:', this.FIRMControllers);
        } else {
          console.error('Invalid data structure:', data);
          this.FIRMControllers = [];
        }
      },
      error => {
        console.error('Error fetching firm controllers', error);
      }
    );
  }

  loadControllersIndividual(): void {
    this.firmService.getFIRMControllers(this.firmId).subscribe(
      (data) => {
        console.log('Raw API Data:', data);
        if (Array.isArray(data.response)) {
          this.FIRMControllersIndividual = data.response.filter(controller =>
            [constants.EntityType.UBO_Corporate, constants.EntityType.UBO_Individual].includes(controller.EntityTypeID)
          );
        } else {
          console.error('Data is not an array:', data);
          this.FIRMControllersIndividual = [];
        }
        console.log('Filtered Controllers:', this.FIRMControllersIndividual);
      },
      (error) => {
        console.error('Error fetching firm controllers', error);
      }
    );
  }

  loadAssiRA() {
    this.firmService.getFIRMUsersRAFunctions(this.firmId, this.ASSILevel).subscribe(
      data => {
        this.FIRMRA = data.response;
        console.log('Firm RA Functions details:', this.FIRMRA);
      },
      error => {
        console.error('Error get Firm RA Functionsdetails', error);
      }
    );
  }
  loadRegisteredFund() {
    this.firmService.getFIRMRegisteredFund(this.firmId).subscribe(
      data => {
        this.RegisteredFund = data.response;
        console.log('Firm FIRM RegisteredFund details:', this.RegisteredFund);
      },
      error => {
        console.error('Error fetching firm RegisteredFund', error);
      }
    );
  }
  loadAdminFees() {
    this.firmService.getFIRMAdminFees(this.firmId).subscribe(
      data => {
        this.FirmAdminFees = data.response;
        console.log('Firm FIRM Admin Fees details:', this.FirmAdminFees);
      },
      error => {
        console.error('Error fetching firm Admin Fees', error);
      }
    );
  }

  loadActivitiesLicensed() {
    this.loadFormReference();
    this.firmService.getCurrentScopeRevNum(this.firmId, 2).subscribe( // 2 here is: Licensed
      data => {
        this.scopeRevNum = data.response.Column1;
        this.firmService.getFirmActivityLicensed(this.firmId).subscribe(
          data => {
            this.ActivityLicensed = data.response;
            console.log('Firm License scope details:', this.ActivityLicensed);
          },
          error => {
            console.error('Error fetching License scope', error);
          }
        );
      },
      error => {
        console.error('Error fetching current scope revision number for licensed: ', error);
      }
    );
  }

  loadFormReference() {
    this.firmService.getDocumentDetails(this.firmId).subscribe(
      data => {
        this.documentDetails = data.response;
      }, error => {
        console.error(error)
      })
  }

  loadActivitiesAuthorized() {
    this.firmService.getCurrentScopeRevNum(this.firmId, 3).subscribe( // 3 here is: Authorized
      data => {
        this.scopeRevNum = data.response.Column1;
        this.firmService.getFirmActivityAuthorized(this.firmId).subscribe(
          data => {
            this.ActivityAuth = data.response;
            const prudentialCategoryTypeID = this.ActivityAuth[0].PrudentialCategoryTypeID;
            this.loadPrudReturnTypes(prudentialCategoryTypeID);
            console.log('Firm Authorized scope details:', this.ActivityAuth);
          },
          error => {
            console.error('Error fetching License scope ', error);
          }
        );
      },
      error => {
        console.error('Error fetching current scope revision number for authorized: ', error);
      }
    );
  }

  onPrudentialCategoryChange(prudCategID: number) {
    // If "Select" is chosen in Prudential Category, do not load return types
    if (prudCategID != 0) {
      this.loadPrudReturnTypes(prudCategID);
    } else {
      // If "Select" is chosen, clear the Prudential Return Types list
      this.prudReturnTypesDropdown = [];
    }
    // Set SectorTypeID to 'Select' (value 0)
    this.ActivityAuth[0].SectorTypeID = 0;
  }
  

  loadScopeOfAuth() {
    this.firmService.getFirmScopeIdAndRevNum(this.firmId).pipe(
      switchMap(({ scopeId, scopeRevNum }) =>
        this.firmService.getDocument(scopeId, scopeRevNum)
      )
    ).subscribe(
      data => {
        this.AuthTableDocument = data.response;
        console.log('Document Data:', data);

      },
      error => {
        console.error('Error loading document:', error);

      }
    );
  }

  loadRegulatedActivities() {
    this.firmService.getFirmActivityAuthorized(this.firmId).subscribe(
      data => {
        this.AuthRegulatedActivities = data.response;

        this.AuthRegulatedActivities.forEach(activity => {
          console.log("Activity ID: " + activity.ActivityTypeID);  // Print activity ID

          if (activity.ActivityTypeID) {
            // Initialize categorizedData for each activity
            this.categorizedData = [];

            // Load all products for the given activity
            this.loadAllProducts(activity.ActivityTypeID).subscribe(allProducts => {
              let currentCategory = null;

              // Create a new object to represent the activity with its products
              const activityData = {
                activityId: activity.ActivityTypeID,
                ActivityCategoryDesc: activity?.ActivityCategoryDesc,
                ActivityTypeDesc: activity?.ActivityTypeDesc,
                specificCondition: activity?.Column1,
                products: []
              };

              // Categorize products into main categories and subcategories
              allProducts.forEach(item => {
                if (!currentCategory || item.ProductCategoryTypeID !== currentCategory.ProductCategoryTypeID) {
                  // Create a new main category
                  currentCategory = {
                    mainCategory: item.ProductCategoryTypeDesc1,
                    ProductCategoryTypeID: item.ProductCategoryTypeID,
                    subCategories: []
                  };
                  activityData.products.push(currentCategory);
                }

                // Check if the item is not the main category itself
                if (item.ID !== 0) {
                  // Add the current item as a subcategory
                  currentCategory.subCategories.push({
                    ID: item.ID,
                    ProductCategoryTypeDesc: item.ProductCategoryTypeDesc,
                    TotalProduct: item.TotalProduct
                  });
                }
              });

              // Push the activity data into categorizedData
              this.categorizedData.push(activityData);

              // Print the categorized data for debugging
              console.log("Activity ID " + activity.ActivityTypeID);

              activityData.products.forEach(category => {
                console.log("Product category " + category.ProductCategoryTypeID + ": " + category.mainCategory);

                category.subCategories.forEach(subCategory => {
                  console.log("Subcategories" + JSON.stringify(subCategory));
                });
              });
            });
          }

          // Initialize selectedCategory
          activity.selectedCategory = this.activityCategories.find(
            category => category.ActivityCategoryDesc === activity.ActivityCategoryDesc
          );

          // If selectedCategory is found, load activities for that category
          if (activity.selectedCategory) {
            this.firmService.getAuthActivityTypes(activity.selectedCategory.ActivityCategoryID).subscribe(
              data => {
                activity.activities = data.response;

                // Initialize selectedActivity based on ActivityTypeID
                activity.selectedActivity = activity.activities.find(
                  act => act.ActivityTypeID === activity.ActivityTypeID
                );
              }
            );
          }
        });
      },
      error => {
        console.error('Error fetching License scope', error);
      }
    );
  }




  loadAllProducts(activityID: any): Observable<any> {
    return this.firmService.getAllProducts(activityID).pipe(
      map(data => {
        const allProducts = data.response;
        return allProducts; // Return the transformed response
      })
    );
  }


  loadIslamicFinance() {
    this.firmService.getIslamicFinance(this.firmId).subscribe(
      data => {
        this.islamicFinance = data.response;
        console.log('Firm Islamic Finance:', this.islamicFinance);
      }, error => {
        console.error('Error Fetching islamic finance', error);
      })
  }

  loadFirmAdresses() {
    this.firmService.getFirmAddresses(this.firmId).subscribe(
      data => {
        this.firmAddresses = data.response;
        console.log('Firm Addresses: ', this.firmAddresses);
      }, error => {
        console.error('Error Fetching Firm Addresses', error);
      })
  }

  loadWaivers() {
    this.firmService.getFirmwaiver(this.firmId).subscribe(
      data => {
        this.FirmWaivers = data.response;
        console.log('Firm FIRM Waivers details:', this.FirmWaivers);
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }
  loadRMPs() {
    this.firmService.getFirmRisk(this.firmId).subscribe(
      data => {
        this.FIRMRMP = data.response;
        console.log('Firm FIRM RRM details:', this.FIRMRMP);
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }
  loadNotices() {
    this.firmService.getNotices(this.firmId).subscribe(
      data => {
        this.FIRMNotices = data.response;
        console.log('Firm FIRMNotices details:', this.FIRMNotices);
      },
      error => {
        console.error('Error fetching FIRMNotices ', error);
      }
    );
  }


  loadCurrentAppDetails() {
    this.firmService.getCurrentAppDetailsLicensedAndAuth(this.firmId, 2).subscribe(data => {
      this.firmAppDetailsCurrentLicensed = data.response;
      console.log(this.firmAppDetailsCurrentLicensed)
    }, error => {
      console.log(error)
    })

    this.firmService.getCurrentAppDetailsLicensedAndAuth(this.firmId, 3).subscribe(data => {
      this.firmAppDetailsCurrentAuthorized = data.response;
      console.log(this.firmAppDetailsCurrentAuthorized)
    }, error => {
      console.log(error)
    })
  }

  getFirmTypes() {
    this.applicationTypeId = this.firmDetails.AuthorisationStatusTypeID != 0 ? 3 : 2;
    this.firmService.getApplications(this.firmId, this.applicationTypeId).subscribe(
      data => {
        this.appDetails = data.response[0];
        console.log('Loaded firm application types:', this.appDetails);
      },
      error => {
        console.error('Error fetching Application Types: ', error);
      }
    );
  }


  loadPrevFirmAndDate() {
    this.firmService.getFirmsNameHistory(this.firmId).subscribe(
      data => {
        this.firmNamesHistory = data.response;
        this.cdr.detectChanges();
        console.log('Firm app details licensed history:', this.firmNamesHistory);
      },
    );
  }

  loadActivityCategories() {
    this.firmService.getActivityCategories().subscribe(
      data => {
        this.activityCategories = data.response;
        console.log('Firm activity categories details:', this.activityCategories);
      }, error => {
        console.error('Error fetching activity categories', error);
      }
    );
  }

  loadActivitiesTypesForLicensed() {
    this.firmService.getLicActivityTypes().subscribe(data => {
      this.licensedActivities = data.response;
      console.log('Firm activity types for licensed', this.licensedActivities);
    }, error => {
      console.error('Error fetching activity types for licensed', error)
    })
  }

  addNewActivity() {
    this.newActivity = {
      ActivityTypeID: 0,
      ActivityDisplayOrder: 0,
      ActivityCategoryID: 1,
      ActivityTypeDesc: '',
      FirmScopeTypeID: 1,
      FirmScopeTypeDesc: 'Add',
      FirmActivityID: 0,
      FirmActivityDetails: '',
      Column1: '',
      WithdrawnDate: 0,

      ApliedDate: this.ActivityLicensed[0].ApliedDate,
      AuthorisationCategoryTypeDesc: this.ActivityLicensed[0].AuthorisationCategoryTypeDesc,
      AuthorisationCategoryTypeID: this.ActivityLicensed[0].AuthorisationCategoryTypeID,
      CreatedDate: this.ActivityLicensed[0].CreatedDate,
      DocID: this.ActivityLicensed[0].DocID,
      EffectiveDate: this.ActivityLicensed[0].EffectiveDate,
      FileLoc: this.ActivityLicensed[0].FileLoc,
      FirmID: this.ActivityLicensed[0].FirmID,
      FirmScopeID: this.ActivityLicensed[0].FirmScopeID,
      GeneralConditions: this.ActivityLicensed[0].GeneralConditions,
      LastModifiedDate: this.ActivityLicensed[0].LastModifiedDate,
      ModifiedBy: this.ActivityLicensed[0].ModifiedBy,
      ScopeAppliedDate: this.ActivityLicensed[0].ScopeAppliedDate,
      ScopeCertificateLink: this.ActivityLicensed[0].ScopeCertificateLink,
      ScopeCreatedByName: this.ActivityLicensed[0].ScopeCreatedByName,
      ScopeCreatedDate: this.ActivityLicensed[0].ScopeCreatedDate,
      ScopeEffectiveDate: this.ActivityLicensed[0].ScopeEffectiveDate,
      ScopeLicensedDate: this.ActivityLicensed[0].ScopeLicensedDate,
      ScopeRevNum: this.ActivityLicensed[0].ScopeRevNum,
    };
    this.ActivityLicensed.push(this.newActivity);
  }

  removeLicActivity(index: number) {
    Swal.fire({
      title: 'Alert',
      text: 'Are you sure you want to delete this activity?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.errorMessages = {};
        const activity = this.ActivityLicensed[index];

        // Check for existing activity (with FirmActivityID)
        if (activity.FirmActivityID) {
          if (this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate) < this.currentDate) {
            this.showErrorAlert(constants.FirmActivitiesEnum.LICENSEDDATEPASSED_CANNOTREMOVE);
          } else if (this.ActivityLicensed.length > 1) {
            this.ActivityLicensed.splice(index, 1);
          } else {
            Swal.fire({
              title: 'Alert!',
              text: 'There has to be at least one permitted activity!',
              icon: 'error',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false
            });
          }
        } else {
          // Check for new activity at index 0
          if (index === 0 && this.ActivityLicensed.length === 1) {
            Swal.fire({
              title: 'Alert!',
              text: 'There has to be at least one permitted activity!',
              icon: 'error',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false
            });
          } else {
            this.ActivityLicensed.splice(index, 1);
          }
        }
      }
    });
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
      PhoneNum: '',
      FaxNum: '',
      LastModifiedBy: 0, //todo _userId;
      LastModifiedDate: this.currentDate,
      addressState: 0,
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

  areAllAddressTypesAdded() {
    const existingTypes = new Set(this.firmAddresses.map(addr => Number(addr.AddressTypeID)));
    return this.allAddressTypes.every(type => existingTypes.has(type.AddressTypeID));
  }

  removeAddress(index: number) {
    Swal.fire({
      title: 'Alert',
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
      this.showErrorAlert(constants.AddressControlMessages.DUPLICATE_ADDRESSTYPES);

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

  loadPrudReturnTypes(prudCategID: number) {
    this.firmService.getPrudReturnTypes(prudCategID).subscribe(data => {
      this.prudReturnTypesDropdown = data.response;
      console.log('Firm Scope Prud Return Types: ', this.prudReturnTypesDropdown);
    }, error => {
      console.log('Error fetching prud types: ', error)
    })
  }

  populateCountries() {
    this.firmService.getObjectTypeTable(constants.countries).subscribe(data => {
      this.allCountries = data.response;
    }, error => {
      console.error('Error Fetching Countries dropdown: ', error);
    })
  }

  populateLegalStatus() {
    this.firmService.getObjectTypeTable(constants.legalStatus).subscribe(data => {
      this.allLegalStatus = data.response;
    }, error => {
      console.error('Error Fetching Legal Status dropdown: ', error);
    })
  }

  populateQFCLicenseStatus() {
    this.firmService.getObjectTypeTable(constants.qfcLicenseStatus).subscribe(data => {
      this.allQFCLicenseStatus = data.response;
    }, error => {
      console.error('Error Fetching QFC License Status dropdown: ', error);
    })
  }

  populateAuthorisationStatus() {
    this.firmService.getObjectTypeTable(constants.authorisationStatus).subscribe(data => {
      this.allAuthorisationStatus = data.response;
    }, error => {
      console.error('Error Fetching Authorisation Status dropdown: ', error);
    })
  }

  populateFinYearEnd() {
    this.firmService.getObjectTypeTable(constants.FinYearEnd).subscribe(data => {
      this.allFinYearEnd = data.response;
    }, error => {
      console.error('Error Fetching Fin Year End dropdown: ', error);
    })
  }

  populateFinAccStd() {
    this.firmService.getObjectTypeTable(constants.FinAccStd).subscribe(data => {
      this.allFinAccStd = data.response;
    }, error => {
      console.error('Error Fetching Fin Acc Std dropdown: ', error);
    })
  }

  populateFirmAppTypes() {
    this.firmService.getObjectTypeTable(constants.firmAppTypes).subscribe(data => {
      this.allFirmTypes = data.response;
    }, error => {
      console.error('Error Fetching Firm Application Types dropdown: ', error);
    })
  }

  populateAddressTypes() {
    this.firmService.getObjectTypeTable(constants.addressTypes).subscribe(data => {
      this.allAddressTypes = data.response;
    }, error => {
      console.error('Error Fetching Address Types dropdown: ', error);
    })
  }

  populatePrudentialCategoryTypes() {
    this.firmService.getObjectTypeTable(constants.prudentialCategoryTypes).subscribe(data => {
      this.allPrudentialCategoryTypes = data.response;
    }, error => {
      console.error('Error Fetching Prudential Category Types dropdown: ', error);
    })
  }

  populateAuthorisationCategoryTypes() {
    this.firmService.getObjectTypeTable(constants.authorisationCategoryTypes).subscribe(data => {
      this.allAuthorisationCategoryTypes = data.response;
    }, error => {
      console.error('Error Fetching Authorisation Category Types dropdown: ', error);
    })
  }

  onCategoryChange(activity: any) {
    const selectedCategory = activity.selectedCategory;
    if (selectedCategory) {
      console.log('Selected Category ID:', selectedCategory.ActivityCategoryID);

      this.firmService.getAuthActivityTypes(selectedCategory.ActivityCategoryID).subscribe(
        data => {
          console.log('Fetched Activities for Category:', selectedCategory.ActivityCategoryDesc, data.response);

          // Populate activities array
          activity.activities = data.response;

          // Automatically select the first activity if there are activities available
          activity.selectedActivity = activity.activities.length > 0
            ? activity.activities[0]
            : null;
        },
        error => {
          console.error('Error fetching activities', error);
        }
      );
    }
  }

  getFYearHistory() {
    this.callFYear = true;
    this.firmService.getFYearEndHistory(this.firmId).subscribe(
      data => {
        this.firmFYearHistory = data.response;
        console.log('Firm Finance year end history details:', this.firmFYearHistory);
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

  getInactiveUsers() {
    this.callInactiveUsers = true;
    this.firmService.getInactiveUsersHistory(this.firmId).subscribe(
      data => {
        this.firmInactiveUsers = data.response;
        console.log('FirmInactive users history details:', this.firmInactiveUsers);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    setTimeout(() => {
      const popupWrapper = document.querySelector('.InactiveUsersPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class not found');
      }
    }, 0);
  }


  closeInactiveUsers() {
    this.callInactiveUsers = false;
    const popupWrapper = document.querySelector('.InactiveUsersPopUp') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }


  getApplicationDetailsHistory() {
    this.callAppDetails = true;
    this.firmService.getAppDetailsLicensedAndAuthHistory(this.firmId, 2, false).subscribe(
      data => {
        this.firmAppDetailsLicensed = data.response;
        console.log('Firm app details licensed history:', this.firmAppDetailsLicensed);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    this.firmService.getAppDetailsLicensedAndAuthHistory(this.firmId, 3, false).subscribe(
      data => {
        this.firmAppDetailsAuthorization = data.response;
        console.log('Firm app details licensed history:', this.firmAppDetailsAuthorization);
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
        console.log('Firm app details licensed history:', this.firmNamesHistory);
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

  getAccountingStandardHistory() {
    this.callAccStandard = true;
    this.firmService.getAccountingStandardsHistory(this.firmId).subscribe(
      data => {
        this.firmAccountingStandardHistory = data.response;
        console.log('Firm app details licensed history:', this.firmAccountingStandardHistory);
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

  getAddressTypeHistory(addressTypeId: number) {
    this.callAddressType = true;
    this.firmService.getAddressesTypeHistory(this.firmId, addressTypeId).subscribe(
      data => {
        this.firmAddressesTypeHistory = data.response;
        console.log('Firm History Addresses Type: ', this.firmAddressesTypeHistory);
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


  getLicScopePreviousVersions(firmId: number, firmApplicationTypeId: number) {
    this.callLicScopePrev = true;
    // Only fetch previous revisions if not already loaded
    if (!this.LicPrevRevNumbers || this.LicPrevRevNumbers.length === 0) {
      this.loadLicScopeRevisions(firmId, firmApplicationTypeId);
    }

    // Just show the popup without prompting the user or fetching new data
    setTimeout(() => {
      const popupWrapper = document.querySelector('.ScopeLicPreviousVersionsPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .ScopeLicPreviousVersionsPopup not found');
      }
    }, 0)
  }

  loadLicScopeRevisions(firmId: number, firmApplicationTypeId: number) {
    if (firmApplicationTypeId === 2) {
      this.firmService.getFirmActivityLicensed(firmId).subscribe(data => {
        this.ActivityLicensed = data.response;

        if (this.ActivityLicensed) {
          const scopeID = this.ActivityLicensed[0].FirmScopeID;

          this.firmService.getRevision(scopeID).subscribe(revisions => {
            console.log('Fetched revisions:', revisions);
            this.LicPrevRevNumbers = revisions.response;
          });
        } else {
          console.error('No activities found or scopeID is missing');
        }
      });
    }
  }

  closeLicScopePreviousVersions() {
    this.callLicScopePrev = false;
    const popupWrapper = document.querySelector('.ScopeLicPreviousVersionsPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .ScopeLicPreviousVersionsPopup not found');
    }
  }

  getAuthScopePreviousVersions(firmId: number, firmApplicationTypeId: number) {
    this.callAuthScopePrev = true;
    // Only fetch previous revisions if not already loaded
    if (!this.AuthPrevRevNumbers || this.AuthPrevRevNumbers.length === 0) {
      this.loadAuthScopeRevisions(firmId, firmApplicationTypeId);
    }

    // Just show the popup without prompting the user or fetching new data
    setTimeout(() => {
      const popupWrapper = document.querySelector('.ScopeAuthPreviousVersionsPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .ScopeAuthPreviousVersionsPopup not found');
      }
    }, 0)
  }

  loadAuthScopeRevisions(firmId: number, firmApplicationTypeId: number) {
    if (firmApplicationTypeId === 3) {
      this.firmService.getFirmActivityAuthorized(firmId).subscribe(data => {
        this.ActivityAuth = data.response;

        if (this.ActivityAuth) {
          const scopeID = this.ActivityAuth[0].FirmScopeID;

          this.firmService.getRevision(scopeID).subscribe(revisions => {
            console.log('Fetched revisions:', revisions);
            this.AuthPrevRevNumbers = revisions.response;
          });
        } else {
          console.error('No activities found or scopeID is missing');
        }
      });
    }
  }

  closeAuthScopePreviousVersions() {
    this.callAuthScopePrev = false;
    const popupWrapper = document.querySelector('.ScopeAuthPreviousVersionsPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .ScopeAuthPreviousVersionsPopup not found');
    }
  }

  fetchPreviousScopeVersions(firmId: number, firmApplicationTypeId: number, scopeRevNum: number) {
    if (firmApplicationTypeId === 2) {
      this.firmService.getScopeNum(firmId, scopeRevNum, 2).subscribe(data => {
        this.ActivityLicensed = data.response;
        this.currentLicRevisionNumber = scopeRevNum;
        console.log('Licensed Activities:', this.ActivityLicensed);
        this.updateLicLastRevisionNumber(); // Update lastRevisionNumber based on the response
        this.closeLicScopePreviousVersions();
      });
    } else if (firmApplicationTypeId === 3) {
      this.firmService.getScopeNum(firmId, scopeRevNum, 3).subscribe(data => {
        this.ActivityAuth = data.response;
        this.currentAuthRevisionNumber = scopeRevNum;
        console.log('Authorized Activities:', this.ActivityAuth);
        this.updateAuthLastRevisionNumber(); // Update lastRevisionNumber based on the response
        this.closeAuthScopePreviousVersions();
      });
    }
  }


  updateLicLastRevisionNumber() {
    this.lastLicRevisionNumber = Math.max(...this.LicPrevRevNumbers.map(r => r.ScopeRevNum));
  }

  updateAuthLastRevisionNumber() {
    this.lastAuthRevisionNumber = Math.max(...this.AuthPrevRevNumbers.map(r => r.ScopeRevNum));
  }

  viewController() {
    this.router.navigate(['home/view-controller']);
  }

  createController() {
    this.router.navigate(['home/create-controller']);
  }

  viewAuditor(auditor: any) {
    this.selectedAuditor = auditor;
    this.IsViewAuditorVisible = true;
    this.IsCreateAuditorVisible = false;
    this.IsEditAuditorVisible = false;
  }

  createAuditor() {
    this.IsCreateAuditorVisible = true;
    this.IsViewAuditorVisible = false;
    this.IsEditAuditorVisible = false;
  }

  editAuditor() {
    const selectedRadio = this.auditorRadios.find(radio => radio.nativeElement.checked);

    if (selectedRadio) {
      // Proceed with edit logic
      this.IsEditAuditorVisible = true;
      this.IsCreateAuditorVisible = false;
      this.IsViewAuditorVisible = false;
      this.selectedAuditor = selectedRadio.nativeElement.value; // Or fetch the auditor details
    } else {
      alert('Please select a record from the list of Auditors displayed.');
    }
  }

  getCleanedNotes(notes: string): string {
    if (typeof notes !== 'string') return '';

    // Remove <p> tags and replace <br> with newline
    let cleanedNotes = notes
      .replace(/<p\s*\/?>/gi, '\n') // <p> or <p />
      .replace(/<\/p>/gi, '\n') // </p>
      .replace(/<br\s*\/?>/gi, '\n'); // <br> or <br />
    return cleanedNotes;
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

  toggleIslamicFinanceFields() {
    if (this.islamicFinance && this.islamicFinance.IFinTypeId !== undefined) {
      this.isIslamicFinanceChecked = true;
    } else {
      this.isIslamicFinanceChecked = false;
    }
  }

  uploadDocument() {
    if (!this.selectedFile) {
      this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.getErrorMessages('uploadDocument', constants.DocumentAttechment.selectDocument);
    } else {
      delete this.errorMessages['uploadDocument'];
    }
  }

  checkFirmLicense() {
    this.firmService.isFirmLicensed(this.firmId).subscribe(
      (response) => {
        this.isLicensed = response.response;
        console.log('Firm licensed:', this.isLicensed);
      },
      error => {
        console.error('Error checking firm license:', error);
        this.isLicensed = false;
      }
    );
  }


  onFirmApplicationTypeChange(selectedFirmTypeID: number) {
    const applicationAuthStatus = this.allAuthorisationStatus.find(option => option.FirmApplStatusTypeID === constants.FirmAuthorizationApplStatusType.Application);
    const applicationLicStatus = this.allQFCLicenseStatus.find(option => option.FirmApplStatusTypeID === constants.FirmLicenseApplStatusType.Application);
    if (!this.isLicensed) {
      this.firmDetails.LicenseStatusTypeID = applicationLicStatus.FirmApplStatusTypeID;
      this.firmDetails.AuthorisationStatusTypeID = applicationAuthStatus.FirmApplStatusTypeID;

      this.firmDetails.AuthorisationStatusTypeLabelDesc = `Date ${applicationAuthStatus.FirmApplStatusTypeDesc}`;
      this.firmDetails.LicenseStatusTypeLabelDesc = `Date ${applicationAuthStatus.FirmApplStatusTypeDesc}`;

      this.firmDetails.LicensedDate = this.dateOfApplication;
      this.firmDetails.AuthorisationDate = this.dateOfApplication;
    }
    // Check if the selected firm type is "Authorize"
    if (selectedFirmTypeID == 3) { //  3 corresponds to 'Authorize'
      // Automatically set the Authorization Status to 'Application'


      if (applicationAuthStatus) {
        this.firmDetails.AuthorisationStatusTypeID = applicationAuthStatus.FirmApplStatusTypeID;
        this.firmDetails.AuthorisationStatusTypeLabelDesc = `Date ${applicationAuthStatus.FirmApplStatusTypeDesc}`;

        // Set the date of authorization to match the date of application
        this.firmDetails.AuthorisationDate = this.dateOfApplication;
      }
    }
  }

  onDateOfApplicationChange(newDate: string) {
    if (newDate && this.firmDetails.LicenseStatusTypeID == constants.FirmLicenseApplStatusType.Application) {
      this.dateOfApplication = newDate;
      this.firmDetails.LicensedDate = newDate;
      // if date of application is null
    } else if (!newDate && this.firmDetails.LicenseStatusTypeID == constants.FirmLicenseApplStatusType.Application) {
      this.dateOfApplication = newDate;
      this.firmDetails.LicensedDate = newDate;
    }
    if (newDate && this.firmDetails.AuthorisationStatusTypeID == constants.FirmAuthorizationApplStatusType.Application) {
      this.dateOfApplication = newDate;
      this.firmDetails.AuthorisationDate = newDate;
      // if date of application is null
    } else if (!newDate && this.firmDetails.AuthorisationStatusTypeID == constants.FirmAuthorizationApplStatusType.Application) {
      this.dateOfApplication = newDate;
      this.firmDetails.AuthorisationDate = newDate;
    }
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

          // Fallback to selected option's description if no status description is returned
          const selectedOption = this.allQFCLicenseStatus.find(option => option.FirmApplStatusTypeID === numericValue);
          const statusDescription = OldFirmApplStatusTypeDesc || selectedOption?.FirmApplStatusTypeDesc || '';

          // Update license status label
          this.firmDetails.LicenseStatusTypeLabelDesc = `Date ${statusDescription}`;

          // Set the date if available, otherwise make it null
          this.firmDetails.LicensedDate = OldFirmApplStatusDate !== '1900-01-01T00:00:00'
            ? this.formatDateToCustomFormat(OldFirmApplStatusDate)
            : null;

          // Save the current status and date
          this.licenseStatusDates[numericValue] = this.firmDetails.LicensedDate;

          let messagePromises: Promise<string>[] = [];
          if (this.firmDetails.FirmTypeID !== 2) {
            if (this.firmDetails.LicensedDate) {
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
              if (this.firmDetails.AuthorisationDate) {
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
          this.firmDetails.LicenseStatusTypeLabelDesc = `Date ${selectedOption?.FirmApplStatusTypeDesc || ''}`;
          this.firmDetails.LicensedDate = null;
        }
      });
  }

  onAuthorizedStatusChange(selectedValue: any) {
    const numericValue = Number(selectedValue);

    if (isNaN(numericValue) || !this.firmId) {
      console.error('Invalid value or firm ID');
      return;
    }

    if (!this.isLicensed) {
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
          this.firmDetails.AuthorisationStatusTypeLabelDesc = `Date ${statusDescription}`;

          // Ensure that the date is null if OldFirmApplStatusDate is invalid or equal to 1900-01-01
          if (OldFirmApplStatusDate && OldFirmApplStatusDate !== '1900-01-01T00:00:00') {
            this.firmDetails.AuthorisationDate = this.formatDateToCustomFormat(OldFirmApplStatusDate);
          } else {
            this.firmDetails.AuthorisationDate = null; // Set to null if date is invalid
          }

          // Save the current status and date
          this.authorisationStatusDates[numericValue] = this.firmDetails.AuthorisationDate;
          let messagePromises: Promise<string>[] = [];
          if (this.firmId !== null) {
            if (IsFirmApplStatusGroupChanged > 0) {
              if (IsFirmApplStatusGroupChanged == 1) {
                messagePromises.push(this.getNotePopupMessage(3913));
              } else if (IsFirmApplStatusGroupChanged == 2) {
                messagePromises.push(this.getNotePopupMessage(3914));
              }
            }
            if (this.firmDetails.AuthorisationDate) {
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
          this.firmDetails.AuthorisationStatusTypeLabelDesc = `Date ${selectedOption?.FirmApplStatusTypeDesc || ''}`;
          this.firmDetails.AuthorisationDate = null; // Ensure it's set to null
        }
      });
  }

  convertDateToYYYYMMDD(dateStr: string | Date): string | null {
    console.log(dateStr);

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



  formatDateToCustomFormat(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getErrorMessages(fieldName: string, msgKey: number, placeholderValue?: string) {
    this.firmService.errorMessages(msgKey).subscribe(
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

  showErrorAlert(messageKey: number) {
    this.firmService.errorMessages(messageKey).subscribe(
      (response) => {
        Swal.fire({
          title: 'Alert!',
          text: response.response,
          icon: 'error',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
    );
  }

  showFirmDetailsSaveSuccessAlert(messageKey: number) {
    this.firmService.errorMessages(messageKey).subscribe(
      (response) => {
        Swal.fire({
          title: 'Success!',
          text: response.response,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
    );
  }

  showFirmScopeSaveSuccessAlert(messageKey: number) {
    this.firmService.errorMessages(messageKey).subscribe(
      (response) => {
        const replacedText = response.response.replace('#Tab#', 'Licensed');
        Swal.fire({
          title: 'Success!',
          text: replacedText,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      },
    );
  }

  // Function to return a promise for the note popup message for Authorisation type change
  getNotePopupMessage(messageKey: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.firmService.errorMessages(messageKey).subscribe(
        (response) => resolve(response.response), // Resolve with the message
        (error) => reject(error) // Reject in case of error
      );
    });
  }

  // Method to show a SweetAlert with combined messages for Authorisation type change
  showCombinedPopup(messages: string[]) {
    Swal.fire({
      // title: 'Alert!',
      html: messages.join('<br>'), // Combine the messages with a line break
    });
  }

  // Method to show a SweetAlert for QFC Licensed type change
  showPopupLicenseTypeChange(messages: string[]) {
    Swal.fire({
      // title: 'Alert!',
      html: messages.join('<br>'), // Combine the messages with a line break
    });
  }

  // Popups when you click save
  showApplnStatusValidationPopup(messageKey: number, placeholder: string, onConfirmed?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.firmService.errorMessages(messageKey).subscribe(
        (response) => {
          const messageWithPlaceholder = response.response.replace("{0}", placeholder);
          Swal.fire({
            html: messageWithPlaceholder,
            showCancelButton: true,
            confirmButtonText: 'Ok',
            cancelButtonText: 'Cancel',
            reverseButtons: false
          }).then((result) => {
            if (result.isConfirmed) {
              if (onConfirmed) {
                onConfirmed(); // Run additional logic when "Ok" is clicked
              }
              resolve(); // Proceed with validation or next step
            } else {
              reject(new Error('Cancelled by user')); // Stop the process if "Cancel" is clicked
            }
          });
        },
        (error) => {
          console.error('Error fetching error message:', error);
          reject(error); // Handle error, prevent continuation if the message fails to load
        }
      );
    });
  }

  isNullOrEmpty(value: any): boolean {
    return value === null || value === '';
  }
}