import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { BreachesService } from 'src/app/ngServices/breaches.service';
import { SupervisionService } from '../supervision.service';
import { forkJoin, tap } from 'rxjs';

@Component({
  selector: 'app-enf-actions',
  templateUrl: './enf-actions.component.html',
  styleUrls: ['./enf-actions.component.scss', '../supervision.scss']
})
export class EnfActionsComponent implements OnInit {


  enfActions: any;
  allEnfActions: any;
  isLoading: boolean = false;
  firmId: number = 0;
  Page = FrimsObject;
  paginatedItems: any[] = [];
  pageSize: number = 10;
  userId: number = 30;
  firmDetails: any;
  showDeletedEnf: boolean = false;
  showPopup: boolean = false;
  selectedEnf: any = null;
  isCreateEnf:boolean = false;

  // Security
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;

  ValidFirmSupervisor: boolean = false;

  assignedUserRoles: any = [];
  assignedLevelUsers: any = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private breachesService: BreachesService,
    private firmDetailsService: FirmDetailsService,
    private supervisionService: SupervisionService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadFirmDetails(this.firmId);
      this.loadEnfActions();
      forkJoin([
        this.isValidFirmSupervisor(),
        this.firmDetailsService.loadAssignedUserRoles(this.userId),
        this.firmDetailsService.loadAssignedLevelUsers(),
      ]).subscribe({
        next: ([userRoles, levelUsers]) => {
          // Assign the results to component properties
          this.assignedUserRoles = userRoles;
          this.assignedLevelUsers = levelUsers;

          // Now apply security on the page
          this.applySecurityOnPage(this.Page.Enforcement);
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

      if (!this.supervisionService.isNullOrEmpty(this.firmId)) {
        if (this.ValidFirmSupervisor) {
          this.isLoading = false;
          return; // No need to hide the button for Firm supervisor
        } else if (this.firmDetailsService.isValidRSGMember()) {
          this.isLoading = false;
          return;
        } else {
          this.hideActionButton();
          this.isLoading = false;
        }
      }
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

  onDeletedEnfToggle(event: Event) {
    this.isLoading = true;
    this.showDeletedEnf = (event.target as HTMLInputElement).checked;
    this.loadEnfActions();
  }

  loadEnfActions() {
    this.isLoading = true;
    this.breachesService.getEnfData(this.userId, this.firmId).subscribe(
      data => {
        this.allEnfActions = data.response;
        if (this.showDeletedEnf) {
          this.enfActions = this.allEnfActions;
        }
        else {
          this.enfActions = this.allEnfActions.filter(item => !item.IsDeleted);
        }
        this.applySearchAndPagination();
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching Enf Actions', error);
        this.isLoading = false;
      }
    );
  }

  openEnfActionPopup(enf: any, firmDetails: any, isCreate : boolean): void {
    this.isCreateEnf = isCreate;
    if(enf){
      this.selectedEnf = enf;
    }
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
    this.applySecurityOnPage(this.Page.Enforcement);
  }

  applySearchAndPagination(): void {
    this.paginatedItems = this.enfActions.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
  }

}
