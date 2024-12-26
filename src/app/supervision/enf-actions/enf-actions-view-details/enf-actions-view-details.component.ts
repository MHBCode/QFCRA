import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { ClassicEditor, Bold, Essentials, Heading, Indent, IndentBlock, Italic, Link, List, MediaEmbed, Paragraph, Table, Undo, Font, FontSize, FontColor } from 'ckeditor5';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { EnforcementsActionsService } from 'src/app/ngServices/enforcements-actions.service';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';
import { SupervisionService } from '../../supervision.service';
import * as constants from 'src/app/app-constants';
import { forkJoin, catchError, of, tap, Observable } from 'rxjs';
import { JournalService } from 'src/app/ngServices/journal.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';
import { LogformService } from 'src/app/ngServices/logform.service';

@Component({
  selector: 'app-enf-actions-view-details',
  templateUrl: './enf-actions-view-details.component.html',
  styleUrls: ['./enf-actions-view-details.component.scss', '../../../shared/popup.scss', '../../supervision.scss']
})
export class EnfActionsViewDetailsComponent implements OnInit {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  @Input() enf: any;
  @Input() firmDetails: any;
  @Input() firmId: any;
  @Input() isCreateEnf: boolean = false;

  @Output() closeEnfPopup = new EventEmitter<void>();
  @Output() reloadEnf = new EventEmitter<void>();

  isEditModeEnf: boolean = false;
  enfDetails: any = [{}];

  //Documents
  enfDoc: any[] = [];
  fetchedDocumentTypes: any = [];
  fileLocation: string = '';
  FileLoc: string = '';
  documentObj: any;
  // selectedFiles: File[] = [];
  newfileNum: number;
  selectedFile: File | null = null;
  fileError: string = '';


  reasonOfDeletion: string;

  isLoading: boolean = false;
  userId: number = 30;
  Page = FrimsObject;

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

  hidePublishBtn: boolean = false;

  ValidFirmSupervisor: boolean = false;
  UserDirector: boolean = false;

  assignedUserRoles: any = [];
  assignedLevelUsers: any = [];

  callDeleteEnf: boolean = false;

  //dropdowns
  allEnfActionAuth: any = [];
  allEnfActionDNFBP: any = [];
  allFirmTypes: any = [];
  allFirmNamesAuth: any = [];
  allFirmNamesDNFBP: any = [];
  allApprovedIndividuals: any = [];
  allRequiredIndividuals: any = [];
  allRelatedIndividuals: any = [];

  selectedEnforcementActionType: number = 0; // Tracks selected action type
  selectedIndividualId: number | null = null;
  showIndividualsDropdown: boolean = true;
  individuals: any[] = [];

  publish: boolean;

  currentDate: any = new Date();

