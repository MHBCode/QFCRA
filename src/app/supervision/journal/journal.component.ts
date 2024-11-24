import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, tap } from 'rxjs';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { JournalService } from 'src/app/ngServices/journal.service';
import * as constants from 'src/app/app-constants';
import { UsersService } from 'src/app/ngServices/users.service';
import { SupervisionService } from '../supervision.service';


@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss', '../supervision.scss']
})
export class JournalComponent {


  Page = FrimsObject;
  journaldata: any;
  isLoading: boolean = false;
  firmId: number = 0;
  paginatedItems: any[] = [];
  pageSize: number = 10;
  userId: number = 10044;
  firmDetails: any;
  showDeletedJournal: boolean = false;
  alljournaldata: any;
  showPopup: boolean = false;
  selectedJournal: any = null;
  isCreateJournal:boolean = false;

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


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private journalService: JournalService,
    private firmDetailsService: FirmDetailsService,
    private supervisionService: SupervisionService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.isUserHasRestrictedAccess();
      this.loadFirmDetails(this.firmId);
      this.loadJournal();

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
          this.applySecurityOnPage(this.Page.SupervisionJournal);
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

    // Apply backend permissions for the current object (e.g., CoreDetail or Scope)
    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType).then(() => {

      this.hideCreateBtn = false;

      if (this.ValidFirmSupervisor) {
        this.isLoading = false;
        return; // No need to hide the button for Firm supervisor
      } else if (this.firmDetailsService.isValidRSGMember()) {
        this.isLoading = false;
        return;
      } else if (this.UserDirector) {
        this.isLoading = false;
        return;
      } else {
        this.hideActionButton();
        this.isLoading = false;
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

  onDeletedJournalToggle(event: Event) {
    this.showDeletedJournal = (event.target as HTMLInputElement).checked;
    this.loadJournal();
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

  loadJournal() {
    this.journalService.getJournalData(this.firmId).subscribe(
      data => {
        this.alljournaldata = data.response;
        if (this.showDeletedJournal) {
          this.journaldata = this.alljournaldata;
        }
        else {
          this.journaldata = this.alljournaldata.filter(item => !item.IsDeleted);
        }
        this.applySearchAndPagination();
        error => {
          console.error('Error fetching Firm regFunds ', error);
        }
      }
    );
  }

  openJournalPopup(journal: any, firmDetails: any, isCreate : boolean): void {
    this.isCreateJournal = isCreate;
    if(journal){
      this.selectedJournal = journal;
    }
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  applySearchAndPagination(): void {
    this.paginatedItems = this.journaldata.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
  }

}
