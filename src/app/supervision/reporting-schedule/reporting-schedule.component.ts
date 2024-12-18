import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';
import { ReportScheduleService } from 'src/app/ngServices/report-schedule.service';
import Swal from 'sweetalert2';
import * as constants from 'src/app/app-constants';
import { SupervisionService } from '../supervision.service';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { forkJoin, tap } from 'rxjs';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';

@Component({
  selector: 'app-reporting-schedule',
  templateUrl: './reporting-schedule.component.html',
  styleUrls: ['./reporting-schedule.component.scss', '../supervision.scss']
})
export class ReportingScheduleComponent {

  Page = FrimsObject;
  userId: number = 10044;
  rptSchedule: any[] = [];
  isLoading: boolean = false;
  firmId: number = 0;
  isAuthorise: boolean = true;
  firmDetails: any;
  selectedReport: any = null;
  showPopup: boolean = false;
  isCreateRptSch: boolean = false;

  pageSize: number = 10; // Define pageSize here
  paginatedItems: any[] = [];

  // Security
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;

  FirmAMLSupervisor: boolean = false;
  ValidFirmSupervisor: boolean = false;

  assignedUserRoles: any = [];
  assignedLevelUsers: any = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firmService: FirmService,
    private reportScheduleService: ReportScheduleService,
    private supervisionService: SupervisionService,
    private firmDetailsService: FirmDetailsService,
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.isFirmAuthorised();
      this.isUserHasRestrictedAccess();
      forkJoin([
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
          this.applySecurityOnPage(this.Page.ReportingSchedule);
        },
        error: (err) => {
          console.error('Error loading user roles or level users:', err);
        }
      });

    })
    this.loadFirmDetails(this.firmId);
  }

  applySecurityOnPage(objectId: FrimsObject) {
    this.isLoading = true;
    const currentOpType = ObjectOpType.ListView;

    // Apply backend permissions for the current object (e.g., CoreDetail or Scope)
    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType).then(() => {
      let firmType = this.firmDetails?.FirmTypeID;

      if (firmType === 2) {
        if (!(this.FirmAMLSupervisor)) {
          this.hideActionButton();
          this.isLoading = false;
        }
      } else if (firmType === 1) {
        if (this.FirmAMLSupervisor) {
          this.hideCreateBtn = true;
          this.hideDeleteBtn = true;
          this.isLoading = false;
        } else if (this.ValidFirmSupervisor === false) {
          this.hideActionButton();
          this.isLoading = false;
        }
      } else {
        if (this.ValidFirmSupervisor === false) {
          this.hideActionButton();
          this.isLoading = false;
        }
      }
    });
    this.hideDeleteBtn = true;
    this.isLoading = false;
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


  getControlVisibility(controlName: string): boolean {
    return this.firmDetailsService.getControlVisibility(controlName);
  }

  getControlEnablement(controlName: string): boolean {
    return this.firmDetailsService.getControlEnablement(controlName);
  }

  isUserHasRestrictedAccess(): void {
    this.supervisionService.isUserHasRestrictedAccess(this.userId, this.firmId, this.Page.ReportingSchedule)
      .subscribe(
        (hasAccess: boolean) => {
          if (hasAccess) {
            // User has restricted access
            this.hideActionButton();
          } 
        },
        (error) => {
          console.error('Error checking user restricted access:', error);
        }
      );
  }


  isFirmAuthorised() {
    this.firmService.checkisFirmAuthorised(this.firmId).subscribe(
      data => {
        this.isAuthorise = data.response;
        this.loadReportingSchedule();
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }

  loadReportingSchedule() {
    this.isLoading = true;
    this.reportScheduleService.getFirmReportSchedule(this.firmId).subscribe(
      data => {
        this.rptSchedule = data.response;
        this.isLoading = false;
        if (!this.isAuthorise) {
          this.supervisionService.showErrorAlert(constants.ReportingScheduleMessages.REPORTINGSCHEDULECANTBECREATED_FIRMSTATUS, 'error');
        }
        this.applySearchAndPagination(); // Initialize pagination
      },
      error => {
        console.error('Error fetching rptSchedule', error);
      }
    );
  }

  applySearchAndPagination(): void {
    this.paginatedItems = this.rptSchedule.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
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
  openReportSchedulePopup(rpt: any, firmDetails: any, isCreate: boolean): void {
    this.isCreateRptSch = isCreate;
    if (isCreate) {
      this.selectedReport = null;
    }
    if (rpt) {
    this.selectedReport = rpt;
    }
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }
}

