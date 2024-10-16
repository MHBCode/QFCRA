import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';  // Import ActivatedRoute
import { FirmService } from 'src/app/ngServices/firm.service';  // Import FirmService
import flatpickr from 'flatpickr';
import { forkJoin, Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import * as constants from 'src/app/app-constants';
import Swal from 'sweetalert2';
import { SecurityService } from 'src/app/ngServices/security.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-view-firm-page',
  templateUrl: './view-firm-page.component.html',
  styleUrls: ['./view-firm-page.component.scss']
})
export class ViewFirmPageComponent implements OnInit {

  userId = 30; // Replace with dynamic userId as needed
  errorMessages: { [key: string]: string } = {};
  /* for Auditors */
  IsViewAuditorVisible: boolean = false;
  IsCreateAuditorVisible: boolean = false;
  IsEditAuditorVisible: boolean = false;
  canAddNewAddress: boolean = true;
  disableAddressFields: boolean = false;
  isFirmLicensed: boolean;
  isFirmAuthorised: boolean;
  selectedAuditor: any = null;
  categorizedData = [];
  selectedAuditorNameFromSelectBox: string = 'select';
  flatpickrInstance: any;
  initialized = false;
  /* Firm Details */
  @ViewChildren('auditorRadio') auditorRadios!: QueryList<any>;
  @ViewChildren('dateInputs') dateInputs: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild('firmSection') firmSection: ElementRef;
  @ViewChild('coreDetailSection') coreDetailSection: ElementRef;
  @ViewChild('scopeSection') scopeSection: ElementRef;
  @ViewChild('controllerSection') controllerSection: ElementRef;
  @ViewChild('auditorSection') auditorSection: ElementRef;
  @ViewChild('contactsSection') contactsSection: ElementRef;

  /* Individual */
  @ViewChild('individualSection') individualSection: ElementRef;
  @ViewChild('individualDetailsSection') individualDetailsSection: ElementRef;

  /* Supervision */
  @ViewChild('supervisionSection') supervisionSection: ElementRef;
  @ViewChild('reportingScheduleSection') reportingScheduleSection: ElementRef;
  @ViewChild('returnReviewSection') returnReviewSection: ElementRef;
  @ViewChild('noticesSection') noticesSection: ElementRef;
  @ViewChild('adminFeeSection') adminFeeSection: ElementRef;
  @ViewChild('rmpsSection') rmpsSection: ElementRef;
  @ViewChild('breachesSection') breachesSection: ElementRef;
  @ViewChild('waiversSection') waiversSection: ElementRef;
  @ViewChild('enfActionSection') enfActionSection: ElementRef;
  @ViewChild('regFundsSection') regFundsSection: ElementRef;
  @ViewChild('journalSection') journalSection: ElementRef;

  showCreateControllerSection: boolean = false;
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
  menuWidth: string = '6%';
  dataWidth: string = '93%';
  width1: string = '14%';
  width2: string = '6%';
  widthData1: string = '98%';
  widthData2: string = '85%';
  titleSection: string = 'Firm Details';
  firmId: number = 0;  // Add firmId property
  ASSILevel: number = 4;
  firmDetails: any = {};  // Add firmDetails property
  dateOfApplication: any;
  formattedLicenseApplStatusDate: any;
  formattedAuthApplStatusDate: any;
  AuthorisationStatusTypeLabelDescFormatted: any;
  LicenseStatusTypeLabelDescFormatted: any;
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
  firmAddressesTypeHistory: any = [];
  ActivityLicensed: any = [{}];
  ActivityAuth: any = [{}];
  AuthTableDocument: any = [];
  islamicFinance: any = {};
  activityCategories: any[] = [];
  activityTypes: any[] = [];
  availableProducts: any[] = [];
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
  isPopupOpen = false;
  selectedFirmName = '';

  RegisteredFund: any[] = [];
  FIRMRA: any[] = [];
  FirmAdminFees: any[] = [];
  FirmWaivers: any;
  FIRMRMP: any;
  FIRMNotices: any;
  usedAddressTypes: Set<string> = new Set();
  newAddress: any = {};
  newActivity: any = {};
  newPermittedActivity: any = {};
  isEditModeCore: boolean = false;
  /* for scope */
  activeSection: string = 'Licensed';
  tabIndex: number = 0; // 0 for Licensed, 1 for Authorized
  isEditModeLicense: boolean = false;
  isEditModeAuth: boolean = false;
  showPermittedActivitiesTable: string | boolean = false;
  isIslamicFinanceChecked: boolean = true;
  isIslamicFinanceDeleted: boolean = false;
  disableApplicationDate: boolean = true;
  showVaryBtn: boolean = true;
  resetFirmSector: boolean = false;
  SectorTypeIDChanged: boolean = false;
  PrudentialCategoryIDChanged: boolean = false;
  // resetSectorTypeID: boolean = false;
  scopeRevNum: number;
  selectedCategory: number;
  selectedActivity: string;
  documentDetails: any = {};
  LicPrevRevNumbers: any = [];
  AuthPrevRevNumbers: any = [];
  existingActivities: any = [];
  existingProducts: any = [];
  sectorDetails: any = [];
  prudentialCategoryDetails: any = [];
  currentLicRevisionNumber: number | null = null;
  lastLicRevisionNumber: number | null = null;
  currentAuthRevisionNumber: number | null = null;
  lastAuthRevisionNumber: number | null = null;
  isScopeConditionChecked: boolean = false;
  previousPrudentialCategoryID: number;
  previousSectorTypeID: number;
  /* */
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
  allFirmScopeTypes: any = [];
  activeTab: FrimsObject = FrimsObject.Firm;

  isCollapsed: { [key: string]: boolean } = {};
  selectedFile: File | null = null;
  fileError: string = '';

  objFirmScope: any = {};
  lstFirmActivities: any = [];
  objectProductActivity: any = [];
  objPrudentialCategory: any = {};
  objSector: any = {};
  lstFirmScopeCondition: any = [];
  objFirmIslamicFinance: any = {};
  rstFirmSector: boolean;
  firmSectorID: any;

  assignedLevelUsers: any = [];
  isFirmAMLSupervisor: boolean = false;
  isFirmSupervisor: boolean = false;
  controlsPermissions: any = [];
  loading: boolean;
  CorporateControllerEdit: any[] = [];
  legalStatusOptionsEdit: any[] = [];
  legalStatusOptionsCreate: any[] = [];
  establishmentOptionsEdit: any[] = [];
  controlTypeOptionsEdit: any[] = [];
  controlTypeOptionsCreate: any[] = [];
  countryOptionsEdit: any[] = [];
  countryOptionsCreate: any[] = [];
  addressTypeOptionsEdit: any[] = [];
  TitleEdit: any[] = [];
  /* buttons */
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;
  // flags validations
  hasValidationErrors: boolean = false;
  invalidAddress: boolean;
  invalidActivity: boolean;
  isUserAllowed: boolean | null = null;

  selectedType: string = '';
  showHoldingsPercentage: boolean = false;
  selectedControlType: string = 'select';
  hideForms: boolean = true;
  isCompanyTraded: boolean | null = null;
  isCompanyRegulated: boolean | null = null;
  more10UBOs: boolean | null = null;
  /* */
  objectOpType = constants.ObjectOpType.View;
  FrimsObject = FrimsObject;

