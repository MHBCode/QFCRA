import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { LogformService } from 'src/app/ngServices/logform.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { FirmDetailsService } from '../firmsDetails.service';
import { FirmService } from '../firm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from 'src/app/ngServices/security.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import * as constants from 'src/app/app-constants';
import { ActivityService } from 'src/app/ngServices/activity.service';
import { forkJoin, switchMap } from 'rxjs';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';
import Swal from 'sweetalert2';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';

@Component({
  selector: 'app-scope',
  templateUrl: './scope.component.html',
  styleUrls: ['./scope.component.scss', '../firms.scss']
})
export class ScopeComponent implements OnInit {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  firmId: number = 0;
  activeSection: string = 'Licensed';
  tabIndex: number = 0; // 0 for Licensed, 1 for Authorized
  isEditModeLicense: boolean = false;
  isEditModeAuth: boolean = false;
  isCreateModeLicense: boolean = false;
  showPermittedActivitiesTable: string | boolean = false;
  isIslamicFinanceChecked: boolean = true;
  isIslamicFinanceDeleted: boolean = false;
  disableApplicationDate: boolean = true;
  resetFirmSector: boolean = false;
  SectorTypeIDChanged: boolean = false;
  PrudentialCategoryIDChanged: boolean = false;
  isParentActivity: boolean = false;
  parentActivity: number | null = null;
  selectedSubActivity: any = null;
  selectedSubActivityID: number | null = null;
  activitySubActivities: { [key: number]: any } = {};
  activityProducts: { [key: number]: any } = {};
  Page = FrimsObject;
  firmDetails: any;
  userId = 30;
  loading: boolean;
  isLoading: boolean = false;
  assignedUserRoles: any[] = [];
  isFirmAMLSupervisor: boolean = false;
  isFirmSupervisor: boolean = false;
  assignedLevelUsers: any = [];
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;
  ActivityLicensed: any = [{}];
  isFirmLicensed: boolean;
  isFirmAuthorised: boolean;
  ActivityAuth: any = [{}];
  errorMessages: { [key: string]: string } = {};
  activity: any = { errorMessages: {} };
  currentActivity: any = null;
  scopeRevNum: number;
  licensedActivities: any = [];
  documentDetails: any = {};
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  objectOpType = constants.ObjectOpType.View;
  controlsPermissions: any = [];
  FIRMRA: any[] = [];
  isEditModeCore: boolean = false;
  previousPrudentialCategoryID: number;
  previousSectorTypeID: number;
  prudReturnTypesDropdown: any = [];
  prudentialCategoryDetails: any = [];
  sectorDetails: any = [];
  islamicFinance: any = {};
  scopeOfAuthTableDoc: any = [];
  hasValidationErrors: boolean = false;
  invalidActivity: boolean;
  existingActivities: any = [];
  selectedDocId: string | null = null;
  LicPrevRevNumbers: any = [];
  activityCategories: any[] = [];
  activityTypes: any[] = [];
  subActivities: any[] = [];
  existingPermittedActivites: any = [];
  callLicScopePrev: boolean = false;
  callAuthScopePrev: boolean = false;
  callSubActivity: boolean = false;
  AuthPrevRevNumbers: any = [];
  isScopeConditionChecked: boolean = false;
  isCollapsed: { [key: string]: boolean } = {};
  allAuthorisationCategoryTypes: any = [];
  allPrudentialCategoryTypes: any = [];
  allFirmScopeTypes: any = [];
  newPermittedActivity: any = {};
  selectedFile: File | null = null;
  fileError: string = '';
  callUploadDoc: boolean = false;
  formReferenceDocs: any = [];
  fetchedScopeDocSubTypeID: any = {};
  callRefForm: boolean = false;
  currentAuthRevisionNumber: number | null = null;
  lastAuthRevisionNumber: number | null = null;
  currentLicRevisionNumber: number | null = null;
  lastLicRevisionNumber: number | null = null;
  newActivity: any = {};


  constructor(
    private securityService: SecurityService,
    private router: Router,
    private route: ActivatedRoute,
    private firmService: FirmService,
    private firmDetailsService: FirmDetailsService,
    private dateUtilService: DateUtilService,
    private cdr: ChangeDetectorRef,
    private logForm: LogformService,
    private activityService: ActivityService,
    private objectWF: ObjectwfService,
    private flatpickrService: FlatpickrService
  ) {

  }

