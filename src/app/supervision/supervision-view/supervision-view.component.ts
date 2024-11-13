import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';
import { RiskService } from 'src/app/ngServices/risk.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { forkJoin, tap } from 'rxjs';

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
  callSupervisionCategory: boolean = false;
  callOperationalData: boolean = false;
  callCreditRatingsSovereign: boolean = false;
  callCreditRatings: boolean = false;
  Page = FrimsObject;
  userId: number = 10044; // Emira Yacoubi
  clientClassification: any;
  isLoading: boolean = false;
  firmId: number = 0;
  OperationalData: any;
  RPTBasis: any;
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

  isEditModeSupervisor: boolean = false;

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

  constructor(private router: Router,
    private route: ActivatedRoute,
    private firmsService: FirmService,
    private riskService: RiskService,
    private firmDetailsService: FirmDetailsService,
    private dateUtilService: DateUtilService) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.getSupervisionCategoryData();
      this.getClientClassificationData();
      this.getOperationalData();
      this.getRPTBasisData();
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
}
