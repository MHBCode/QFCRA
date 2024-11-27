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
    EnforcementType: null,
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
    private journalService: JournalService
  ) { }

  ngOnInit(): void {
    this.isLoading = true; // Start loading
    if (!this.isCreateEnf) {
      forkJoin({
        userRoles: this.firmDetailsService.loadAssignedUserRoles(this.userId),
        levelUsers: this.firmDetailsService.loadAssignedLevelUsers(),
        isDirector: this.isUserDirector(),
        isSupervisor: this.isValidFirmSupervisor(),
        //enforcementDetails: this.loadEnfDetails(this.enf.EnforcementAndDisciplinaryActnID)

      }).subscribe({
        next: ({
          userRoles,
          levelUsers,
          isDirector,
          isSupervisor,
          //enforcementDetails

        }) => {
          // Assign data to component properties
          this.assignedUserRoles = userRoles;
          this.assignedLevelUsers = levelUsers;
          this.UserDirector = isDirector;
          this.ValidFirmSupervisor = isSupervisor;
          // this.enfDetails = enforcementDetails;

          // Apply security after all data is loaded

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

    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType).then(() => {
      this.registerMasterPageControlEvents();
    });
  }

  registerMasterPageControlEvents() {

    this.hideCancelBtn = true;

    if (this.isEditModeEnf || this.isCreateEnf) {
      this.hidePublishBtn = true;
      this.hideCancelBtn = false;
    }

    if (this.enfDetails[0].Published) {
      this.hideDeleteBtn = true;
    } else {
      this.hideDeleteBtn = false;
    }

    // if () {
    //   this.hidePublishBtn = true;
    // }

    if (this.enf.IsDeleted) {
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
        console.log('Enforcement Details Reloaded:', this.enfDetails);
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
    return this.isCreateEnf ? this.createEnfObj.FirmID : this.enfDetails[0]?.FirmID;
  }

  set firmName(value: number) {
    if (this.isCreateEnf) {
      this.createEnfObj.FirmID = value;
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
          console.log('Published/Unpublished successfully: ', publishObj);
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
    this.isEditModeEnf = true;

    // Populate dropdowns for options
    this.populateEnfActionsAuth();
    this.populateEnfActionsDNFBP();
    this.populateFirmNamesAuthorised();
    this.populateFirmNamesDNFBP();

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
          id: ind.ContactID,
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
    this.showIndividualsDropdown = false; // Reset visibility of dropdown
    this.selectedIndividualId = 0; // Reset selected individual

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
          id: individual.ContactID,
          name: individual.FullName
        }));
        this.showIndividualsDropdown = true; // Show dropdown
      });
    }
    else {
      this.showIndividualsDropdown = false; // Hide dropdown for other types
      this.selectedIndividualId = this.enfDetails[0]?.EnforcementActionOnTypeID
    }
  }

  async validateEnforcement(): Promise<boolean> {
    this.hasValidationErrors = false;

    // Validate Enf Entry Type
    if (this.enfTypeID === 0) {
      this.loadErrorMessages('enfTypeID', 1200,'Action On');
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['enfTypeID'];
    }

    // const entryDate = this.isCreateJournal ? this.createJournalObj.EntryDate : this.journalDetails[0].EntryDate;

    // Validate Action Date From
    if (this.supervisionService.isNullOrEmpty(this.actionDateFrom)) {
      this.loadErrorMessages('actionDateFrom', constants.InvoicesMessages.INVALID_DATA,'Action Effective From');
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['actionDateFrom'];
    }

    if (this.supervisionService.isNullOrEmpty(this.typeOfAction.trim())) {
      this.loadErrorMessages('typeOfAction', 1200,'Type of Action');
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['typeOfAction'];
    }

    if (this.firmName === 0) {
      this.loadErrorMessages('firmName', 1200,'Firm Name');
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['firmName'];
    }

    if (this.selectedIndividualId === 0 && this.enfTypeID !== 0) {
      this.loadErrorMessages('individual', 1200,'Individual');
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['individual'];
    }

    return !this.hasValidationErrors;
  }


  async saveEnf() {

    // Validate before saving
    const isValid = await this.validateEnforcement();

    console.log('Validation result:', isValid); // Debug log

    if (!isValid) {
      this.firmDetailsService.showErrorAlert(constants.MessagesLogForm.ENTER_REQUIREDFIELD_PRIORSAVING);
      this.isLoading = false;
      return; // Prevent further action if validation fails or the user cancels
    }

    const enfObj = this.prepareEnfObj();

    this.enfService.saveEnforcement(enfObj).subscribe({
      next: () => {
        console.log('saved successfully: ', enfObj);
        this.isEditModeEnf = false;
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
      appIndividualName: this.enfDetails[0].AppIndividualName,
      enforcementActionOnTypeID: this.enfTypeID,
      enforcementActionOnTypeDesc: this.enfDetails[0].EnforcementActionOnTypeDesc,
      enforcementActionOnDate: null,
      enforcementActionFromDate: this.actionDateFrom,
      enforcementActionToDate: this.actionDateTo,
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
      opType: "U",
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
      console.log('Saved successfully: ', deleteEnfObj);
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

  populateFirmTypes() {
    this.supervisionService.populateFirmTypes(this.userId, constants.ObjectOpType.Create).subscribe(
      firmTypes => {
        this.allFirmTypes = firmTypes;
      },
      error => {
        console.error('Error fetching Firm Types: ', error);
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
        this.allRequiredIndividuals = types.response;
      }, error => {
        console.error('Error Fetching Required Individuals: ', error);
      })
    );
  }

  populateApprovedIndividuals(): Observable<any> {
    return this.journalService.getAllApprovedIndividuals(this.firmId).pipe(
      tap((types) => {
        this.allApprovedIndividuals = types.response;
      }, error => {
        console.error('Error Fetching Approved Individuals: ', error);
      })
    );
  }

  populateRelatedIndividuals(): Observable<any> {
    return this.enfService.getAllRelatedIndividuals(this.firmId, this.firmDetails.FirmTypeID).pipe(
      tap((types) => {
        this.allRelatedIndividuals = types.response;
      }, error => {
        console.error('Error Fetching Related Individuals: ', error);
      })
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
}
