import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { catchError, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { JournalService } from 'src/app/ngServices/journal.service';
import * as constants from 'src/app/app-constants';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { SupervisionService } from '../../supervision.service';
import { ClassicEditor, Bold, Essentials, Heading, Indent, IndentBlock, Italic, Link, List, MediaEmbed, Paragraph, Table, Undo, Font, FontSize, FontColor } from 'ckeditor5';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';

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
  reasonOfDeletion: string;

  currentDate = new Date();

  // dropdowns
  alljournalEntryTypes: any = [];
  allExternalAuditors: any = [];
  allApprovedIndividuals: any = [];
  allRequiredIndividuals: any = [];

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

  hideExportBtn: boolean = false;

  FirmAMLSupervisor: boolean = false;
  ValidFirmSupervisor: boolean = false;
  UserDirector: boolean = false;

  assignedUserRoles: any = [];
  assignedLevelUsers: any = [];

  // popups
  callDeleteJournal: boolean = false;

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
    private supervisionService: SupervisionService,
    private dateUtilService: DateUtilService,
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
    this.loadSupJournalSubjectData(this.journal.SupervisionJournalID, this.journalSubjectTypes).subscribe(() => {
      console.log('Journal Subject Data Loaded:', this.journalSubjectTypes);
    });
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

        // Map selected subjects to the main list and add `isSelected` and `selectedValue`
        subjectTypes.forEach((subject) => {
          const matchedSubject = selectedSubjects.find(
            (s) => s.JournalSubjectTypeID === subject.JournalSubjectTypeID
          );

          subject.isSelected = !!matchedSubject; // Mark as selected if it exists in the response
          console.log(`Subject: ${subject.JournalSubjectTypeID}, isSelected: ${subject.isSelected}`);
          subject.ObjectInstanceDesc = matchedSubject?.ObjectInstanceDesc || null;
          subject.JournalSubjectOtherDesc = matchedSubject?.JournalSubjectOtherDesc || null;

          // Set selectedValue for dropdowns
          subject.selectedValue = matchedSubject?.ObjectInstanceID || 0; // Use ObjectInstanceID or default to 0

          console.log('Updated Subject:', subject);
        });
      })
    );
  }



  getDropdownOptions(subject: any): any[] {
    switch (subject.JournalSubjectTypeID) {
      case 1: // Firm
        return []; // No options for Firm
      case 2: // Approved Individual
        return this.allApprovedIndividuals.map((ind: any) => ({
          value: ind.AppIndividualID, // Ensure this is correctly set
          label: ind.FullName, // Ensure this is correctly set
        }));
      case 5: // Required Individual
        return this.allRequiredIndividuals.map((ind: any) => ({
          value: ind.ContactID,
          label: ind.FullName,
        }));
      case 3: // External Auditors
        return this.allExternalAuditors.map((auditor: any) => ({
          value: auditor.OtherEntityID,
          label: auditor.OtherEntityName,
        }));
      case 4: // Others
        return []; // Others does not have dropdown options
      default:
        return []; // Default case to handle unexpected types
    }
  }




  isChecked(subject: any): boolean {
    return subject.isSelected === true;
  }

  toggleSelection(subject: any, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    subject.isSelected = inputElement.checked; // Update the selection status

    if (!subject.isSelected) {
      subject.ObjectInstanceDesc = null; // Clear description when unchecked
      subject.JournalSubjectOtherDesc = null; // Clear other description when unchecked
    }
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

  async validateJournal(): Promise<boolean> {
    this.hasValidationErrors = false;



    return !this.hasValidationErrors;
  }

  // save
  async saveJournal() {
    this.isLoading = true;

    // Validate before saving
    const isValid = await this.validateJournal();

    console.log('Validation result:', isValid); // Debug log

    if (!isValid) {
      this.firmDetailsService.showErrorAlert(constants.SupervisionData_Messages.SUPERVISION_SAVE_ERROR);
      this.isLoading = false;
      return; // Prevent further action if validation fails or the user cancels
    }


    // Proceed with saving
    const journalDataObj = this.prepareJournalObject(this.userId);
    const subjectDataObj = this.prepareSubjectObject(this.userId);

    forkJoin({
      saveSupervision: this.journalService.saveSupJournalData(journalDataObj),
      saveSupCategory: this.journalService.insertUpdateJournalSup(subjectDataObj)
    }).subscribe(
      response => {
        console.log('Save successful:', response); // Debug log
        this.firmDetailsService.showSaveSuccessAlert(18025);
        this.isEditModeJournal = false;
        this.isLoading = false;
        this.loadJournalDetails(this.journal.SupervisionJournalID);
        this.loadSupJournalSubjectData(this.journal.SupervisionJournalID, this.journalSubjectTypes)
        this.applySecurityOnPage(this.Page.SupervisionJournal, this.isEditModeJournal);
      },
      error => {
        console.error('Error saving data:', error);
        this.isLoading = false;
      }
    );
  }




  prepareJournalObject(userId: number) {
    return {
      supervisionJournalID: this.journalDetails[0].SupervisionJournalID,
      firmId: this.firmId,
      journalEntryTypeID: this.journalDetails[0].JournalEntryTypeID,
      entryBy: this.journalDetails[0].EntryBy,
      entryDate: this.dateUtilService.convertDateToYYYYMMDD(this.journalDetails[0].EntryDate),
      entryTitle: this.journalDetails[0].EntryTitle,
      entryNotes: this.journalDetails[0].EntryNotes,
      createdBy: userId,
    }
  }


  prepareSubjectObject(userId: number): any[] {
    return this.journalSubjectTypes
      .filter(subject => subject.isSelected) // Include only selected subjects
      .map(subject => {
        const matchedData = this.subjectData.find(
          (data: any) => data.JournalSubjectTypeID === subject.JournalSubjectTypeID
        );

        return {
          journalSubjectAssnID: matchedData?.JournalSubjectAssnID || 0,
          supervisionJournalID: matchedData?.SupervisionJournalID || this.journal.SupervisionJournalID,
          journalSubjectTypeID: subject.JournalSubjectTypeID,
          objectID: subject.ObjectID || 0,
          objectInstanceID: subject.selectedValue || matchedData?.ObjectInstanceID || 0,
          journalSubjectOtherDesc: subject.JournalSubjectOtherDesc || matchedData?.JournalSubjectOtherDesc || '',
          createdBy: userId,
        };
      });
  }

  // delete
  getJournalDeletePopup() {
    this.callDeleteJournal = true;
    setTimeout(() => {
      const popupWrapper = document.querySelector('.JournalDeletion') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .JournalDeletion not found');
      }
    }, 0);
  }

  closeDeleteJournalPopup() {
    this.callDeleteJournal = false;
    const popupWrapper = document.querySelector('.JournalDeletion') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
      this.reasonOfDeletion = '';
    } else {
      console.error('Element with class .JournalDeletion not found');
    }
  }


  deleteJournal() {
    const deletePayload = {
      supervisionJournalID: this.journal.SupervisionJournalID, 
      isDeleted: true,
      deletedBy: this.userId, 
      deletedDate: this.currentDate, 
      reasonForDeletion: this.reasonOfDeletion || null,
      lastModifiedBy: this.userId,
    };

    this.journalService.deleteJournalData(deletePayload).subscribe(
      response => {
        console.log('Delete successful:', response);
        this.firmDetailsService.showSaveSuccessAlert(18015);
        this.closeDeleteJournalPopup();
        this.onClose();
      },
      error => {
        console.error('Error deleting journal:', error);
      }
    );
  }



}
