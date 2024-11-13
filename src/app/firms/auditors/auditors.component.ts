import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from 'src/app/ngServices/security.service';
import Swal from 'sweetalert2';
import { FirmService } from '../firm.service';
import { FirmDetailsService } from '../firmsDetails.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { ParententityService } from 'src/app/ngServices/parententity.service';
import * as constants from 'src/app/app-constants';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';

@Component({
  selector: 'app-auditors',
  templateUrl: './auditors.component.html',
  styleUrls: ['./auditors.component.scss','../firms.scss']
})
export class AuditorsComponent {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  userId = 30; // Replace with dynamic userId as needed
  firmId: number = 0;
  errorMessages: { [key: string]: string } = {};
  IsViewAuditorVisible: boolean = false;
  IsCreateAuditorVisible: boolean = false;
  IsEditAuditorVisible: boolean = false;
  firmDetails: any;
  canAddNewAddress: boolean = true;
  disableAddressFields: boolean = false;
  isFirmLicensed: boolean;
  isFirmAuthorised: boolean;
  selectedAuditor: any = {};
  categorizedData = [];
  selectedAuditorNameFromSelectBox: string = 'select';
  initialized = false;
  FIRMAuditors: any[] = [];
  showInactiveAuditors = false;
  hasValidationErrors: boolean = false;
  loading: boolean;
  isLoading: boolean = false;
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  firmAuditorName: { OtherEntityID: number, OtherEntityName: string }[] = [];
  firmAuditorType: { EntitySubTypeID: number, EntitySubTypeDesc: string }[] = [];
  objectOpTypeIdEdit = 41;
  objectOpTypeIdCreate = 40;
  assignedUserRoles: any = [];


  constructor(
    private securityService: SecurityService,
    private router: Router,
    private route: ActivatedRoute,
    private firmService: FirmService,
    private firmDetailsService: FirmDetailsService,
    private dateUtilService: DateUtilService,
    private flatpickrService: FlatpickrService
  ) {

  }

