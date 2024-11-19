import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { forkJoin, tap } from 'rxjs';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';

@Component({
  selector: 'app-journal-view-details',
  templateUrl: './journal-view-details.component.html',
  styleUrls: ['./journal-view-details.component.scss', '../../../shared/popup.scss', '../../supervision.scss']
})
export class JournalViewDetailsComponent implements OnInit {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  @Input() journal: any;
  @Input() firmDetails: any;
  @Input() firmId: any;
  @Output() closeJournalPopup = new EventEmitter<void>();

  isEditModeJournal: boolean = false;

  isLoading: boolean = false;
  userId: number = 10044;
  Page = FrimsObject;

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

  constructor(private flatpickrService: FlatpickrService, private firmDetailsService: FirmDetailsService) {

  }

  ngOnInit(): void {
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
  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }

  applySecurityOnPage(objectId: FrimsObject) {
    this.isLoading = true;
    const currentOpType = ObjectOpType.Edit;

    // Apply backend permissions for the current object (e.g., CoreDetail or Scope)
    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType).then(() => {

      this.hideEditBtn = false;

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

  editJournal() {
    this.isEditModeJournal = true;
  }

  onClose() {
    this.closeJournalPopup.emit();
  }
}
