import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';
import { RiskService } from 'src/app/ngServices/risk.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import * as constants from 'src/app/app-constants';
import { forkJoin, tap } from 'rxjs';
import { SecurityService } from 'src/app/ngServices/security.service';
import { SupervisionService } from '../supervision.service';
import Swal from 'sweetalert2';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { LogformService } from 'src/app/ngServices/logform.service';

interface CreditRating {
  CreditRatingTypeID: number;
  CreditRatingAgencyName: string;
  CreditRatingDisplayName: string;
  Ratings: string;
  RatingsAsOfDate: string;
  DisplayOrder: number;
  IsLatest: number;
}

type CreditRatingsGrouped = { [key: string]: CreditRating[] };
@Component({
  selector: 'app-supervision-view',
  templateUrl: './supervision-view.component.html',
  styleUrls: ['./supervision-view.component.scss', '../supervision.scss']
})
export class SupervisionViewComponent {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  callSupervisionCategory: boolean = false;
  callOperationalData: boolean = false;
  callCreditRatingsSovereign: boolean = false;
  callCreditRatings: boolean = false;
  Page = FrimsObject;
  userId: number = 10044; // Ewald Muller
  clientClassification: any = [{}];
  isLoading: boolean = false;
  firmId: number = 0;
  OperationalData: any[] = [{}];
  RPTBasis: any = {};
  SupervisionCategory: any;
  CreditRatings: CreditRating[] = [];
  FiltredCreditRatingsFirm: CreditRating[] = [];
  FiltredHistoryCreditRatingFirm: CreditRating[] = [];
  FiltredHistoryCreditRatingCountry: CreditRating[] = [];
  CreditRatingsFirm: CreditRatingsGrouped = {};
  FiltredCountryCreditRatingFirm: CreditRating[] = [];
  CountryCreditRatingsFirm: CreditRatingsGrouped = {};
  SupervisionCategories: any;
  HistoryCreditRatingGrouped: CreditRatingsGrouped = {};
  HistoryCreditRatingCountryGrouped: CreditRatingsGrouped = {};
  firmDetails: any;
  legalStatusTypeID: number;
  savedSupEffectiveDate: string;
  savedSupCategoryID: number;

  currentDate = new Date();
  currentDateISOString = this.currentDate.toISOString();

  isEditModeSupervisor: boolean = false;


  // Dropdowns
  allFirmRptClassificationTypes: any = [];
  allFirmRptClassificationTypesForDNFBPs: any = [];
  allFirmRptBasisTypes: any = [];

  // Validations
  hasValidationErrors: boolean = false;
  errorMessages: { [key: string]: string } = {};

  // Security
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;

  FirmAMLSupervisor: boolean = false;
  ValidFirmSupervisor: boolean = false;
  UserDirector: boolean = false;
  
  assignedUserRoles: any = [];
  assignedLevelUsers: any = [];

  // Panel Security flags
  pnlSupCategoryData: boolean = false;
  pnlClientClassificationData: boolean = false;
  pnlFirmRPTBasisData: boolean = false;
  pnlOperationalData: boolean = false;