  //Contact Popup 
  isPopupVisible: boolean = false;
  isEditable: boolean = false; // Controls the readonly state of the input fields
  selectedContact: any = null;
  /* current date */
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];

  /* user access and security */
  assignedUserRoles: any = [];

  /* loader flag */
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,  // Inject ActivatedRoute
    private firmService: FirmService,  // Inject FirmService
    private securityService: SecurityService,
    private el: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.scrollToTop();


    this.route.params.subscribe(params => {
      this.firmId = +params['id']; // Retrieve the firm ID from the route parameters
      console.log(`Loaded firm with ID: ${this.firmId}`);
      this.loadFirmDetails(this.firmId);  // Fetch the firm details
      this.loadFirmOPDetails(this.firmId); // Fetch Operational Data
      this.loadAssiRA();
      this.checkFirmLicense();
      this.checkFirmAuthorisation();
      this.userAllowedToAccessFirm();

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
      this.populateFirmScopeTypes();

      this.loadAssignedUserRoles();
      this.isValidFirmAMLSupervisor(this.firmId, this.userId);
      this.isValidFirmSupervisor(this.firmId, this.userId);
      this.getAssignedLevelUsers();

      this.getControllerControlTypes();
      this.getControllerControlTypesCreat();
      this.getTitle();
      this.getAddressTypesController();
      this.getlegalStatusController();
      this.getlegalStatusControllerCreate()
      this.getCorporateController();
      this.getcountries();
      this.getFirmAuditorName();
      this.getFirmAuditorType();

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

  toggleMenu(inputNumber: number) {
    if (this.menuId === inputNumber) {
      // Don't hide the menu if it's the same one clicked again
      return;
    } else {
      // Open the new menu and set the appropriate widths
      this.menuId = inputNumber;
      this.menuWidth = this.width1;
      this.dataWidth = this.widthData2;
      if (this.menuId === 1) {
        this.titleSection = 'Firm Details';
      } else if (this.menuId === 2) {
        this.titleSection = 'Individuals';
      } else if (this.menuId === 3) {
        this.titleSection = 'Supervision';
      }
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

  switchTab(objectId: FrimsObject) {
    console.log('switchTab called with:', objectId);
    this.activeTab = objectId;

    // Hide all sections
    this.hideAllSections();

    this.isEditModeLicense = false;
    this.isEditModeAuth = false;
    this.isEditModeCore = false;
    // Add other edit mode variables if needed...

    // Show the selected section based on the objectId
    switch (objectId) {
      case FrimsObject.CoreDetail:
        this.showSection(this.coreDetailSection);
        this.hideEditBtn = false;
        this.hideCreateBtn = false;
        this.hideDeleteBtn = false;
        this.hideReviseBtn = false;
        this.applySecurityOnPage(FrimsObject.CoreDetail, this.isEditModeCore);
        this.loadPrevFirmAndDate();
        this.loadCurrentAppDetails();
        this.loadFirmAdresses();
        break;
      case FrimsObject.Scope:
        const section = 'Licensed';
        this.showSection(this.scopeSection);

        this.activeSection = 'Licensed';

        if (section === 'Licensed') {
          this.tabIndex = 0;
          this.disableApplicationDate = true;
          this.loadActivitiesLicensed()
            .then(() => {
              this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeLicense);
            })
            .catch((error) => {
              console.error('Error loading activities:', error);
            })
            .finally(() => {
              this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeLicense);
            });
        } else if (section === 'Authorized') {
          this.tabIndex = 1;
          this.disableApplicationDate = true;
          this.loadActivitiesAuthorized()
            .then(() => {
              this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeAuth);
            })
            .catch((error) => {
              console.error('Error loading activities:', error);
            })
            .finally(() => {
              this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeAuth);
            });
        }
        break;
      case FrimsObject.Auditor:
        this.showSection(this.auditorSection);
        if (this.FIRMAuditors.length === 0) {
          this.loadAuditors();
        }
        break;
      case FrimsObject.Contatcs:
        this.showSection(this.contactsSection);
        if (this.FIRMContacts.length === 0) {
          this.loadContacts();
        }
        break;
      case FrimsObject.Controller:
        this.showSection(this.controllerSection);
        if (this.FIRMControllers.length === 0) {
          this.loadControllers();
          this.loadControllersIndividual();
        }
        break;
      case FrimsObject.Supervision:

        this.showSection(this.supervisionSection);
        break;
      case FrimsObject.ReturnsReview:
        this.showSection(this.returnReviewSection);
        break;
      case FrimsObject.Notices:
        this.showSection(this.noticesSection);
        this.loadNotices();
        break;
      case FrimsObject.LateAdminFee:
        this.showSection(this.adminFeeSection);
        this.loadAdminFees()
        break;
      case FrimsObject.RMP:
        this.showSection(this.rmpsSection);
        this.loadRMPs()
        break;
      case FrimsObject.Breach:
        this.showSection(this.breachesSection);
        break;
      case FrimsObject.Waiver:
        this.showSection(this.waiversSection);
        this.loadWaivers()
        break;
      case FrimsObject.Enforcement:
        this.showSection(this.enfActionSection);
        break;
      case FrimsObject.RegisteredFunds:
        this.showSection(this.regFundsSection);
        this.loadRegisteredFund()
        break;
      case FrimsObject.SupervisionJournal:
        this.showSection(this.journalSection);
        break;
      default:
        break;
    }
  }

  // Method to hide all sections
  hideAllSections() {
    this.renderer.setStyle(this.coreDetailSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.scopeSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.controllerSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.auditorSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.contactsSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.individualSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.supervisionSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.reportingScheduleSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.returnReviewSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.noticesSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.adminFeeSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.rmpsSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.breachesSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.waiversSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.enfActionSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.regFundsSection.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.journalSection.nativeElement, 'display', 'none');
  }

  // Method to show a specific section
  showSection(section: ElementRef) {
    this.renderer.setStyle(section.nativeElement, 'display', 'flex');
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


  getControlVisibility(controlName: string): boolean {
    const control = this.controlsPermissions.find(c => c.ControlName === controlName);
    return control ? control.ShowProperty === 1 : false;
  }

  getControlEnablement(controlName: string): boolean {
    const control = this.controlsPermissions.find(c => c.ControlName === controlName);
    return control ? control.EnableProperty === 1 : false;
  }


  // This one is used for Core Details and Scope Licensed/Authorized
  applySecurityOnPage(objectId: FrimsObject, isEditMode: boolean) {
    if (this.activeTab === FrimsObject.Scope) {
      this.maskCommandActionsControlsScope();
    }
    this.loading = true;
    const currentOpType = isEditMode ? ObjectOpType.Edit : ObjectOpType.View;

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

  maskCommandActionsControlsScope() {
    this.hideCreateBtn = false;
    this.hideEditBtn = false;
    this.hideDeleteBtn = false;
    this.hideReviseBtn = false;
    if (this.tabIndex === 0) { //Licensed
      if (!(this.isNullOrEmpty(this.ActivityLicensed[0].FirmScopeID)) && this.ActivityLicensed[0].FirmScopeID) {
        this.hideCreateBtn = true;
      }
      if (this.firmDetails.LicenseStatusTypeID === constants.FirmLicenseApplStatusType.Application) {
        this.hideReviseBtn = true;
      }
      if (!(this.isFirmLicensed)) {
        this.hideCreateBtn = true;
        this.hideEditBtn = true;
        this.hideDeleteBtn = true;
        this.hideReviseBtn = true;
      }
    }

    if (this.tabIndex === 1) { //Authorised
      if (!(this.isNullOrEmpty(this.ActivityAuth[0]?.FirmScopeID) && this.ActivityAuth[0].FirmScopeID)) {
        this.hideCreateBtn = true;
      }
      if (this.firmDetails.AuthorisationStatusTypeID === constants.FirmAuthorizationApplStatusType.Application) {
        this.hideReviseBtn = true;
      }
      if (!(this.isFirmAuthorised)) {
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


  isValidFirmSupervisor(firmId: number, userId: number): void {
    this.securityService.isValidFirmSupervisor(firmId, userId).subscribe((response) => {
      this.isFirmSupervisor = response.response;
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

  getAssignedLevelUsers(): void {
    this.firmService.getAssignLevelUsers().subscribe((response) => {
      this.assignedLevelUsers = response.response;
    }, error => {
      console.error('error fetching assigned level users: ', error)
    })
  }

  hideActionButton() {
    this.hideEditBtn = true;
    this.hideSaveBtn = true;
    this.hideCancelBtn = true;
    this.hideCreateBtn = true;
    this.hideDeleteBtn = true;
    this.hideReviseBtn = true;
  }

  loadAssignedUserRoles() {
    this.securityService.getUserRoles(this.userId).subscribe((assignedRoles) => {
      this.assignedUserRoles = assignedRoles.response;
      console.log(this.assignedUserRoles);
    }, error => {
      console.error('Error fetching assigned roles: ', error);
    })
  }

  removeHtmlTags(input: string): string {
    // This regex will remove all HTML tags
    return input.replace(/<[^>]*>/g, '');
  }

  editFirm() {
    this.isLoading = true;
    this.existingAddresses = this.firmAddresses.filter(address => address.Valid);

    // If form is not in edit mode, toggle it to edit mode
    if (!this.isEditModeCore) {
      this.objectOpType = constants.ObjectOpType.Edit; //Not used
      this.isEditModeCore = true;
      this.applySecurityOnPage(FrimsObject.CoreDetail, this.isEditModeCore);
      this.isLoading = false;
      return;
    }
  }

  async saveFirm() {
    this.isLoading = true;
    // Start validations
    this.hasValidationErrors = false;
    this.existingAddresses = this.firmAddresses.filter(address => address.Valid);
    // Synchronous firm-level validation checks
    this.validateFirmDetails(); // Perform existing validation logic synchronously

    // If validation errors exist, stop the process
    if (this.hasValidationErrors) {
      this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
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
        this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
        this.isLoading = false;
        return;
      }

      // Prepare firm object and save the firm details
      const firmObj = this.prepareFirmObject(this.userId);
      this.saveFirmDetails(firmObj, this.userId);

      // Toggle off edit mode after saving
      this.isEditModeCore = false;
      this.applySecurityOnPage(FrimsObject.CoreDetail, this.isEditModeCore);
      this.isLoading = false;
    } catch (error) {
      if (error.message !== 'Cancelled by user') {
        console.error('Validation or Save Process failed:', error);
        this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
        this.isLoading = false;
      }
    }
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
    if (!this.dateOfApplication || this.dateOfApplication == '01/Jan/0001') {
      this.getErrorMessages('DateOfApplication', constants.Firm_CoreDetails_Messages.ENTER_DATE_OF_APPLICATION);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['DateOfApplication'];
    }

    if (!this.formattedLicenseApplStatusDate) {
      this.getErrorMessages('LicensedDate', constants.FirmActivitiesEnum.ENTER_VALID_DATE, "QFC License Status date");
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['LicensedDate'];
    }

    if (!this.formattedAuthApplStatusDate) {
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
              resolve(true); // Validation passes
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
        licensedDate: this.convertDateToYYYYMMDD(this.formattedLicenseApplStatusDate),
        authorisationStatusTypeID: this.firmDetails.AuthorisationStatusTypeID,
        authorisationDate: this.convertDateToYYYYMMDD(this.formattedAuthApplStatusDate),
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
          objectID: address.ObjectID || FrimsObject.CoreDetail,
          objectInstanceID: address.ObjectInstanceID || this.firmId,
          objectInstanceRevNumber: address.ObjectInstanceRevNumber || 1,
          sourceObjectID: address.SourceObjectID || FrimsObject.CoreDetail,
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
    this.applySecurityOnPage(FrimsObject.CoreDetail, this.isEditModeCore);
  }

  // Function to save firm details
  saveFirmDetails(firmObj: any, userId: number) {
    this.isLoading = true;
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
      title: 'Alert',
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
        this.applySecurityOnPage(FrimsObject.CoreDetail, this.isEditModeCore);
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

  // This function applies only the Vary Button logic and leaves the application date input always disabled in view mode
  applyVaryScopeButtonVisibilityOnEdit() {
    if (this.tabIndex === 0) {
      // Logic for showing or hiding the "Vary Scope" button
      if (!(this.isNullOrEmpty(this.ActivityLicensed[0].ScopeAppliedDate)) && !(this.isNullOrEmpty(this.ActivityLicensed[0].ScopeLicensedDate))) {
        if (this.currentDate > this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate)) {
          this.showVaryBtn = true;
          this.disableApplicationDate = false;
        } else {
          this.showVaryBtn = false;
          this.disableApplicationDate = true;
        }
      } else {
        this.showVaryBtn = false;
        this.disableApplicationDate = true;
      }
    } else if (this.tabIndex === 1) {
      if (!(this.isNullOrEmpty(this.ActivityAuth[0].ScopeApplicationDate)) && !(this.isNullOrEmpty(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate))) {
        if (this.currentDateOnly > this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate)) {
          this.disableApplicationDate = false;  // Enable the field
          this.showVaryBtn = true;
        } else {
          this.disableApplicationDate = true;  // Disable the field
          this.showVaryBtn = false;
        }
      } else {
        this.disableApplicationDate = true;  // Enable if no authorisation date is present
        this.showVaryBtn = false;
      }
    }
  }

  switchScopeTab(section: string) {
    this.activeSection = section;  // Update the active section
    this.errorMessages = {};
    if (section === 'Licensed') {
      this.tabIndex = 0;
      this.isEditModeLicense = false;
      this.disableApplicationDate = true;
      this.loadActivitiesLicensed()
        .then(() => {
          this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeLicense);
        })
        .catch((error) => {
          console.error('Error loading activities:', error);
        })
        .finally(() => {
          this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeLicense);
        });
    } else if (section === 'Authorized') {
      this.tabIndex = 1;
      this.isEditModeAuth = false;
      this.loadActivitiesAuthorized()
        .then(() => {
          this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeAuth);
        })
        .catch((error) => {
          console.error('Error loading auth activities:', error);
        })
        .finally(() => {
          this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeAuth);
        });
    }
  }


  editLicenseScope() {
    if (this.ActivityLicensed[0].ScopeRevNum) {
      // enable/disable application date input and vary scope/revise button visiblity
      // Check if the current date is greater than the ScopeLicensedDate
      // if (!(this.isNullOrEmpty(this.ActivityLicensed[0].ScopeAppliedDate)) && !(this.isNullOrEmpty(this.ActivityLicensed[0].ScopeLicensedDate))) {
      //   if (this.currentDate > this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate)) {
      //     this.disableApplicationDate = false;  // Enable the field
      //     this.showVaryBtn = true;
      //   } else {
      //     this.disableApplicationDate = true;  // Disable the field
      //     this.showVaryBtn = false;
      //   }
      // } else {
      //   this.disableApplicationDate = true;  // Enable if no licensed date is present
      //   this.showVaryBtn = false;
      // }

      this.applyVaryScopeButtonVisibilityOnEdit();

      // If the form is not in edit mode, toggle to edit mode
      if (!this.isEditModeLicense) {
        this.isEditModeLicense = true;
        //this.objectOpType = constants.ObjectOpType.Edit;
        this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeLicense);
        return; // Exit the function to prevent running validations
      }
    }
  }

  validateLicenseScope() {
    // APPLICATION DATE VALIDATION
    if (this.isNullOrEmpty(this.ActivityLicensed[0].ScopeAppliedDate)) {
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
  }

  saveLicenseScope() {
    this.isLoading = true;
    // If the form is in edit mode, proceed with validations and saving

    this.hasValidationErrors = false;

    this.validateLicenseScope();

    // Step 2: Handle Validation Errors
    if (this.hasValidationErrors) {
      this.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS);
      this.isLoading = false;
      return; // Prevent further action if validation fails
    }

    this.ActivityLicensed.forEach(activityLic => {
      const selectedActivity = this.licensedActivities.find(activity => activity.ActivityTypeID === +activityLic.ActivityTypeID);
      if (selectedActivity) {
        activityLic.ActivityTypeDesc = selectedActivity.ActivityTypeDesc;
      }
    });

    this.existingActivities = this.ActivityLicensed;

    if (!(this.isNullOrEmpty(this.ActivityLicensed[0].ScopeEffectiveDate)) && this.currentDateOnly > this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeEffectiveDate) || this.ActivityLicensed[0].ScopeRevNum === 1) {
      this.isLoading = false;
      this.saveVaryLicenseScope();
    } else {

      // Step 3: Save License Scope Details
      this.executeSaveLicense()
    }
  }

  executeSaveLicense() {
    const updatedLicenseScope = this.prepareLicenseScopeObject(this.userId);
    this.saveLicenseScopeDetails(updatedLicenseScope, this.userId);
    this.showFirmScopeLicSaveSuccessAlert(constants.FirmActivitiesEnum.ACTIVITIES_SAVED_SUCCESSFULLY);
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
        withDrawnDate: this.convertDateToYYYYMMDD(activityLic.ScopeEffectiveDate),
        objectProductActivity: null,
        activityDetails: activityLic.FirmActivityDetails
      }))
    };
  }

  saveLicenseScopeDetails(updatedLicenseScope: any, userId: number) {
    this.isLoading = true;
    console.log('Updated License Scope:', updatedLicenseScope);

    this.firmService.editLicenseScope(updatedLicenseScope).subscribe(
      response => {
        console.log('License scope updated successfully:', response);
        this.loadActivitiesLicensed(); // Reload license scope details
        this.isEditModeLicense = false; // Toggle edit mode off
        this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeLicense);
        this.disableApplicationDate = true;
        this.isLoading = false;
      },
      error => {
        console.error('Error updating license scope:', error);
        this.isLoading = false;
      }
    );
  }

  saveVaryLicenseScope(): void {
    this.firmService.errorMessages(constants.FirmActivitiesEnum.SCOPECHANGED_SAVEORREVISE).subscribe((response) => {
      Swal.fire({
        title: 'Alert',
        text: response.response,
        icon: 'warning',
        showCancelButton: true,
        showDenyButton: true,
        denyButtonText: 'Vary Scope',
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        customClass: {
          cancelButton: 'btn-danger',
          confirmButton: 'btn-success',
          denyButton: 'btn-warning',
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Save action
          this.executeSaveLicense();
        } else if (result.isDenied) {
          // Vary Scope action
          this.varyScopeLicConfirm();
        } else {
          console.log('Action canceled');
          // Handle cancel action if needed
        }
      });
    });
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
        this.validateLicenseScope();

        //Handle Validation Errors
        if (this.hasValidationErrors) {
          // If there are validation errors, show an error message and stop the process
          this.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS);
          return; // Prevent further action if validation fails
        }

        this.varyScopeLicConfirm();
      }
    });
  }

  prepareVaryScopeLicenseObject(userId: number) {
    return {
      objFirmScope: {
        firmScopeID: this.ActivityLicensed[0].FirmScopeID,
        scopeRevNum: null,
        firmID: this.ActivityLicensed[0].FirmID,
        objectID: 524,
        createdBy: userId, //recheck
        docReferenceID: this.ActivityLicensed[0].docReferenceID ?? null,
        firmApplTypeID: 2, // licensed
        docIDs: null,
        generalConditions: this.ActivityLicensed[0].GeneralConditions,
        effectiveDate: this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeEffectiveDate),
        scopeCertificateLink: null,
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
        withDrawnDate: this.convertDateToYYYYMMDD(activityLic.ScopeEffectiveDate),
        objectProductActivity: null,
        activityDetails: activityLic.FirmActivityDetails
      }))
    };
  }

  varyScopeLicConfirm() {
    this.existingActivities = this.ActivityLicensed;
    const varyLicenseScope = this.prepareVaryScopeLicenseObject(this.userId);
    this.firmService.editLicenseScope(varyLicenseScope).subscribe((response) => {
      console.log('Vary Scope Successfully', response);
      this.loadActivitiesLicensed();
      this.isEditModeLicense = false;
      this.disableApplicationDate = true;
      this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeLicense);
      this.loadLicScopeRevisions(this.firmId, 2);
      this.showFirmScopeLicSaveSuccessAlert(constants.FirmActivitiesEnum.ACTIVITIES_SAVED_SUCCESSFULLY);
    }, error => {
      console.log('Vary Scope Failed', error);
    })
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
        this.isEditModeLicense = false;
        this.disableApplicationDate = true;
        this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeLicense);
        this.errorMessages = {};
        this.loadActivitiesLicensed();
      }
    });
  }


  editAuthScope() {
    this.isLoading = true;
    if (this.ActivityAuth[0].ScopeRevNum) {
      this.applyVaryScopeButtonVisibilityOnEdit();
      if (!this.isEditModeAuth) {
        this.isEditModeAuth = true;  // Set the form to edit mode
        this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeAuth);
        this.loadActivityCategories();
        // Loop through each activity and load its activities based on FirmScopeTypeID
        this.ActivityAuth.forEach(activity => {
          if (activity.FirmScopeTypeID) {
            this.loadActivityTypes(activity);  // Load activities for each category
          }
        });
        this.loadAllProductsForEditMode();
        if (this.islamicFinance?.IFinTypeId > 0 && this.islamicFinance) {
          this.isIslamicFinanceChecked = true;  // Check the box
        } else {
          this.isIslamicFinanceChecked = false; // Uncheck the box
        }
        if (this.ActivityAuth[0]?.ObjectFirmScopeCondition[0]?.restriction === 0) {
          this.isScopeConditionChecked = true;
        } else {
          this.isScopeConditionChecked = false;
        }

      }
    }
    this.isLoading = false;
  }

  saveAuthScope() {
    this.isLoading = true; // Start loading indicator
    this.hasValidationErrors = false;


    this.validateAuthScope();

    // Step 2: Handle Validation Errors
    if (this.hasValidationErrors) {
      this.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS);
      this.isLoading = false;
      return; // Prevent further action if validation fails
    }

    this.existingProducts = this.ActivityAuth;

    if (!(this.isNullOrEmpty(this.ActivityAuth[0].ScopeEffectiveDate)) && this.currentDateOnly > this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeEffectiveDate || this.ActivityAuth[0].ScopeRevNum === 1)) {
      this.isLoading = false;
      this.saveVaryAuthScope();
    } else {

      // Step 3: Save License Scope Details
      this.executeSaveAuthorise()
    }

    // Call the function to save the details and handle response inside the subscription
  }

  executeSaveAuthorise() {
    const updatedAuthorizeScope = this.prepareAuthoriseScopeObject(this.userId);
    this.firmService.editAuthorizedScope(updatedAuthorizeScope).subscribe(
      response => {
        console.log('Authorise scope updated successfully:', response);

        this.loadActivitiesAuthorized(); // Reload authorize scope details
        this.isEditModeAuth = false; // Toggle edit mode off
        this.disableApplicationDate = true;
        this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeAuth);

        // Show success alert after data is successfully saved
        this.showFirmScopeAuthSaveSuccessAlert(constants.FirmActivitiesEnum.ACTIVITIES_SAVED_SUCCESSFULLY);

        this.isLoading = false; // Stop loading indicator after success
      },
      error => {
        console.error('Error updating Authorised Scope:', error);
        this.isLoading = false; // Stop loading indicator on error
      }
    );
  }

  saveVaryAuthScope(): void {
    this.firmService.errorMessages(constants.FirmActivitiesEnum.SCOPECHANGED_SAVEORREVISE).subscribe((response) => {
      Swal.fire({
        title: 'Alert',
        text: response.response,
        icon: 'warning',
        showCancelButton: true,
        showDenyButton: true,
        denyButtonText: 'Vary Scope',
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        customClass: {
          cancelButton: 'btn-danger',
          confirmButton: 'btn-success',
          denyButton: 'btn-warning',
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Save action
          this.executeSaveAuthorise();
        } else if (result.isDenied) {
          // Vary Scope action
          this.varyScopeAuthConfirm();
        } else {
          console.log('Action canceled');
          // Handle cancel action if needed
        }
      });
    });
  }

  varyAuthScope() {
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
        this.validateAuthScope();

        //Handle Validation Errors
        if (this.hasValidationErrors) {
          // If there are validation errors, show an error message and stop the process
          this.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS);
          return; // Prevent further action if validation fails
        }
        this.varyScopeAuthConfirm();
      }
    });
  }


  prepareAuthoriseScopeObject(userId: number) {
    return {
      objFirmScope: {
        firmScopeID: this.ActivityAuth[0].FirmScopeID,
        scopeRevNum: this.ActivityAuth[0].ScopeRevNum,
        firmID: this.ActivityAuth[0].FirmID,
        objectID: 524,
        createdBy: userId, //recheck
        docReferenceID: this.ActivityAuth[0].docReferenceID ?? null,
        firmApplTypeID: 3, // Authorised
        docIDs: this.ActivityAuth[0].DocID,
        generalConditions: this.ActivityAuth[0].GeneralCondition,
        effectiveDate: this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeEffectiveDate),
        scopeCertificateLink: this.ActivityAuth[0]?.ScopeCertificateLink,
        applicationDate: this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeApplicationDate),
        licensedOrAuthorisedDate: this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate),
      },
      lstFirmActivities: this.existingProducts.map(activityAuth => ({
        createdBy: userId, //recheck
        firmScopeTypeID: parseInt(activityAuth.FirmScopeTypeID),
        activityTypeID: parseInt(activityAuth.ActivityTypeID),
        effectiveDate: this.convertDateToYYYYMMDD(activityAuth.ScopeEffectiveDate),
        firmActivityConditions: activityAuth.FirmActivityConditions,
        productTypeID: null,
        appliedDate: this.convertDateToYYYYMMDD(activityAuth.ScopeAppliedDate),
        withDrawnDate: this.convertDateToYYYYMMDD(activityAuth.ScopeEffectiveDate),
        objectProductActivity: activityAuth.categorizedProducts
          .flatMap(catProd =>
            catProd.subProducts
              .filter(subProd => subProd.isChecked)  // Only include checked sub-products
              .map(subProd => ({
                productTypeID: String(subProd.ID),
                appliedDate: this.convertDateToYYYYMMDD(activityAuth.appliedDate),
                withDrawnDate: this.convertDateToYYYYMMDD(activityAuth.withDrawnDate),
                effectiveDate: this.convertDateToYYYYMMDD(activityAuth.effectiveDate),
                firmScopeTypeID: subProd.firmScopeTypeID
              }))
          ),
        activityDetails: null
      })),
      objPrudentialCategory: {
        firmPrudentialCategoryID: this.PrudentialCategoryIDChanged ? null : this.prudentialCategoryDetails[0].FirmPrudentialCategoryID,
        firmId: this.firmId,
        prudentialCategoryTypeID: this.ActivityAuth[0].PrudentialCategoryTypeID,
        firmScopeID: this.ActivityAuth[0].FirmScopeID,
        scopeRevNum: this.ActivityAuth[0].ScopeRevNum,
        lastModifiedByID: userId,
        effectiveDate: this.convertDateToYYYYMMDD(this.ActivityAuth[0].PrudentialCategoryEffectiveDate),
        expirationDate: null,
        lastModifiedDate: null,
        authorisationCategoryTypeID: this.ActivityAuth[0].AuthorisationCategoryTypeID
      },
      objSector: {
        firmSectorID: this.SectorTypeIDChanged ? null : this.sectorDetails[0].FirmSectorID,
        sectorTypeID: parseInt(this.ActivityAuth[0].SectorTypeID),
        lastModifiedByID: userId, //recheck
        effectiveDate: this.convertDateToYYYYMMDD(this.ActivityAuth[0].SectorEffectiveDate)
      },
      lstFirmScopeCondition: this.isScopeConditionChecked
        ? [
          {
            firmScopeID: this.ActivityAuth[0].FirmScopeID,
            firmID: null,
            objectID: null,
            createdBy: null,
            docReferenceID: null,
            firmApplTypeID: null,
            docIDs: null,
            generalConditions: null,
            effectiveDate: null,
            scopeCertificateLink: null,
            applicationDate: null,
            licensedOrAuthorisedDate: null,
            scopeConditionTypeId: 1,
            lastModifiedBy: userId,
            restriction: 1,
            scopeConditionTypeDesc: "Retail Restriction"
          }
        ]
        : [
          {
            firmScopeID: this.ActivityAuth[0].FirmScopeID,
            firmID: null,
            objectID: null,
            createdBy: null,
            docReferenceID: null,
            firmApplTypeID: null,
            docIDs: null,
            generalConditions: null,
            effectiveDate: null,
            scopeCertificateLink: null,
            applicationDate: null,
            licensedOrAuthorisedDate: null,
            scopeConditionTypeId: 1,
            lastModifiedBy: userId,
            restriction: 0,
            scopeConditionTypeDesc: "Retail Restriction"
          }
        ], // Send an empty array if the checkbox is not checked
      objFirmIslamicFinance: this.isIslamicFinanceChecked
        ? {  // When checked, send the actual values
          iFinFlag: this.isIslamicFinanceChecked,
          iFinTypeId: this.islamicFinance.IFinTypeId,
          iFinTypeDesc: this.islamicFinance.IFinTypeDesc,
          endorsement: this.islamicFinance.Endorsement,
          savedIFinTypeID: this.islamicFinance.IFinTypeId,
          scopeRevNum: this.ActivityAuth[0].ScopeRevNum,
          lastModifiedBy: userId
        }
        : {  // When unchecked, send iFinFlag as false and everything else as null
          iFinFlag: false,
          iFinTypeId: null,
          iFinTypeDesc: null,
          endorsement: null,
          savedIFinTypeID: null,
          scopeRevNum: null,
          lastModifiedBy: null
        },
      resetFirmSector: this.resetFirmSector,
      firmSectorID: null
    }
  }

  validateAuthScope() {
    this.hasValidationErrors = false;


    this.ActivityAuth.forEach(activity => {
      // Reset error messages for each activity
      activity.errorMessages = {};

      // Validation for Application Date
      if (this.isNullOrEmpty(this.ActivityAuth[0].ScopeApplicationDate)) {
        this.getErrorMessages('ScopeAppliedDateAuth', constants.FirmActivitiesEnum.ENTER_VALID_APPLICATIONDATE);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages[('ScopeAppliedDateAuth')];
      }

      // Validation for Effective Date
      if (!(this.isNullOrEmpty(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate)) && !(this.isNullOrEmpty(this.ActivityAuth[0].ScopeEffectiveDate)) && this.currentDate > this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate)) {
        if (this.isNullOrEmpty(this.ActivityAuth[0].ScopeEffectiveDate)) {
          this.getErrorMessages('ScopeEffectiveDateAuth', constants.FirmActivitiesEnum.ENTER_VALID_SCOPEEFFECTIVEDATE);
          this.hasValidationErrors = true;
        } else {
          delete this.errorMessages[('ScopeEffectiveDateAuth')];
        }
      }

      // Validation for Effective Date Later Application Date
      if (!(this.isNullOrEmpty(this.ActivityAuth[0].ScopeApplicationDate)) && !(this.isNullOrEmpty(this.ActivityAuth[0].ScopeEffectiveDate))) {
        if (this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeEffectiveDate) < this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeApplicationDate)) {
          this.getErrorMessages('EffectiveDateLaterApplicationDate', constants.FirmActivitiesEnum.ENTER_EFFECTIVEDATE_LATER_APPLICATIONDATE)
        } else {
          delete this.errorMessages[('EffectiveDateLaterApplicationDate')]
        }
      }

      // Check if the selected activity is valid (not "Select")
      if (activity.ActivityTypeID == 0) {
        this.getErrorMessages('ActivityTypeID', constants.FirmActivitiesEnum.SELECT_ACTIVITIES, activity);
        this.getErrorMessages('correctPermittedActivities', constants.FirmActivitiesEnum.CORRECT_PERMITTEDACTIVITIES);
        this.hasValidationErrors = true;
      } else {
        delete activity.errorMessages['ActivityTypeID'];
        delete this.errorMessages['correctPermittedActivities'];
      }

      // Check if categorizedProducts exists and is empty
      const hasNoProducts = activity.categorizedProducts == null || activity.categorizedProducts.length == 0;

      // Check if any product is selected (isChecked = true) in the current activity
      const hasCheckedProducts = activity.categorizedProducts?.some(catProd =>
        catProd.subProducts.some(subProd => subProd.isChecked)
      );

      // Validation for Activities
      // If the activity has no products or has products but none are selected, display an error
      if (hasNoProducts || (!hasNoProducts && !hasCheckedProducts)) {
        this.getErrorMessages('Products', constants.FirmActivitiesEnum.SELECT_ATLEASTONE_PRODUCTS, activity);
        this.getErrorMessages('correctPermittedActivities', constants.FirmActivitiesEnum.CORRECT_PERMITTEDACTIVITIES);
        this.hasValidationErrors = true;
      } else {
        delete activity.errorMessages['Products'];
        delete this.errorMessages['correctPermittedActivities'];
      }
    });
    // Validation for Prudential Effective Date
    if (this.isNullOrEmpty(this.ActivityAuth[0].PrudentialCategoryEffectiveDate)) {
      this.getErrorMessages('PrudentialEffectiveDate', constants.FirmActivitiesEnum.ENTER_PRUDENTIAL_EFFECTIVEDATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages[('PrudentialEffectiveDate')]
    }

    // Validation for Sector Effective Date
    if (this.isNullOrEmpty(this.ActivityAuth[0].SectorEffectiveDate)) {
      this.getErrorMessages('SectorEffectiveDate', constants.FirmActivitiesEnum.ENTER_SECTOR_EFFECTIVEDATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages[('SectorEffectiveDate')]
    }

    // Validation for Sector Effective Date
    if (this.isNullOrEmpty(this.ActivityAuth[0].SectorEffectiveDate)) {
      this.getErrorMessages('SectorEffectiveDate', constants.FirmActivitiesEnum.ENTER_SECTOR_EFFECTIVEDATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages[('SectorEffectiveDate')]
    }

    // Validation for Sector Effective Date
    if (parseInt(this.ActivityAuth[0].SectorTypeID) === 0) {
      this.hasValidationErrors = true;
      this.errorMessages['SectorReturnType'] = 'Please select valid "Prudential Return Type".';
    } else {
      delete this.errorMessages[('SectorReturnType')]
    }
  }

  varyScopeAuthConfirm() {
    this.existingProducts = this.ActivityAuth;
    const varyAuthoriseScope = this.prepareVaryScopeAuthoriseObject(this.userId);
    console.log("vary scope data to be sent" + varyAuthoriseScope);
    this.firmService.editAuthorizedScope(varyAuthoriseScope).subscribe((response) => {
      console.log('Vary Scope Successfully', response);
      this.isEditModeAuth = false;
      this.disableApplicationDate = true;
      this.loadActivitiesAuthorized();
      this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeAuth);
      this.loadAuthScopeRevisions(this.firmId, 2);
      this.showFirmScopeAuthSaveSuccessAlert(constants.FirmActivitiesEnum.ACTIVITIES_SAVED_SUCCESSFULLY);
    }, error => {
      console.log('Vary Scope Failed', error);
    })
  }

  prepareVaryScopeAuthoriseObject(userId: number) {
    return {
      objFirmScope: {
        firmScopeID: this.ActivityAuth[0].FirmScopeID,
        scopeRevNum: null,
        firmID: this.ActivityAuth[0].FirmID,
        objectID: 524,
        createdBy: userId, //recheck
        docReferenceID: null,
        firmApplTypeID: 3, // Authorised
        docIDs: null,
        generalConditions: this.ActivityAuth[0].GeneralCondition,
        effectiveDate: this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeEffectiveDate),
        scopeCertificateLink: null,
        applicationDate: this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeApplicationDate),
        licensedOrAuthorisedDate: this.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate),
      },
      lstFirmActivities: this.existingProducts.map(activityAuth => ({
        createdBy: userId, //recheck
        firmScopeTypeID: 0,
        activityTypeID: parseInt(activityAuth.ActivityTypeID),
        effectiveDate: null,
        firmActivityConditions: null,
        productTypeID: null,
        appliedDate: null,
        withDrawnDate: null,
        objectProductActivity: activityAuth.categorizedProducts
          .flatMap(catProd =>
            catProd.subProducts
              .filter(subProd => subProd.isChecked)  // Only include checked sub-products
              .map(subProd => ({
                productTypeID: String(subProd.ID),
                appliedDate: this.convertDateToYYYYMMDD(activityAuth.appliedDate),
                withDrawnDate: this.convertDateToYYYYMMDD(activityAuth.withDrawnDate),
                effectiveDate: this.convertDateToYYYYMMDD(activityAuth.effectiveDate),
                firmScopeTypeID: subProd.firmScopeTypeID
              }))
          ),
        activityDetails: null
      })),
      objPrudentialCategory: {
        firmPrudentialCategoryID: null,
        firmId: this.firmId,
        prudentialCategoryTypeID: this.ActivityAuth[0].PrudentialCategoryTypeID,
        firmScopeID: this.ActivityAuth[0].FirmScopeID,
        scopeRevNum: null,
        lastModifiedByID: userId,
        effectiveDate: this.convertDateToYYYYMMDD(this.ActivityAuth[0].PrudentialCategoryEffectiveDate),
        expirationDate: null,
        lastModifiedDate: null,
        authorisationCategoryTypeID: this.ActivityAuth[0].AuthorisationCategoryTypeID
      },
      objSector: {
        firmSectorID: null,
        sectorTypeID: parseInt(this.ActivityAuth[0].SectorTypeID),
        lastModifiedByID: userId, //recheck
        effectiveDate: this.convertDateToYYYYMMDD(this.ActivityAuth[0].SectorEffectiveDate)
      },
      lstFirmScopeCondition: this.isScopeConditionChecked
        ? [
          {
            firmScopeID: this.ActivityAuth[0].FirmScopeID,
            firmID: null,
            objectID: null,
            createdBy: null,
            docReferenceID: null,
            firmApplTypeID: null,
            docIDs: null,
            generalConditions: null,
            effectiveDate: null,
            scopeCertificateLink: null,
            applicationDate: null,
            licensedOrAuthorisedDate: null,
            scopeConditionTypeId: 1,
            lastModifiedBy: userId,
            restriction: 1,
            scopeConditionTypeDesc: "Retail Restriction"
          }
        ]
        : [
          {
            firmScopeID: this.ActivityAuth[0].FirmScopeID,
            firmID: null,
            objectID: null,
            createdBy: null,
            docReferenceID: null,
            firmApplTypeID: null,
            docIDs: null,
            generalConditions: null,
            effectiveDate: null,
            scopeCertificateLink: null,
            applicationDate: null,
            licensedOrAuthorisedDate: null,
            scopeConditionTypeId: 1,
            lastModifiedBy: userId,
            restriction: 0,
            scopeConditionTypeDesc: "Retail Restriction"
          }
        ], // Send an empty array if the checkbox is not checked
      objFirmIslamicFinance: this.isIslamicFinanceChecked
        ? {  // When checked, send the actual values
          iFinFlag: this.isIslamicFinanceChecked,
          iFinTypeId: this.islamicFinance.IFinTypeId,
          iFinTypeDesc: this.islamicFinance.IFinTypeDesc,
          endorsement: this.islamicFinance.Endorsement,
          savedIFinTypeID: this.islamicFinance.IFinTypeId,
          scopeRevNum: null,
          lastModifiedBy: userId
        }
        : {  // When unchecked, send iFinFlag as false and everything else as null
          iFinFlag: false,
          iFinTypeId: null,
          iFinTypeDesc: null,
          endorsement: null,
          savedIFinTypeID: null,
          scopeRevNum: null,
          lastModifiedBy: null
        },
      resetFirmSector: this.resetFirmSector,
      firmSectorID: null
    }
  }

  cancelEditAuthScope() {
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
        this.isEditModeAuth = false;
        this.disableApplicationDate = true;
        this.applySecurityOnPage(FrimsObject.Scope, this.isEditModeAuth);
        this.errorMessages = {};
        this.loadActivitiesAuthorized();
        this.loadSectorDetails();
        this.loadPrudentialCategoryDetails();
      }
    });
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
      if (!this.isEditModeCore) {
        // If not, toggle to edit mode and resolve the promise
        this.isEditModeCore = true;
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
      if (!this.isEditModeCore) {
        // If not, toggle to edit mode and resolve the promise
        this.isEditModeCore = true;
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
        this.formattedLicenseApplStatusDate = this.formatDateToCustomFormat(this.firmDetails.LicenseApplStatusDate);
        this.formattedAuthApplStatusDate = this.formatDateToCustomFormat(this.firmDetails.AuthApplStatusDate);
        this.AuthorisationStatusTypeLabelDescFormatted = this.firmDetails.AuthorisationStatusTypeLabelDesc.replace(/:/g, '');
        this.LicenseStatusTypeLabelDescFormatted = this.firmDetails.LicenseStatusTypeLabelDesc.replace(/:/g, '');
        // this.firmDetails.AuthorisationDate = this.formatDateToCustomFormat(this.firmDetails.FirmAuthApplDate);
        // this.firmDetails.LicensedDate = this.formatDateToCustomFormat(this.firmDetails.FirmLicApplDate);
        this.getFirmTypes();
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
    this.isLoading = true;
    this.firmService.getFIRMAuditors(this.firmId).subscribe(
      data => {
        this.FIRMAuditors = data.response;
        console.log('Firm Auditors details:', this.FIRMAuditors);
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching firm details', error);
        this.isLoading = false;
      }
    );
  }
  loadContacts() {
    this.isLoading = true;
    this.firmService.getContactsOfFIRM(this.firmId).subscribe(
      data => {
        this.FIRMContacts = data.response;
        console.log('Firm FIRM Contacts details:', this.FIRMContacts);
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching firm details', error);
        this.isLoading = false;
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
      contactID: this.selectedContact?.ContactID,
      title: this.selectedContact?.Title,
      firstName: this.selectedContact?.FirstName,
      secondName: this.selectedContact?.SecondName,
      thirdName: this.selectedContact?.ThirdName,
      familyName: this.selectedContact?.FamilyName,
      countryOfResidence: this.selectedContact?.countryOfResidence,
      createdBy: this.selectedContact?.createdBy,
      dateOfBirth: this.selectedContact?.dateOfBirth,
      fullName: this.selectedContact?.FirstName,
      lastModifiedBy: this.selectedContact?.LastModifiedBy,
      nationalID: this.selectedContact?.NationalID,
      nationality: this.selectedContact?.Nationality,
      passportNum: this.selectedContact?.PassportNum,
      placeOfBirth: this.selectedContact?.PlaceOfBirth,
      previousName: this.selectedContact?.PreviousName,
      isExists: this.selectedContact?.IsExists,
      nameInPassport: this.selectedContact?.NameInPassport,
      contactAddnlInfoTypeID: this.selectedContact?.ContactAddnlInfoTypeID,
      isFromContact: this.selectedContact?.IsFromContact,
      countryofBirth: this.selectedContact?.CountryofBirth,
      juridictionID: this.selectedContact?.JuridictionID,
      objectID: this.selectedContact?.ObjectID,
      isPeP: this.selectedContact?.IsPeP,
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
  ////////////// Yazan Controller 

  controllerDetails = {
    OtherEntityName: '',
    RegisteredNum: '',
    ControllerControlTypeDesc: '',
    AssnDateFrom: '',
    AssnDateTo: '',
    IsCompanyRegulated: false,
    LegalStatusTypeDesc: '',
    CountryName: '',
    PctOfShares: '',
    AdditionalDetails: '',
    LastModifiedByOfOtherEntities: '',
    LastModifiedDate: '',
    addressType: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
    city: '',
    stateProvince: '',
    country: '',
    zipPostalCode: '',
    regulator: '',
    regulatorContact: ''
  };
  homeRegulater: any = [];
  selectedController: any;
  Address: any = {}
  openControllerPopup(controller: any): void {
    this.selectedController = controller; // Set the firm name
    this.controllerDetails = { ...controller }; // Populate the controller details
    this.isPopupOpen = true; // Open the popup
    console.log('SSSSSSSSSSSSSSSSSSSSSSSdfgdfgdfhfgjfhjdhdj', this.selectedController.OtherEntityID, this.selectedController.EntityTypeID);
    this.firmService.getRegulatorDetails(this.selectedController.OtherEntityID, this.selectedController.EntityTypeID).subscribe(
      data => {
        if (data.response && data.response.length > 0) {
          this.homeRegulater = data.response[0]; // Assuming it's an array and taking the first element
        }
      },
    );
    console.log("controllerDetails", this.controllerDetails)
    console.log("selectedController", this.selectedController)

  }
  //////////// 44



  objectOpTypeIdEdit = 41;
  objectOpTypeIdCreate = 40;
  getControllerControlTypes(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.ControllerControlTypes, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.controlTypeOptionsEdit = data.response;
        console.log("getControllerControlTypes", data)
      }, error => {
        console.error("Error fetching controller control types:", error);
      });
  }
  getControllerControlTypesCreat(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.ControllerControlTypes, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.controlTypeOptionsCreate = data.response;
        console.log("getControllerControlTypes", data)
      }, error => {
        console.error("Error fetching controller control types:", error);
      });
  }
  getCorporateController(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.CorporateController, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.CorporateControllerEdit = data.response;
        console.log("getCorporateController", data)
      }, error => {
        console.error("Error fetching controller", error);
      });
  }
  getCorporateControllerCreate(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.CorporateController, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.CorporateControllerEdit = data.response;
        console.log("getCorporateController", data)
      }, error => {
        console.error("Error fetching controller", error);
      });
  }
  getlegalStatusController(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.legalStatusController, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.legalStatusOptionsEdit = data.response;
        console.log("getlegalStatusController", data)
      }, error => {
        console.error("Error fetching legalStatus", error);
      });
  }
  getlegalStatusControllerCreate(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.legalStatusController, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.legalStatusOptionsCreate = data.response;
        console.log("getlegalStatusController", data)
      }, error => {
        console.error("Error fetching legalStatus", error);
      });
  }

  getAddressTypesController(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.addressTypes, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.addressTypeOptionsEdit = data.response;
        console.log("getAddressTypesController", data)
      }, error => {
        console.error("Error fetching AddressTypes", error);
      });
  }
  getAddressTypesControllerCreate(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.addressTypes, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.addressTypeOptionsEdit = data.response;
        console.log("getAddressTypesController", data)
      }, error => {
        console.error("Error fetching AddressTypes", error);
      });
  }
  getTitle(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.Title, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.TitleEdit = data.response;
        console.log("Countries", data)
      }, error => {
        console.error("Error fetching TitleTypes", error);
      });
  }
  getTitleCreate(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.Title, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.TitleEdit = data.response;
        console.log("Countries", data)
      }, error => {
        console.error("Error fetching TitleTypes", error);
      });
  }
  getcountries(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.countries, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.countryOptionsEdit = data.response;
        console.log("Countries", data)
      }, error => {
        console.error("Error fetching Countries", error);
      });
  }
  getcountriesCreate(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.countries, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.countryOptionsCreate = data.response;
        console.log("Countries", data)
      }, error => {
        console.error("Error fetching Countries", error);
      });
  }
  closeControllerPopup(): void {
    this.isPopupOpen = false;
    this.isEditable = false; // Close the popup
  }
  closeCreateControllerPopup(): void {
    this.isEditable = false;
    this.showCreateControllerSection = false; // Close the popup
  }
  EditControllerValidateForm(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.errorMessages = {}; // Clear previous error messages
      this.hasValidationErrors = false;

      // Validate Full Name of Entity
      if (!this.selectedController.OtherEntityName) {
        this.getErrorMessages('OtherEntityName', constants.ControllerMessages.ENTER_OTHER_ENTITY_NAME);
      }

      // Validate Effective Date
      if (!this.selectedController.EffectiveDate) {
        this.getErrorMessages('EffectiveDate', constants.ControllerMessages.ENTER_VALID_EFFECTIVEDATE);
      }

      // Validate Cessation Date
      if (!this.selectedController.CessationDate) {
        this.getErrorMessages('CessationDate', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
      } else if (this.selectedController.EffectiveDate && new Date(this.selectedController.EffectiveDate) > new Date(this.selectedController.CessationDate)) {
        this.getErrorMessages('CessationDate', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
      }

      // Validate Place of Establishment
      if (!this.selectedController.PlaceOfEstablishment) {
        this.getErrorMessages('PlaceOfEstablishment', constants.ControllerMessages.SELECT_RECORD);
      }

      // Validate Type of Control
      if (!this.selectedController.ControllerControlTypeDesc) {
        this.getErrorMessages('ControllerControlTypeDesc', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
      }

      // Validate Percentage of Holding
      if (this.selectedController.PctOfShares) {
        const pct = parseFloat(this.selectedController.PctOfShares);
        if (isNaN(pct) || pct < 0 || pct > 100) {
          this.getErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_VALID_PERCENTAGE);
        }
      }

      // Check for any validation errors
      if (Object.keys(this.errorMessages).length > 0) {
        this.hasValidationErrors = true;
        resolve(); // Resolve with errors
      } else {
        resolve(); // Resolve with no errors
      }
    });
  }
  confarmDeleteControllerDetials(OtherEntityID: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this controller detail?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.DeleteControllerPopup(OtherEntityID); // Pass the ID to the method
      }
    });
  }

  DeleteControllerPopup(OtherEntityID: number): void {
    this.firmService.deleteotherentitydetails(OtherEntityID).subscribe({
      next: (response) => {
        Swal.fire('Deleted!', 'Controller detail has been deleted.', 'success');
        console.log('Entity deleted successfully:', response);
        // Optionally refresh the list or perform other actions here
      },
      error: (err) => {
        Swal.fire('Error!', 'There was a problem deleting the controller detail.', 'error');
        console.error('Error deleting entity:', err);
      }
    });
  }
  getLegalStatusDescription(): string {
    const status = this.legalStatusOptionsEdit.find(option => option.LegalStatusTypeID === this.selectedController.LegalStatusTypeID);
    return status ? status.LegalStatusTypeDesc : '';
  }
  getPlaceOfEstablishmentName(): string {
    const place = this.countryOptionsEdit.find(option => option.CountryID === this.selectedController.PlaceOfEstablishment);
    return place ? place.CountryName : '';
  }

  // Method to get the Control Type Description
  getControlTypeDescription(): string {
    const controlType = this.controlTypeOptionsEdit.find(option => option.ControllerControlTypeID === this.selectedController.ControllerControlTypeID);
    return controlType ? controlType.ControllerControlTypeDesc : '';
  }
  changeType() {
    if (this.selectedType === 'Percentage') {
      this.showHoldingsPercentage = true;
    } else {
      this.showHoldingsPercentage = false;
    }
  }

  changeControlType() {
    if (this.CreatecontrollerDetails.SelectedControlType === 'select') {
      this.hideForms = true;
    }
    else {
      this.hideForms = false;
    }
  }

  createController() {
    this.showCreateControllerSection = true;
    this.getcountriesCreate();
    this.getTitleCreate();
    this.getAddressTypesControllerCreate();
    this.getlegalStatusControllerCreate();
    this.getControllerControlTypesCreat();
  }
  saveControllerPopupChanges(): void {
    this.isEditable = false;
    this.EditControllerValidateForm().then(() => {
      if (!this.hasValidationErrors) {
        console.log("Selected Controller:", this.selectedController);
        if (
          ["Parent Entity", "Corporate Controller", "Head_Office", "UBO_Corporate"].includes(this.selectedController.EntityTypeDesc)
        ) {
          const saveControllerPopupChangesObj = {
            otherEntityDetails: {
              UserID: 30,
              UserName: null,
              OtherEntityName: this.selectedController.EntityTypeDesc,
              otherEntityID: this.selectedController.OtherEntityID,
              DateOfIncorporation: this.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
              createdBy: this.selectedController.CreatedBy,
              CessationDate: this.convertDateToYYYYMMDD(this.selectedController.CessationDate),
              EffectiveDate: this.convertDateToYYYYMMDD(this.selectedController.EffectiveDate),
              CreatedDate: null,
              relatedEntityID: this.selectedController.RelatedEntityID,
              entitySubTypeID: this.selectedController.EntitySubTypeID,
              relatedEntityTypeID: this.selectedController.EntityTypeID,
              relatedEntityEntityID: this.selectedController.RelatedEntityEntityID,
              myState: this.selectedController.myState,
              LegalStatusTypeID: this.selectedController.LegalStatusTypeID,
              LegalStatusTypeDesc: this.selectedController.LegalStatusTypeDesc,
              placeOfIncorporation: this.selectedController.PlaceOfIncorporation,
              countryOfIncorporation: this.selectedController.countryOfIncorporation,
              registeredNumber: this.selectedController.RegisteredNum,
              zebSiteAddress: this.selectedController.zebSiteAddress,
              lastModifiedBy: 30,
              ControllerControlTypeDesc: null,
              //LastModifiedDate : "2024-10-01T13:55:58.178Z",
              isAuditor: this.selectedController.isAuditor,
              isCompanyRegulated: this.selectedController.IsCompanyRegulated,
              additionalDetails: this.selectedController.additionalDetails,
              isParentController: this.selectedController.isParentController,
              isPublicallyTraded: this.selectedController.isPublicallyTraded,
              areAnyUBOs: this.selectedController.areAnyUBOs,
              controllerInfo: this.selectedController.controllerInfo,
              output: this.selectedController.output,
              FirmID: this.selectedController.FirmID,
              EntityTypeID: this.selectedController.EntityTypeID,
              EntityID: this.selectedController.FirmID,
              controllerControlTypeID: this.selectedController.ControllerControlTypeID,
              numOfShares: this.selectedController.numOfShares,
              pctOfShares: this.selectedController.pctOfShares,
              MajorityStockHolder: false,
              assnDateFrom: null,
              assnDateTo: null,
              LastModifiedByOfOtherEntity: 30,
            },
            addressList: [
              {
                firmID: this.selectedController.firmID,
                countryID: this.selectedController.countryID,
                addressTypeID: this.selectedController.addressTypeID,
                sameAsTypeID: this.selectedController.sameAsTypeID,
                LastModifiedBy: 30,
                addressAssnID: this.selectedController.addressAssnID,
                entityTypeID: this.selectedController.entityTypeID,
                entityID: this.selectedController.entityID,
                contactAssnID: this.selectedController.contactAssnID,
                contactID: this.selectedController.contactID,
                addressID: this.selectedController.addressID,
                addressLine1: this.selectedController.addressLine1,
                addressLine2: this.selectedController.addressLine2,
                addressLine3: this.selectedController.addressLine3,
                addressLine4: this.selectedController.addressLine4,
                city: this.selectedController.city,
                province: this.selectedController.province,
                postalCode: this.selectedController.postalCode,
                phoneNumber: this.selectedController.phoneNumber,
                phoneExt: this.selectedController.phoneExt,
                faxNumber: this.selectedController.faxNumber,
                CreatedDate: this.convertDateToYYYYMMDD(this.selectedController.CreatedDate),
                LastModifiedDate: this.currentDate,
                addressState: this.selectedController.addressState,
                fromDate: null,
                toDate: null,
                objectID: this.selectedController.objectID,
                objectInstanceID: this.selectedController.objectInstanceID,
                objectInstanceRevNumber: this.selectedController.objectInstanceRevNumber,
                sourceObjectID: this.selectedController.sourceObjectID,
                sourceObjectInstanceID: this.selectedController.sourceObjectInstanceID,
                sourceObjectInstanceRevNumber: this.selectedController.sourceObjectInstanceRevNumber,
                objAis: { // Ensure this object is correctly structured
                  ainId: this.selectedController.AinId,
                  contactId: this.selectedController.contactId,
                  natinality: this.selectedController.natinality,
                  countryOfResidence: this.selectedController.countryOfResidence,
                  functionId: this.selectedController.functionId,
                  formTypeId: this.selectedController.FormTypeId,
                  formProcessorId: this.selectedController.formProcessorId,
                  statusofApplicationId: this.selectedController.statusofApplicationId,
                  applicatioState: this.selectedController.applicatioState,
                  fromType: this.selectedController.FromType,
                  contactAssId: this.selectedController.contactAssId,
                  FirmId: this.selectedController.FirmId,
                  prefferdMethod: this.selectedController.PrefferdMethod,
                  customFacingId: this.selectedController.customFacingId,
                  ainNumber: this.selectedController.ainNumber,
                  title: this.selectedController.title,
                  firstName: this.selectedController.firstName,
                  secondName: this.selectedController.secondName,
                  thirdName: this.selectedController.thirdName,
                  familyName: this.selectedController.familyName,
                  fullName: this.selectedController.fullName,
                  previousName: this.selectedController.previousName,
                  dateOfBirth: this.selectedController.DateOfBirth,
                  placeOfBirth: this.selectedController.placeOfBirth,
                  nationality: this.selectedController.nationality,
                  copyOfResidence: this.selectedController.copyOfResidence,
                  passportNumber: this.selectedController.passportNumber,
                  nationalId: this.selectedController.nationalId,
                  functions: this.selectedController.functions,
                  conditions: this.selectedController.conditions,
                  FormType: this.selectedController.FormType,
                  dateReceived: this.selectedController.DateReceived,
                  formProcessor: this.selectedController.formProcessor,
                  paymentRequest: this.selectedController.paymentRequest,
                  paymentReceived: this.selectedController.paymentReceived,
                  createdBy: this.selectedController.createdBy,
                  statusOfApplications: this.selectedController.statusOfApplications,
                  statusDate: this.selectedController.StatusDate,
                  applicationStatusDate: this.selectedController.ApplicationStatusDate,
                  customFacingActivity: this.selectedController.CustomFacingActivity,
                  paymentRequestSentOn: this.selectedController.paymentRequestSentOn,
                  paymentReceivedOn: this.selectedController.paymentReceivedOn,
                  conditionsRestriction: this.selectedController.conditionsRestriction,
                  applicationID: this.selectedController.applicationID,
                  createdDate: this.selectedController.createdDate,
                  mobilePhone: this.selectedController.mobilePhone,
                  businessEmail: this.selectedController.businessEmail,
                  otherEmail: this.selectedController.otherEmail,
                  preferredMethodType: this.selectedController.preferredMethodType,
                  showReadOnly: true,
                  showEnabled: true
                }
              }
            ],
            regulatorList: [
              {
                regulatorState: this.selectedController.regulatorState,
                regulatorID: this.selectedController.regulatorID,
                entityTypeID: this.selectedController.entityTypeID,
                entityID: this.selectedController.entityID,
                relatedEntityTypeID: this.selectedController.relatedEntityTypeID,
                relatedEntityID: this.selectedController.relatedEntityID,
                contactAssnID: this.selectedController.contactAssnID
              }
            ]
          }

          // Call the insert/update endpoint
          this.firmService.insertupdateotherentitydetails(saveControllerPopupChangesObj).subscribe(
            response => {
              console.log("Save successful:", response);
            },
            error => {
              console.error("Error saving changes:", error);
            }
          );
        }
      }
      else if (
        ["IndividualController", "UBO_Individual"].includes(this.selectedController.EntityTypeDesc)
      ) {
        const saveControllerPopupChangesIndividualObj = {
          contactDetails: {
            contactDetails: {
              firmID: 0,
              contactID: 0,
              contactAssnID: 0,
              title: this.selectedController.Title, // Map your inputs accordingly
              firstName: this.selectedController.FirstName,
              secondName: this.selectedController.SecondName,
              thirdName: this.selectedController.ThirdName,
              familyName: this.selectedController.FamilyName,
              countryOfResidence: this.selectedController.CountryOfResidence,
              createdBy: this.selectedController.CreatedBy,
              dateOfBirth: this.selectedController.DateOfBirth,
              fullName: this.selectedController.FullName,
              lastModifiedBy: this.selectedController.LastModifiedByOfOtherEntities,
              nationalID: this.selectedController.NationalID,
              nationality: this.selectedController.Nationality,
              passportNum: this.selectedController.PassportNum,
              placeOfBirth: this.selectedController.PlaceOfBirth,
              previousName: this.selectedController.PreviousName,
              isExists: this.selectedController.IsExists,
              nameInPassport: this.selectedController.NameInPassport,
              contactAddnlInfoTypeID: this.selectedController.ContactAddnlInfoTypeID,
              isFromContact: this.selectedController.IsFromContact,
              countryofBirth: this.selectedController.CountryOfBirth,
              juridictionID: this.selectedController.JuridictionID,
              objectID: this.selectedController.ObjectID,
              isPeP: this.selectedController.IsPeP
            },
            lstContactFunctions: this.selectedController.LstContactFunctions.map(func => ({
              contactFunctionID: func.ContactFunctionID,
              contactFunctionTypeID: func.ContactFunctionTypeID,
              contactAssnID: func.ContactAssnID,
              contactID: func.ContactID,
              contactFunctionTypeDesc: func.ContactFunctionTypeDesc,
              effectiveDate: func.EffectiveDate,
              endDate: func.EndDate,
              createdDate: func.CreatedDate,
              createdBy: func.CreatedBy,
              lastModifiedBy: func.LastModifiedByOfOtherEntities,
              LastModifiedDate: func.LastModifiedDate,
              reviewStatus: func.ReviewStatus,
              selected: func.Selected,
              isFunctionActive: func.IsFunctionActive,
              isRecordEditable: func.IsRecordEditable
            }))
          },
          addresses: this.selectedController.Addresses.map(address => ({
            firmID: address.FirmID,
            countryID: address.CountryID,
            addressTypeID: address.AddressTypeID,
            sameAsTypeID: address.SameAsTypeID,
            lastModifiedBy: address.LastModifiedByOfOtherEntities,
            addressAssnID: address.AddressAssnID,
            entityTypeID: address.EntityTypeID,
            entityID: address.EntityID,
            contactAssnID: address.ContactAssnID,
            contactID: address.ContactID,
            addressID: address.AddressID,
            addressLine1: address.AddressLine1,
            addressLine2: address.AddressLine2,
            addressLine3: address.AddressLine3,
            addressLine4: address.AddressLine4,
            city: address.City,
            province: address.Province,
            postalCode: address.PostalCode,
            phoneNumber: address.PhoneNumber,
            phoneExt: address.PhoneExt,
            faxNumber: address.FaxNumber,
            LastModifiedDate: address.LastModifiedDate,
            addressState: address.AddressState,
            fromDate: "2024-10-01T14:38:59.118Z",
            toDate: "2024-10-01T14:38:59.118Z",
            objectID: address.ObjectID,
            objectInstanceID: address.ObjectInstanceID,
            objectInstanceRevNumber: address.ObjectInstanceRevNumber,
            sourceObjectID: address.SourceObjectID,
            sourceObjectInstanceID: address.SourceObjectInstanceID,
            sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNumber,
            objAis: address.ObjAis // Ensure this object is correctly structured
          }))
        };

        // Call the save/update contact form endpoint
        this.firmService.saveupdatecontactform(saveControllerPopupChangesIndividualObj).subscribe(
          response => {
            console.log("Contact save successful:", response);
          },
          error => {
            console.error("Error saving contact:", error);
          }
        );
      }
      else {
        console.log('Validation errors found:', this.errorMessages);
      }
    });
  }
  CreateControllerValidateForm(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.errorMessages = {}; // Clear previous error messages
      this.hasValidationErrors = false;

      // Validate Full Name of Entity
      if (!this.CreatecontrollerDetails.OtherEntityName) {
        this.getErrorMessages('OtherEntityName', constants.ControllerMessages.ENTER_OTHER_ENTITY_NAME);
      }

      // Validate Effective Date
      if (!this.CreatecontrollerDetails.EffectiveDate) {
        this.getErrorMessages('EffectiveDate', constants.ControllerMessages.ENTER_VALID_EFFECTIVEDATE);
      }

      // Validate Cessation Date
      if (!this.CreatecontrollerDetails.CessationDate) {
        this.getErrorMessages('CessationDate', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
      } else if (this.CreatecontrollerDetails.EffectiveDate && new Date(this.CreatecontrollerDetails.EffectiveDate) > new Date(this.CreatecontrollerDetails.CessationDate)) {
        this.getErrorMessages('CessationDate', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
      }

      // Validate Place of Establishment
      if (!this.CreatecontrollerDetails.PlaceOfEstablishment) {
        this.getErrorMessages('PlaceOfEstablishment', constants.ControllerMessages.SELECT_RECORD);
      }

      // Validate Type of Control
      if (!this.CreatecontrollerDetails.ControllerControlTypeDesc) {
        this.getErrorMessages('ControllerControlTypeDesc', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
      }

      // Validate Percentage of Holding
      if (this.CreatecontrollerDetails.PctOfShares) {
        const pct = parseFloat(this.CreatecontrollerDetails.PctOfShares);
        if (isNaN(pct) || pct < 0 || pct > 100) {
          this.getErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_VALID_PERCENTAGE);
        }
      }

      // Check for any validation errors
      if (Object.keys(this.errorMessages).length > 0) {
        this.hasValidationErrors = true;
        resolve(); // Resolve with errors
      } else {
        resolve(); // Resolve with no errors
      }
    });
  }
  // updateControlType() {
  //   const selectedType = this.controlTypeOptionsEdit.find(
  //     controlType => controlType.ControllerControlTypeID === this.CreatecontrollerDetails.ControllerControlTypeID
  //   );

  //   if (selectedType) {
  //     this.CreatecontrollerDetails.ControllerControlTypeDesc = selectedType.ControllerControlTypeDesc;
  //   }
  // }
  CreatecontrollerDetails = {
    SelectedControlType: '',
    TypeOfControl: '',
    EntityTypeDesc: '',
    OtherEntityID: 0,
    OtherEntityName: '',
    LegalStatusTypeID: 0,
    PctOfShares: null,
    PlaceOfEstablishment: '',
    Title: '',
    FirstName: '',
    SecondName: '',
    FamilyName: '',
    PlaceOfBirth: '',
    DateOfBirth: '',
    PassportNum: '',
    IsPEP: 0,
    IsPublicallyTraded: false,
    ControllerControlTypeID: 2,
    RegisteredNum: '',
    ControllerControlTypeDesc: '',
    HoldingsPercentage: '',
    EffectiveDate: '',
    CessationDate: '',
    More10UBOs: true,
    IsParentController: true,
    AssnDateFrom: '',
    AssnDateTo: '',
    IsCompanyRegulated: false,
    LegalStatusTypeDesc: '',
    CountryName: '',
    AdditionalDetails: '',
    LastModifiedByOfOtherEntities: '',
    LastModifiedDate: '',
    AddressType: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
    city: '',
    stateProvince: '',
    country: '',
    zipPostalCode: '',
    regulator: '',
    RegulatorContact: '',
    CreatedBy: 30,
    RelatedEntityID: 0,
    EntitySubTypeID: null,
    EntityTypeID: 6,
    RelatedEntityEntityID: 0,
    MyState: 0,
    PlaceOfIncorporation: '',
    CountryOfIncorporation: 0,
    zebSiteAddress: '',
    IsAuditor: 0,
    ControllerInfo: '',
    FirmID: 0,
    Output: 0,
    NumOfShares: 0,
    CountryID: 0,
    AddressTypeID: 0,
    CreatedDate: '',
    EntityID: 0,
    ContactID: 0,
    AddressID: '',
    AddressState: 0,
    RelatedEntityTypeID: 6,
    ObjectID: 0,
    PrefferdMethod: '',
    ContactId: 0,
    ObjectInstanceID: 0,
    StatusDate: '',
    MobilePhone: '',
    businessEmail: '',
    OtherEmail: '',
    RegulatorID: 0,
    PreferredMethodType: '',
    RegulatorName: '',
  };
  updateControlTypeDesc(selectedValue: any) {
    switch (selectedValue) {
      case '1':
        this.selectedController.ControllerControlTypeDesc = 'Percentage';
        break;
      case '2':
        this.selectedController.ControllerControlTypeDesc = 'Exercise Control';
        break;
      default:
        this.selectedController.ControllerControlTypeDesc = '';
        break;
    }
  }

  createControllerPopupChanges(): void {
    console.log("CreatecontrollerDetails", this.CreatecontrollerDetails)
    this.CreateControllerValidateForm().then(() => {
      if (!this.hasValidationErrors) {
        console.log("Selected Controller:", this.CreatecontrollerDetails.EntityTypeDesc);
        if (
          ["parentEntity", "corporateController", "headOfficeBranch", "uboCorporate"].includes(this.CreatecontrollerDetails.EntityTypeDesc)
        ) {
          const saveControllerPopupChangesObj = {
            otherEntityDetails: {
              UserID: 30,
              UserName: null,
              OtherEntityName: this.CreatecontrollerDetails.OtherEntityName,
              OtherEntityID: null,
              ControllerControlTypeDesc: this.CreatecontrollerDetails.ControllerControlTypeDesc,
              EntityTypeDesc: this.CreatecontrollerDetails.EntityTypeDesc,
              DateOfIncorporation: this.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
              createdBy: this.CreatecontrollerDetails.CreatedBy,
              CessationDate: this.convertDateToYYYYMMDD(this.CreatecontrollerDetails.CessationDate),
              EffectiveDate: this.convertDateToYYYYMMDD(this.CreatecontrollerDetails.EffectiveDate),
              CreatedDate: null,
              ControllerControlTypeID: this.CreatecontrollerDetails.ControllerControlTypeID,
              relatedEntityID: this.CreatecontrollerDetails.RelatedEntityID,
              entitySubTypeID: this.CreatecontrollerDetails.EntitySubTypeID,
              relatedEntityTypeID: this.CreatecontrollerDetails.EntityTypeID,
              relatedEntityEntityID: this.CreatecontrollerDetails.RelatedEntityEntityID,
              myState: this.CreatecontrollerDetails.MyState,
              LegalStatusTypeID: this.CreatecontrollerDetails.LegalStatusTypeID,
              LegalStatusTypeDesc: this.CreatecontrollerDetails.LegalStatusTypeDesc,
              placeOfIncorporation: this.CreatecontrollerDetails.PlaceOfIncorporation,
              countryOfIncorporation: 2,
              PctOfShares: null,
              addressState: 2,
              registeredNumber: this.CreatecontrollerDetails.RegisteredNum,
              zebSiteAddress: this.CreatecontrollerDetails.zebSiteAddress,
              lastModifiedBy: 30,
              //LastModifiedDate : "2024-10-01T13:55:58.178Z",
              isAuditor: this.CreatecontrollerDetails.IsAuditor,
              isCompanyRegulated: this.CreatecontrollerDetails.IsCompanyRegulated,
              additionalDetails: this.CreatecontrollerDetails.AdditionalDetails,
              isParentController: this.CreatecontrollerDetails.IsParentController,
              isPublicallyTraded: this.CreatecontrollerDetails.IsPublicallyTraded,
              areAnyUBOs: this.CreatecontrollerDetails.More10UBOs,
              controllerInfo: this.CreatecontrollerDetails.ControllerInfo,
              Output: 0,
              FirmID: this.firmId,
              EntityTypeID: this.CreatecontrollerDetails.EntityTypeID,
              EntityID: this.firmId,
              numOfShares: this.CreatecontrollerDetails.NumOfShares,
              MajorityStockHolder: false,
              assnDateFrom: null,
              assnDateTo: null,
              LastModifiedByOfOtherEntity: 30,
            },
            addressList: [
              {
                firmID: this.firmId,
                countryID: this.CreatecontrollerDetails.CountryID,
                addressTypeID: this.CreatecontrollerDetails.AddressTypeID,
                LastModifiedBy: 30,
                entityTypeID: this.CreatecontrollerDetails.EntityTypeID,
                entityID: this.CreatecontrollerDetails.EntityID,
                contactID: this.CreatecontrollerDetails.ContactID,
                addressID: null,
                addressLine1: this.CreatecontrollerDetails.addressLine1,
                addressLine2: this.CreatecontrollerDetails.addressLine2,
                addressLine3: this.CreatecontrollerDetails.addressLine3,
                addressLine4: this.CreatecontrollerDetails.addressLine4,
                city: this.CreatecontrollerDetails.city,
                createdBy: 0,
                addressAssnID: null,
                CreatedDate: this.convertDateToYYYYMMDD(this.CreatecontrollerDetails.CreatedDate),
                LastModifiedDate: this.currentDate,
                addressState: 2,
                fromDate: null,
                toDate: null,
                Output: 0,
                objectID: this.CreatecontrollerDetails.ObjectID,
                objectInstanceID: this.CreatecontrollerDetails.ObjectInstanceID,
                objAis: { // Ensure this object is correctly structured
                  contactId: this.CreatecontrollerDetails.ContactId,
                  FirmId: this.firmId,
                  title: this.CreatecontrollerDetails.Title,
                  firstName: this.CreatecontrollerDetails.FirstName,
                  secondName: this.CreatecontrollerDetails.SecondName,
                  familyName: this.CreatecontrollerDetails.FamilyName,
                  dateOfBirth: this.CreatecontrollerDetails.DateOfBirth,
                  placeOfBirth: this.CreatecontrollerDetails.PlaceOfBirth,
                  passportNumber: this.CreatecontrollerDetails.PassportNum,
                  addressAssnID: null,
                  AddressTypeID: this.CreatecontrollerDetails.AddressTypeID,
                  statusDate: this.CreatecontrollerDetails.StatusDate,
                  createdDate: this.CreatecontrollerDetails.CreatedDate,
                  mobilePhone: this.CreatecontrollerDetails.MobilePhone,
                  businessEmail: this.CreatecontrollerDetails.businessEmail,
                  otherEmail: this.CreatecontrollerDetails.OtherEmail,
                  preferredMethodType: this.CreatecontrollerDetails.PreferredMethodType,
                  showReadOnly: true,
                  showEnabled: true,
                  Output: 0,
                }
              }
            ],
            regulatorList: [
              {
                EntityTypeID: this.CreatecontrollerDetails.EntityTypeID,
                EntityID: null,
                UserID: null,
                FirmID: null,
                RelatedEntityTypeID: this.CreatecontrollerDetails.RelatedEntityTypeID,
                relatedEntityID: this.CreatecontrollerDetails.RelatedEntityID,
                Output: 0,
                regulatorState: 2,
                RegulatorID: 39,
                RegulatorName: "Bahrain Monetary Agency",
                RegulatorContacts: "",
                RelatedEntityID: null,
                ContactID: null,
                Title: null,
                FullName: null,
                BussinessEmail: null,
                AddressLine1: null,
                AddressLine2: null,
                AddressLine3: null,
                AddressLine4: null,
                City: null,
                Province: null,
                CountryID: 0,
                CountryName: null,
                PostalCode: null,
                PhoneNumber: null,
                PhoneExt: null,
                FaxNumber: null,
                EntityRegulators: null,
                ShowReadOnly: false,
                ShowEnabled: true,
                ContactAssnID: null
              }
            ]
          }

          // Call the insert/update endpoint
          this.firmService.insertupdateotherentitydetails(saveControllerPopupChangesObj).subscribe(
            response => {
              console.log("Save successful:", response);
              this.isEditable = false;
            },
            error => {
              console.error("Error saving changes:", error);
            }
          );
        }
      }
      else if (
        ["individualController", "uboIndividual"].includes(this.CreatecontrollerDetails.EntityTypeDesc)
      ) {
        const saveControllerPopupChangesIndividualObj = {
          contactDetails: {
            contactDetails: {
              firmID: 0,
              contactID: 0,
              contactAssnID: 0,
              title: this.selectedController.Title, // Map your inputs accordingly
              firstName: this.selectedController.FirstName,
              secondName: this.selectedController.SecondName,
              thirdName: this.selectedController.ThirdName,
              familyName: this.selectedController.FamilyName,
              countryOfResidence: this.selectedController.CountryOfResidence,
              createdBy: this.selectedController.CreatedBy,
              dateOfBirth: this.selectedController.DateOfBirth,
              fullName: this.selectedController.FullName,
              lastModifiedBy: this.selectedController.LastModifiedByOfOtherEntities,
              nationalID: this.selectedController.NationalID,
              nationality: this.selectedController.Nationality,
              passportNum: this.selectedController.PassportNum,
              placeOfBirth: this.selectedController.PlaceOfBirth,
              previousName: this.selectedController.PreviousName,
              isExists: this.selectedController.IsExists,
              nameInPassport: this.selectedController.NameInPassport,
              contactAddnlInfoTypeID: this.selectedController.ContactAddnlInfoTypeID,
              isFromContact: this.selectedController.IsFromContact,
              countryofBirth: this.selectedController.CountryOfBirth,
              juridictionID: this.selectedController.JuridictionID,
              objectID: this.selectedController.ObjectID,
              isPeP: this.selectedController.IsPeP
            },
            lstContactFunctions: this.selectedController.LstContactFunctions.map(func => ({
              contactFunctionID: func.ContactFunctionID,
              contactFunctionTypeID: func.ContactFunctionTypeID,
              contactAssnID: func.ContactAssnID,
              contactID: func.ContactID,
              contactFunctionTypeDesc: func.ContactFunctionTypeDesc,
              effectiveDate: func.EffectiveDate,
              endDate: func.EndDate,
              createdDate: func.CreatedDate,
              createdBy: func.CreatedBy,
              lastModifiedBy: func.LastModifiedByOfOtherEntities,
              LastModifiedDate: func.LastModifiedDate,
              reviewStatus: func.ReviewStatus,
              selected: func.Selected,
              isFunctionActive: func.IsFunctionActive,
              isRecordEditable: func.IsRecordEditable
            }))
          },
          addresses: this.selectedController.Addresses.map(address => ({
            firmID: address.FirmID,
            countryID: address.CountryID,
            addressTypeID: address.AddressTypeID,
            sameAsTypeID: address.SameAsTypeID,
            lastModifiedBy: address.LastModifiedByOfOtherEntities,
            addressAssnID: address.AddressAssnID,
            entityTypeID: address.EntityTypeID,
            entityID: address.EntityID,
            contactAssnID: address.ContactAssnID,
            contactID: address.ContactID,
            addressID: address.AddressID,
            addressLine1: address.AddressLine1,
            addressLine2: address.AddressLine2,
            addressLine3: address.AddressLine3,
            addressLine4: address.AddressLine4,
            city: address.City,
            province: address.Province,
            postalCode: address.PostalCode,
            phoneNumber: address.PhoneNumber,
            phoneExt: address.PhoneExt,
            faxNumber: address.FaxNumber,
            LastModifiedDate: address.LastModifiedDate,
            addressState: address.AddressState,
            fromDate: "2024-10-01T14:38:59.118Z",
            toDate: "2024-10-01T14:38:59.118Z",
            objectID: address.ObjectID,
            objectInstanceID: address.ObjectInstanceID,
            objectInstanceRevNumber: address.ObjectInstanceRevNumber,
            sourceObjectID: address.SourceObjectID,
            sourceObjectInstanceID: address.SourceObjectInstanceID,
            sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNumber,
            objAis: address.ObjAis // Ensure this object is correctly structured
          }))
        };

        // Call the save/update contact form endpoint
        this.firmService.saveupdatecontactform(saveControllerPopupChangesIndividualObj).subscribe(
          response => {
            console.log("Contact save successful:", response);
          },
          error => {
            console.error("Error saving contact:", error);
          }
        );
      }
      else {
        console.log('Validation errors found:', this.errorMessages);
      }
    });
  }
  editController(): void {

    this.isEditable = true;

    console.log('Editing:', this.controllerDetails);
  }

  loadControllers(): void {
    this.isLoading = true;
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
          this.isLoading = false;
        } else {
          console.error('Invalid data structure:', data);
          this.FIRMControllers = [];
          this.isLoading = false;
        }
      },
      error => {
        console.error('Error fetching firm controllers', error);
        this.isLoading = false;
      }
    );
  }

  loadControllersIndividual(): void {
    this.isLoading = true;
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
          this.isLoading = false;
        }
        console.log('Filtered Controllers:', this.FIRMControllersIndividual);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching firm controllers', error);
        this.isLoading = false;
      }
    );
  }
  /////////// End Yazan Controller 
  loadAssiRA() {
    this.isLoading = true;
    this.firmService.getFIRMUsersRAFunctions(this.firmId, this.ASSILevel).subscribe(
      data => {
        this.FIRMRA = data.response;
        console.log('Firm RA Functions details:', this.FIRMRA);
        this.isLoading = false;
      },
      error => {
        console.error('Error get Firm RA Functionsdetails', error);
        this.isLoading = false;
      }
    );
  }
  loadRegisteredFund() {
    this.isLoading = true;
    this.firmService.getFIRMRegisteredFund(this.firmId).subscribe(
      data => {
        this.RegisteredFund = data.response;
        console.log('Firm FIRM RegisteredFund details:', this.RegisteredFund);
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching firm RegisteredFund', error);
        this.isLoading = false;
      }
    );
  }
  loadAdminFees() {
    this.isLoading = true;
    this.firmService.getFIRMAdminFees(this.firmId).subscribe(
      data => {
        this.FirmAdminFees = data.response;
        console.log('Firm FIRM Admin Fees details:', this.FirmAdminFees);
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching firm Admin Fees', error);
        this.isLoading = false;
      }
    );
  }


  loadActivitiesLicensed(): Promise<void> {
    this.isLoading = true;

    return new Promise((resolve, reject) => {
      this.loadFormReference();
      this.loadActivitiesTypesForLicensed();

      this.firmService.getCurrentScopeRevNum(this.firmId, 2).subscribe(
        data => {
          this.scopeRevNum = data.response.Column1;

          this.firmService.getFirmActivityLicensed(this.firmId).subscribe(
            data => {
              this.ActivityLicensed = data.response;
              console.log('Firm License scope details:', this.ActivityLicensed);
              this.isLoading = false;
              resolve(); // Resolve the promise when everything is successfully loaded
            },
            error => {
              console.error('Error fetching License scope', error);
              this.isLoading = false;
              reject(error); // Reject the promise in case of an error
            }
          );
        },
        error => {
          console.error('Error fetching current scope revision number for licensed: ', error);
          this.isLoading = false;
          reject(error); // Reject the promise in case of an error
        }
      );
    });
  }


  loadFormReference() {
    this.firmService.getDocumentDetails(this.firmId).subscribe(
      data => {
        this.documentDetails = data.response;
      }, error => {
        console.error(error)
      })
  }

  // On View Mode
  loadActivitiesAuthorized(): Promise<void> {
    this.isLoading = true; // Start loading indicator 

    return new Promise((resolve, reject) => {
      // Run both initial API calls in parallel using forkJoin
      forkJoin({
        scopeRevNum: this.firmService.getCurrentScopeRevNum(this.firmId, 3),
        firmActivity: this.firmService.getFirmActivityAuthorized(this.firmId),
      }).subscribe(
        ({ scopeRevNum, firmActivity }) => {
          // Process scope revision number
          this.scopeRevNum = scopeRevNum.response.Column1;

          // Process firm activity authorized details
          this.ActivityAuth = firmActivity.response;
          this.previousPrudentialCategoryID = parseInt(this.ActivityAuth[0].PrudentialCategoryTypeID);
          this.previousSectorTypeID = parseInt(this.ActivityAuth[0].SectorTypeID);

          // Process activities and categorize products
          this.ActivityAuth.forEach(activity => {
            activity.categorizedProducts = [];
            let currentCategory = null;

            activity.ObjectProductActivity.forEach(product => {
              if (product.productTypeID === "0") {
                // Main category
                currentCategory = {
                  mainCategory: product.productTypeDescription,
                  subProducts: []
                };
                activity.categorizedProducts.push(currentCategory);
              } else if (currentCategory) {
                // Sub-product
                product.firmScopeTypeID = product.firmScopeTypeID || ''; // Ensure firmScopeTypeID is set
                currentCategory.subProducts.push(product);
              }
            });
          });

          // Load additional details using another forkJoin to ensure all calls finish before turning off the loader
          forkJoin([
            this.loadPrudReturnTypes(this.ActivityAuth[0].PrudentialCategoryTypeID),
            this.loadPrudentialCategoryDetails(),
            this.loadSectorDetails(),
            this.loadIslamicFinance(),
            this.loadScopeOfAuth()
          ]).subscribe(
            () => {
              this.isLoading = false;
              resolve();
            },
            error => {
              console.error('Error loading additional data', error);
              this.isLoading = false;
              reject(error);
            }
          );
        },
        error => {
          console.error('Error fetching data', error);
          this.isLoading = false;
          reject(error);
        }
      );
    });
  }



  loadSectorDetails() {
    // Use the first activity's FirmScopeID and ScopeRevNum if they are the same across all.
    const firstActivity = this.ActivityAuth[0];
    if (firstActivity) {
      this.firmService.getSectorDetails(this.firmId, firstActivity.FirmScopeID, firstActivity.ScopeRevNum).subscribe((data) => {
        this.sectorDetails = data.response;
      }, error => {
        console.error('Error Fetching Sector Details: ', error);
      });
    }
  }

  loadPrudentialCategoryDetails() {
    const firstActivity = this.ActivityAuth[0];
    if (firstActivity) {
      this.firmService.getPrudentialCategoryDetails(this.firmId, firstActivity.FirmScopeID, firstActivity.ScopeRevNum).subscribe((data) => {
        this.prudentialCategoryDetails = data.response;
      }, error => {
        console.error('Error Fetching Prudential Category Details: ', error);
      });
    }
  }


  onPrudentialCategoryChange(prudCategID: string) {
    // Check if the new selection is the same as the previous one
    if (parseInt(prudCategID) === this.previousPrudentialCategoryID) {
      this.PrudentialCategoryIDChanged = false; // don't reset
    } else {
      // Determine if the FirmPrudentialCategoryID should be reset for a different selection
      if (this.ActivityAuth[0].SectorTypeID > 0 && this.ActivityAuth[0].PrudentialCategoryTypeID) {
        this.PrudentialCategoryIDChanged = true;
        this.showConfirmationAndUpdate(prudCategID, constants.FirmActivitiesEnum.CHANGINGPRUDCAT_RESET_PRUDRETTYPE);
      } else {
        this.PrudentialCategoryIDChanged = false;
        this.updateSectorAndLoadReturnTypes(prudCategID);
      }
    }
  }

  onSectorTypeChange(sectorID: string) {
    console.log("Sector Type Changed:", sectorID);
    console.log("Previous Sector Type ID:", this.previousSectorTypeID);
    if (parseInt(sectorID) === this.previousSectorTypeID) {
      this.SectorTypeIDChanged = false;
    } else {
      this.SectorTypeIDChanged = true;
    }
    console.log(this.SectorTypeIDChanged);
  }

  showConfirmationAndUpdate(prudCategID: string, msgKey: number) {
    this.firmService.errorMessages(msgKey).subscribe((response) => {
      Swal.fire({
        title: 'Alert',
        text: response.response,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          this.resetFirmSector = true;
          // User clicked 'Yes', reset SectorTypeID and load new return types
          this.updateSectorAndLoadReturnTypes(prudCategID, true); // true indicates reset SectorTypeID
        } else if (result.isDismissed) {
          this.resetFirmSector = false;
          // User clicked 'No', reset the prudential category to the previous value
          this.ActivityAuth[0].PrudentialCategoryTypeID = this.previousPrudentialCategoryID;
          this.PrudentialCategoryIDChanged = false;
          this.loadPrudReturnTypes(this.ActivityAuth[0].PrudentialCategoryTypeID);
          this.ActivityAuth[0].SectorTypeID = 0;
        }
      });
    });
  }

  updateSectorAndLoadReturnTypes(prudCategID: string, resetSectorTypeID: boolean = false) {
    // If instructed to reset SectorTypeID, set it to 0 ('Select')
    if (resetSectorTypeID) {
      this.ActivityAuth[0].SectorTypeID = 0;
    }

    // Load the return types for the new Prudential Category or clear if 'Select' is chosen
    if (parseInt(prudCategID) !== 0) {
      this.loadPrudReturnTypes(prudCategID);
    } else {
      this.prudReturnTypesDropdown = []; // Clear the dropdown
    }
  }

  loadScopeOfAuth() {
    const firstActivity = this.ActivityAuth[0];
    this.firmService.getDocument(firstActivity.FirmScopeID, firstActivity.ScopeRevNum).pipe(

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

  // loadScopeOfAuth() {
  //   this.firmService.getFirmScopeIdAndRevNum(this.firmId).pipe(
  //     switchMap(({ scopeId, scopeRevNum }) =>
  //       this.firmService.getDocument(scopeId, scopeRevNum)
  //     )
  //   ).subscribe(
  //     data => {
  //       this.AuthTableDocument = data.response;
  //       console.log('Document Data:', data);

  //     },
  //     error => {
  //       console.error('Error loading document:', error);

  //     }
  //   );
  // }


  loadIslamicFinance() {
    const firstActivity = this.ActivityAuth[0];
    this.firmService.getIslamicFinance(this.firmId, firstActivity.FirmScopeID, firstActivity.ScopeRevNum).subscribe(
      data => {
        this.islamicFinance = data.response || { IFinTypeId: null };
        this.isIslamicFinanceDeleted = false; // Data exists, so reset the flag
        this.isIslamicFinanceChecked = this.islamicFinance?.IFinTypeId > 0; // Set checkbox based on data
      },
      error => {
        console.error('Error fetching Islamic Finance', error);
        this.isIslamicFinanceDeleted = true; // Set flag to hide the section in view mode
        this.islamicFinance = { IFinTypeId: null };
      }
    );
  }


  loadFirmAdresses() {
    this.isLoading = true;
    this.firmService.getFirmAddresses(this.firmId).subscribe(
      data => {
        this.firmAddresses = data.response;
        console.log('Firm Addresses: ', this.firmAddresses);
        this.isLoading = false;
      }, error => {
        console.error('Error Fetching Firm Addresses', error);
        this.isLoading = false;
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
    this.isLoading = true;
    this.firmService.getCurrentAppDetailsLicensedAndAuth(this.firmId, 2).subscribe(data => {
      this.firmAppDetailsCurrentLicensed = data.response;
      console.log(this.firmAppDetailsCurrentLicensed);
      this.isLoading = false;
    }, error => {
      console.log(error)
      this.isLoading = false;
    })

    this.firmService.getCurrentAppDetailsLicensedAndAuth(this.firmId, 3).subscribe(data => {
      this.firmAppDetailsCurrentAuthorized = data.response;
      console.log(this.firmAppDetailsCurrentAuthorized);
      this.isLoading = false;
    }, error => {
      console.log(error)
      this.isLoading = false;
    })
  }

  userAllowedToAccessFirm() {
    this.isLoading = true;
    this.securityService.isUserAllowedToAccessFirm(this.userId, this.firmId).subscribe(data => {
      this.isUserAllowed = data.response;
      this.isLoading = false;
      if (!this.isUserAllowed) {
        this.router.navigate(['error/FirmAccessDenied'])
      }
    }, error => {
      console.error('Error loading is user allowed to access firm: ', error);
      this.isLoading = false;
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
    this.isLoading = true;
    this.firmService.getFirmsNameHistory(this.firmId).subscribe(
      data => {
        this.firmNamesHistory = data.response;
        this.cdr.detectChanges();
        console.log('Firm app details licensed history:', this.firmNamesHistory);
        this.isLoading = false;
      }, error => {
        console.error(error)
        this.isLoading = false;
      },
    );
  }

  addNewPermittedActivity() {
    this.newPermittedActivity = {
      FirmScopeTypeID: null, // Set to null or default value
      ActivityTypeID: null, // Set to null or default value
      CategoryID: null,
      activities: [], // Empty array for activity types to be loaded dynamically
      categorizedProducts: [], // Empty array for categorized products
      ObjectProductActivity: [], // Adjust as necessary for your product logic
      FirmActivityConditions: null, // Empty or default condition
      ActivityTypeDescription: null,
      CategoryDescription: null,
      FirmScopeTypeDescription: null,

      FirmID: this.ActivityAuth[0].FirmID,
      FirmScopeID: this.ActivityAuth[0].FirmScopeID,
      ScopeRevNum: this.ActivityAuth[0].ScopeRevNum,
      EffectiveDate: this.ActivityAuth[0].EffectiveDate,
      GeneralCondition: this.ActivityAuth[0].GeneralCondition,
      ScopeEffectiveDate: this.ActivityAuth[0].ScopeEffectiveDate,
      LastModifiedDate: this.ActivityAuth[0].LastModifiedDate,
      ModifiedByName: this.ActivityAuth[0].ModifiedByName,
      DocID: this.ActivityAuth[0].DocID,
      FormRefFileLocation: this.ActivityAuth[0].FormRefFileLocation,
      AppliedDate: this.ActivityAuth[0].AppliedDate,
      WithDrawnDate: this.ActivityAuth[0].WithDrawnDate,
      ScopeCertificateLink: this.ActivityAuth[0].ScopeCertificateLink,
      ActivityDetails: this.ActivityAuth[0].ActivityDetails,
      FirmActivityID: this.ActivityAuth[0].FirmActivityID,
      ScopeApplicationDate: this.ActivityAuth[0].ScopeApplicationDate,
      ScopeLicensedOrAuthorisedDate: this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate,
      CreatedDate: this.ActivityAuth[0].CreatedDate,
      CreatedByName: this.ActivityAuth[0].CreatedByName,
      ActivityDisplayOrder: this.ActivityAuth[0].ActivityDisplayOrder,

      ObjectFirmScopeCondition: this.ActivityAuth[0]?.ObjectFirmScopeCondition || [],

      FirmPrudentialCategoryID: this.ActivityAuth[0].FirmPrudentialCategoryID,
      PrudentialCategoryTypeID: this.ActivityAuth[0].PrudentialCategoryTypeID,
      PrudentialCategoryTypeDesc: this.ActivityAuth[0].PrudentialCategoryTypeDesc,
      PrudentialCategoryEffectiveDate: this.ActivityAuth[0].PrudentialCategoryEffectiveDate,
      PrudentialCategoryLastModifiedDate: this.ActivityAuth[0].PrudentialCategoryLastModifiedDate,
      FirmSectorID: this.ActivityAuth[0].FirmSectorID,
      SectorTypeID: this.ActivityAuth[0].SectorTypeID,
      SectorTypeDesc: this.ActivityAuth[0].SectorTypeDesc,
      SectorEffectiveDate: this.ActivityAuth[0].SectorEffectiveDate,
      SectorLastModifiedDate: this.ActivityAuth[0].SectorLastModifiedDate,
      SectorLastModifiedByName: this.ActivityAuth[0].SectorLastModifiedByName,
      ParentActivityTypeID: this.ActivityAuth[0].ParentActivityTypeID,
      AuthorisationCategoryTypeID: this.ActivityAuth[0].AuthorisationCategoryTypeID,
      AuthorisationCategoryTypeDesc: this.ActivityAuth[0].AuthorisationCategoryTypeDesc,
      PrudentialCategoryLastModifiedByName: this.ActivityAuth[0].PrudentialCategoryLastModifiedByName
    };

    this.ActivityAuth.unshift(this.newPermittedActivity);
  }

  removePermittedActivity(index: number) {
    Swal.fire({
      title: 'Alert',
      text: 'Are you sure you want to Remove this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.ActivityAuth.splice(index, 1);
      }
    });
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

  loadActivityTypes(activity: any) {
    const firmScopeTypeID = activity.FirmScopeTypeID;

    if (firmScopeTypeID) {
      this.firmService.getAuthActivityTypes(firmScopeTypeID).subscribe(
        data => {
          activity.activities = data.response;  // Set activities for the specific activity object

          console.log(`Loaded activities for FirmScopeTypeID ${firmScopeTypeID}:`, activity.activities);

          // Ensure the correct ActivityTypeID is selected
          if (activity.ActivityTypeID) {
            const selectedActivity = activity.activities.find(
              act => act.ActivityTypeID === activity.ActivityTypeID
            );

            // Set the preselected ActivityTypeID if it exists
            if (selectedActivity) {
              activity.ActivityTypeID = selectedActivity.ActivityTypeID;
            } else {
              console.warn(`ActivityTypeID ${activity.ActivityTypeID} not found for FirmScopeTypeID ${firmScopeTypeID}`);
            }
          }
        },
        error => {
          console.error('Error fetching activities for FirmScopeTypeID:', firmScopeTypeID, error);
        }
      );
    }
  }

  loadAllProductsForEditMode(): void {
    this.isLoading = true;
    const activityCount = this.ActivityAuth.length;
    let loadedCount = 0;
    // Assuming ActivityAuth contains all activities with their ActivityTypeID
    this.ActivityAuth.forEach(activity => {
      const activityTypeID = activity.ActivityTypeID;

      // Call the service to get the products for each ActivityTypeID
      this.firmService.getAllProducts(activityTypeID).subscribe(
        data => {
          const products = data.response;

          // Categorize products into main categories and subcategories for each activity
          activity.categorizedProducts = [];
          let currentCategory = null;

          // Iterate through the products and categorize them
          products.forEach(product => {
            if (product.ID === 0) {
              // If it's a main category, start a new group
              currentCategory = {
                mainCategory: product.ProductCategoryTypeDesc,
                subProducts: []
              };
              activity.categorizedProducts.push(currentCategory);
            } else if (currentCategory) {
              const subProduct = { ...product }; // Copy product details

              // Check if the product exists in the ObjectProductActivity array
              const matchingActivity = activity.ObjectProductActivity.find(
                act => act.productTypeDescription === product.ProductCategoryTypeDesc
              );

              // If there's a match, mark it as checked, otherwise unchecked
              if (matchingActivity) {
                subProduct.isChecked = true;
                subProduct.firmScopeTypeID = matchingActivity.firmScopeTypeID; // Set firmScopeTypeID from matching activity
              } else {
                subProduct.isChecked = false; // Uncheck if not found in ObjectProductActivity
                subProduct.firmScopeTypeID = 1;
              }

              // Add the subProduct (checked or unchecked) to the current category
              currentCategory.subProducts.push(subProduct);
            }
          });
          loadedCount++;
          if (loadedCount === activityCount) {
            this.isLoading = false; // Stop loader after all products are loaded
          }
        },
        error => {
          console.error(`Error fetching products for ActivityTypeID ${activityTypeID}:`, error);
          this.isLoading = false;
        }
      );
    });
  }




  toggleAllSubCategories(product: any, isChecked: boolean): void {
    // Loop through the sub-products and set their checked state to the same as the main category
    product.subProducts.forEach(subProduct => {
      subProduct.isChecked = isChecked;
    });
  }

  updateMainCategoryState(product: any): void {
    // If any sub-product is not checked, the main category should be unchecked
    product.isChecked = product.subProducts.every(subProduct => subProduct.isChecked);
  }

  loadActivitiesTypesForLicensed() {
    this.isLoading = true;
    this.firmService.getLicActivityTypes().subscribe(data => {
      this.licensedActivities = data.response;
      console.log('Firm activity types for licensed', this.licensedActivities);
      this.isLoading = false;
    }, error => {
      console.error('Error fetching activity types for licensed', error)
      this.isLoading = false;
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
              confirmButtonText: 'Ok',
            });
          }
        } else {
          // Check for new activity at index 0
          if (index === 0 && this.ActivityLicensed.length === 1) {
            Swal.fire({
              title: 'Alert!',
              text: 'There has to be at least one permitted activity!',
              icon: 'error',
              confirmButtonText: 'Ok',
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

  loadPrudReturnTypes(prudCategID: string) {
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

  populateFirmScopeTypes() {
    this.firmService.getObjectTypeTable(constants.firmScopeTypes).subscribe(data => {
      this.allFirmScopeTypes = data.response;
    }, error => {
      console.error('Error Fetching Firm Scope Types dropdown: ', error);
    })
  }

  onCategoryChange(activity: any) {
    const selectedCategoryID = activity.FirmScopeTypeID; // The selected category ID
    if (selectedCategoryID) {
      console.log('Selected Category ID:', selectedCategoryID);

      // Reset the categorized products for the activity when the category changes
      activity.categorizedProducts = [];

      // Fetch activities based on the selected category
      this.firmService.getAuthActivityTypes(selectedCategoryID).subscribe(
        data => {
          console.log('Fetched Activities for Category:', data.response);

          // Populate activities array
          activity.activities = data.response;

          // Reset the selected ActivityTypeID to '0' to select the "Select" option
          activity.ActivityTypeID = 0; // Ensure the default "Select" option is chosen
        },
        error => {
          console.error('Error fetching activities', error);
        }
      );
    }
  }


  onActivityChange(activity: any) {
    const activityTypeID = activity.ActivityTypeID; // The selected activity ID

    if (activityTypeID) {
      console.log('Selected Activity ID:', activityTypeID);

      // Fetch products for the selected activity
      this.firmService.getAllProducts(activityTypeID).subscribe(
        data => {
          const products = data.response;

          // If no products are returned, set categorizedProducts to null
          if (!products || products.length === 0) {
            activity.categorizedProducts = null;
            console.log('No products found for the selected activity.');
            return;
          }

          // Reset categorizedProducts to load new products
          activity.categorizedProducts = [];
          let currentCategory = null;

          // Iterate through the products and categorize them
          products.forEach(product => {
            if (product.ID === 0) {
              // If it's a main category, start a new group
              currentCategory = {
                mainCategory: product.ProductCategoryTypeDesc,
                subProducts: []
              };
              activity.categorizedProducts.push(currentCategory);
            } else if (currentCategory) {
              const subProduct = { ...product }; // Copy product details

              // Uncheck the product by default when loading
              subProduct.isChecked = false;
              subProduct.firmScopeTypeID = 1; // Default firmScopeTypeID

              // Add the subProduct to the current category
              currentCategory.subProducts.push(subProduct);
            }
          });

          console.log('Loaded Products for Activity:', activity.categorizedProducts);
        },
        error => {
          // If an error occurs, set categorizedProducts to null
          console.error('Error fetching products for ActivityTypeID', error);
          activity.categorizedProducts = null;
        }
      );
    } else {
      // If no activity is selected, clear the products
      activity.categorizedProducts = null;
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
    this.isLoading = true;
    if (firmApplicationTypeId === 2) {
      this.firmService.getFirmActivityLicensed(firmId).subscribe(data => {
        this.ActivityLicensed = data.response;

        if (this.ActivityLicensed) {
          const scopeID = this.ActivityLicensed[0].FirmScopeID;

          this.firmService.getRevision(scopeID).subscribe(revisions => {
            console.log('Fetched revisions:', revisions);
            this.LicPrevRevNumbers = revisions.response;
            this.isLoading = false;
          });
        } else {
          console.error('No activities found or scopeID is missing');
          this.isLoading = false;
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
    this.isLoading = true;
    if (firmApplicationTypeId === 3) {
      if (this.ActivityAuth) {
        const scopeID = this.ActivityAuth[0].FirmScopeID;

        this.firmService.getRevision(scopeID).subscribe(revisions => {
          console.log('Fetched revisions:', revisions);
          this.AuthPrevRevNumbers = revisions.response;
          this.groupActivitiesByCategory(this.ActivityAuth);
          this.isLoading = false;
        });
      } else {
        console.error('No activities found or scopeID is missing');
        this.isLoading = false;
      }
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
    this.isLoading = true; // Start loader when fetch begins

    if (firmApplicationTypeId === 2) {
      this.firmService.getScopeNum(firmId, scopeRevNum, 2).subscribe(
        data => {
          this.ActivityLicensed = data.response;
          this.currentLicRevisionNumber = scopeRevNum;
          console.log('Licensed Activities:', this.ActivityLicensed);
          this.updateLicLastRevisionNumber();
          this.closeLicScopePreviousVersions();
          this.isLoading = false; // Stop loader when data is loaded
        },
        error => {
          console.error('Error fetching licensed activities:', error);
          this.isLoading = false; // Stop loader on error
        }
      );
    } else if (firmApplicationTypeId === 3) {
      this.firmService.getScopeNum(firmId, scopeRevNum, 3).subscribe(
        data => {
          this.ActivityAuth = data.response;
          this.currentAuthRevisionNumber = scopeRevNum;
          console.log('Authorized Activities:', this.ActivityAuth);
          this.groupActivitiesByCategory(this.ActivityAuth);
          this.updateAuthLastRevisionNumber();
          this.closeAuthScopePreviousVersions();
          this.loadSectorDetails();
          this.loadPrudentialCategoryDetails();
          this.isLoading = false; // Stop loader when data is loaded
        },
        error => {
          console.error('Error fetching authorized activities:', error);
          this.isLoading = false; // Stop loader on error
        }
      );
    }
  }


  groupActivitiesByCategory(activityList: any[]) {
    activityList.forEach(activity => {
      activity.categorizedProducts = [];
      let currentCategory = null;

      activity.ObjectProductActivity.forEach(product => {
        if (product.productTypeID === "0") {
          // If it's a main category, start a new group
          currentCategory = {
            mainCategory: product.productTypeDescription,
            subProducts: []
          };
          activity.categorizedProducts.push(currentCategory);
        } else if (currentCategory) {
          // If it's a sub-product, add it to the current main category
          currentCategory.subProducts.push(product);
        }
      });
    });
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

  //  createController() {
  //    this.router.navigate(['home/create-controller']);
  //  }

  createContact() {
    this.router.navigate(['home/create-contact'])
  }
  ////////// Yazan Auditor
  firmAuditorName: { OtherEntityID: number, OtherEntityName: string }[] = [];
  firmAuditorType: { EntitySubTypeID: number, EntitySubTypeDesc: string }[] = [];
  getFirmAuditorName(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.firmAuditorName, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.firmAuditorName = data.response;
        console.log("firmAuditorName", data)
      }, error => {
        console.error("Error fetching controller", error);
      });
  }
  getFirmAuditorType(): void {
    this.firmService.getobjecttypetableEdit(this.userId, constants.firmAuditorType, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.firmAuditorType = data.response;
        console.log("firmAuditorName", data)
      }, error => {
        console.error("Error fetching controller", error);
      });
  }
  viewAuditor(auditor: any) {
    this.selectedAuditor = auditor; // Set the selected auditor
    this.IsViewAuditorVisible = true; // Show view section
    this.IsEditAuditorVisible = false; // Hide edit section
    this.IsCreateAuditorVisible = false; // Hide create section
  }
  closeAuditorPopup() {
    this.selectedAuditor = {}; // Reset the selected auditor object
    this.IsEditAuditorVisible = false; // Hide edit section
    this.IsViewAuditorVisible = false; // Hide view section
    this.IsCreateAuditorVisible = false; // Hide create section
  }
  closecreateAuditor() {
    this.selectedAuditor = {};
    this.IsCreateAuditorVisible = false;
    this.IsViewAuditorVisible = false;
  }
  editAuditor() {
    this.IsEditAuditorVisible = true; // Show the edit section
    this.IsCreateAuditorVisible = false; // Hide the create section
    this.IsViewAuditorVisible = false; // Hide the view section

    // Fetch dropdown values when entering edit mode
    this.getFirmAuditorName();
    this.getFirmAuditorType();
  }
  firmAuditorsObj: {};
  saveEditAuditor() {
    console.log("selectedAuditor", this.selectedAuditor)
    this.firmAuditorsObj = {
      OtherEntityID: this.selectedAuditor.OtherEntityID,
      CreatedBy: 30,
      RelatedEntityID: this.selectedAuditor.RelatedEntityID,
      EntitySubTypeID: this.selectedAuditor.EntitySubTypeID,
      EntitySubTypeDesc: this.selectedAuditor.EntitySubTypeDesc,
      // erorr
      RelatedEntityTypeID: this.selectedAuditor.RelatedEntityID,
      RelatedEntityEntityID: this.selectedAuditor.OtherEntityID,
      MyState: 3,
      LastModifiedByOfOtherEntity: 30,
      OtherEntityName: this.selectedAuditor.OtherEntityName,
      DateOfIncorporation: null,
      LegalStatusTypeID: null,
      PlaceOfIncorporation: null,
      CountryOfIncorporation: null,
      RegisteredNumber: null,
      ZebSiteAddress: null,
      LastModifiedDate: this.currentDate,
      lastModifiedBy: 30,
      isAuditor: 0,

      isCompanyRegulated: true,
      additionalDetails: null,
      isParentController: true,
      isPublicallyTraded: true,
      areAnyUBOs: true,
      controllerInfo: null,
      output: 0,
      firmId: this.firmId,
      entityTypeID: 0,
      entityID: this.firmId,
      controllerControlTypeID: null,
      numOfShares: 0,
      pctOfShares: 0,
      majorityStockHolder: true,
      assnDateFrom: this.convertDateToYYYYMMDD(this.selectedAuditor.AssnDateFrom),
      assnDateTo: this.convertDateToYYYYMMDD(this.selectedAuditor.AssnDateTo),
      ShowEnabled: false,
      ShowReadOnly: false,
      MajorityStockHolder: false,

    }
    this.firmService.savefirmauditors(this.firmAuditorsObj).subscribe(
      (response) => {
        console.log("Auditor saved successfully", response);
        Swal.fire('Saved!', 'Auditors details has been Saved.', 'success');
        this.IsEditAuditorVisible = false;
        this.IsViewAuditorVisible = false;
        this.loadAuditors();
      },
      (error) => {
        console.error("Error saving auditor", error);
        Swal.fire('Error!', 'Error Saving Auditor', 'error');
      }
    );
  }
  saveCreateAuditor() {
    this.firmAuditorsObj = {
      otherEntityID: this.selectedAuditor.OtherEntityID,
      createdBy: this.userId,
      relatedEntityID: this.selectedAuditor.RelatedEntityID,
      entitySubTypeID: this.selectedAuditor.EntitySubTypeID,
      relatedEntityTypeID: 0,
      relatedEntityEntityID: 0,
      myState: 2,
      otherEntityName: this.selectedAuditor.OtherEntityName,
      dateOfIncorporation: "2024-10-02T11:58:32.911Z",
      legalStatusTypeID: 0,
      placeOfIncorporation: null,
      countryOfIncorporation: 0,
      registeredNumber: null,
      zebSiteAddress: null,
      lastModifiedBy: this.userId,
      isAuditor: 0,
      isCompanyRegulated: true,
      additionalDetails: null,
      isParentController: true,
      isPublicallyTraded: true,
      areAnyUBOs: true,
      controllerInfo: null,
      output: 0,
      firmId: this.firmId,
      entityTypeID: 0,
      entityID: 0,
      controllerControlTypeID: 0,
      numOfShares: 0,
      pctOfShares: 0,
      majorityStockHolder: true,
      assnDateFrom: "2024-10-02T11:58:32.911Z",
      assnDateTo: "2024-10-02T11:58:32.911Z"
    }
    this.firmService.savefirmauditors(this.firmAuditorsObj).subscribe(
      (response) => {
        console.log("Auditor saved successfully", response);
        Swal.fire('Seaved!', 'Auditors details has been Seaved.', 'success');
        this.IsEditAuditorVisible = false;
        this.IsViewAuditorVisible = false;
        this.loadAuditors();
      },
      (error) => {
        console.error("Error saving auditor", error);
        Swal.fire('Error!', 'Error Saving Auditor', 'error');
      }
    );
  }
  // Method to cancel the edit action and switch back to view mode
  cancelEdit() {
    this.IsEditAuditorVisible = false;
    this.IsViewAuditorVisible = true;
  }
  createAuditor() {
    this.selectedAuditor = {};
    this.IsCreateAuditorVisible = true;
    this.IsEditAuditorVisible = false;
    this.IsViewAuditorVisible = false;
    this.getFirmAuditorName();
    this.getFirmAuditorType();
  }

  confirmDeleteAuditor() {
    Swal.fire({
      html: 'No history will be maintained for the record being deleted. If you wish to maintain history, please click "Cancel", specify a date for the "Effective To Date" field and save the data.',
      showCancelButton: true,
      confirmButtonColor: '#a51e36',
      cancelButtonColor: '#a51e36',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'custom-swal-width', // Class for custom width
      }

    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteAuditor(); // Call delete logic if OK is clicked
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Do something if Cancel is clicked, if needed
        console.log('Cancelled deletion');
      }
    });
  }

  // Delete auditor logic
  deleteAuditor() {
    this.firmAuditorsObj = {
      otherEntityID: this.selectedAuditor.OtherEntityID,
      createdBy: 30,
      relatedEntityID: this.selectedAuditor.RelatedEntityID,
      entitySubTypeID: this.selectedAuditor.EntitySubTypeID,
      relatedEntityTypeID: 0,
      relatedEntityEntityID: 0,
      myState: 4,
      otherEntityName: this.selectedAuditor.OtherEntityName,
      dateOfIncorporation: "2024-10-02T11:58:32.911Z",
      legalStatusTypeID: 0,
      placeOfIncorporation: null,
      countryOfIncorporation: 0,
      registeredNumber: null,
      zebSiteAddress: null,
      lastModifiedBy: 0,
      isAuditor: 0,
      isCompanyRegulated: true,
      additionalDetails: null,
      isParentController: true,
      isPublicallyTraded: true,
      areAnyUBOs: true,
      controllerInfo: null,
      output: 0,
      firmId: this.firmId,
      entityTypeID: 0,
      entityID: 0,
      controllerControlTypeID: 0,
      numOfShares: 0,
      pctOfShares: 0,
      majorityStockHolder: true,
      assnDateFrom: "2024-10-02T11:58:32.911Z",
      assnDateTo: "2024-10-02T11:58:32.911Z"
    }
    this.firmService.savefirmauditors(this.firmAuditorsObj).subscribe(
      (response) => {
        console.log("Auditor Deleted successfully", response);
        Swal.fire('Deleted!', 'Auditors details has been Deleted.', 'success');
        this.IsEditAuditorVisible = false;
        this.IsViewAuditorVisible = false;
        this.loadAuditors();
      },
      (error) => {
        console.error("Error Deleteing auditor", error);
        Swal.fire('Error!', 'Error Deleteing Auditor', 'error');
      }
    );
  }


  getSanitizedNotes(notes: string): SafeHtml {
    if (typeof notes !== 'string') return '';

    // Use the sanitizer to bypass security and render the notes as HTML
    return this.sanitizer.bypassSecurityTrustHtml(notes);
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
        this.isFirmLicensed = response.response;
        console.log('Firm licensed:', this.isFirmLicensed);
      },
      error => {
        console.error('Error checking firm license:', error);
        this.isFirmLicensed = false;
      }
    );
  }

  checkFirmAuthorisation() {
    this.firmService.isFirmAuthorised(this.firmId).subscribe(
      (response) => {
        this.isFirmAuthorised = response.response;
        console.log('Firm Authorised: ', response)
      }, error => {
        console.error('Error checking firm authorisation:', error);
        this.isFirmLicensed = false;
      }
    )
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
            ? this.formatDateToCustomFormat(OldFirmApplStatusDate)
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
            this.formattedAuthApplStatusDate = this.formatDateToCustomFormat(OldFirmApplStatusDate);
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



  formatDateToCustomFormat(dateString: string | null): string {
    // Check if the date string is null, empty, or invalid
    if (!dateString || isNaN(Date.parse(dateString))) {
      return '01/Jan/0001'; // Return 1/Jan/1001 if the date is invalid
    }
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }


  getErrorMessages(fieldName: string, msgKey: number, activity?: any, placeholderValue?: string) {
    this.firmService.errorMessages(msgKey).subscribe(
      (response) => {
        let errorMessage = response.response;
        // If a placeholder value is provided, replace the placeholder with the actual value
        if (placeholderValue) {
          errorMessage = errorMessage.replace("#Date#", placeholderValue).replace("##DateFieldLabel##", placeholderValue).replace("#ApplicationDate#", placeholderValue);
        }
        this.errorMessages[fieldName] = errorMessage;
        activity.errorMessages[fieldName] = errorMessage;
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
          confirmButtonText: 'Ok',
        });
      },
    );
    this.isLoading = false;
  }

  showFirmDetailsSaveSuccessAlert(messageKey: number) {
    this.firmService.errorMessages(messageKey).subscribe(
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

  showFirmScopeLicSaveSuccessAlert(messageKey: number) {
    this.isLoading = true;
    this.firmService.errorMessages(messageKey).subscribe(
      (response) => {
        const replacedText = response.response.replace('#Tab#', 'Licensed');
        Swal.fire({
          title: 'Success!',
          text: replacedText,
          icon: 'success',
          confirmButtonText: 'Ok',
        });
      },
    );
    this.isLoading = false;
  }

  showFirmScopeAuthSaveSuccessAlert(messageKey: number) {
    this.firmService.errorMessages(messageKey).subscribe(
      (response) => {
        const replacedText = response.response.replace('#Tab#', 'Authorised');
        Swal.fire({
          title: 'Success!',
          text: replacedText,
          icon: 'success',
          confirmButtonText: 'Ok',
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
      showCancelButton: false,
      confirmButtonText: 'Ok',
    });
  }

  // Method to show a SweetAlert for QFC Licensed type change
  showPopupLicenseTypeChange(messages: string[]) {
    Swal.fire({
      // title: 'Alert!',
      html: messages.join('<br>'), // Combine the messages with a line break
      showCancelButton: false,
      confirmButtonText: 'Ok',
    });
  }

  // Popups when you click save
  showApplnStatusValidationPopup(messageKey: number, placeholder: string, onConfirmed?: () => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firmService.errorMessages(messageKey).subscribe(
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

  showAlertDeleteFile() {
    Swal.fire({
      text: 'Do you really want to delete this attachment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {

      } else if (result.isDismissed) {
        return;
      }
    });
  }


  isNullOrEmpty(value: any): boolean {
    return value === null || value === '';
  }
}