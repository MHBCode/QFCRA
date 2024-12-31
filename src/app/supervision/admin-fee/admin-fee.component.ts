import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { FirmService } from 'src/app/ngServices/firm.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { FirmRptAdminFeeService } from 'src/app/ngServices/firm-rpt-admin-fee.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { SupervisionService } from '../supervision.service';
import { forkJoin, tap } from 'rxjs';

@Component({
  selector: 'app-admin-fee',
  templateUrl: './admin-fee.component.html',
  styleUrls: ['./admin-fee.component.scss', '../supervision.scss']
})
export class AdminFeeComponent {

  userId: number = 10044;
  FirmAdminFees: any;
  isLoading: boolean = false;
  firmId: number = 0;
  firmDetails: any;
  pageSize: number = 10; // Define pageSize here
  paginatedItems: any[] = [];
  showPopup: boolean = false;
  Page = FrimsObject;

  // Security
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideDeleteBtn: boolean = false;

  ValidRSGAndSupervisor: boolean = false;
  UserSupervisorToTheFirm: boolean = false;

  assignedUserRoles: any = [];
  assignedLevelUsers: any = [];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firmService: FirmService,
    public dateUtilService: DateUtilService,
    private firmDetailsService: FirmDetailsService,
    private firmRptAdminFeeService: FirmRptAdminFeeService,
    private supervisionService: SupervisionService

  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadAdminFees();
      this.loadFirmDetails(this.firmId);
      this.isUserHasRestrictedAccess();

      forkJoin([
        this.isValidRSGAndSupervisor(),
        this.isUserSupervisorToTheFirm(),
        this.firmDetailsService.loadAssignedUserRoles(this.userId),
        this.firmDetailsService.loadAssignedLevelUsers(),
      ]).subscribe({
        next: ([userRoles, levelUsers]) => {
          // Assign the results to component properties
          this.assignedUserRoles = userRoles;
          this.assignedLevelUsers = levelUsers;

          this.applySecurityOnPage(this.Page.LateAdminFee);
        },
        error: (err) => {
          console.error('Error loading user roles or level users:', err);
        }
      });

    })
  }

  applySecurityOnPage(objectId: FrimsObject) {
    this.isLoading = true;
    const currentOpType = ObjectOpType.List;

    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType,null,null).then(() => {
      if (this.ValidRSGAndSupervisor === false) {
        this.hideActionButton();
      }

    })
    this.isLoading = false;
  }

  hideActionButton() {
    this.hideEditBtn = true;
    this.hideSaveBtn = true;
    this.hideCancelBtn = true;
    this.hideCreateBtn = true;
    this.hideDeleteBtn = true;
  }

  isUserHasRestrictedAccess(): void {
    this.supervisionService.isUserHasRestrictedAccess(this.userId, this.firmId, this.Page.LateAdminFee)
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

  isValidRSGAndSupervisor() {
    return this.firmDetailsService.isValidRSGAndSupervisor(this.firmId, this.userId).pipe(
      tap(response => this.ValidRSGAndSupervisor = response)
    );
  }

  isUserSupervisorToTheFirm() {
    return this.firmDetailsService.isUserSupervisorToTheFirm(this.firmId, this.userId).pipe(
      tap(response => this.UserSupervisorToTheFirm = response)
    );
  }

  getControlVisibility(controlName: string): boolean {
    return this.firmDetailsService.getControlVisibility(controlName);
  }

  getControlEnablement(controlName: string): boolean {
    return this.firmDetailsService.getControlEnablement(controlName);
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

  loadAdminFees() {
    this.isLoading = true;
    this.firmRptAdminFeeService.getAdminFeeList(this.firmId).subscribe(
      data => {
        this.FirmAdminFees = data.response;
        this.isLoading = false;
        this.applySearchAndPagination(); // Initialize pagination
      },
      error => {
        console.error('Error fetching firm Admin Fees', error);
        this.isLoading = false;
      }
    );
  }



  applySearchAndPagination(): void {
    this.paginatedItems = this.FirmAdminFees.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; 
  }
  selectedAdminFee: any;
  openAdminFeePopup(fee: any, firmDetails: any): void {
    this.selectedAdminFee = fee;
    this.showPopup = true;
    console.log("openRegisteredFundPopup")
  }
  closePopup(): void {
    this.showPopup = false;
    this.selectedAdminFee = null; 
  }
}
