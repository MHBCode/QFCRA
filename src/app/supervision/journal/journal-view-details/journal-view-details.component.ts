import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { catchError, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { JournalService } from 'src/app/ngServices/journal.service';
import * as constants from 'src/app/app-constants';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { SupervisionService } from '../../supervision.service';
import { ClassicEditor, Bold, Essentials, Heading, Indent, IndentBlock, Italic, Link, List, MediaEmbed, Paragraph, Table, Undo, Font, FontSize, FontColor } from 'ckeditor5';

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
  journalDetails: any = [{}];
  subjectData: any[] = [];
  journalSubjectTypes: any = [];

  // dropdowns
  alljournalEntryTypes: any = [];
  allExternalAuditors: any = [];
  allApprovedIndividuals: any = [];
  allRequiredIndividuals: any = [];


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

  public Editor = ClassicEditor;

  public config = {
    toolbar: [
      'undo', 'redo', '|',
      'heading', '|', 'bold', 'italic', '|',
      'fontSize', 'fontColor', '|',
      'link', 'insertTable', 'mediaEmbed', '|',
      'bulletedList', 'numberedList', 'indent', 'outdent'
    ],
    plugins: [
      Bold,
      Essentials,
      Heading,
      Indent,
      IndentBlock,
      Italic,
      Link,
      List,
      MediaEmbed,
      Paragraph,
      Table,
      Undo,
      Font,
      FontSize,
      FontColor
    ],
    licenseKey: ''
  };

  constructor(
    private flatpickrService: FlatpickrService,
    private firmDetailsService: FirmDetailsService,
    private journalService: JournalService,
    private supervisionService: SupervisionService
  ) {
  }

  ngOnInit(): void {
    forkJoin({
      subjectData: this.loadSupJournalSubjectData(this.journal.SupervisionJournalID, this.journalSubjectTypes),
      subjectTypes: this.popuplateSubjectTypes(),
      userRoles: this.firmDetailsService.loadAssignedUserRoles(this.userId),
      levelUsers: this.firmDetailsService.loadAssignedLevelUsers(),
      requiredIndividuals: this.popuplateRequiredIndividuals(),
      approvedIndividuals: this.populateApprovedIndividuals(),
      isDirector: this.isUserDirector(),
      isSupervisor: this.isValidFirmSupervisor(),
      isAMLSupervisor: this.isValidFirmAMLSupervisor(),
    }).subscribe({
      next: ({
        subjectData,
        subjectTypes,
        userRoles,
        levelUsers,
        requiredIndividuals,
        approvedIndividuals,
        isDirector,
        isSupervisor,
        isAMLSupervisor,
      }) => {
        // Process `subjectData` and `subjectTypes` together
        this.journalSubjectTypes = subjectTypes.response;
        this.subjectData = subjectData.response;
  
        // Map subject data to subject types
        this.journalSubjectTypes.forEach((subject) => {
          const matchedSubject = this.subjectData.find(
            (s) => s.JournalSubjectTypeID === subject.JournalSubjectTypeID
          );
          subject.isSelected = !!matchedSubject; // Mark as selected if it exists in the response
          subject.ObjectInstanceDesc = matchedSubject?.ObjectInstanceDesc || null;
          subject.JournalSubjectOtherDesc = matchedSubject?.JournalSubjectOtherDesc || null;
        });
  
        // Assign other data to component properties
        this.assignedUserRoles = userRoles;
        this.assignedLevelUsers = levelUsers;
        this.allRequiredIndividuals = requiredIndividuals.response;
        this.allApprovedIndividuals = approvedIndividuals.response;
  
        this.UserDirector = isDirector;
        this.ValidFirmSupervisor = isSupervisor;
        this.FirmAMLSupervisor = isAMLSupervisor;
  
        // Apply security after all data is loaded
        this.applySecurityOnPage(this.Page.SupervisionJournal, this.isEditModeJournal);
      },
      error: (err) => {
        console.error('Error initializing page:', err);
      },
    });
  
    // Load additional data that does not depend on forkJoin
    this.loadJournalDetails(this.journal.SupervisionJournalID);
    this.populateJournalEntryTypes();
    this.populateJournalExternalAuditors();
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
    this.populateJournalExternalAuditors();
    this.registerMasterPageControlEvents();
  }

  cancelJournal() {
    this.isEditModeJournal = false;
    this.loadJournalDetails(this.journal.SupervisionJournalID);
    this.loadSupJournalSubjectData(this.journal.SupervisionJournalID, this.journalSubjectTypes);
    this.applySecurityOnPage(this.Page.SupervisionJournal, this.isEditModeJournal);
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

  loadSupJournalSubjectData(supJournalID: number, subjectTypes: any[]): Observable<any> {
    return this.journalService.getSupJournalSubjectData(supJournalID).pipe(
      tap((data) => {
        const selectedSubjects = data.response;

        // Map selected subjects to the main list and add `isSelected`
        subjectTypes.forEach((subject) => {
          const matchedSubject = selectedSubjects.find(
            (s) => s.JournalSubjectTypeID === subject.JournalSubjectTypeID
          );
          subject.isSelected = !!matchedSubject; // Mark as selected if it exists in the response
          subject.ObjectInstanceDesc = matchedSubject?.ObjectInstanceDesc || null;
          subject.JournalSubjectOtherDesc = matchedSubject?.JournalSubjectOtherDesc || null;
        });
      })
    );
  }


  getDropdownOptions(subject: any): any[] {
    switch (subject.JournalSubjectTypeID) {
      case 5: // Registered Individual
        return this.allRequiredIndividuals.map((ind: any) => ({
          value: ind.ObjectInstanceID,
          label: ind.ObjectInstanceDesc,
        }));
      case 1: // Firm
        return this.allApprovedIndividuals.map((ind: any) => ({
          value: ind.ObjectInstanceID,
          label: ind.ObjectInstanceDesc,
        }));
      default: // External Auditors
        return this.allExternalAuditors.map((auditor: any) => ({
          value: auditor.ObjectInstanceID,
          label: auditor.ObjectInstanceDesc,
        }));
    }
  }


  isChecked(subject: any): boolean {
    return subject.isSelected;
  }

  toggleSelection(subject: any, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    subject.isSelected = inputElement.checked; // Update the selection status
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

  popuplateSubjectTypes(): Observable<any> {
    return this.journalService.getSupJournalSubjectTypes(this.firmId).pipe(
      tap((types) => {
        this.journalSubjectTypes = types.response;
      })
    );
  }

  popuplateRequiredIndividuals(): Observable<any> {
    return this.journalService.getAllRequiredIndividuals(this.firmId).pipe(
      tap((types) => {
        this.allRequiredIndividuals = types.response;
      })
    );
  }

  populateApprovedIndividuals(): Observable<any> {
    return this.journalService.getAllApprovedIndividuals(this.firmId).pipe(
      tap((types) => {
        this.allApprovedIndividuals = types.response;
      }),
      catchError((error) => {
        console.error('Error fetching approved individuals:', error);
        // Assign an empty array to continue execution
        this.allApprovedIndividuals = [];
        return of({ response: [] }); // Return an empty response to continue execution
      })
    );
  }


  populateJournalExternalAuditors() {
    this.supervisionService.populateJournalExternalAuditors(this.userId, constants.ObjectOpType.Create).subscribe(
      externalAuditors => {
        this.allExternalAuditors = externalAuditors;
      },
      error => {
        console.error('Error fetching journal types:', error);
      }
    );
  }
}