  ngOnInit(): void {
    this.firmService.scrollToTop();
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadFirmDetails(this.firmId);
      this.loadAssignedUserRoles(this.userId);
      if (this.FIRMAuditors.length === 0) {
        this.loadAuditors();
      }
      this.firmDetailsService.isFirmLicensed$.subscribe(
        (value) => (this.isFirmLicensed = value)
      );
      this.firmDetailsService.isFirmAuthorised$.subscribe(
        (value) => (this.isFirmAuthorised = value)
      );

      this.firmDetailsService.checkFirmLicense(this.firmId);
      this.firmDetailsService.checkFirmAuthorisation(this.firmId);
    })
  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
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

  loadAssignedUserRoles(userId: number): void {
    this.firmDetailsService.loadAssignedUserRoles(userId).subscribe(
      data => {
        this.assignedUserRoles = data.assignedUserRoles;
        console.log('Roles successfully fetched:', this.assignedUserRoles);
      },
      error => {
        console.error(error);
      }
    );
  }

  getFirmAuditorName(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.firmAuditorName, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.firmAuditorName = data.response.filter(item => {
          return isNaN(item.OtherEntityName) && !/\d/.test(item.OtherEntityName);
        });
        console.log("Filtered firmAuditorName", this.firmAuditorName);
      }, error => {
        console.error("Error fetching controller", error);
      });
  }
  getFirmAuditorType(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.firmAuditorType, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.firmAuditorType = data.response;
        console.log("firmAuditorName", data)
      }, error => {
        console.error("Error fetching controller", error);
      });
  }
  viewAuditor(auditor: any) {
    this.selectedAuditor = auditor; // Set the selected auditor
    console.log("selectedAuditor",this.selectedAuditor)
    this.IsViewAuditorVisible = true; // Show view section
    this.IsEditAuditorVisible = false; // Hide edit section
    this.IsCreateAuditorVisible = false; // Hide create section
  }
  closeAuditorPopup() {
    this.selectedAuditor = {}; // Reset the selected auditor object
    this.IsEditAuditorVisible = false; // Hide edit section
    this.IsViewAuditorVisible = false; // Hide view section
    this.IsCreateAuditorVisible = false; // Hide create section
    this.hasValidationErrors = false;
    this.errorMessages = {};
  }
  closecreateAuditor() {
    this.selectedAuditor = {};
    this.IsCreateAuditorVisible = false;
    this.IsViewAuditorVisible = false;
    this.firmAuditorsObj = {};
    this.hasValidationErrors = false;
    this.errorMessages = {};
  }
  editAuditor() {
    this.IsEditAuditorVisible = true; // Show the edit section
    this.IsCreateAuditorVisible = false; // Hide the create section
    this.IsViewAuditorVisible = false; // Hide the view section

    // Fetch dropdown values when entering edit mode
    this.getFirmAuditorName();
    this.getFirmAuditorType();
  }
  EditAuditorValidateForm(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.errorMessages = {};
      this.hasValidationErrors = false;

      // Validate 'EntitySubTypeID'
      if (!this.selectedAuditor.EntitySubTypeID && this.selectedAuditor.EntitySubTypeID === undefined) {
        this.loadErrorMessages('EntitySubTypeID', constants.AuditorsMessages.Select_Auditor_Type);
        this.hasValidationErrors = true;
      }
      if ( this.firmService.isNullOrEmpty(this.selectedAuditor.AssnDateFrom) || this.selectedAuditor.AssnDateFrom === undefined) {
        this.loadErrorMessages('AssnDateFrom', constants.AuditorsMessages.Select_Valid_Data_From);
        this.hasValidationErrors = true;
      }
      if (this.dateUtilService.convertDateToYYYYMMDD(this.selectedAuditor.AssnDateFrom) >= this.dateUtilService.convertDateToYYYYMMDD(this.selectedAuditor.AssnDateTo)) {
        this.loadErrorMessages('AssnDateTo', constants.AuditorsMessages.Select_Valid_Data_From_Later_Than_To);
        this.hasValidationErrors = true;
      }
    });
  }
  firmAuditorsObj: {};
  saveEditAuditor() {
    this.EditAuditorValidateForm();

    // Check if there are any errors
    if (this.hasValidationErrors) {
      this.showError(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.isLoading = false;
      return;
    }
    console.log("selectedAuditor", this.selectedAuditor)
    this.firmAuditorsObj = {
      OtherEntityID: this.selectedAuditor.OtherEntityID,
      CreatedBy: 30,
      RelatedEntityID: this.selectedAuditor.RelatedEntityID, // Yazan ?? 
      EntitySubTypeID: this.selectedAuditor.EntitySubTypeID || 0,
      EntitySubTypeDesc: this.selectedAuditor.EntitySubTypeDesc,
      EntityTypeID: 1,
      RelatedEntityTypeID: 3, // Yazan ??
      RelatedEntityEntityID: this.selectedAuditor.OtherEntityID, // Yazan ?? 
      MyState: 2,
      LastModifiedByOfOtherEntity: 30,
      OtherEntityName: this.selectedAuditor.OtherEntityName || '',
      DateOfIncorporation: "2024-10-02T11:58:32.911Z",
      LegalStatusTypeID: null,
      PlaceOfIncorporation: null,
      CountryOfIncorporation: null,
      RegisteredNumber: null,
      ZebSiteAddress: null,
      LastModifiedDate: this.currentDate,
      lastModifiedBy: 30,
      isAuditor: null,
      isCompanyRegulated: true,
      additionalDetails: null,
      isParentController: true,
      isPublicallyTraded: true,
      areAnyUBOs: true,
      controllerInfo: null,
      output: 0,
      firmId: this.firmId,
      entityTypeID: this.selectedAuditor.EntityTypeID,
      entityID: this.firmId,
      controllerControlTypeID: null,
      numOfShares: 0,
      pctOfShares: 0,
      majorityStockHolder: true,
      assnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.selectedAuditor.AssnDateFrom) || '',
      assnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.selectedAuditor.AssnDateTo) || '',
      ShowEnabled: false,
      ShowReadOnly: false,
      MajorityStockHolder: false,

    }
    console.log("Auditor to be saved", this.firmAuditorsObj)
    this.firmService.savefirmauditors(this.firmAuditorsObj).subscribe(
      (response) => {
        console.log("Auditor saved successfully", response);
        Swal.fire('Saved!', 'Auditors details has been Saved.', 'success');
        this.IsEditAuditorVisible = false;
        this.IsViewAuditorVisible = false;
        this.loadAuditors();
      },
      (error) => {
        console.error("Error saving auditor", error);
        Swal.fire('Error!', 'Error Saving Auditor', 'error');
      }
    );
  }

  showError(messageKey: number) {
    this.firmDetailsService.showErrorAlert(messageKey, this.isLoading);
  }
  
  onAuditorChange(event: any): void {
    const selectedAuditorID = event.target.value;

    if (selectedAuditorID === 'other') {
      this.CreateAuditorObj.OtherEntityName = 'other';
      this.CreateAuditorObj.customAuditorName = ''; // Reset the custom name input
    } else {
      const selectedAuditor = this.firmAuditorName.find(name => name.OtherEntityName === selectedAuditorID);
      this.CreateAuditorObj.OtherEntityName = selectedAuditorID;
      this.CreateAuditorObj.OtherEntityName = selectedAuditor?.OtherEntityName;
      this.CreateAuditorObj.customAuditorName = null; // Clear custom auditor name if not 'other'
    }
  }
  CreateAuditorValidateForm(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.errorMessages = {};
      this.hasValidationErrors = false;
  
      // Map existing auditor names to a lowercase array for case-insensitive comparison
      const existingAuditorNames = this.filteredAuditors
        .map(auditor => auditor.OtherEntityName?.toLowerCase())
        .filter(name => name); // Remove any undefined names
  
      // Validate dropdown selection or custom auditor name
      if (this.CreateAuditorObj.OtherEntityName === 'other') {
        // Custom auditor name validation
        if (!this.CreateAuditorObj.customAuditorName || this.CreateAuditorObj.customAuditorName.trim() === '') {
          this.loadErrorMessages('customAuditorName', constants.AuditorsMessages.Select_Auditor_Name);
          this.hasValidationErrors = true;
        } else if (existingAuditorNames.includes(this.CreateAuditorObj.customAuditorName.toLowerCase())) {
          this.loadErrorMessages('customAuditorName', constants.AuditorsMessages.Selected_Auditor_Name_already_Exsists);
          this.hasValidationErrors = true;
        }
      } else {
        // Directly validate selected auditor name to prevent duplicates
        const selectedAuditorName = this.CreateAuditorObj.OtherEntityName?.toLowerCase();
        
        if (!selectedAuditorName) {
          this.loadErrorMessages('auditorName', constants.AuditorsMessages.Select_Auditor_Name);
          this.hasValidationErrors = true;
        } else if (existingAuditorNames.includes(selectedAuditorName)) {
          this.loadErrorMessages('auditorName', constants.AuditorsMessages.Selected_Auditor_Name_already_Exsists);
          this.hasValidationErrors = true;
        }
      }
  
      // Additional validations (same as before)
      if (!this.CreateAuditorObj.EntitySubTypeID) {
        this.loadErrorMessages('EntitySubTypeID', constants.AuditorsMessages.Select_Auditor_Type);
        this.hasValidationErrors = true;
      }
  
      if (this.firmService.isNullOrEmpty(this.CreateAuditorObj.AssnDateFrom)) {
        this.loadErrorMessages('AssnDateFrom', constants.AuditorsMessages.Select_Valid_Data_From);
        this.hasValidationErrors = true;
      }
  
      if (this.CreateAuditorObj.AssnDateTo && 
          this.dateUtilService.convertDateToYYYYMMDD(this.CreateAuditorObj.AssnDateFrom) >= this.dateUtilService.convertDateToYYYYMMDD(this.CreateAuditorObj.AssnDateTo)) {
        this.loadErrorMessages('AssnDateTo', constants.AuditorsMessages.Select_Valid_Data_From_Later_Than_To);
        this.hasValidationErrors = true;
      }
  
      // Resolve or reject the promise based on validation results
      if (this.hasValidationErrors) {
        reject();
      } else {
        resolve();
      }
    });
  }
  
  // CreateAuditorValidateForm(): Promise<void> {
  //   return new Promise<void>((resolve, reject) => {
  //     this.errorMessages = {};
  //     this.hasValidationErrors = false; 

  //     if (this.selectedAuditor.OtherEntityID === 'other') {
  //       if (!this.selectedAuditor.customAuditorName || this.selectedAuditor.customAuditorName.trim() === '') {
  //         this.loadErrorMessages('customAuditorName', constants.AuditorsMessages.Select_Auditor_Name);
  //         this.hasValidationErrors = true;
  //       } else if (
  //         this.FIRMAuditors.some(
  //           auditor => auditor.OtherEntityName?.toLowerCase() === this.selectedAuditor.customAuditorName?.toLowerCase()
  //         )
  //       ) {
  //         this.loadErrorMessages('customAuditorName', constants.AuditorsMessages.Selected_Auditor_Name_already_Exsists);
  //         this.hasValidationErrors = true;
  //       }
  //     } else {
  //       if (!this.selectedAuditor.OtherEntityID) {
  //         this.loadErrorMessages('OtherEntityName', constants.AuditorsMessages.Select_Auditor_Name);
  //         this.hasValidationErrors = true;
  //       }
  //     }
  //     // Validate 'EntitySubTypeID'
  //     if (!this.selectedAuditor.EntitySubTypeID && this.selectedAuditor.EntitySubTypeID === undefined) {
  //       this.loadErrorMessages('EntitySubTypeID', constants.AuditorsMessages.Select_Auditor_Type);
  //       this.hasValidationErrors = true;
  //     }
  //     if ( this.firmService.isNullOrEmpty(this.selectedAuditor.AssnDateFrom) || this.selectedAuditor.AssnDateFrom === undefined) {
  //       this.loadErrorMessages('AssnDateFrom', constants.AuditorsMessages.Select_Valid_Data_From);
  //       this.hasValidationErrors = true;
  //     }
  //     if (this.dateUtilService.convertDateToYYYYMMDD(this.selectedAuditor.AssnDateFrom) >= this.dateUtilService.convertDateToYYYYMMDD(this.selectedAuditor.AssnDateTo)) {
  //       this.loadErrorMessages('AssnDateTo', constants.AuditorsMessages.Select_Valid_Data_From_Later_Than_To);
  //       this.hasValidationErrors = true;
  //     }
  //   });
  // }
  CreateAuditorObj = {
    CreatedBy: this.userId,
    EntitySubTypeID: 0,
    EntitySubTypeDesc: "",
    RelatedEntityEntityID: null,
    MyState: 2,
    LastModifiedByOfOtherEntity: this.userId,
    OtherEntityName: "",
    DateOfIncorporation: null,
    LegalStatusTypeID: null,
    PlaceOfIncorporation: null,
    CountryOfIncorporation: null,
    RegisteredNumber: null,
    ZebSiteAddress: null,
    LastModifiedDate: this.currentDate,
    lastModifiedBy: this.userId,
    relatedEntityTypeID: 3,
    IsAuditor: 2,
    isCompanyRegulated: true,
    additionalDetails: null,
    isParentController: true,
    isPublicallyTraded: true,
    areAnyUBOs: true,
    controllerInfo: null,
    output: 0,
    firmId: this.firmId,
    EntityTypeID: 1,
    entityID: this.firmId,
    controllerControlTypeID: null,
    customAuditorName:'',
    numOfShares: 0,
    pctOfShares: 0,
    majorityStockHolder: true,
    AssnDateFrom: "",
    AssnDateTo:"",
    LastModifiedByOfRelatedEntity: this.userId,
  }
  saveCreateAuditor() {
    try {
      // Wait for validation to complete
      this.CreateAuditorValidateForm();

      // Check if there are any errors
      if (this.hasValidationErrors) {
        this.showError(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
        this.isLoading = false;
        return;
      }
      // If no validation errors, proceed to save the auditor
      this.firmAuditorsObj = {
        OtherEntityID: null,
        CreatedBy: this.userId,
        RelatedEntityID: null,
        EntitySubTypeID: this.CreateAuditorObj.EntitySubTypeID,
        EntitySubTypeDesc: this.CreateAuditorObj.EntitySubTypeDesc,
        RelatedEntityEntityID: null,
        MyState: 2,
        LastModifiedByOfOtherEntity: 30,
        OtherEntityName: this.CreateAuditorObj.OtherEntityName === 'other' ? this.CreateAuditorObj.customAuditorName : this.CreateAuditorObj.OtherEntityName,
        DateOfIncorporation: null,
        LegalStatusTypeID: null,
        PlaceOfIncorporation: null,
        CountryOfIncorporation: null,
        RegisteredNumber: null,
        ZebSiteAddress: null,
        LastModifiedDate: this.currentDate,
        lastModifiedBy: this.userId,
        relatedEntityTypeID: 3,
        IsAuditor: 2,
        isCompanyRegulated: true,
        additionalDetails: null,
        isParentController: true,
        isPublicallyTraded: true,
        areAnyUBOs: true,
        controllerInfo: null,
        output: 0,
        firmId: this.firmId,
        EntityTypeID: 1,
        entityID: this.firmId,
        controllerControlTypeID: null,
        numOfShares: 0,
        pctOfShares: 0,
        majorityStockHolder: true,
        assnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.CreateAuditorObj.AssnDateFrom),
        assnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.CreateAuditorObj.AssnDateTo),
        LastModifiedByOfRelatedEntity: 30,
      };
      console.log("selectedAuditor.OtherEntityName:", this.selectedAuditor.OtherEntityName, this.selectedAuditor.customAuditorName)
      console.log("Auditor to be created", this.firmAuditorsObj);

      // Call the save function
      this.firmService.savefirmauditors(this.firmAuditorsObj).subscribe(
        (response) => {
          console.log("Auditor saved successfully", response);
          Swal.fire('Saved!', 'Auditors details have been saved.', 'success');
          this.IsEditAuditorVisible = false;
          this.IsViewAuditorVisible = false;
          this.IsCreateAuditorVisible = false;
          this.loadAuditors();
        },
        (error) => {
          console.error("Error saving auditor", error);
          Swal.fire('Error!', 'Error Saving Auditor', 'error');
        }
      );
    } catch (error) {
      // Handle validation errors
      Swal.fire('Error!', 'Please fix the validation errors before submitting.', 'error');
    }
  }

  cancelEdit() {
    this.IsEditAuditorVisible = false;
    this.IsViewAuditorVisible = true;
  }
  createAuditor() {
    this.selectedAuditor = {};
    this.IsCreateAuditorVisible = true;
    this.IsEditAuditorVisible = false;
    this.IsViewAuditorVisible = false;
    this.getFirmAuditorName();
    this.getFirmAuditorType();
  }

  confirmDeleteAuditor() {
    Swal.fire({
      html: 'No history will be maintained for the record being deleted. If you wish to maintain history, please click "Cancel", specify a date for the "Effective To Date" field and save the data.',
      showCancelButton: true,
      confirmButtonColor: '#a51e36',
      cancelButtonColor: '#a51e36',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'custom-swal-width', // Class for custom width
      }

    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteAuditor(); // Call delete logic if OK is clicked
        this.loadAuditors();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Do something if Cancel is clicked, if needed
        console.log('Cancelled deletion');
      }
    });
  }

  // Delete auditor logic
  deleteAuditor() {
    this.firmAuditorsObj = {
      otherEntityID: this.selectedAuditor.OtherEntityID,
      createdBy: 30,
      relatedEntityID: this.selectedAuditor.RelatedEntityID,
      entitySubTypeID: this.selectedAuditor.EntitySubTypeID,
      relatedEntityTypeID: 0,
      relatedEntityEntityID: 0,
      myState: 4,
      otherEntityName: this.selectedAuditor.OtherEntityName,
      dateOfIncorporation: "2024-10-02T11:58:32.911Z",
      legalStatusTypeID: 0,
      placeOfIncorporation: null,
      countryOfIncorporation: 0,
      registeredNumber: null,
      zebSiteAddress: null,
      lastModifiedBy: 0,
      isAuditor: 0,
      isCompanyRegulated: true,
      additionalDetails: null,
      isParentController: true,
      isPublicallyTraded: true,
      areAnyUBOs: true,
      controllerInfo: null,
      output: 0,
      firmId: this.firmId,
      entityTypeID: 0,
      entityID: 0,
      controllerControlTypeID: 0,
      numOfShares: 0,
      pctOfShares: 0,
      majorityStockHolder: true,
      assnDateFrom: "2024-10-02T11:58:32.911Z",
      assnDateTo: "2024-10-02T11:58:32.911Z"
    }
    this.firmService.savefirmauditors(this.firmAuditorsObj).subscribe(
      (response) => {
        console.log("Auditor Deleted successfully", response);
        Swal.fire('Deleted!', 'Auditors details has been Deleted.', 'success');
        this.IsEditAuditorVisible = false;
        this.IsViewAuditorVisible = false;
        this.loadAuditors();
      },
      (error) => {
        console.error("Error Deleteing auditor", error);
        Swal.fire('Error!', 'Error Deleteing Auditor', 'error');
      }
    );
  }

  loadAuditors() {
    this.isLoading = true;
    this.firmService.getFIRMAuditors(this.firmId).subscribe(
      data => {
        this.FIRMAuditors = data.response;
        console.log('Firm Auditors details:', this.FIRMAuditors);
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching firm details', error);
        this.isLoading = false;
      }
    );
  }
  get filteredAuditors() {
    if (this.showInactiveAuditors) {
      return this.FIRMAuditors;
    } else {
      return this.FIRMAuditors.filter(auditor => {
        const assnDateTo = auditor.AssnDateTo ? new Date(auditor.AssnDateTo) : null;
        const currentDate = new Date(this.currentDate);
  
        // Include active records if AssnDateTo is null or if it is in the future
        return !assnDateTo || assnDateTo.getTime() >= currentDate.getTime();
      });
    }
  }
  
  onInactiveAuditorsToggle(event: Event) {
    this.showInactiveAuditors = (event.target as HTMLInputElement).checked;
  }

  loadErrorMessages(fieldName: string, msgKey: number, placeholderValue?: string) {
    this.firmDetailsService.getErrorMessages(fieldName, msgKey, null, null, placeholderValue).subscribe(
      () => {
        this.errorMessages[fieldName] = this.firmDetailsService.errorMessages[fieldName];
        console.log(`Error message for ${fieldName} loaded successfully`);
      },
      error => {
        console.error(`Error loading error message for ${fieldName}:`, error);
      }
    );
  }

}
