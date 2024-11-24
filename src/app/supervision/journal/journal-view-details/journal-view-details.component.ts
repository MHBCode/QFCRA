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
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';
import { SafeHtml } from '@angular/platform-browser';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';

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
  @Input() isCreate: boolean = false;

  @Output() closeJournalPopup = new EventEmitter<void>();
  @Output() reloadJournal = new EventEmitter<void>();

  isEditModeJournal: boolean = false;

  isLoading: boolean = false;
  userId: number = 10044;
  Page = FrimsObject;
  journalDetails: any = [{}];
  subjectData: any[] = [];
  journalSubjectTypes: any = [];
  reasonOfDeletion: string;

  currentDate = new Date();

  journalDoc: any = {};

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
    private sanitizerService: SanitizerService,
    private objectWF: ObjectwfService,
  ) {
  }

  ngOnInit(): void {
    if (!this.isCreate) {
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
          // Assign the response to journalSubjectTypes and subjectData
          this.journalSubjectTypes = subjectTypes.response;

          // Synchronize `isSelected` and other properties for subjectData
          this.subjectData = this.journalSubjectTypes.map((subject) => {
            const matchedSubject = subjectData.response.find(
              (s: any) => s.JournalSubjectTypeID === subject.JournalSubjectTypeID
            );

            return {
              ...subject, // Preserve existing properties from journalSubjectTypes
              isSelected: !!matchedSubject, // Mark as selected if matched
              ObjectInstanceDesc: matchedSubject?.ObjectInstanceDesc || null,
              JournalSubjectOtherDesc: matchedSubject?.JournalSubjectOtherDesc || null,
              selectedValue: matchedSubject?.ObjectInstanceID || 0, // Use matched ObjectInstanceID or default
            };
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
      this.loadJournalDetails(this.journal.SupervisionJournalID);
    }
    else {
      forkJoin({
        subjectTypes: this.popuplateSubjectTypes(),
        requiredIndividuals: this.popuplateRequiredIndividuals(),
        approvedIndividuals: this.populateApprovedIndividuals(),
      }).subscribe({
        next: ({
          subjectTypes,
          requiredIndividuals,
          approvedIndividuals
        }) => {
          // Assign the response to journalSubjectTypes and subjectData
          this.journalSubjectTypes = subjectTypes.response;
          // Assign other data to component properties
          this.allRequiredIndividuals = requiredIndividuals.response;
          this.allApprovedIndividuals = approvedIndividuals.response;

          this.registerMasterPageControlEvents();
        },

        error: (err) => {
          console.error('Error initializing page:', err);
        },
      });

      this.isEditModeJournal = false;
    }
    // Load additional data that does not depend on forkJoin
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
    } else {
      if (this.isCreate) {
        this.hideSaveBtn = false;
        this.hideCancelBtn = false;
        this.hideEditBtn = true;
        this.hideDeleteBtn = true;
        this.hideExportBtn = true;
        return;
      }
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
    this.errorMessages = {};
    this.loadSupJournalSubjectData(this.journal.SupervisionJournalID, this.subjectData).subscribe(() => {
      console.log('Journal Subject Data Updated:', this.subjectData);
    });
    this.loadJournalDetails(this.journal.SupervisionJournalID);
    this.reloadJournal.emit(); // recalls the loadJournal() function in journal component
    this.applySecurityOnPage(this.Page.SupervisionJournal, this.isEditModeJournal);
  }

  onClose() {
    this.errorMessages = {};
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

    // Validate Journal Entry Type
    if (parseInt(this.journalDetails[0].JournalEntryTypeID) === 0) {
      this.loadErrorMessages('EntryType', 18017);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['EntryType'];
    }

    // Validate Entry Date
    if (this.supervisionService.isNullOrEmpty(this.journalDetails[0].EntryDate)) {
      this.loadErrorMessages('EntryDate', 18018);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['EntryDate'];
    }

    // Validate Entry Title
    if (this.supervisionService.isNullOrEmpty(this.journalDetails[0].EntryTitle)) {
      this.loadErrorMessages('EntryTitle', 18020);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['EntryTitle'];
    }

    // Validate Checkbox Selection
    const hasSelectedCheckbox = this.journalSubjectTypes.some(subject => subject.isSelected);
    if (!hasSelectedCheckbox) {
      this.loadErrorMessages('CheckboxSelection', 18024); // Message Key for No Checkbox Selected
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['CheckboxSelection'];
    }

    // Validate Dropdowns for Selected Checkboxes
    let isSubjectSelected = false; // To track if any subject is selected

    this.journalSubjectTypes.forEach((subject) => {
      if (subject.isSelected) {
        isSubjectSelected = true;

        // Check specific dropdowns based on ObjectID
        switch (subject.ObjectID) {
          case FrimsObject.Firm:
            // No additional validation for Firm
            break;

          case FrimsObject.Ais: // Approved Individuals
            if (parseInt(subject.selectedValue) === 0) {
              this.loadErrorMessages('AI', 18021);
              this.hasValidationErrors = true;
            } else {
              delete this.errorMessages['AI'];
            }
            break;

          case FrimsObject.Auditor: // External Auditors
            if (parseInt(subject.selectedValue) === 0) {
              this.loadErrorMessages('EA', 18022);
              this.hasValidationErrors = true;
            } else {
              delete this.errorMessages['EA'];
            }
            break;

          case FrimsObject.Contatcs: // Required Individuals
            if (parseInt(subject.selectedValue) === 0) {
              this.loadErrorMessages('RI', 18027);
              this.hasValidationErrors = true;
            } else {
              delete this.errorMessages['RI'];
            }
            break;

          default:
            // For "Others" (JournalSubjectTypeID === 4)
            if (parseInt(subject.JournalSubjectTypeID) === 4 && this.supervisionService.isNullOrEmpty(subject.JournalSubjectOtherDesc)) {
              this.loadErrorMessages('Others', 18023);
              this.hasValidationErrors = true;
            } else {
              delete this.errorMessages['Others'];
            }
            break;
        }
      } else {
        delete this.errorMessages['Others'];
        delete this.errorMessages['RI'];
        delete this.errorMessages['AI'];
        delete this.errorMessages['EA'];
      }
    });

    return !this.hasValidationErrors;
  }

  hasDropdownError(objectID: number): boolean {
    switch (objectID) {
      case FrimsObject.Ais: // Approved Individuals
        return !!this.errorMessages['AI'];
      case FrimsObject.Auditor: // External Auditors
        return !!this.errorMessages['EA'];
      case FrimsObject.Contatcs: // Required Individuals
        return !!this.errorMessages['RI'];
      default:
        return false;
    }
  }

  hasOtherInputError(subject: any): boolean {
    return subject.JournalSubjectTypeID === 4 && !!this.errorMessages['Others'];
  }


  // save
  async saveJournal() {
    this.isLoading = true;

    // Validate before saving
    const isValid = await this.validateJournal();

    console.log('Validation result:', isValid); // Debug log

    if (!isValid) {
      this.firmDetailsService.showErrorAlert(constants.MessagesLogForm.ENTER_REQUIREDFIELD_PRIORSAVING);
      this.isLoading = false;
      return; // Prevent further action if validation fails or the user cancels
    }


    // Proceed with saving
    const journalDataObj = this.prepareJournalObject(this.userId);

    this.journalService.saveSupJournalData(journalDataObj).subscribe(
      response => {
        console.log('Save successful:', response); // Debug log
        this.firmDetailsService.showSaveSuccessAlert(18025);
        this.isEditModeJournal = false;
        this.isLoading = false;
        this.loadJournalDetails(this.journal.SupervisionJournalID);
        this.loadSupJournalSubjectData(this.journal.SupervisionJournalID, this.subjectData).subscribe(() => {
          console.log('Journal Subject Data Updated:', this.subjectData);
        });
        this.reloadJournal.emit(); // recalls the loadJournal() function in journal component
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
      objSupJournal: {
        supervisionJournalID: this.journalDetails[0].SupervisionJournalID,
        firmID: this.firmId,
        journalEntryTypeID: this.journalDetails[0].JournalEntryTypeID,
        journalEntryTypeDesc: this.journalDetails[0].JournalEntryTypeDesc,
        entryBy: this.journalDetails[0].EntryBy,
        entryByUser: null,
        entryDate: this.dateUtilService.convertDateToYYYYMMDD(this.journalDetails[0].EntryDate),
        entryTitle: this.journalDetails[0].EntryTitle,
        entryNotes: this.journalDetails[0].EntryNotes,
        isDeleted: this.journalDetails[0].IsDeleted,
        deletedBy: this.journalDetails[0].DeletedBy,
        deletedByUser: this.journalDetails[0].DeletedBy,
        deletedDate: this.journalDetails[0].DeletedDate,
        reasonForDeletion: this.reasonOfDeletion,
        createdBy: this.userId,
        lastModifiedBy: null,
        lastModifiedDate: this.currentDate,
      },
      lstSupSubjects: this.journalSubjectTypes
        .filter(subject => subject.isSelected) // Include only selected subjects
        .map(subject => {
          const matchedData = this.subjectData.find(
            (data: any) => data.JournalSubjectTypeID === subject.JournalSubjectTypeID
          );

          return {
            journalSubjectAssnID: matchedData?.JournalSubjectAssnID || null,
            journalSubjectTypeID: subject.JournalSubjectTypeID,
            supervisionJournalID: matchedData?.SupervisionJournalID || this.journalDetails[0].SupervisionJournalID,
            objectID: subject.ObjectID || null,
            objectInstanceID:
              subject.JournalSubjectTypeID === 1 // 1 is the ID for "Firm"
                ? this.firmId
                : subject.selectedValue || matchedData?.ObjectInstanceID || null,
            journalSubjectOtherDesc: subject.JournalSubjectOtherDesc || matchedData?.JournalSubjectOtherDesc || null,
            journalSubjectTypeDesc: null,
            displayOrder: subject.DisplayOrder || 0,
            regulatorName: null,
            individualName: null,
            objectInstanceDesc: matchedData?.ObjectInstanceDesc,
            createdBy: userId,
          };
        }),
    };
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

  // Documents
  loadDocuments() {
    this.objectWF.getDocument(this.Page.SupervisionJournal, this.journalDetails[0].SupervisionJournalID, 1).pipe(
    ).subscribe(
      data => {
        this.journalDoc = data.response;
        console.log('Document Data:', data);
      },
      error => {
        console.error('Error loading document:', error);
        this.journalDoc = {};

      }
    );
  }

  loadErrorMessages(fieldName: string, msgKey: number, placeholderValue?: string) {
    this.supervisionService.getErrorMessages(fieldName, msgKey, null, placeholderValue).subscribe(
      () => {
        this.errorMessages[fieldName] = this.supervisionService.errorMessages[fieldName];
        console.log(`Error message for ${fieldName} loaded successfully`);
      },
      error => {
        console.error(`Error loading error message for ${fieldName}:`, error);
      }
    );
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizerService.sanitizeHtml(html);
  }
}
