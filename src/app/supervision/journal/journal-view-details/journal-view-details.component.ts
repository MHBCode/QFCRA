import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { forkJoin, tap } from 'rxjs';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { JournalService } from 'src/app/ngServices/journal.service';
import * as constants from 'src/app/app-constants';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { SupervisionService } from '../../supervision.service';

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
  userId: number = 30;
  Page = FrimsObject;
  journalDetails: any = [];
  subjectData: any = [];

  // dropdowns
  alljournalEntryTypes: any = [];

  // Security
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;

  hideExportBtn: boolean = false;

  FirmAMLSupervisor: boolean = false;
  ValidFirmSupervisor: boolean = false;
  UserDirector: boolean = false;

  assignedUserRoles: any = [];
  assignedLevelUsers: any = [];

  constructor(
    private flatpickrService: FlatpickrService,
    private firmDetailsService: FirmDetailsService,
    private journalService: JournalService,
    private supervisionService: SupervisionService
  ) {
  }

  ngOnInit(): void {
    this.loadJournalDetails(this.journal.SupervisionJournalID);
    this.loadSupJournalSubjectData(this.journal.SupervisionJournalID);
    this.populateJournalEntryTypes();
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
        this.applySecurityOnPage(this.Page.SupervisionJournal, this.isEditModeJournal);
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

  applySecurityOnPage(objectId: FrimsObject, Mode: boolean) {
    this.isLoading = true;
    const currentOpType = Mode ? ObjectOpType.Create : ObjectOpType.List;

    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType).then(() => {
      this.registerMasterPageControlEvents();
    });
  }

  registerMasterPageControlEvents() {
      // Edit mode
      if (this.isEditModeJournal) {
        this.hideSaveBtn = false;
        this.hideCancelBtn = false;
        this.hideDeleteBtn = true;
        return;
      }

      // View mode
      this.hideSaveBtn = true;
      this.hideCancelBtn = true;
      this.hideEditBtn = false;
      this.hideDeleteBtn = false;
      this.hideExportBtn = true;
      if (this.journalDetails[0].IsDeleted) {
        this.hideDeleteBtn = true;
        this.hideEditBtn = true;
      }

      if (this.ValidFirmSupervisor) {
        return; // No need to hide the button for Firm supervisor
      } else if (this.firmDetailsService.isValidRSGMember()) {
        this.isLoading = false;
        return;
      } else if (this.UserDirector) {
        this.isLoading = false;
        return;
      } else {
        this.isLoading = false;
        this.hideActionButton();
      }
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
    this.hideExportBtn = true;
    this.hideEditBtn = true;
    this.registerMasterPageControlEvents();
  }

  cancelJournal() {
    this.isEditModeJournal = false;
    this.loadJournalDetails(this.journal.SupervisionJournalID);
    this.loadSupJournalSubjectData(this.journal.SupervisionJournalID);
    this.applySecurityOnPage(this.Page.SupervisionJournal,this.isEditModeJournal);
  }

  onClose() {
    this.closeJournalPopup.emit();
  }

  loadJournalDetails(supJournalID: number) {
    this.journalService.getJournalDataDetails(this.firmId, supJournalID).subscribe(
      data => {
        this.journalDetails = data.response;
        error => {
          console.error('Error fetching Firm regFunds ', error);
        }
      }
    );
  }

  loadSupJournalSubjectData(supJournalID: number) {
    this.journalService.getSupJournalSubjectData(supJournalID).subscribe(data => {
      this.subjectData = data.response;
    }, error => {
      console.error('Error Fetching Subject Data: ', error);
    })
  }

  populateJournalEntryTypes() {
    this.supervisionService.populateJournalEntryTypes(this.userId, constants.ObjectOpType.Edit).subscribe(
      journalEntryTypes => {
        this.alljournalEntryTypes = journalEntryTypes;
      },
      error => {
        console.error('Error fetching journal types:', error);
      }
    );
  }
}