  createEnfObj = {
    FirmTypes: 0,
    FirmID: 0,
    EnforcementActionOnTypeID: 0,
    EnforcementActionOnTypeDesc: null,
    EnforcementActionFromDate: null,
    EnforcementActionToDate: null,
    EnforcementType: '',
    FirmName: null,
    LastModifiedBy: null,
    IsDeleted: false,
    EnforcementNotes: null,
    DeletedBy: null,
    DeletedDate: null,
    ReasonForDeletion: null,
  }

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
    private sanitizerService: SanitizerService,
    private flatpickrService: FlatpickrService,
    private firmDetailsService: FirmDetailsService,
    private enfService: EnforcementsActionsService,
    private supervisionService: SupervisionService,
    private journalService: JournalService,
    private dateUtilService: DateUtilService,
    private objectWF: ObjectwfService,
    private logForm: LogformService
  ) { }

  ngOnInit(): void {
    this.isLoading = true; // Start loading
    if (!this.isCreateEnf) {
      forkJoin({
        userRoles: this.firmDetailsService.loadAssignedUserRoles(this.userId),
        levelUsers: this.firmDetailsService.loadAssignedLevelUsers(),
        isDirector: this.isUserDirector(),
        isSupervisor: this.isValidFirmSupervisor(),

      }).subscribe({
        next: ({
          userRoles,
          levelUsers,
          isDirector,
          isSupervisor,

        }) => {
          // Assign data to component properties
          this.assignedUserRoles = userRoles;
          this.assignedLevelUsers = levelUsers;
          this.UserDirector = isDirector;
          this.ValidFirmSupervisor = isSupervisor;

          // Apply security after all data is loaded
          this.loadDocuments();
          this.loadEnfDetails(this.enf.EnforcementAndDisciplinaryActnID).subscribe({
            next: () => {
              this.applySecurityOnPage(this.Page.Enforcement, false);
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading enforcement details: ', error);
              this.isLoading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error initializing page:', err);
          this.isLoading = false;
        },
      });
    } else {
      forkJoin({
        userRoles: this.firmDetailsService.loadAssignedUserRoles(this.userId),
        levelUsers: this.firmDetailsService.loadAssignedLevelUsers(),
        isDirector: this.isUserDirector(),
        isSupervisor: this.isValidFirmSupervisor(),

      }).subscribe({
        next: ({
          userRoles,
          levelUsers,
          isDirector,
          isSupervisor,

        }) => {
          // Assign data to component properties
          this.assignedUserRoles = userRoles;
          this.assignedLevelUsers = levelUsers;
          this.UserDirector = isDirector;
          this.ValidFirmSupervisor = isSupervisor;

          // Apply security after all data is loaded
          this.populateEnfActionsAuth();
          this.populateEnfActionsDNFBP();
          this.populateFirmNamesAuthorised();
          this.populateFirmNamesDNFBP();

          this.showIndividualsDropdown = false;

          this.applySecurityOnPage(this.Page.Enforcement, true); // on create mode
        },
        error: (err) => {
          console.error('Error initializing page:', err);
          this.isLoading = false;
        },
      });
    }
  }


  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }

  applySecurityOnPage(objectId: FrimsObject, Mode: boolean) {
    this.isLoading = true;
    const currentOpType = Mode ? ObjectOpType.Create : ObjectOpType.View;

    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType,null,null).then(() => {
      this.registerMasterPageControlEvents();
    });
  }

  registerMasterPageControlEvents() {

    this.hideCancelBtn = true;

    if (this.isEditModeEnf || this.isCreateEnf) {
      this.hidePublishBtn = true;
      this.hideCancelBtn = false;
    }

    if (this.enfDetails[0].Published && !(this.isCreateEnf)) {
      this.hideDeleteBtn = true;
    } else {
      this.hideDeleteBtn = false;
    }

    // if () {
    //   this.hidePublishBtn = true;
    // }

    if (this.enfDetails[0].IsDeleted && !(this.isCreateEnf)) {
      this.hideDeleteBtn = true;
      this.hideEditBtn = true;
      this.hidePublishBtn = true;
    }

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

  loadEnfDetails(enforcementId: number): Observable<any> {
    return this.enfService.getEnforcementDetails(this.userId, enforcementId).pipe(
      tap((response) => {
        this.enfDetails = response.response; // Update the view
      })
    );
  }

  getDocumentTypes() {
    const docTypeId = constants.FrimsObject.Enforcement;
    this.objectWF.getDocumentType(docTypeId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.fetchedDocumentTypes = res.response;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error deleting RegisteredFund', error);
      },
    });
  }

  // Documents
  loadDocuments() {
    this.objectWF.getDocument(this.Page.Enforcement, this.enf?.EnforcementAndDisciplinaryActnID, 1).pipe(
    ).subscribe(
      data => {
        this.enfDoc = data.response; 
        this.FileLoc = ''; 
  
        this.logForm.constructDocUrl(this.enfDoc).subscribe(
          response => {
            if (response) {
              this.enfDoc = this.enfDoc.map((doc, index) => ({
                ...doc,
                fileLoc: response.response[index]?.fileLoc || ''
              }));
            }
          },
          error => {
            console.error('Error constructing document URL:', error);
          }
        );
      },
      error => {
        console.error('Error loading document:', error);
        this.enfDoc = [];
      }
    );
  }

  async onDocumentUploaded(uploadedDocument: any) {
    this.isLoading = true;

    try {
      // Call getNewFileNumber and wait for it to complete
      await this.getNewFileNumber().toPromise();

      // Continue with the rest of the code after getNewFileNumber completes
      const { fileLocation, intranetGuid } = uploadedDocument;
      this.documentObj = this.prepareDocumentObject(
        this.userId,
        fileLocation,
        intranetGuid,
        constants.DocType.EnforcementAttachment,
        this.Page.Enforcement,
        this.fetchedDocumentTypes.DocSubTypeID,
        this.enf?.EnforcementAndDisciplinaryActnID,
        1 // constant
      );

      this.objectWF.insertDocument(this.documentObj).subscribe(
        response => {
          this.loadDocuments();
          this.isLoading = false;
        },
        error => {
          console.error('Error updating enforcement attachment:', error);
          this.isLoading = false;
        }
      );
    } catch (error) {
      console.error('Error in getNewFileNumber:', error);
      this.isLoading = false;
    }
  }

  prepareDocumentObject(userId: number, fileLocation: string, intranetGuid: string, docType: number, objectId: number, docSubTypeID: number, objectInstanceID: number, objectInstanceRevNum: number) {
    return {
      userId: userId,
      docID: null,
      referenceNumber: null,
      fileName: this.selectedFile.name,
      fileNumber: this.newfileNum.toString(),
      firmId: this.firmId,
      otherFirm: null,
      docTypeID: docType,
      loggedBy: userId,
      loggedDate: this.currentDate,
      receivedBy: userId,
      receivedDate: this.currentDate,
      docRecieptMethodID: constants.LogFormRecieptMethods.InternalDocument,
      checkPrimaryDocID: true,
      fileLocation: fileLocation,
      docAttributeID: null,
      intranetGuid: intranetGuid,
      objectID: objectId,
      objectInstanceID: objectInstanceID,
      objectInstanceRevNum: objectInstanceRevNum,
      docSubType: docSubTypeID
    };
  }

  getNewFileNumber() {
    return this.logForm.getNewFileNumber(this.firmId, this.currentDate.toISOString()).pipe(
      tap(data => {
        this.newfileNum = data.response.Column1;
      })
    );
  }


  //getters and setters
  get enfTypeID() {
    return this.isCreateEnf ? this.createEnfObj.EnforcementActionOnTypeID : this.enfDetails[0]?.EnforcementActionOnTypeID;
  }

  set enfTypeID(value: number) {
    if (this.isCreateEnf) {
      this.createEnfObj.EnforcementActionOnTypeID = value;
    } else {
      this.enfDetails[0].EnforcementActionOnTypeID = value;
    }
  }

  get actionDateFrom() {
    return this.isCreateEnf ? this.createEnfObj.EnforcementActionFromDate : this.enfDetails[0]?.EnforcementActionFromDate;
  }

  set actionDateFrom(value: string) {
    if (this.isCreateEnf) {
      this.createEnfObj.EnforcementActionFromDate = value;
    } else {
      this.enfDetails[0].EnforcementActionFromDate = value;
    }
  }

  get actionDateTo() {
    return this.isCreateEnf ? this.createEnfObj.EnforcementActionToDate : this.enfDetails[0]?.EnforcementActionToDate;
  }

  set actionDateTo(value: string) {
    if (this.isCreateEnf) {
      this.createEnfObj.EnforcementActionToDate = value;
    } else {
      this.enfDetails[0].EnforcementActionToDate = value;
    }
  }

  get typeOfAction() {
    return this.isCreateEnf ? this.createEnfObj.EnforcementType : this.enfDetails[0]?.EnforcementType;
  }

  set typeOfAction(value: string) {
    if (this.isCreateEnf) {
      this.createEnfObj.EnforcementType = value;
    } else {
      this.enfDetails[0].EnforcementType = value;
    }
  }

  get firmName() {
    return this.isCreateEnf ? this.firmId : this.enfDetails[0]?.FirmID;
  }

  set firmName(value: number) {
    if (this.isCreateEnf) {
      this.firmId = value;
    } else {
      this.enfDetails[0].FirmID = value;
    }
  }

  get enfNotes() {
    return this.isCreateEnf ? this.createEnfObj.EnforcementNotes : this.enfDetails[0].EnforcementNotes;
  }

  set enfNotes(value: string) {
    if (this.isCreateEnf) {
      this.createEnfObj.EnforcementNotes = value;
    } else {
      this.enfDetails[0].EnforcementNotes = value;
    }
  }

  get individualLabel(): string {
    if (this.enfTypeID === 2 && this.firmDetails?.FirmTypeID === 1) {
      return 'Approved Individuals';
    } else if (this.enfTypeID === 3 || this.enfTypeID === 6) {
      return 'Related Individuals';
    } else if (this.enfTypeID === 5 && this.firmDetails?.FirmTypeID === 2) {
      return 'Required Individuals';
    } else {
      return '';
    }
  }

  publishEnf() {
    if (!this.supervisionService.isNullOrEmpty(this.enfDetails[0].EnforcementAndDisciplinaryActnID)) {
      this.publish = !this.enfDetails[0].Published;

      const publishObj = this.preparePublishEnfObj();

      this.enfService.saveEnforcement(publishObj).subscribe({
        next: () => {
          this.reloadEnf.emit(); // Reload Enforcement
          this.loadEnfDetails(this.enf.EnforcementAndDisciplinaryActnID).subscribe({
            next: () => {
              this.applySecurityOnPage(this.Page.Enforcement, false); // Apply Security After Loading
              this.isLoading = false;

              // Show Success Alert
              const alertId = this.publish ? 18052 : 18053;
              this.firmDetailsService.showSaveSuccessAlert(alertId);
            },
            error: (error) => {
              console.error('Error loading enforcement details: ', error);
              this.isLoading = false;
            }
          });
        },
        error: (error) => {
          console.error('Error saving enforcement: ', error);
          this.isLoading = false;
        }
      });
    }
  }


  preparePublishEnfObj() {
    return {
      enforcementAndDisciplinaryActnID: this.enfDetails[0].EnforcementAndDisciplinaryActnID,
      firmID: this.firmId,
      firmName: null,
      qfcNum: null,
      appIndividualID: null,
      contactAssnID: null,
      appIndividualName: null,
      enforcementActionOnTypeID: null,
      enforcementActionOnTypeDesc: null,
      enforcementActionOnDate: null,
      enforcementActionFromDate: null,
      enforcementActionToDate: null,
      enforcementType: null,
      enforcementNotes: null,
      isDeleted: false,
      deletedBy: null,
      deletedByName: null,
      deletedDate: null,
      reasonForDeletion: null,
      createdByName: null,
      createdDate: null,
      lastModifiedByName: null,
      lastModifiedDate: this.currentDate,
      userID: this.userId,
      opType: "P",
      published: this.publish,
      publishedBy: this.userId,
      publisheByName: null,
      publisheDate: this.currentDate
    }
  }

  editEnf(): void {

    if (this.isCreateEnf) {
      this.closeEnfPopup.emit();
    }

    this.isEditModeEnf = true;

    // Populate dropdowns for options
    this.populateEnfActionsAuth();
    this.populateEnfActionsDNFBP();
    this.populateFirmNamesAuthorised();
    this.populateFirmNamesDNFBP();
    this.getDocumentTypes();

    // Set dropdown visibility and populate individuals based on action type
    const actionTypeID = this.enfDetails[0]?.EnforcementActionOnTypeID;

    if (actionTypeID === 2 && this.firmDetails.FirmTypeID === 1) { // Approved Individual
      this.selectedIndividualId = this.enfDetails[0]?.AppIndividualID || 0;
      this.populateApprovedIndividuals().subscribe(() => {
        this.individuals = this.allApprovedIndividuals.map(ind => ({
          id: ind.AppIndividualID,
          name: ind.FullName
        }));
        this.showIndividualsDropdown = true;
      });
    } else if (actionTypeID === 3 || actionTypeID === 6) { // Related Individuals
      this.selectedIndividualId = this.enfDetails[0]?.ContactAssnID || 0;
      this.populateRelatedIndividuals().subscribe(() => {
        this.individuals = this.allRelatedIndividuals.map(ind => ({
          id: ind.ContactAssnID,
          name: ind.ContactName
        }));
        this.showIndividualsDropdown = true;
      });
    } else if (actionTypeID === 5 && this.firmDetails.FirmTypeID === 2) { // Registered or Required Individuals
      this.selectedIndividualId = this.enfDetails[0]?.ContactAssnID || 0;
      this.popuplateRequiredIndividuals(1).subscribe(() => {
        this.individuals = this.allRequiredIndividuals.map(ind => ({
          id: ind.ContactAssnID,
          name: ind.FullName
        }));
        this.showIndividualsDropdown = true;
      });
    }
    else {
      this.showIndividualsDropdown = false;
      this.selectedIndividualId = this.enfDetails[0]?.EnforcementActionOnTypeID;
    }

    // Apply security settings
    this.applySecurityOnPage(this.Page.Enforcement, this.isEditModeEnf);
  }



  cancelEnf() {
    this.errorMessages = {};
    if (this.isCreateEnf) {
      this.closeEnfPopup.emit();
    }
    this.isEditModeEnf = false;
    this.hidePublishBtn = false;
    this.loadEnfDetails(this.enf.EnforcementAndDisciplinaryActnID);
    this.reloadEnf.emit();
    this.applySecurityOnPage(this.Page.Enforcement, this.isEditModeEnf);
  }

  onClose() {
    this.errorMessages = {};
    this.closeEnfPopup.emit();
  }

  onActionTypeChange(event: Event): void {
    const selectedType = +(event.target as HTMLSelectElement).value; // Convert value to number
    this.enfTypeID = selectedType; // Update enfTypeID explicitly
    this.selectedIndividualId = 0; // Reset selected individual
    this.individuals = []; // Reset individuals array

    if (this.enfTypeID === 2 && this.firmDetails.FirmTypeID === 1) { // Approved Individual
      this.populateApprovedIndividuals().subscribe(() => {
        this.individuals = this.allApprovedIndividuals.map(individual => ({
          id: individual.AppIndividualID,
          name: individual.FullName
        }));
        this.showIndividualsDropdown = true; // Show dropdown
      });
    } else if (this.enfTypeID === 3 || this.enfTypeID === 6) { // Related Individuals
      this.populateRelatedIndividuals().subscribe(() => {
        this.individuals = this.allRelatedIndividuals.map(individual => ({
          id: individual.ContactAssnID,
          name: individual.ContactName
        }));
        this.showIndividualsDropdown = true; // Show dropdown
      });
    } else if (this.enfTypeID === 5 && this.firmDetails.FirmTypeID === 2) { // Registered or Required Individuals
      this.popuplateRequiredIndividuals(1).subscribe(() => {
        this.individuals = this.allRequiredIndividuals.map(individual => ({
          id: individual.ContactAssnID,
          name: individual.FullName
        }));
        this.showIndividualsDropdown = true; // Show dropdown
      });
    } else if (this.enfTypeID === 1 || this.enfTypeID === 4) {
      this.showIndividualsDropdown = false;
      this.selectedIndividualId = null;
    } else {
      this.showIndividualsDropdown = false;
    }
  }


  async validateEnforcement(): Promise<boolean> {
    this.hasValidationErrors = false;

    // Validate Enf Entry Type
    if (this.enfTypeID === 0) {
      this.loadErrorMessages('enfTypeID', 1200, 'Action On');
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['enfTypeID'];
    }

    // Validate Action Date From
    if (this.supervisionService.isNullOrEmpty(this.actionDateFrom)) {
      this.loadErrorMessages('actionDateFrom', constants.InvoicesMessages.INVALID_DATA, 'Action Effective From');
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['actionDateFrom'];
    }

    if (this.supervisionService.isNullOrEmpty(this.typeOfAction.trim())) {
      this.loadErrorMessages('typeOfAction', 1200, 'Type of Action');
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['typeOfAction'];
    }

    if (this.firmName === 0) {
      this.loadErrorMessages('firmName', 1200, 'Firm Name');
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['firmName'];
    }

    if (this.selectedIndividualId === 0 && this.enfTypeID !== 0) {
      this.loadErrorMessages('individual', 1200, 'Individual');
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['individual'];
    }

    return !this.hasValidationErrors;
  }


  async saveEnf() {

    // Validate before saving
    const isValid = await this.validateEnforcement();

    if (!isValid) {
      this.supervisionService.showErrorAlert(constants.MessagesLogForm.ENTER_REQUIREDFIELD_PRIORSAVING, 'error');
      this.isLoading = false;
      return; // Prevent further action if validation fails or the user cancels
    }

    const enfObj = this.prepareEnfObj();

    this.enfService.saveEnforcement(enfObj).subscribe({
      next: () => {
        if (this.isCreateEnf) {
          this.firmDetailsService.showSaveSuccessAlert(18040);
          this.reloadEnf.emit(); // Reload Enforcement
          this.closeEnfPopup.emit();
          return;
        }
        this.isEditModeEnf = false;
        this.isCreateEnf = false;
        this.reloadEnf.emit(); // Reload Enforcement
        this.loadEnfDetails(this.enf.EnforcementAndDisciplinaryActnID).subscribe({
          next: () => {
            this.applySecurityOnPage(this.Page.Enforcement, this.isEditModeEnf); // Apply Security After Loading
            this.isLoading = false;
            this.closeEnfPopup.emit();
            // Show Success Alert
            this.firmDetailsService.showSaveSuccessAlert(18040);
          },
          error: (error) => {
            console.error('Error loading enforcement details: ', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error saving enforcement: ', error);
        this.isLoading = false;
      }
    });
  }

  prepareEnfObj() {
    return {
      enforcementAndDisciplinaryActnID: this.isCreateEnf ? null : this.enfDetails[0].EnforcementAndDisciplinaryActnID,
      firmID: this.firmName,
      firmName: null,
      qfcNum: this.isCreateEnf ? null : this.enfDetails[0].QFCNum,
      appIndividualID: this.showIndividualsDropdown && (this.enfTypeID === 2) ? this.selectedIndividualId : null,
      contactAssnID: this.showIndividualsDropdown && (this.enfTypeID === 3 || this.enfTypeID === 6 || this.enfTypeID === 5) ? this.selectedIndividualId : null,
      appIndividualName: this.isCreateEnf ? null : this.enfDetails[0].AppIndividualName,
      enforcementActionOnTypeID: this.enfTypeID,
      enforcementActionOnTypeDesc: this.isCreateEnf ? null : this.enfDetails[0].EnforcementActionOnTypeDesc,
      enforcementActionOnDate: null,
      enforcementActionFromDate: this.dateUtilService.convertDateToYYYYMMDD(this.actionDateFrom),
      enforcementActionToDate: this.dateUtilService.convertDateToYYYYMMDD(this.actionDateTo),
      enforcementType: this.typeOfAction,
      enforcementNotes: this.enfNotes,
      isDeleted: false,
      deletedBy: null,
      deletedByName: null,
      deletedDate: null,
      reasonForDeletion: null,
      createdByName: null,
      createdDate: this.isCreateEnf ? this.currentDate : null,
      lastModifiedByName: null,
      lastModifiedDate: this.currentDate,
      userID: this.userId,
      opType: this.isCreateEnf ? null : "U",
      published: this.enfDetails[0].Published,
      publishedBy: this.userId,
      publisheByName: null,
      publisheDate: this.currentDate
    }
  }


  deleteEnf() {
    this.isLoading = true;
    const deleteEnfObj = {
      enforcementAndDisciplinaryActnID: this.enfDetails[0].EnforcementAndDisciplinaryActnID,
      firmID: this.firmId,
      firmName: null,
      qfcNum: null,
      appIndividualID: null,
      contactAssnID: null,
      appIndividualName: null,
      enforcementActionOnTypeID: null,
      enforcementActionOnTypeDesc: null,
      enforcementActionOnDate: null,
      enforcementActionFromDate: null,
      enforcementActionToDate: null,
      enforcementType: null,
      enforcementNotes: null,
      isDeleted: true,
      deletedBy: this.userId,
      deletedByName: null,
      deletedDate: null,
      reasonForDeletion: this.reasonOfDeletion,
      createdByName: null,
      createdDate: null,
      lastModifiedByName: null,
      lastModifiedDate: null,
      userID: this.userId,
      opType: "D",
      published: this.enfDetails[0].Published,
      publishedBy: 0,
      publisheByName: null,
      publisheDate: null
    }
    this.enfService.saveEnforcement(deleteEnfObj).subscribe(() => {
      this.isLoading = false;
      this.reloadEnf.emit();
      this.onClose();
      this.firmDetailsService.showSaveSuccessAlert(18041);
    })
  }


  getEnfDeletePopup() {
    this.callDeleteEnf = true;
    setTimeout(() => {
      const popupWrapper = document.querySelector('.enfDeletion') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .enfDeletion not found');
      }
    }, 0);
  }

  closeDeleteEnfPopup() {
    this.callDeleteEnf = false;
    const popupWrapper = document.querySelector('.enfDeletion') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
      this.reasonOfDeletion = '';
    } else {
      console.error('Element with class .enfDeletion not found');
    }
  }



  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizerService.sanitizeHtml(html);
  }

  populateEnfActionsAuth() {
    this.supervisionService.populateEnfActionsAuth(this.userId, constants.ObjectOpType.Create).subscribe(
      enfActionAuth => {
        this.allEnfActionAuth = enfActionAuth;
      },
      error => {
        console.error('Error fetching Enf Action Auth types:', error);
      }
    );
  }

  populateEnfActionsDNFBP() {
    this.supervisionService.populateEnfActionsDNFBP(this.userId, constants.ObjectOpType.Create).subscribe(
      enfActionDNFBP => {
        this.allEnfActionDNFBP = enfActionDNFBP;
      },
      error => {
        console.error('Error fetching Enf Action DNFBP types:', error);
      }
    );
  }

  populateFirmNamesAuthorised() {
    this.supervisionService.populateFirmNamesAuthorised(this.userId, constants.ObjectOpType.Create).subscribe(
      firmNamesAuthorised => {
        this.allFirmNamesAuth = firmNamesAuthorised;
      },
      error => {
        console.error('Error fetching Firm Names Authorised: ', error);
      }
    );
  }

  populateFirmNamesDNFBP() {
    this.supervisionService.populateFirmNamesDNFBP(this.userId, constants.ObjectOpType.Create).subscribe(
      firmNamesDNFBPs => {
        this.allFirmNamesDNFBP = firmNamesDNFBPs;
      },
      error => {
        console.error('Error fetching Firm Names DNFBP: ', error);
      }
    );
  }

  popuplateRequiredIndividuals(contactAssnId: number): Observable<any> {
    return this.journalService.getAllRequiredIndividuals(this.firmId, contactAssnId).pipe(
      tap((types) => {
        this.allRequiredIndividuals = types.response || [];
      }, error => {
        console.error('Error Fetching Required Individuals: ', error);
        this.allRequiredIndividuals = [];
      })
    );
  }

  populateApprovedIndividuals(): Observable<any> {
    return this.journalService.getAllApprovedIndividuals(this.firmId).pipe(
      tap((types) => {
        this.allApprovedIndividuals = types.response || [];
      }, error => {
        console.error('Error Fetching Approved Individuals: ', error);
        this.allApprovedIndividuals = [];
      })
    );
  }

  populateRelatedIndividuals(): Observable<any> {
    return this.enfService.getAllRelatedIndividuals(this.firmId, this.firmDetails.FirmTypeID).pipe(
      tap(
        (types) => {
          this.allRelatedIndividuals = types.response || [];
        },
        (error) => {
          console.error('Error Fetching Related Individuals: ', error);
          this.allRelatedIndividuals = [];
        }
      )
    );
  }


  loadErrorMessages(fieldName: string, msgKey: number, placeholderValue?: string) {
    this.supervisionService.getErrorMessages(fieldName, msgKey, null, placeholderValue).subscribe(
      () => {
        this.errorMessages[fieldName] = this.supervisionService.errorMessages[fieldName];
      },
      error => {
        console.error(`Error loading error message for ${fieldName}:`, error);
      }
    );
  }
}