  ngOnInit(): void {
    this.firmService.scrollToTop();
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadFirmDetails(this.firmId);
      this.populateAuthorisationCategoryTypes();
      this.populatePrudentialCategoryTypes();
      this.populateFirmScopeTypes();
      this.loadAssignedUserRoles(this.userId);
      this.switchScopeTab('Licensed');

      this.firmDetailsService.isFirmLicensed$.subscribe(
        (value) => (this.isFirmLicensed = value)
      );
      this.firmDetailsService.isFirmAuthorised$.subscribe(
        (value) => (this.isFirmAuthorised = value)
      );

      this.firmDetailsService.checkFirmLicense(this.firmId);
      this.firmDetailsService.checkFirmAuthorisation(this.firmId);
    })
  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }

  loadFirmDetails(firmId: number) {
    this.firmDetailsService.loadFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.firmDetails;
      },
      error => {
        console.error(error);
      }
    );
  }

  loadAssignedUserRoles(userId: number): void {
    this.firmDetailsService.loadAssignedUserRoles(userId).subscribe(
      data => {
        this.assignedUserRoles = data.assignedUserRoles;
        console.log('Roles successfully fetched:', this.assignedUserRoles);
      },
      error => {
        console.error(error);
      }
    );
  }

  isNullOrEmpty(value) {
    return this.firmService.isNullOrEmpty(value);
  }

  removeHtmlTags(value) {
    return this.firmService.removeHtmlTags(value);
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


  hideActionButton() {
    this.hideEditBtn = true;
    this.hideSaveBtn = true;
    this.hideCancelBtn = true;
    this.hideCreateBtn = true;
    this.hideDeleteBtn = true;
    this.hideReviseBtn = true;
  }

  switchScopeTab(section: string) {
    this.activeSection = section;  // Update the active section
    this.errorMessages = {};
    this.disableApplicationDate = true;
    if (section === 'Licensed') {
      this.tabIndex = 0;
      this.isEditModeLicense = false;
      this.loadActivitiesLicensed()
        .then(() => {
          this.applySecurityOnPage(this.Page.Scope, this.isEditModeLicense);
        })
        .catch((error) => {
          console.error('Error loading activities:', error);
        })
        .finally(() => {
          this.applySecurityOnPage(this.Page.Scope, this.isEditModeLicense);
        });
    } else if (section === 'Authorized') {
      this.tabIndex = 1;
      this.isEditModeAuth = false;
      this.loadActivitiesAuthorized()
        .then(() => {
          this.applySecurityOnPage(this.Page.Scope, this.isEditModeAuth);
        })
        .catch((error) => {
          console.error('Error loading auth activities:', error);
        })
        .finally(() => {
          this.applySecurityOnPage(this.Page.Scope, this.isEditModeAuth);
        });
    }
  }


  // On View Mode
  loadActivitiesAuthorized(): Promise<void> {
    this.isLoading = true; // Start loading indicator 

    return new Promise((resolve, reject) => {
      // Run both initial API calls in parallel using forkJoin
      forkJoin({
        scopeRevNum: this.activityService.getCurrentScopeRevNum(this.firmId, 3),
        firmActivity: this.activityService.getFirmActivityAuthorized(this.firmId),
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
              // Check for withdrawal or discontinue actions
              if (product.firmScopeTypeID !== 2 && product.firmScopeTypeID !== 3) {
                if (product.productTypeID === "0") {
                  // Main category
                  currentCategory = {
                    mainCategory: product.productTypeDescription,
                    subProducts: [],
                    hasVisibleProducts: false // Initialize the visibility flag
                  };
                  activity.categorizedProducts.push(currentCategory);
                } else if (currentCategory) {
                  // Sub-product
                  product.firmScopeTypeID = product.firmScopeTypeID || ''; // Ensure firmScopeTypeID is set
                  currentCategory.subProducts.push(product);
                  // Set the flag to true if there are visible sub-products
                  currentCategory.hasVisibleProducts = true;
                }
              }
            });
          });

          // Load additional details using another forkJoin to ensure all calls finish before turning off the loader
          forkJoin([
            this.loadPrudReturnTypes(this.ActivityAuth[0].PrudentialCategoryTypeID),
            this.loadPrudentialCategoryDetails(),
            this.loadSectorDetails(),
            this.loadIslamicFinance(),
            this.loadScopeOfAuthDoc(),
            this.loadFormReference(),
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
          console.error('Error fetching activities authorised data', error);
          this.loadFormReference(),
            this.isLoading = false;
          reject(error);
        }
      );
    });
  }

  loadActivitiesLicensed(): Promise<void> {
    this.isLoading = true;

    return new Promise((resolve, reject) => {
      this.loadActivitiesTypesForLicensed();

      this.activityService.getCurrentScopeRevNum(this.firmId, 2).subscribe(
        data => {
          this.scopeRevNum = data.response.Column1;

          this.activityService.getFirmActivityLicensed(this.firmId).subscribe(
            data => {
              this.ActivityLicensed = data.response;
              this.loadFormReference();
              console.log('Firm License scope details:', this.ActivityLicensed);
              this.isLoading = false;
              resolve(); // Resolve the promise when everything is successfully loaded
            },
            error => {
              console.error('Error fetching License scope', error);
              this.loadFormReference(),
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

  loadPrudReturnTypes(prudCategID: string) {
    this.activityService.getPrudReturnTypes(prudCategID).subscribe(data => {
      this.prudReturnTypesDropdown = data.response;
      console.log('Firm Scope Prud Return Types: ', this.prudReturnTypesDropdown);
    }, error => {
      console.log('Error fetching prud types: ', error)
    })
  }

  loadPrudentialCategoryDetails() {
    const firstActivity = this.ActivityAuth[0];
    if (firstActivity) {
      this.activityService.getPrudentialCategoryDetails(this.firmId, firstActivity.FirmScopeID, firstActivity.ScopeRevNum).subscribe((data) => {
        this.prudentialCategoryDetails = data.response;
      }, error => {
        console.error('Error Fetching Prudential Category Details: ', error);
      });
    }
  }

  loadSectorDetails() {
    // Use the first activity's FirmScopeID and ScopeRevNum if they are the same across all.
    const firstActivity = this.ActivityAuth[0];
    if (firstActivity) {
      this.activityService.getSectorDetails(this.firmId, firstActivity.FirmScopeID, firstActivity.ScopeRevNum).subscribe((data) => {
        this.sectorDetails = data.response;
      }, error => {
        console.error('Error Fetching Sector Details: ', error);
      });
    }
  }


  loadIslamicFinance() {
    const firstActivity = this.ActivityAuth[0];
    this.activityService.getIslamicFinance(this.firmId, firstActivity.FirmScopeID, firstActivity.ScopeRevNum).subscribe(
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

  loadScopeOfAuthDoc() {
    const firstActivity = this.ActivityAuth[0];
    this.objectWF.getDocument(this.Page.Scope, firstActivity.FirmScopeID, firstActivity.ScopeRevNum).pipe(
    ).subscribe(
      data => {
        this.scopeOfAuthTableDoc = data.response;
        console.log('Document Data:', data);
      },
      error => {
        console.error('Error loading document:', error);
        this.scopeOfAuthTableDoc = [];

      }
    );
  }

  // Added by Moe
  fetchSubTypeDocIDs() {
    this.securityService.getObjectTypeTable(constants.docSubTypes).subscribe(data => {
      // Scope Of Authorsation in Scope Authorised
      this.fetchedScopeDocSubTypeID = data.response.find((item: { DocSubTypeID: number }) =>
        item.DocSubTypeID === 262
      );
    });
  }

  loadFormReference() {
    this.isLoading = true;
    const firstActivityAuth = this.ActivityAuth[0];
    const firstActivityLic = this.ActivityLicensed[0];
    let docID = 0;

    if (this.tabIndex === 0) {
      docID = firstActivityLic.DocID;
    } else if (this.tabIndex === 1) {
      docID = firstActivityAuth.DocID;
    }

    this.logForm.getDocumentDetails(docID).subscribe(
      data => {
        this.documentDetails = data.response;

        // Extract and format the file name
        const fullFileName = this.documentDetails.FileName;
        const fileParts = fullFileName.split('_');  // Split by underscore (_)

        if (fileParts.length > 1) {
          // Assume the first part is the Form code and the rest is the full file name
          const formName = 'Form ' + fileParts[0].replace('Q01', 'Q01 - Application for Licensing');
          const restOfFileName = fileParts.join('_');  // Join back the parts
          this.documentDetails.formattedFileName = `${formName}: ${restOfFileName}`;
        } else {
          this.documentDetails.formattedFileName = fullFileName; // Fallback for unexpected format
        }

        this.isLoading = false;
      }, error => {
        console.error(error);
        this.documentDetails = {};
        this.isLoading = false;
      }
    );
  }

  loadActivitiesTypesForLicensed() {
    this.isLoading = true;
    this.activityService.getLicActivityTypes().subscribe(data => {
      this.licensedActivities = data.response;
      console.log('Firm activity types for licensed', this.licensedActivities);
      this.isLoading = false;
    }, error => {
      console.error('Error fetching activity types for licensed', error)
      this.isLoading = false;
    })
  }

  editLicenseScope() {
    if (this.ActivityLicensed[0].ScopeRevNum) {

      this.applyVaryScopeButtonVisibilityOnEdit();

      // If the form is not in edit mode, toggle to edit mode
      if (!this.isEditModeLicense) {
        this.isEditModeLicense = true;
        //this.objectOpType = constants.ObjectOpType.Edit;
        this.applySecurityOnPage(this.Page.Scope, this.isEditModeLicense);
        return; // Exit the function to prevent running validations
      }
    }
  }


  applyVaryScopeButtonVisibilityOnEdit() {
    if (this.tabIndex === 0) {
      // Logic for showing or hiding the "Vary Scope" button
      if (!(this.firmService.isNullOrEmpty(this.ActivityLicensed[0].ScopeAppliedDate)) && !(this.firmService.isNullOrEmpty(this.ActivityLicensed[0].ScopeLicensedDate))) {
        if (this.currentDate > this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate)) {
          this.hideReviseBtn = true;
          this.disableApplicationDate = false;
        } else {
          this.hideReviseBtn = false;
          this.disableApplicationDate = true;
        }
      } else {
        this.hideReviseBtn = false;
        this.disableApplicationDate = true;
      }
    } else if (this.tabIndex === 1) {
      if (!(this.firmService.isNullOrEmpty(this.ActivityAuth[0].ScopeApplicationDate)) && !(this.firmService.isNullOrEmpty(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate))) {
        if (this.currentDateOnly > this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate)) {
          this.disableApplicationDate = false;  // Enable the field
          this.hideReviseBtn = true;
        } else {
          this.disableApplicationDate = true;  // Disable the field
          this.hideReviseBtn = false;
        }
      } else {
        this.disableApplicationDate = true;  // Enable if no authorisation date is present
        this.hideReviseBtn = false;
      }
    }
  }

  validateLicenseScope() {
    // APPLICATION DATE VALIDATION
    if (this.firmService.isNullOrEmpty(this.ActivityLicensed[0].ScopeAppliedDate)) {
      this.loadErrorMessages('ScopeAppliedDate', constants.FirmActivitiesEnum.ENTER_VALID_APPLICATIONDATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['ScopeAppliedDate'];
    }

    if (this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeAppliedDate) < this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.FirmLicApplDate)) {
      this.loadErrorMessages('ScopeAppliedDateLessThanFirmLicApplDate', constants.FirmActivitiesEnum.APPLICATIONDATE_LATER_COREDETAIL, this.dateUtilService.formatDateToCustomFormat(this.firmDetails.FirmLicApplDate));
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['ScopeAppliedDateLessThanFirmLicApplDate'];
    }

    // EFFECTIVE DATE VALIDATION
    if (this.ActivityLicensed[0].ScopeEffectiveDate) {
      if (this.ActivityLicensed[0].ScopeEffectiveDate == null || this.ActivityLicensed[0].ScopeEffectiveDate == '') {
        this.loadErrorMessages('ScopeEffectiveDate', constants.FirmActivitiesEnum.ENTER_VALID_SCOPEEFFECTIVEDATE);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['ScopeEffectiveDate'];
      }
    }
    if (this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeEffectiveDate) < this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeAppliedDate)) {
      this.loadErrorMessages('ScopeEffectiveDateLessThanApplicationDate', constants.FirmActivitiesEnum.ENTER_EFFECTIVEDATE_LATER_APPLICATIONDATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['ScopeEffectiveDateLessThanApplicationDate'];
    }

    // ACTIVITY TYPE VALIDATION
    this.invalidActivity = this.ActivityLicensed.find(activity => activity.ActivityTypeID == 0);
    if (this.invalidActivity) {
      this.loadErrorMessages('ActivityTypeIDCORRECTION', constants.FirmActivitiesEnum.CORRECT_PERMITTEDACTIVITIES);
      this.loadErrorMessages('ActivityTypeID', constants.FirmActivitiesEnum.SELECT_ACTIVITIES);
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
      this.showError(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS);
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

    if (!(this.firmService.isNullOrEmpty(this.ActivityLicensed[0].ScopeEffectiveDate)) && this.currentDateOnly > this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeEffectiveDate) || this.ActivityLicensed[0].ScopeRevNum === 1) {
      this.isLoading = false;
      this.saveVaryLicenseScope();
    } else {

      // Step 3: Save License Scope Details
      this.executeSaveLicense()
    }
  }

  showError(messageKey: number) {
    this.firmDetailsService.showErrorAlert(messageKey, this.isLoading);
  }

  executeSaveLicense() {
    const updatedLicenseScope = this.prepareLicenseScopeObject(this.userId);
    this.saveLicenseScopeDetails(updatedLicenseScope, this.userId);
    this.showFirmScopeLicSaveSuccessAlert(constants.FirmActivitiesEnum.ACTIVITIES_SAVED_SUCCESSFULLY);
  }

  showFirmScopeLicSaveSuccessAlert(messageKey: number) {
    this.isLoading = true;
    this.logForm.errorMessages(messageKey).subscribe(
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
        docIDs: this.selectedDocId == null ? null : this.selectedDocId.toString(),
        generalConditions: this.ActivityLicensed[0].GeneralConditions,
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeEffectiveDate),
        scopeCertificateLink: this.ActivityLicensed[0].ScopeCertificateLink,
        applicationDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeAppliedDate),
        licensedOrAuthorisedDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate),
      },
      lstFirmActivities: this.existingActivities.map(activityLic => ({
        createdBy: userId, //recheck
        firmScopeTypeID: activityLic.FirmScopeTypeID,
        activityTypeID: Number(activityLic.ActivityTypeID),
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(activityLic.ScopeEffectiveDate),
        firmActivityConditions: activityLic.Column1,
        productTypeID: null,
        appliedDate: this.dateUtilService.convertDateToYYYYMMDD(activityLic.ScopeAppliedDate),
        withDrawnDate: this.dateUtilService.convertDateToYYYYMMDD(activityLic.ScopeEffectiveDate),
        objectProductActivity: null,
        activityDetails: activityLic.FirmActivityDetails
      }))
    };
  }

  saveLicenseScopeDetails(updatedLicenseScope: any, userId: number) {
    this.isLoading = true;
    console.log('Updated License Scope:', updatedLicenseScope);

    this.activityService.editLicenseScope(updatedLicenseScope).subscribe(
      response => {
        console.log('License scope updated successfully:', response);
        this.loadActivitiesLicensed(); // Reload license scope details
        this.isEditModeLicense = false; // Toggle edit mode off
        this.applySecurityOnPage(this.Page.Scope, this.isEditModeLicense);
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
    this.logForm.errorMessages(constants.FirmActivitiesEnum.SCOPECHANGED_SAVEORREVISE).subscribe((response) => {
      Swal.fire({
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
          this.showError(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS);
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
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeEffectiveDate),
        scopeCertificateLink: null,
        applicationDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeAppliedDate),
        licensedOrAuthorisedDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate),
      },
      lstFirmActivities: this.existingActivities.map(activityLic => ({
        createdBy: userId, //recheck
        firmScopeTypeID: activityLic.FirmScopeTypeID,
        activityTypeID: Number(activityLic.ActivityTypeID),
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(activityLic.ScopeEffectiveDate),
        firmActivityConditions: activityLic.Column1,
        productTypeID: null,
        appliedDate: this.dateUtilService.convertDateToYYYYMMDD(activityLic.ScopeAppliedDate),
        withDrawnDate: this.dateUtilService.convertDateToYYYYMMDD(activityLic.ScopeEffectiveDate),
        objectProductActivity: null,
        activityDetails: activityLic.FirmActivityDetails
      }))
    };
  }

  varyScopeLicConfirm() {
    this.existingActivities = this.ActivityLicensed;
    const varyLicenseScope = this.prepareVaryScopeLicenseObject(this.userId);
    this.activityService.editLicenseScope(varyLicenseScope).subscribe((response) => {
      console.log('Vary Scope Successfully', response);
      this.loadActivitiesLicensed();
      this.getFormReferenceDocuments();
      this.isEditModeLicense = false;
      this.disableApplicationDate = true;
      this.applySecurityOnPage(this.Page.Scope, this.isEditModeLicense);
      this.loadLicScopeRevisions(this.firmId, 2);
      this.showFirmScopeLicSaveSuccessAlert(constants.FirmActivitiesEnum.ACTIVITIES_SAVED_SUCCESSFULLY);
    }, error => {
      console.log('Vary Scope Failed', error);
    })
  }

  loadLicScopeRevisions(firmId: number, firmApplicationTypeId: number) {
    this.isLoading = true;
    if (firmApplicationTypeId === 2) {
      this.activityService.getFirmActivityLicensed(firmId).subscribe(data => {
        this.ActivityLicensed = data.response;

        if (this.ActivityLicensed) {
          const scopeID = this.ActivityLicensed[0].FirmScopeID;

          this.objectWF.getRevision(scopeID).subscribe(revisions => {
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


  cancelEditLicScope() {
    Swal.fire({
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
        this.applySecurityOnPage(this.Page.Scope, this.isEditModeLicense);
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
        this.applySecurityOnPage(this.Page.Scope, this.isEditModeAuth);
        this.loadActivityCategories();
        // Loop through each activity and load its activities based on FirmScopeTypeID
        this.ActivityAuth.forEach(activity => {
          if (activity.CategoryID) {
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

  loadActivityCategories() {
    this.activityService.getActivityCategories().subscribe(
      data => {
        this.activityCategories = data.response;
        console.log('Firm activity categories details:', this.activityCategories);
      }, error => {
        console.error('Error fetching activity categories', error);
      }
    );
  }

  loadActivityTypes(activity: any) {
    const categoryID = activity.CategoryID;

    if (categoryID) {
      this.activityService.getAuthActivityTypes(categoryID).subscribe(
        data => {
          activity.activities = data.response;  // Set activities for the specific activity object

          console.log(`Loaded activities for CategoryID ${categoryID}:`, activity.activities);

          // Ensure the correct ActivityTypeID is selected
          if (activity.ActivityTypeID) {
            const selectedActivity = activity.activities.find(
              act => act.ActivityTypeID === activity.ActivityTypeID
            );

            // Set the preselected ActivityTypeID if it exists
            if (selectedActivity) {
              activity.ActivityTypeID = selectedActivity.ActivityTypeID;
            } else {
              console.warn(`ActivityTypeID ${activity.ActivityTypeID} not found for FirmScopeTypeID ${categoryID}`);
            }
          }
        },
        error => {
          console.error('Error fetching activities for CategoryID:', categoryID, error);
        }
      );
    }
  }



  loadAllProductsForEditMode(): void {
    this.isLoading = true;
    const activityCount = this.ActivityAuth.length;
    let loadedCount = 0;

    this.ActivityAuth.forEach(activity => {
      const activityTypeID = activity.ActivityTypeID;

      this.activityService.getAllProducts(activityTypeID).subscribe(
        data => {
          const products = data.response;

          // Categorize products into main categories and subcategories for each activity
          activity.categorizedProducts = [];
          let currentCategory = null;

          products.forEach(product => {
            if (product.ID === 0) {
              // Start a new main category group
              currentCategory = {
                mainCategory: product.ProductCategoryTypeDesc,
                subProducts: [],
                isChecked: false // Initialize as unchecked
              };
              activity.categorizedProducts.push(currentCategory);
            } else if (currentCategory) {
              const subProduct = { ...product };

              // Check if subProduct exists in ObjectProductActivity and set isChecked accordingly
              const matchingActivity = activity.ObjectProductActivity.find(
                act => act.productTypeDescription === product.ProductCategoryTypeDesc
              );

              subProduct.isChecked = !!matchingActivity;
              subProduct.firmScopeTypeID = matchingActivity ? matchingActivity.firmScopeTypeID : 1;

              // Add the subProduct to the current category
              currentCategory.subProducts.push(subProduct);
            }
          });

          // After processing sub-products, check if all sub-products are selected for each main category
          activity.categorizedProducts.forEach(category => {
            const allSubProductsChecked = category.subProducts.every(subProduct => subProduct.isChecked);
            category.isChecked = allSubProductsChecked;
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


  saveAuthScope() {
    this.isLoading = true; // Start loading indicator
    this.hasValidationErrors = false;


    this.validateAuthScope();

    // Step 2: Handle Validation Errors
    if (this.hasValidationErrors) {
      this.showError(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS);
      this.isLoading = false;
      return; // Prevent further action if validation fails
    }

    this.existingPermittedActivites = this.ActivityAuth;

    if (!(this.firmService.isNullOrEmpty(this.ActivityAuth[0].ScopeEffectiveDate)) && this.currentDateOnly > this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeEffectiveDate || this.ActivityAuth[0].ScopeRevNum === 1)) {
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
    this.activityService.editAuthorizedScope(updatedAuthorizeScope).subscribe(
      response => {
        console.log('Authorise scope updated successfully:', response);

        this.loadActivitiesAuthorized(); // Reload authorize scope details
        this.isEditModeAuth = false; // Toggle edit mode off
        this.disableApplicationDate = true;
        this.applySecurityOnPage(this.Page.Scope, this.isEditModeAuth);

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
    this.logForm.errorMessages(constants.FirmActivitiesEnum.SCOPECHANGED_SAVEORREVISE).subscribe((response) => {
      Swal.fire({
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
          this.showError(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS);
          return; // Prevent further action if validation fails
        }
        this.varyScopeAuthConfirm();
      }
    });
  }


  showFirmScopeAuthSaveSuccessAlert(messageKey: number) {
    this.logForm.errorMessages(messageKey).subscribe(
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
        docIDs: this.selectedDocId == null ? null : this.selectedDocId.toString(),
        generalConditions: this.ActivityAuth[0].GeneralCondition,
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeEffectiveDate),
        scopeCertificateLink: this.ActivityAuth[0]?.ScopeCertificateLink,
        applicationDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeApplicationDate),
        licensedOrAuthorisedDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate),
      },
      lstFirmActivities: this.existingPermittedActivites.map(activityAuth => ({
        createdBy: userId, //recheck
        firmScopeTypeID: null,
        activityTypeID: parseInt(activityAuth.ActivityTypeID),
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(activityAuth.ScopeEffectiveDate),
        firmActivityConditions: activityAuth.FirmActivityConditions,
        productTypeID: null,
        appliedDate: this.dateUtilService.convertDateToYYYYMMDD(activityAuth.ScopeAppliedDate),
        withDrawnDate: this.dateUtilService.convertDateToYYYYMMDD(activityAuth.ScopeEffectiveDate),
        objectProductActivity: activityAuth.categorizedProducts
          .flatMap(catProd =>
            catProd.subProducts
              .filter(subProd => subProd.isChecked)  // Only include checked sub-products
              .map(subProd => ({
                productTypeID: String(subProd.ID),
                appliedDate: this.dateUtilService.convertDateToYYYYMMDD(activityAuth.appliedDate),
                withDrawnDate: this.dateUtilService.convertDateToYYYYMMDD(activityAuth.withDrawnDate),
                effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(activityAuth.effectiveDate),
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
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].PrudentialCategoryEffectiveDate),
        expirationDate: null,
        lastModifiedDate: null,
        authorisationCategoryTypeID: this.ActivityAuth[0].AuthorisationCategoryTypeID
      },
      objSector: {
        firmSectorID: this.SectorTypeIDChanged ? null : this.sectorDetails[0].FirmSectorID,
        sectorTypeID: parseInt(this.ActivityAuth[0].SectorTypeID),
        lastModifiedByID: userId, //recheck
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].SectorEffectiveDate)
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

  validateAuthScope() {
    this.hasValidationErrors = false;
    // Set to check if there are duplicates activity ids added
    const activityIdsSet = new Set<number>();


    this.ActivityAuth.forEach(activity => {
      // Reset error messages for each activity
      activity.errorMessages = {};
      const activityTypeIdAsNumber = Number(activity.ActivityTypeID);
      if (activityIdsSet.has(activityTypeIdAsNumber)) {
        // Flag duplicates and set a validation message
        this.loadErrorMessages('DuplicateActivity', constants.FirmActivitiesEnum.ACTIVITY_ALREADY_SELECTED, activity, activity.ActivityTypeDescription);
        this.loadErrorMessages('correctPermittedActivities', constants.FirmActivitiesEnum.CORRECT_PERMITTEDACTIVITIES);
        this.hasValidationErrors = true;
      } else {
        activityIdsSet.add(activityTypeIdAsNumber);
        delete activity.errorMessages['DuplicateActivity'];
        delete activity.errorMessages['correctPermittedActivities'];
      }

      // Validation for Application Date
      if (this.firmService.isNullOrEmpty(this.ActivityAuth[0].ScopeApplicationDate)) {
        this.loadErrorMessages('ScopeAppliedDateAuth', constants.FirmActivitiesEnum.ENTER_VALID_APPLICATIONDATE);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages[('ScopeAppliedDateAuth')];
      }

      // Validation for Effective Date
      if (!(this.firmService.isNullOrEmpty(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate)) && !(this.firmService.isNullOrEmpty(this.ActivityAuth[0].ScopeEffectiveDate)) && this.currentDate > this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate)) {
        if (this.firmService.isNullOrEmpty(this.ActivityAuth[0].ScopeEffectiveDate)) {
          this.loadErrorMessages('ScopeEffectiveDateAuth', constants.FirmActivitiesEnum.ENTER_VALID_SCOPEEFFECTIVEDATE);
          this.hasValidationErrors = true;
        } else {
          delete this.errorMessages[('ScopeEffectiveDateAuth')];
        }
      }

      // Validation for Effective Date Later Application Date
      if (!(this.firmService.isNullOrEmpty(this.ActivityAuth[0].ScopeApplicationDate)) && !(this.firmService.isNullOrEmpty(this.ActivityAuth[0].ScopeEffectiveDate))) {
        if (this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeEffectiveDate) < this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeApplicationDate)) {
          this.loadErrorMessages('EffectiveDateLaterApplicationDate', constants.FirmActivitiesEnum.ENTER_EFFECTIVEDATE_LATER_APPLICATIONDATE)
        } else {
          delete this.errorMessages[('EffectiveDateLaterApplicationDate')]
        }
      }

      // Check if the selected activity is valid (not "Select")
      if (activity.ActivityTypeID == 0) {
        this.loadErrorMessages('ActivityTypeID', constants.FirmActivitiesEnum.SELECT_ACTIVITIES, activity);
        this.loadErrorMessages('correctPermittedActivities', constants.FirmActivitiesEnum.CORRECT_PERMITTEDACTIVITIES);
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
        this.loadErrorMessages('Products', constants.FirmActivitiesEnum.SELECT_ATLEASTONE_PRODUCTS, activity);
        this.loadErrorMessages('correctPermittedActivities', constants.FirmActivitiesEnum.CORRECT_PERMITTEDACTIVITIES);
        this.hasValidationErrors = true;
      } else {
        delete activity.errorMessages['Products'];
        delete this.errorMessages['correctPermittedActivities'];
      }
    });
    // Validation for Prudential Effective Date
    if (this.firmService.isNullOrEmpty(this.ActivityAuth[0].PrudentialCategoryEffectiveDate)) {
      this.loadErrorMessages('PrudentialEffectiveDate', constants.FirmActivitiesEnum.ENTER_PRUDENTIAL_EFFECTIVEDATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages[('PrudentialEffectiveDate')]
    }

    // Validation for Sector Effective Date
    if (this.firmService.isNullOrEmpty(this.ActivityAuth[0].SectorEffectiveDate)) {
      this.loadErrorMessages('SectorEffectiveDate', constants.FirmActivitiesEnum.ENTER_SECTOR_EFFECTIVEDATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages[('SectorEffectiveDate')]
    }

    // Validation for Sector Effective Date
    if (this.firmService.isNullOrEmpty(this.ActivityAuth[0].SectorEffectiveDate)) {
      this.loadErrorMessages('SectorEffectiveDate', constants.FirmActivitiesEnum.ENTER_SECTOR_EFFECTIVEDATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages[('SectorEffectiveDate')]
    }

    // Validation for Sector Effective Date
    if (parseInt(this.ActivityAuth[0].SectorTypeID) === 0) {
      this.errorMessages['SectorReturnType'] = 'Please select valid "Prudential Return Type".';
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages[('SectorReturnType')]
    }

    if (parseInt(this.islamicFinance.IFinTypeId) === 0) {
      this.loadErrorMessages('islamicType', constants.FirmActivitiesEnum.SELECT_ISLAMICFINANCE_TYPE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages[('islamicType')]
    }


  }

  varyScopeAuthConfirm() {
    this.existingPermittedActivites = this.ActivityAuth;
    const varyAuthoriseScope = this.prepareVaryScopeAuthoriseObject(this.userId);
    console.log("vary scope data to be sent" + varyAuthoriseScope);
    this.activityService.editAuthorizedScope(varyAuthoriseScope).subscribe((response) => {
      console.log('Vary Scope Successfully', response);
      this.isEditModeAuth = false;
      this.disableApplicationDate = true;
      this.loadActivitiesAuthorized();
      this.applySecurityOnPage(this.Page.Scope, this.isEditModeAuth);
      this.loadAuthScopeRevisions(this.firmId, 3);
      this.showFirmScopeAuthSaveSuccessAlert(constants.FirmActivitiesEnum.ACTIVITIES_SAVED_SUCCESSFULLY);
    }, error => {
      console.log('Vary Scope Failed', error);
    })
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

        this.objectWF.getRevision(scopeID).subscribe(revisions => {
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

  closeAuthScopePreviousVersions() {
    this.callAuthScopePrev = false;
    const popupWrapper = document.querySelector('.ScopeAuthPreviousVersionsPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .ScopeAuthPreviousVersionsPopup not found');
    }
  }

  showSubActivitiesPopup(subActivities: any) {
    this.callSubActivity = true;
    setTimeout(() => {
      const popupWrapper = document.querySelector('.SubActivitiesPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .SubActivitiesPopUp not found');
      }
    }, 0);
  }

  closeSubActivity() {
    this.callSubActivity = false;
    const popupWrapper = document.querySelector('.SubActivitiesPopUp') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .SubActivitiesPopUp not found');
    }
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
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeEffectiveDate),
        scopeCertificateLink: null,
        applicationDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeApplicationDate),
        licensedOrAuthorisedDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].ScopeLicensedOrAuthorisedDate),
      },
      lstFirmActivities: this.existingPermittedActivites.map(activityAuth => ({
        createdBy: userId, //recheck
        firmScopeTypeID: parseInt(activityAuth.FirmScopeTypeID),
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
                appliedDate: this.dateUtilService.convertDateToYYYYMMDD(activityAuth.appliedDate),
                withDrawnDate: this.dateUtilService.convertDateToYYYYMMDD(activityAuth.withDrawnDate),
                effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(activityAuth.effectiveDate),
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
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].PrudentialCategoryEffectiveDate),
        expirationDate: null,
        lastModifiedDate: null,
        authorisationCategoryTypeID: this.ActivityAuth[0].AuthorisationCategoryTypeID
      },
      objSector: {
        firmSectorID: null,
        sectorTypeID: parseInt(this.ActivityAuth[0].SectorTypeID),
        lastModifiedByID: userId, //recheck
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.ActivityAuth[0].SectorEffectiveDate)
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
        this.applySecurityOnPage(this.Page.Scope, this.isEditModeAuth);
        this.errorMessages = {};
        this.loadActivitiesAuthorized();
        this.loadSectorDetails();
        this.loadPrudentialCategoryDetails();
      }
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

  fetchPreviousScopeVersions(firmId: number, firmApplicationTypeId: number, scopeRevNum: number) {
    this.isLoading = true; // Start loader when fetch begins

    if (firmApplicationTypeId === 2) {
      this.activityService.getScopeNum(firmId, scopeRevNum, 2).subscribe(
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
      this.activityService.getScopeNum(firmId, scopeRevNum, 3).subscribe(
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

  updateAuthLastRevisionNumber() {
    this.lastAuthRevisionNumber = Math.max(...this.AuthPrevRevNumbers.map(r => r.ScopeRevNum));
  }
  updateLicLastRevisionNumber() {
    this.lastLicRevisionNumber = Math.max(...this.LicPrevRevNumbers.map(r => r.ScopeRevNum));
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
    this.ActivityLicensed.unshift(this.newActivity);
  }

  removeLicActivity(index: number) {
    Swal.fire({
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
          if (this.dateUtilService.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate) < this.currentDate) {
            this.showError(constants.FirmActivitiesEnum.LICENSEDDATEPASSED_CANNOTREMOVE);
          } else if (this.ActivityLicensed.length > 1) {
            this.ActivityLicensed.splice(index, 1);
          } else {
            Swal.fire({
              text: 'There has to be at least one permitted activity!',
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          }
        } else {
          // Check for new activity at index 0
          if (index === 0 && this.ActivityLicensed.length === 1) {
            Swal.fire({
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

  populateAuthorisationCategoryTypes() {
    this.securityService.getObjectTypeTable(constants.authorisationCategoryTypes).subscribe(data => {
      this.allAuthorisationCategoryTypes = data.response;
    }, error => {
      console.error('Error Fetching Authorisation Category Types dropdown: ', error);
    })
  }

  populatePrudentialCategoryTypes() {
    this.securityService.getObjectTypeTable(constants.prudentialCategoryTypes).subscribe(data => {
      this.allPrudentialCategoryTypes = data.response;
    }, error => {
      console.error('Error Fetching Prudential Category Types dropdown: ', error);
    })
  }

  populateFirmScopeTypes() {
    this.securityService.getObjectTypeTable(constants.firmScopeTypes).subscribe(data => {
      this.allFirmScopeTypes = data.response;
    }, error => {
      console.error('Error Fetching Firm Scope Types dropdown: ', error);
    })
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


  showConfirmationAndUpdate(prudCategID: string, msgKey: number) {
    this.logForm.errorMessages(msgKey).subscribe((response) => {
      Swal.fire({
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


  toggleAllSubCategories(product: any, isChecked: boolean): void {
    // Loop through the sub-products and set their checked state to the same as the main category
    product.subProducts.forEach(subProduct => {
      subProduct.isChecked = isChecked;
    });
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

  updateMainCategoryState(product: any): void {
    // If any sub-product is not checked, the main category should be unchecked
    product.isChecked = product.subProducts.every(subProduct => subProduct.isChecked);
  }

  onCategoryChange(activity: any) {
    const selectedCategoryID = activity.CategoryID; // The selected category ID
    if (selectedCategoryID) {
      console.log('Selected Category ID:', selectedCategoryID);

      // Reset the categorized products for the activity when the category changes
      activity.categorizedProducts = [];

      // Fetch activities based on the selected category
      this.activityService.getAuthActivityTypes(selectedCategoryID).subscribe(
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

  // onActivityChange(activity: any) {
  //   const activityTypeID = activity.ActivityTypeID;

  //   this.parentsWithSubActivities = []; // Reset to avoid duplication
  //   this.tempSelectedSubActivities = {}; // Clear temporary selections for the new activity

  //   if (activityTypeID) {
  //     console.log('Selected Activity ID:', activityTypeID);

  //     // Check if the activity is a parent
  //     this.activityService.isParentActivity(activityTypeID).subscribe(response => {
  //       this.isParentActivity = response.response.Column1;

  //       if (this.isParentActivity) {
  //         this.selectedSubActivityID = activityTypeID;

  //         // Fetch sub-activities for parent activities
  //         this.activityService.getSubActivities(activityTypeID).subscribe(subActivityData => {
  //           this.subActivities = subActivityData.response;
  //           console.log('Loaded Sub-Activities:', this.subActivities);

  //           if (this.subActivities.length > 0) {
  //             // Only add to selectedSubActivities if sub-activities are present
  //             this.selectedSubActivities[activityTypeID] = null; // Initialize for current activity

  //             // Organize parents and children sub-activities
  //             const parents = this.subActivities.filter(activity => activity.ParentActivityTypeID === null);
  //             parents.forEach(parent => {
  //               parent.isExpanded = false; // Control to expand/collapse sub-activities
  //               parent.subActivities = this.subActivities.filter(
  //                 sub => sub.ParentActivityTypeID === parent.ActivityTypeID
  //               );
  //               this.parentsWithSubActivities.push(parent);
  //             });

  //             // Display the sub-activities in a popup
  //             this.showSubActivitiesPopup(this.subActivities);
  //           }
  //         }, error => {
  //           console.error('Error fetching sub-activities:', error);
  //         });
  //       }

  //       // Fetch products for the selected activity
  //       this.activityService.getAllProducts(activityTypeID).subscribe(
  //         data => {
  //           const products = data.response;

  //           // If no products are returned, set categorizedProducts to null
  //           if (!products || products.length === 0) {
  //             activity.categorizedProducts = null;
  //             console.log('No products found for the selected activity.');
  //             return;
  //           }

  //           // Reset categorizedProducts to load new products
  //           activity.categorizedProducts = [];
  //           let currentCategory = null;

  //           // Iterate through the products and categorize them
  //           products.forEach(product => {
  //             if (product.ID === 0) {
  //               // If it's a main category, start a new group
  //               currentCategory = {
  //                 mainCategory: product.ProductCategoryTypeDesc,
  //                 subProducts: []
  //               };
  //               activity.categorizedProducts.push(currentCategory);
  //             } else if (currentCategory) {
  //               const subProduct = { ...product }; // Copy product details

  //               // Uncheck the product by default when loading
  //               subProduct.isChecked = false;
  //               subProduct.firmScopeTypeID = 1; // Default firmScopeTypeID

  //               // Add the subProduct to the current category
  //               currentCategory.subProducts.push(subProduct);
  //             }
  //           });

  //           console.log('Loaded Products for Activity:', activity.categorizedProducts);
  //         },
  //         error => {
  //           // If an error occurs, set categorizedProducts to null
  //           console.error('Error fetching products for ActivityTypeID', error);
  //           activity.categorizedProducts = null;
  //         }
  //       );
  //     });
  //   } else {
  //     // If no activity is selected, clear the products
  //     activity.categorizedProducts = null;
  //   }
  // }

  onActivityChange(activity: any) {
    const activityTypeID = activity.ActivityTypeID;

    if (activityTypeID) {
      console.log('Selected Activity ID:', activityTypeID);

      // First, check if the activity is a parent
      this.activityService.isParentActivity(activityTypeID).pipe(
        switchMap(response => {
          this.isParentActivity = response.response.Column1;

          if (this.isParentActivity) {
            // If it's a parent, load sub-activities
            return this.activityService.getSubActivities(activityTypeID);
          } else {
            // If it's not a parent, load products
            return this.activityService.getAllProducts(activityTypeID);
          }
        })
      ).subscribe(
        data => {
          if (this.isParentActivity) {
            // Process sub-activities if the activity is a parent
            this.subActivities = data.response.map(sub => ({ ...sub, isSelected: false }));
            console.log('Loaded Sub-Activities:', this.subActivities);
            this.showSubActivitiesPopup(this.subActivities);
          } else {
            // Process products if it's not a parent
            activity.categorizedProducts = this.categorizeProducts(data.response);
            console.log("Categorized Products:", activity.categorizedProducts);
          }
        },
        error => {
          console.error('Error fetching data:', error);
          activity.categorizedProducts = [];
        }
      );
    }
  }

  // Fetch and categorize products in a single function
  fetchAndCategorizeProducts(activityTypeID: number, activity: any) {
    this.activityService.getAllProducts(activityTypeID).subscribe(
      data => {
        const products = data.response;
        if (!products || products.length === 0) {
          activity.categorizedProducts = [];
          console.log('No products found.');
          return;
        }
        activity.categorizedProducts = this.categorizeProducts(products);
        console.log("Updated activity.categorizedProducts:", activity.categorizedProducts); // Confirm update here
      },
      error => {
        console.error('Error fetching products:', error);
        activity.categorizedProducts = [];
      }
    );
  }



  // Helper function to categorize products
  categorizeProducts(products: any[]) {
    const categorizedProducts = [];
    let currentCategory = null;

    products.forEach(product => {
      if (product.ID === 0) {
        // Start a new category group
        currentCategory = {
          mainCategory: product.ProductCategoryTypeDesc,
          subProducts: []
        };
        categorizedProducts.push(currentCategory);
      } else if (currentCategory) {
        const subProduct = { ...product, isChecked: false, firmScopeTypeID: 1 };
        currentCategory.subProducts.push(subProduct);
      }
    });

    return categorizedProducts;
  }

  selectSubActivity(sub: any) {
    this.subActivities.forEach(activity => activity.isSelected = false); // Clear previous selection
    sub.isSelected = true; // Set selected sub-activity
    this.selectedSubActivityID = sub.ActivityTypeID; // Track selected ID if needed
  }

  confirmSelection(activity: any) {
    const selectedSubActivity = this.subActivities.find(sub => sub.isSelected);
    if (selectedSubActivity) {
        activity.selectedSubActivity = selectedSubActivity; // Attach directly to the activity
        console.log("Selected Sub-Activity:", selectedSubActivity);
        // Fetch products for this specific sub-activity and save to this activity
        this.fetchAndCategorizeProducts(selectedSubActivity.ActivityTypeID, activity);
    }
    this.closeSubActivity();
}


  toggleExpand(activityTypeID: number) {
    this.parentActivity = this.parentActivity === activityTypeID ? null : activityTypeID;
  }




  toggleCollapse(section: string) {
    this.isCollapsed[section] = !this.isCollapsed[section];
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
      this.loadErrorMessages('uploadDocument', constants.DocumentAttechment.selectDocument);
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


  getFormReferenceDocuments() {
    this.isLoading = true;
    let DocType: number[] = [];
    if (this.tabIndex === 0) { //Licensed tab
      if (this.ActivityLicensed[0].ScopeRevNum > 1) {
        DocType.push(constants.DocumentType.Q13);
      } else {
        DocType.push(constants.DocumentType.Q01);
        DocType.push(constants.DocumentType.Q02);
      }
    } else if (this.tabIndex === 1) {
      if (this.ActivityAuth[0].ScopeRevNum > 1) {
        DocType.push(constants.DocumentType.Q13);
      } else {
        DocType.push(constants.DocumentType.Q02);
      }
    }

    const docTypeString = DocType.join(',');
    this.logForm.getDocListByFirmDocType(this.firmId, docTypeString).subscribe(data => {
      this.formReferenceDocs = data.response;

      const existingDoc = this.formReferenceDocs.find(doc => doc.FILENAME === this.documentDetails?.FileName);
      if (existingDoc) {
        this.selectedDocId = existingDoc.DocID;
      }

      console.log('Form Reference Docs: ', this.formReferenceDocs);
      this.isLoading = false;
    }, error => {
      this.formReferenceDocs = []; //reintalize the array if it doesn't exist
      console.error('Error Fetching Form Reference Docs: ', error);
      this.isLoading = false;
    })
    this.callRefForm = true;
    setTimeout(() => {
      const popupWrapper = document.querySelector('.ReferenceFormPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .ReferenceFormPopUp not found');
      }
    }, 0)
  }


  closeFormReference() {
    this.callRefForm = false;
    const popupWrapper = document.querySelector('.ReferenceFormPopUp') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .ReferenceFormPopUp not found');
    }
  }

  replaceDocument(): void {
    if (this.selectedDocId) {
      const selectedDoc = this.formReferenceDocs.find(doc => doc.DocID === this.selectedDocId);
      if (selectedDoc) {
        this.documentDetails = {
          FileName: selectedDoc.FILENAME,
          Column3: selectedDoc.FileLoc
        };

        console.log('Document replaced with:', selectedDoc);
        this.closeFormReference();
      } else {
        console.error('Selected document not found.');
      }
    } else {
      this.closeFormReference();
      console.warn('No document selected.');
    }
  }

  deSelectDocument(): void {
    if (this.selectedDocId) {
      this.selectedDocId = null;

      this.documentDetails = {
        FileName: '',
        Column3: ''
      };
      this.closeFormReference();
      console.log('Document de-selected and removed.');
    } else {
      console.warn('No document is currently selected.');
    }
  }

  loadErrorMessages(fieldName: string, msgKey: number, activity?: any, customMessage?: string) {
    this.firmDetailsService.getErrorMessages(fieldName, msgKey, activity, customMessage).subscribe(
      () => {
        this.errorMessages[fieldName] = this.firmDetailsService.errorMessages[fieldName];
        console.log(`Error message for ${fieldName} loaded successfully`);
      },
      error => {
        console.error(`Error loading error message for ${fieldName}:`, error);
      }
    );
  }
}