  constructor(private router: Router,
    private route: ActivatedRoute,
    private firmsService: FirmService,
    private riskService: RiskService,
    private firmDetailsService: FirmDetailsService,
    private dateUtilService: DateUtilService,
    private supervisionService: SupervisionService,
    private flatpickrService: FlatpickrService,
    private logForm: LogformService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.initializeSupvisionData();
      this.getLegalStatusTypeID();
      // Credit Ratings - Firm
      this.getCreditRatingsData(true, false);
      // Credit Ratings - Sovereign ( Home Country - Qatar )
      this.getCreditRatingsData(false, false);


      forkJoin([
        this.isUserDirector(),
        this.isValidFirmSupervisor(),
        this.isValidFirmAMLSupervisor(),
        this.firmDetailsService.loadAssignedUserRoles(this.userId),
        this.firmDetailsService.loadAssignedLevelUsers(),
      ]).subscribe({
        next: ([userRoles, levelUsers]) => {
          // Assign the results to component properties
          this.assignedUserRoles = userRoles;
          this.assignedLevelUsers = levelUsers;

          // Now apply security on the page
          this.applySecurityOnPage(this.Page.Supervision, this.isEditModeSupervisor);
        },
        error: (err) => {
          console.error('Error loading user roles or level users:', err);
        }
      });
    })
    this.loadFirmDetails(this.firmId);
  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }

  applySecurityOnPage(objectId: FrimsObject, Mode: boolean) {
    this.isLoading = true;
    const currentOpType = Mode ? ObjectOpType.Edit : ObjectOpType.View;

    // Apply backend permissions for the current object (e.g., CoreDetail or Scope)
    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType).then(() => {
      let firmType = this.firmDetails?.FirmTypeID;


      if (this.ValidFirmSupervisor) {
        this.isLoading = false;
        return; // No need to hide the button for Firm supervisor
      } else if (this.firmDetailsService.isValidRSGMember()) {
        this.hideActionButton();
        this.isLoading = false;
      } else if (this.UserDirector) {
        if (firmType === 1) {
          this.hideEditBtn = false;
        }
      } else if (this.FirmAMLSupervisor) {

        if (firmType === 1) {
          this.hideActionButton(); // Hide button if no AML supervisor is assigned
        }
      } else {
        this.hideActionButton(); // Default: hide the button
      }
      this.isLoading = false;
    });
  }

  hideActionButton() {
    this.hideEditBtn = true;
    this.hideSaveBtn = true;
    this.hideCancelBtn = true;
    this.hideCreateBtn = true;
    this.hideDeleteBtn = true;
    this.hideReviseBtn = true;
  }

  isValidFirmSupervisor() {
    return this.firmDetailsService.isValidFirmSupervisor(this.firmId, this.userId).pipe(
      tap(response => this.ValidFirmSupervisor = response)
    );
  }

  isValidFirmAMLSupervisor() {
    return this.firmDetailsService.isValidFirmAMLSupervisor(this.firmId, this.userId).pipe(
      tap(response => this.FirmAMLSupervisor = response)
    );
  }

  isUserDirector() {
    return this.firmDetailsService.isUserDirector(this.userId).pipe(
      tap(response => this.UserDirector = response)
    );
  }

  getControlVisibility(controlName: string): boolean {
    return this.firmDetailsService.getControlVisibility(controlName);
  }

  getControlEnablement(controlName: string): boolean {
    return this.firmDetailsService.getControlEnablement(controlName);
  }

  getSupervisionCategory() {
    this.callSupervisionCategory = true;
    this.getSupervisionCategoryData();
    setTimeout(() => {
      const popupWrapper = document.querySelector('.popup-wrapper') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .popup-wrapper not found');
      }
    }, 0);
  }

  closeCategoryPopup() {
    this.callSupervisionCategory = false;
    const popupWrapper = document.querySelector('.popup-wrapper') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .popup-wrapper not found');
    }
  }


  getOperationalDataHistory() {
    this.callOperationalData = true;
    this.getOperationalData();
    setTimeout(() => {
      const popupWrapper = document.querySelector('.OperationalData') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .OperationalData not found');
      }
    }, 0);
  }

  closeOperationalDataPopup() {
    this.callOperationalData = false;
    const popupWrapper = document.querySelector('.OperationalData') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .OperationalData not found');
    }
  }


  getCreditRatingsSovereignDataHistory() {
    this.callCreditRatingsSovereign = true;
    this.getCreditRatingsData(false, true)
    setTimeout(() => {
      const popupWrapper = document.querySelector('.CreditRatingsSovereign') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .CreditRatingsSovereign not found');
      }
    }, 0);
  }

  closeCreditRatingsSovereignPopup() {
    this.callCreditRatingsSovereign = false;
    const popupWrapper = document.querySelector('.CreditRatingsSovereign') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .CreditRatingsSovereign not found');
    }
  }


  getCreditRatingsHistory() {
    this.callCreditRatings = true;
    this.getCreditRatingsData(true, true);
    setTimeout(() => {
      const popupWrapper = document.querySelector('.CreditRatings') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .CreditRatings not found');
      }
    }, 0);
  }

  closeCreditRatingsPopup() {
    this.callCreditRatings = false;
    const popupWrapper = document.querySelector('.CreditRatings') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .CreditRatings not found');
    }
  }

  getClientClassificationData() {
    this.firmsService.getClientClassification(this.firmId).subscribe(
      data => {
        this.clientClassification = data.response;
        console.log('Firm FIRM clientClassification details:', this.clientClassification);
      },
      error => {
        console.error('Error fetching Firm clientClassification ', error);
      }
    );
  }


  getOperationalData() {
    this.firmsService.getOperationalData(this.firmId).subscribe(
      data => {
        this.OperationalData = data.response;
        console.log('Firm FIRM OperationalData details:', this.OperationalData);
      },
      error => {
        console.error('Error fetching Firm OperationalData ', error);
      }
    );
  }

  getRPTBasisData() {
    this.firmsService.getRPTBasis(this.firmId).subscribe(
      data => {
        this.RPTBasis = data.response;
        console.log('Firm FIRM RPTBasis details:', this.RPTBasis);
      },
      error => {
        console.error('Error fetching Firm RPTBasis ', error);
      }
    );
  }

  getSupervisionCategoryData() {
    this.firmsService.getSupervisionCategory(this.firmId).subscribe(
      data => {
        this.SupervisionCategory = data.response;
        console.log('Supervision Category Data: ', this.SupervisionCategory)
      },
      error => {
        console.error('Error fetching Firm SupervisionCategory ', error);
      }
    );
  }
  getCreditRatingsData(isFirm?: boolean, isHistory?: boolean) {
    this.riskService.getCreditRatings(this.firmId).subscribe(
      data => {
        this.CreditRatings = data.response;
        if (isFirm) {
          if (!isHistory) {
            // Credit Firm View Table
            this.FiltredCreditRatingsFirm = this.CreditRatings
              .filter(item => item.CreditRatingTypeID === 1 && item.IsLatest === 1)
              .sort((a, b) => a.DisplayOrder - b.DisplayOrder);
            this.CreditRatingsFirm = this.FiltredCreditRatingsFirm.reduce((acc, item) => {
              const agencyName = item.CreditRatingAgencyName;
              if (!acc[agencyName]) {
                acc[agencyName] = [];
              }
              acc[agencyName].push(item);
              return acc;
            }, {} as CreditRatingsGrouped);
          } else {
            // Credit Firm Popup Table
            this.FiltredHistoryCreditRatingFirm = this.CreditRatings
              .filter(item => item.CreditRatingTypeID === 1)
              .sort((a, b) => {
                // Sort by DisplayOrder
                const displayOrderComparison = a.DisplayOrder - b.DisplayOrder;
                if (displayOrderComparison !== 0) {
                  return displayOrderComparison; // Ascending order for DisplayOrder
                }

                const formattedDateA = this.dateUtilService.formatDateToCustomFormat(a.RatingsAsOfDate);
                const formattedDateB = this.dateUtilService.formatDateToCustomFormat(b.RatingsAsOfDate);

                const dateA = new Date(formattedDateA.split('/').reverse().join('/'));
                const dateB = new Date(formattedDateB.split('/').reverse().join('/'));

                return dateB.getTime() - dateA.getTime();
              });

            // Group by CreditRatingAgencyName
            this.HistoryCreditRatingGrouped = this.FiltredHistoryCreditRatingFirm.reduce((acc, item) => {
              const agencyName = item.CreditRatingAgencyName;
              if (!acc[agencyName]) {
                acc[agencyName] = [];
              }
              acc[agencyName].push(item);
              return acc;
            }, {} as CreditRatingsGrouped);
          }
        } else {
          if (!isHistory) {
            // second table 
            this.FiltredCountryCreditRatingFirm = this.CreditRatings
              .filter(item => item.CreditRatingTypeID === 2 && item.IsLatest === 1)
              .sort((a, b) => a.DisplayOrder - b.DisplayOrder);
            this.CountryCreditRatingsFirm = this.FiltredCountryCreditRatingFirm.reduce((acc, item) => {
              const agencyName = item.CreditRatingAgencyName;
              if (!acc[agencyName]) {
                acc[agencyName] = [];
              }
              acc[agencyName].push(item);
              return acc;
            }, {} as CreditRatingsGrouped);
          } else {
            this.FiltredHistoryCreditRatingCountry = this.CreditRatings
              .filter(item => item.CreditRatingTypeID === 2)
              .sort((a, b) => {
                // Sort by DisplayOrder
                const displayOrderComparison = a.DisplayOrder - b.DisplayOrder;
                if (displayOrderComparison !== 0) {
                  return displayOrderComparison; // Ascending order for DisplayOrder
                }

                const formattedDateA = this.dateUtilService.formatDateToCustomFormat(a.RatingsAsOfDate);
                const formattedDateB = this.dateUtilService.formatDateToCustomFormat(b.RatingsAsOfDate);

                const dateA = new Date(formattedDateA.split('/').reverse().join('/'));
                const dateB = new Date(formattedDateB.split('/').reverse().join('/'));

                return dateB.getTime() - dateA.getTime();
              });

            // Group by CreditRatingAgencyName
            this.HistoryCreditRatingCountryGrouped = this.FiltredHistoryCreditRatingCountry.reduce((acc, item) => {
              const agencyName = item.CreditRatingAgencyName;
              if (!acc[agencyName]) {
                acc[agencyName] = [];
              }
              acc[agencyName].push(item);
              return acc;
            }, {} as CreditRatingsGrouped);
          }
        }
      },
      error => {
        console.error('Error fetching Firm CreditRatings ', error);
      }
    );
  }

  hasCreditRatings(creditRatings: CreditRatingsGrouped): boolean {
    return creditRatings && Object.keys(creditRatings).length > 0;
  }

  hasCountryCreditRatings(countryCreditRatings: CreditRatingsGrouped): boolean {
    return countryCreditRatings && Object.keys(countryCreditRatings).length > 0;
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



  initializeSupvisionData() {
    this.getSupervisionCategoryData();
    this.getClientClassificationData();
    this.getRPTBasisData();
    this.getOperationalData();
  }

  // on edit mode
  editSupervision() {
    this.isEditModeSupervisor = true;
    this.savedSupEffectiveDate = this.SupervisionCategory[0].EffectiveFromDate;
    this.savedSupCategoryID = this.SupervisionCategory[0].FirmRptClassificationTypeID;
    this.populateFirmRptClassificationTypes();
    this.populateFirmRptClassificationTypesForDNFBPs();
    this.populateFirmRptBasisTypes();
    this.applyPanelSecurity();
    this.applySecurityOnPage(this.Page.Supervision, this.isEditModeSupervisor);
  }

  applyPanelSecurity() {
    if (this.UserDirector && !this.ValidFirmSupervisor) {
      this.pnlSupCategoryData = true;
      this.pnlClientClassificationData = false;
      this.pnlFirmRPTBasisData = false;
      this.pnlOperationalData = false;
    } else if (!this.UserDirector && this.ValidFirmSupervisor) {
      this.pnlSupCategoryData = false;
      this.pnlClientClassificationData = true;
      this.pnlFirmRPTBasisData = true;
      this.pnlOperationalData = true;
    } else if (this.UserDirector && this.ValidFirmSupervisor) {
      this.pnlSupCategoryData = true;
      this.pnlClientClassificationData = true;
      this.pnlFirmRPTBasisData = true;
      this.pnlOperationalData = true;
    }
  }

  cancelSupervision() {
    Swal.fire({
      text: 'Are you sure you want to cancel your changes ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.isEditModeSupervisor = false;
        this.errorMessages = {};
        this.applySecurityOnPage(this.Page.Supervision, this.isEditModeSupervisor);
        this.initializeSupvisionData();
      }
    });
  }

  getLegalStatusTypeID() {
    this.firmsService.getLegalStatusTypeID(this.firmId).subscribe(response => {
      this.legalStatusTypeID = response.LegalStatusTypeID
      console.log('Legal Status Type ID: ' + this.legalStatusTypeID)
    }, error => {
      console.log("Error Fetching LegalStatusTypeID: ", error)
    })
  }

  populateFirmRptClassificationTypes() {
    this.supervisionService.populateFirmRptClassificationTypes().subscribe(
      firmRptClassification => {
        this.allFirmRptClassificationTypes = firmRptClassification;
      },
      error => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  populateFirmRptClassificationTypesForDNFBPs() {
    this.supervisionService.populateFirmRptClassificationTypesForDNFBPs().subscribe(
      firmRptClassificationDNFBPs => {
        this.allFirmRptClassificationTypesForDNFBPs = firmRptClassificationDNFBPs;
      },
      error => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  populateFirmRptBasisTypes() {
    this.supervisionService.populateFirmRptBasisTypes().subscribe(
      firmRptBasisTypes => {
        this.allFirmRptBasisTypes = firmRptBasisTypes;
      },
      error => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  // getters and setters
  get RPTBasisEffectiveDate(): string {
    if (!this.RPTBasis.Column1 && this.isEditModeSupervisor) {
      // show this date only on edit mode if there is none
      return this.dateUtilService.formatDateToCustomFormat(this.currentDateISOString);
    }
    return this.RPTBasis.Column1;
  }

  set RPTBasisEffectiveDate(value: string) {
    this.RPTBasis.Column1 = value;
  }


  async validateSupervision(): Promise<boolean> {
    this.hasValidationErrors = false;

    if (this.supervisionService.isNullOrEmpty(this.SupervisionCategory[0].EffectiveFromDate)) {
      this.loadErrorMessages('SupCatEffectiveDateFrom', constants.SupervisionData_Messages.ENTER_EFFECTIVE_DATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['SupCatEffectiveDateFrom'];
    }

    if (this.SupervisionCategory[0].FirmRptClassificationTypeID === null) {
      this.loadErrorMessages('SupCategoryType', 8611);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['SupCategoryType'];
    }

    if (this.supervisionService.isNullOrEmpty(this.RPTBasisEffectiveDate)) {
      this.loadErrorMessages('FRBTEffectiveDate', constants.SupervisionData_Messages.ENTER_EFFECTIVE_DATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['FRBTEffectiveDate'];
    }

    if (this.pnlOperationalData) {
      if (this.supervisionService.isNullOrEmpty(this.OperationalData[0].EffectiveFromDate)) {
        this.loadErrorMessages('OPEffectiveDateFrom', 3219);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['OPEffectiveDateFrom'];
      }
    }

    if (this.pnlOperationalData) {
      if (this.OperationalData[0].NumOfLocalStaff < 0 || !Number.isInteger(+this.OperationalData[0].NumOfLocalStaff)) {
        this.loadErrorMessages('NumOfLocalStaff', constants.SupervisionData_Messages.INVALID_NO_OF_STAFF);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['NumOfLocalStaff'];
      }
    }

    if (this.pnlOperationalData) {
      if (this.OperationalData[0].NumOfTotalStaff < 0 || !Number.isInteger(+this.OperationalData[0].NumOfTotalStaff)) {
        this.loadErrorMessages('NumOfTotalStaff', constants.SupervisionData_Messages.INVALID_NO_OF_STAFF);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['NumOfTotalStaff'];
      }
    }

    if (this.OperationalData[0].NumOfLocalStaff > this.OperationalData[0].NumOfTotalStaff) {
      this.loadErrorMessages('NumOfLocalStaffGreaterThanNumOfLocalStaff', constants.SupervisionData_Messages.NO_OF_STAFF_SHOULD_BE_LESS_THAN_OR_EQUAL_TOTAL_STAFF);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['NumOfLocalStaffGreaterThanNumOfLocalStaff'];
    }

    return !this.hasValidationErrors;
  }



  // save
  async saveSupervision() {
    this.isLoading = true;

    // Validate before saving
    const isValid = await this.validateSupervision();

    console.log('Validation result:', isValid); // Debug log

    if (!isValid) {
      this.firmDetailsService.showErrorAlert(constants.SupervisionData_Messages.SUPERVISION_SAVE_ERROR);
      this.isLoading = false;
      return; // Prevent further action if validation fails or the user cancels
    }

    if (
      this.savedSupCategoryID !== parseInt(this.SupervisionCategory[0].FirmRptClassificationTypeID) &&
      (parseInt(this.SupervisionCategory[0].FirmRptClassificationTypeID) !== 0 || null)
    ) {
      if (this.savedSupEffectiveDate === this.SupervisionCategory[0].EffectiveFromDate) {
        this.isLoading = false;
        const isConfirmed = await this.showPopupAlert(8613);
        if (!isConfirmed) {
          // If user cancels, stop the process
          this.isLoading = false;
          return;
        }
      }
    }

    // Proceed with saving
    const supervisionDataObj = this.prepareSupervisionObject(this.userId);
    const supCategoryDataObj = this.prepareSupCategoryObject(this.userId);

    forkJoin({
      saveSupervision: this.firmsService.saveSupervision(supervisionDataObj),
      saveSupCategory: this.firmsService.saveSupCategory(supCategoryDataObj)
    }).subscribe(
      response => {
        console.log('Save successful:', response); // Debug log
        this.firmDetailsService.showSaveSuccessAlert(constants.SupervisionData_Messages.SUPERVISION_DATA_SAVED_SUCCESSFULLY);
        this.isEditModeSupervisor = false;
        this.isLoading = false;
        this.initializeSupvisionData();
        this.applySecurityOnPage(this.Page.Supervision, this.isEditModeSupervisor);
      },
      error => {
        console.error('Error saving data:', error);
        this.isLoading = false;
      }
    );
  }




  prepareSupervisionObject(userId: number) {
    return {
      firmSupervisionObj: {
        firmId: this.firmId,
        notes: this.OperationalData[0].Notes,
        noOfLocalStaff: this.OperationalData[0].NumOfLocalStaff,
        noOfTotalStaff: this.OperationalData[0].NumOfTotalStaff,
        firmOperatinalStatusId: this.OperationalData[0].FirmOperationalStatusID,
        createdBy: userId,
        effectiveFromDate: this.dateUtilService.convertDateToYYYYMMDD(this.OperationalData[0].EffectiveFromDate)
      },
      firmClientClassificationObj: {
        firmClientsClassificationID: this.clientClassification[0].FirmClientsClassificationID,
        firmId: this.firmId,
        holdsClientMoney: this.clientClassification[0].HoldsClientMoney,
        holdsInsuranceMoney: this.clientClassification[0].HoldsInsuranceMoney,
        holdsClientMoneyDesc: null,
        holdsInsuranceMoneyDesc: null,
        createdBy: userId,
        lastModifiedBy: userId,
        createdDate: this.currentDate,
        lastModifiedDate: this.currentDate,
        firmClientsClassificationDesc: null
      },
      rptBasisObj: {
        firmId: this.firmId,
        firmRptBasisID: this.RPTBasis.FirmRptBasisID,
        firmRptBasisDesc: null,
        firmRptBasisTypeID: this.RPTBasis.FirmRptBasisTypeID ?? 0,
        firmRptBasisTypeDesc: this.RPTBasis.FirmRptBasisTypeDesc,
        effectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.RPTBasisEffectiveDate),
        expirationDate: null,
        createdBy: userId,
        lastModifiedBy: userId,
        createdDate: this.currentDate,
        lastModifiedDate: this.currentDate,
      }
    }
  }

  prepareSupCategoryObject(userId: number) {
    return {
      firmRptClassificationID: this.SupervisionCategory[0].FirmRptClassificationID,
      firmId: this.firmId,
      firmRptClassificationTypeID: this.SupervisionCategory[0].FirmRptClassificationTypeID ?? null,
      effectiveFromDate: this.dateUtilService.convertDateToYYYYMMDD(this.SupervisionCategory[0].EffectiveFromDate),
      createdBy: userId,
    }
  }

  showPopupAlert(msgKey: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.logForm.errorMessages(msgKey).subscribe((response) => {
        Swal.fire({
          text: response.response,
          showCancelButton: true,
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          this.isLoading = false;
          resolve(result.isConfirmed); // Resolve the promise with the user's choice
        });
      });
    });
  }


  loadErrorMessages(fieldName: string, msgKey: number, placeholderValue?: string) {
    this.firmDetailsService.getErrorMessages(fieldName, msgKey, null, null, placeholderValue).subscribe(
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
