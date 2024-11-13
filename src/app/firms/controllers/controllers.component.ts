import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { EntityType, FrimsObject, FunctionType, ObjectOpType } from 'src/app/app-constants';
import { FirmService } from '../firm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from 'src/app/ngServices/security.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { FirmDetailsService } from '../firmsDetails.service';
import * as constants from 'src/app/app-constants';
import { ControllersService } from 'src/app/ngServices/controllers.service';
import { ContactService } from 'src/app/ngServices/contact.service';
import { ParententityService } from 'src/app/ngServices/parententity.service';
import { AddressesService } from 'src/app/ngServices/addresses.service';
import Swal from 'sweetalert2';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { forkJoin, tap } from 'rxjs';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss', '../firms.scss']
})
export class ControllersComponent implements OnInit {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  Page = FrimsObject;
  ControllerType = EntityType;
  // FunctionType = FunctionType;
  firmDetails: any;
  userId = 30;
  isLoading: boolean = false;
  firmId: number = 0;
  FIRMControllers: any[] = [];
  FIRMControllersIndividual: any[] = [];
  errorMessages: { [key: string]: string } = {};
  hasValidationErrors: boolean = false;
  /* current date */
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  isEditModeController: boolean = false;
  AllRegulater: any = [];
  Address: any = {};
  allCountries: any = [];
  hideForms: boolean = true;
  selectedController: any;
  selectedIndividualController: any = [];
  isPopupOpen = false;
  showCreateControllerSection: boolean = false;
  CorporateControllerEdit: any[] = [];
  legalStatusOptionsEdit: any[] = [];
  legalStatusOptionsCreate: any[] = [];
  establishmentOptionsEdit: any[] = [];
  controlTypeOptionsEdit: any[] = [];
  controlTypeOptionsCreate: any[] = [];
  controllerTypeOption: any = [];
  countryOptionsCreate: any[] = [];
  addressTypeOptionsEdit: any[] = [];
  Titles: any[] = [];


  // Addresses
  callAddressType: boolean = false;
  invalidAddress: boolean;
  ControllerCorporateAddresses: any = [];
  ControllerIndividualAddresses: any = [];
  existingAddresses: any = [];

  existingControllerCorporateAddresses: any = [];
  existingControllerIndividualAddresses: any = [];
  controllerFirmAddressesTypeHistory: any = [];
  allAddressTypes: any = [];
  allContactAddressTypes: any = [];
  currentAddressTypes: any = [];
  removedAddresses = [];
  defaultAddress = this.createDefaultAddress();
  // used variables on edit mode
  newAddressOnEdit: any = {};
  canAddNewAddressOnEdit: boolean = true;
  disableAddressFieldsOnEdit: boolean = false;
  isAllAddressesAddedOnEdit: boolean;


  // used variables on create mode
  addedAddresses: any = []; // Array will hold the newly added addresses
  canAddNewAddressOnCreate: boolean = true;
  isAllAddressesAddedOnCreate: boolean;

  // regulator
  regulatorList: any = [];
  newRegulator: any = {};
  existingRegulatorList: any = [];
  removedRegulators: any = [];
  invalidRegulator: boolean;

  objectOpTypeIdEdit = 41;
  objectOpTypeIdCreate = 40;

  // Security
  assignedUserRoles: any = [];
  assignedLevelUsers: any = [];
  FirmAMLSupervisor: boolean = false;
  ValidFirmSupervisor: boolean = false;
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;


  constructor(
    private securityService: SecurityService,
    private router: Router,
    private route: ActivatedRoute,
    private firmService: FirmService,
    private firmDetailsService: FirmDetailsService,
    private dateUtilService: DateUtilService,
    private controllerService: ControllersService,
    private contactService: ContactService,
    private parentEntity: ParententityService,
    private addressService: AddressesService,
    private cdr: ChangeDetectorRef,
    private flatpickrService: FlatpickrService
  ) {

  }

  ngOnInit(): void {
    this.firmService.scrollToTop();
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadFirmDetails(this.firmId);
      if (this.FIRMControllers.length === 0) {
        this.loadControllers();
        this.loadControllersIndividual();
      }
      this.populateCountries();
      this.getlegalStatusController();
      this.getlegalStatusControllerCreate()
      this.getCorporateController();
      this.getControllerControlTypesCreate();
      this.getTitleCreate();
      this.getAddressTypesControllerCreate();
      this.getlegalStatusControllerCreate();
      console.log('Initial isEditModeController:', this.isEditModeController);
      console.log('Initial canAddNewAddressOnEdit:', this.canAddNewAddressOnEdit);
      
      // Security
      forkJoin([
        this.firmDetailsService.loadAssignedUserRoles(this.userId),
        this.firmDetailsService.loadAssignedLevelUsers(),
        this.isValidFirmSupervisor(),
        this.isValidFirmAMLSupervisor(),
      ]).subscribe({
        next: ([userRoles, levelUsers]) => {
          // Assign the results to component properties
          this.assignedUserRoles = userRoles;
          this.assignedLevelUsers = levelUsers;

          this.applySecurityOnPage(this.Page.Controller, this.isEditModeController);
        },
        error: (err) => {
          console.error('Error loading user roles or level users:', err);
        }
      });
    })

  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }

  applySecurityOnPage(objectId: FrimsObject, Mode: boolean) {
    this.isLoading = true;
    const currentOpType = Mode ? ObjectOpType.Edit : ObjectOpType.ListView;

    // Apply backend permissions for the current object (e.g., CoreDetail or Scope)
    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType).then(() => {
      let firmType = this.firmDetails?.FirmTypeID;


      if (this.ValidFirmSupervisor) {
        this.isLoading = false;
        return; // No need to hide the button for Firm supervisor
      } else if (this.firmDetailsService.isValidRSGMember()) {
        this.isLoading = false;
        return; // No need to hide the button for RSG Member
      } else if (this.FirmAMLSupervisor || this.firmDetailsService.isValidAMLDirector()) {
        if (firmType === 1) {
          this.hideActionButton(); // Hide button for AML Team
        }
      } else {
        this.hideActionButton(); // Default: hide the button
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


  getAllRegulater(firmId: number, countryID: number, regulatorArray: any[], callback?: () => void): void {
    if (countryID === 0) {
      this.securityService.getObjectTypeTable(constants.Regulaters)
        .subscribe(data => {
          this.AllRegulater = data.response;  // Store dropdown options separately
          console.log("General Regulators fetched:", data);

          // Reset selected regulator if it no longer exists in AllRegulater
          this.resetSelectedRegulatorIfNotFound(regulatorArray);

          if (callback) callback();
        }, error => {
          console.error("Error fetching Regulators:", error);
        });
    } else {
      this.parentEntity.getRegulatorsByCountry(firmId, countryID)
        .subscribe(data => {
          this.AllRegulater = data.response;  // Store dropdown options separately
          console.log("Country-specific Regulators fetched:", data);

          // Reset selected regulator if it no longer exists in AllRegulater
          this.resetSelectedRegulatorIfNotFound(regulatorArray);

          if (callback) callback();
        }, error => {
          console.error("Error fetching Country-specific Regulators:", error);
        });
    }
  }




  resetSelectedRegulatorIfNotFound(targetArray: any[]): void {
    targetArray.forEach(regulator => {
      const selectedRegulatorID = regulator.RegulatorID;

      // Check if the current RegulatorID exists in the new AllRegulater list
      const regulatorExists = this.AllRegulater.some(r => r.RegulatorID === selectedRegulatorID);

      if (!regulatorExists) {
        // Reset to default "Select" option by setting RegulatorID to 0
        regulator.RegulatorID = 0;
      }
    });
  }




  createDefaultRegulator() {
    return {
      RegulatorID: 0,
      RegulatorName: '',
      RegulatorContact: '',
    }
  }

  addRegulator(regulatorArray: any[]): void {
    const newRegulator = {
      RegulatorID: 0,
      RegulatorName: '',
      RegulatorContact: '',
    };

    regulatorArray.unshift(newRegulator); // Add new regulator at the beginning
  }

  removeRegulator(regulatorArray: any[], index: number, isEditMode: boolean): void {
    if (isEditMode && regulatorArray[index].RegulatorID) {
      // Mark as removed if in edit mode
      const regulator = regulatorArray[index];
      regulator.isRemoved = true;
      this.removedRegulators.push(regulator);
      regulatorArray.splice(index, 1);
    } else {
      // Remove regulator from array if in create mode or if it's a new regulator in edit mode
      regulatorArray.splice(index, 1);
    }
  }


  updateRegulators(countryID: number, regulatorArray: any[], isRegulated: boolean): void {
    if (isRegulated) {
      // Fetch regulators based on the country and add a default regulator if needed
      this.getAllRegulater(this.firmId, countryID, regulatorArray, () => {
        if (regulatorArray.length === 0) {
          this.addRegulator(regulatorArray);
        }
      });
    } else {
      // Clear the list if regulation is set to "No"
      regulatorArray.length = 0;
    }
  }

  onRegulationChange(regulatorArray: any[], isEditMode: boolean): void {
    const details = isEditMode ? this.selectedController : this.CreatecontrollerDetails;

    this.updateRegulators(
      details.CountryOfIncorporation,
      regulatorArray,
      details.IsCompanyRegulated
    );

    // Add a regulator if required
    if (details.IsCompanyRegulated && regulatorArray.length === 0) {
      this.addRegulator(regulatorArray);
    }
  }

  onCountryChange(countryID: number, regulatorArray: any[], isEditMode: boolean): void {
    const details = isEditMode ? this.selectedController : this.CreatecontrollerDetails;

    this.updateRegulators(
      countryID,
      regulatorArray,
      details.IsCompanyRegulated
    );

    // Reset selected regulator to "Select" on country change
    regulatorArray.forEach(reg => reg.RegulatorID = 0);
  }


  createControllerPopupChanges(): void {
    this.isLoading = true;
    console.log("CreatecontrollerDetails", this.CreatecontrollerDetails)
    this.CreateControllerValidateForm();

    // Check if there are any errors
    if (this.hasValidationErrors) {
      this.firmDetailsService.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.isLoading = false;
      return;
    }
    console.log("Selected Controller:", this.CreatecontrollerDetails.EntityTypeDesc);
    if (
      [constants.EntityType.ParentEntity, constants.EntityType.CorporateController, constants.EntityType.Head_Office, constants.EntityType.UBO_Corporate].includes(this.CreatecontrollerDetails.EntityTypeID)
    ) {
      const saveControllerPopupChangesObj = {
        otherEntityDetails: {
          otherEntityID: null,
          createdBy: this.userId,
          relatedEntityID: null,
          entitySubTypeID: null,
          relatedEntityTypeID: this.CreatecontrollerDetails.EntityTypeID,
          relatedEntityEntityID: null,
          myState: 2,
          otherEntityName: this.CreatecontrollerDetails.OtherEntityName,
          dateOfIncorporation: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
          legalStatusTypeID: this.CreatecontrollerDetails.LegalStatusTypeID === 0 ? null : this.CreatecontrollerDetails.LegalStatusTypeID,
          placeOfIncorporation: null,
          countryOfIncorporation: this.CreatecontrollerDetails.CountryOfIncorporation,
          registeredNumber: this.CreatecontrollerDetails.RegisteredNum,
          WebSiteAddress: null,
          lastModifiedBy: this.userId,
          isAuditor: null,
          isCompanyRegulated: this.CreatecontrollerDetails.IsCompanyRegulated,
          additionalDetails: this.CreatecontrollerDetails.AdditionalDetails,
          isParentController: this.CreatecontrollerDetails.IsParentController,
          isPublicallyTraded: this.CreatecontrollerDetails.IsPublicallyTraded,
          areAnyUBOs: this.CreatecontrollerDetails.More10UBOs,
          controllerInfo: this.CreatecontrollerDetails.ControllerInfo, // not integrated in the form
          output: 0,
          firmId: this.firmId,
          entityTypeID: this.CreatecontrollerDetails.EntityTypeID,
          entityID: this.firmId, // not integrated in the form
          controllerControlTypeID: this.CreatecontrollerDetails.ControllerControlTypeID,
          numOfShares: this.CreatecontrollerDetails.NumOfShares,
          pctOfShares: this.CreatecontrollerDetails.ControllerControlTypeID === 1 ? this.CreatecontrollerDetails.PctOfShares : null,
          majorityStockHolder: false, // not integrated in the form
          assnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom),
          assnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo)
        },
        addressList: this.addedAddresses.map(address => ({
          firmID: this.firmId,
          countryID: Number(address.CountryID) || 0,
          addressTypeID: address.AddressTypeID || 0,
          sameAsTypeID: address.SameAsTypeID || null,
          lastModifiedBy: this.userId, // must be dynamic
          addressAssnID: address.AddressAssnID || null,
          entityTypeID: address.EntityTypeID || 1,
          entityID: address.EntityID || this.firmId,
          contactAssnID: 0,
          contactID: 0,
          addressID: address.AddressID?.toString() || '',
          addressLine1: address.AddressLine1 || '',
          addressLine2: address.AddressLine2 || '',
          addressLine3: address.AddressLine3 || '',
          addressLine4: address.AddressLine4 || '',
          city: address.City || '',
          province: address.Province || '',
          postalCode: address.PostalCode || '',
          phoneNumber: address.PhoneNumber || '',
          phoneExt: address.PhoneExt || '',
          faxNumber: address.FaxNumber || '',
          lastModifiedDate: this.currentDate,
          addressState: 2, // New address state is 2, existing modified or unchanged is 6, 4 is delete
          fromDate: address.FromDate || null,
          toDate: address.ToDate || null,
          objectID: address.ObjectID || this.Page.Controller,
          objectInstanceID: address.ObjectInstanceID || this.firmId,
          objectInstanceRevNumber: address.ObjectInstanceRevNumber || 1,
          sourceObjectID: address.SourceObjectID || this.Page.Controller,
          sourceObjectInstanceID: address.SourceObjectInstanceID || this.firmId,
          sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNumber || 1,
          objAis: null,
        })),

        regulatorList: this.CreatecontrollerDetails.IsCompanyRegulated ? this.regulatorList.map(regulator => ({
          regulatorState: 2, // add new regulator
          regulatorID: regulator.RegulatorID,
          entityTypeID: this.CreatecontrollerDetails.EntityTypeID, // controller type
          entityID: null,
          relatedEntityTypeID: 5, // constant
          relatedEntityID: null,
          contactAssnID: null
        })) : []
      };
      console.log("Controller to be saved", saveControllerPopupChangesObj)
      // Call the insert/update endpoint
      this.controllerService.insertupdateotherentitydetails(saveControllerPopupChangesObj).subscribe(
        response => {
          console.log("Save successful:", response);
          this.showCreateControllerSection = false;
          this.isLoading = false;
          this.loadControllers();
          this.loadControllersIndividual();
          this.applySecurityOnPage(this.Page.Controller, this.isEditModeController);
          this.firmDetailsService.showSaveSuccessAlert(constants.ControllerMessages.RECORD_INSERTED);
        },
        error => {
          console.error("Error saving changes:", error);
          this.isLoading = false;
        }
      );

    }
    else if (
      [constants.EntityType.IndividualController, constants.EntityType.UBO_Individual].includes(this.CreatecontrollerDetails.EntityTypeID)
    ) {

      let functionTypeId;

      if (this.CreatecontrollerDetails.EntityTypeID === constants.EntityType.UBO_Individual) {
        functionTypeId = FunctionType.UBO_IndividualController;
      } else if (this.CreatecontrollerDetails.EntityTypeID === constants.EntityType.IndividualController) {
        functionTypeId = FunctionType.IndividualController;
      } 

      const saveControllerPopupChangesIndividualObj = {
        contactDetails: {
          contactDetails: {
            firmID: this.firmId,
            contactID: null,
            contactAssnID: null,
            title: this.CreatecontrollerDetails.Title,
            firstName: this.CreatecontrollerDetails.FirstName,
            secondName: this.CreatecontrollerDetails.SecondName,
            thirdName: null,
            familyName: this.CreatecontrollerDetails.FamilyName,
            countryOfResidence: null,
            createdBy: this.userId,
            dateOfBirth: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.DateOfBirth),
            fullName: null,
            lastModifiedBy: this.userId,
            nationalID: null,
            nationality: null,
            passportNum: this.CreatecontrollerDetails.PassportNum,
            placeOfBirth: this.CreatecontrollerDetails.PlaceOfBirth,
            previousName: null,
            isExists: null,
            nameInPassport: null,
            contactAddnlInfoTypeID: null,
            isFromContact: null,
            countryofBirth: null,
            juridictionID: null,
            objectID: this.Page.Controller,
            isPeP: this.CreatecontrollerDetails.isPEP,
            entityTypeID: constants.EntityType.Firm,
            contactTypeId: null,
            functionTypeId: functionTypeId,
            mobileNum: null,
            busEmail: null,
            otherEmail: null,
            contactMethodTypeID: null,
            entityID: this.firmId,
            entitySubTypeID: null, //check
            numOfShares: null,
            pctOfShares: this.CreatecontrollerDetails.ControllerControlTypeID === 1 ? this.CreatecontrollerDetails.PctOfShares : null,
            majorityStockHolder: false,
            assnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom),
            assnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo),
            controllerControlTypeID: this.CreatecontrollerDetails.ControllerControlTypeID,
            jobTitle: null,
            nameAsInPassport: null,
            busPhone: null,
            residencePhone: null,
            fax: null,
            qfcNumber: null,
            isContactSelected: true,
            isIndividualRegulated: true,
            additionalDetails: this.CreatecontrollerDetails.AdditionalDetails,
            ipAddress: null,
            ainId: null,
            ainNumber: null,
            applicationID: null,
            docID: null,
            dateRecieved: null,
            formProcessor: null,
            comment: null,
            condApprovalReasonTypeID: null,
            reasonForDelayInFiling: null,
            residentStatus: null,
            isOrdinarilyResident: null,
            applFeeReceived: null,
            applFeeComment: null,
            wcfAddnlInfo: null,
            placeOfBirthCountryID: null,
            jurisdictionId: this.CreatecontrollerDetails.jurisdictionOfIssue,
            totalIndiustryExperenceYear: null,
            totalIndustryExperenceMonth: null,
            roleExperenceMonth: null,
            roleExperenceYear: null,
            pastPositionFlag: null,
            experience: null,
            appIndividualArrangementTypeID: null,
            otherArrangementTypeDesc: null,
            appIndividualDataID: null,
            pastPositionDesc: null,
            fandPAddnlInfo: null,
            poposedJobTitle: null,
            jobDescription: null,
            cfExercise: null,
            withdrawlReasonDesc: null,
            altArrangementDesc: null,
            competenciesAndExp: null,
            createdDate: this.currentDate,
            lastModifedDate: this.currentDate,
            proposedToQatarDateDays: null,
            proposedToQatarDateMonth: null,
            proposedToQatarDateYear: null
          },
          lstContactFunctions: null,
        },
        addresses: this.addedAddresses.map(address => ({
          firmID: this.firmId,
          countryID: Number(address.CountryID) || 0,
          addressTypeID: address.AddressTypeID || 0,
          sameAsTypeID: address.SameAsTypeID || null,
          lastModifiedBy: this.userId, // must be dynamic
          addressAssnID: address.AddressAssnID || null,
          entityTypeID: address.EntityTypeID || 1,
          entityID: address.EntityID || this.firmId,
          contactAssnID: 0,
          contactID: 0,
          addressID: address.AddressID?.toString() || '',
          addressLine1: address.AddressLine1 || '',
          addressLine2: address.AddressLine2 || '',
          addressLine3: address.AddressLine3 || '',
          addressLine4: address.AddressLine4 || '',
          city: address.City || '',
          province: address.Province || '',
          postalCode: address.PostalCode || '',
          phoneNumber: address.PhoneNumber || '',
          phoneExt: address.PhoneExt || '',
          faxNumber: address.FaxNumber || '',
          lastModifiedDate: this.currentDate,
          addressState: 2, // New address state is 2, existing modified or unchanged is 6, 4 is delete
          fromDate: address.FromDate || null,
          toDate: address.ToDate || null,
          objectID: address.ObjectID || this.Page.Controller,
          objectInstanceID: address.ObjectInstanceID || this.firmId,
          objectInstanceRevNumber: address.ObjectInstanceRevNumber || 1,
          sourceObjectID: address.SourceObjectID || this.Page.Controller,
          sourceObjectInstanceID: address.SourceObjectInstanceID || this.firmId,
          sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNumber || 1,
          objAis: null,
        })),
      };

      this.contactService.saveupdatecontactform(saveControllerPopupChangesIndividualObj).subscribe(
        response => {
          console.log("Contact save successful:", response);
          this.isLoading = false;
          this.isPopupOpen = false;
          this.isEditModeController = false;
          this.loadControllers();
          this.loadControllersIndividual();
          this.firmDetailsService.showSaveSuccessAlert(constants.ControllerMessages.RECORD_INSERTED);
        },
        error => {
          console.error("Error saving contact:", error);
          this.isLoading = false;
        }
      );
    }
    else {
      console.log('Validation errors found:', this.errorMessages);
    }
  }

  CreatecontrollerDetails = Object.assign({}, {
    EntityTypeDesc: '',
    OtherEntityID: 0,
    OtherEntityName: '',
    LegalStatusTypeID: 0,
    PctOfShares: '',
    Title: '',
    FirstName: '',
    SecondName: '',
    FamilyName: '',
    PlaceOfBirth: '',
    DateOfBirth: '',
    PassportNum: '',
    isPEP: true,
    IsPublicallyTraded: false,
    ControllerControlTypeID: 2,
    RegisteredNum: '',
    ControllerControlTypeDesc: '',
    HoldingsPercentage: '',
    EffectiveDate: '',
    CessationDate: '',
    More10UBOs: true,
    IsParentController: true,
    AssnDateFrom: '',
    AssnDateTo: '',
    IsCompanyRegulated: false,
    LegalStatusTypeDesc: '',
    CountryName: '',
    AdditionalDetails: '',
    LastModifiedByOfOtherEntities: '',
    LastModifiedDate: '',
    AddressType: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
    city: '',
    stateProvince: '',
    country: '',
    zipPostalCode: '',
    regulator: '',
    RegulatorContact: '',
    CreatedBy: 30,
    RelatedEntityID: 0,
    EntitySubTypeID: null,
    EntityTypeID: 0,
    RelatedEntityEntityID: 0,
    MyState: 2,
    PlaceOfIncorporation: '',
    CountryOfIncorporation: 0,
    webSiteAddress: '',
    IsAuditor: 0,
    ControllerInfo: '',
    FirmID: 0,
    Output: 0,
    NumOfShares: 0,
    CountryID: 0,
    jurisdictionOfIssue: 0,
    AddressTypeID: 0,
    CreatedDate: '',
    EntityID: 0,
    ContactID: 0,
    ObjectID: 0,
    PrefferdMethod: '',
    ContactId: 0,
    ThirdName: '',
    ObjectInstanceID: 0,
    AddressTypeDesc: '',
    StatusDate: '',
    MobilePhone: '',
    businessEmail: '',
    OtherEmail: '',
    RegulatorID: 0,
    PreferredMethodType: '',
    RegulatorName: '',
  });

  CreateControllerValidateForm(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.errorMessages = {}; // Clear previous error messages
      this.hasValidationErrors = false;

      // Validate for "Select" option in Controller Type
      if (this.CreatecontrollerDetails.EntityTypeID === 0) {
        this.loadErrorMessages('EntityTypeName', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
        this.hasValidationErrors = true;
        return;
      }

      // ADDRESS TYPE VALIDATION
      this.invalidAddress = this.addedAddresses.find(address => !address.AddressTypeID || address.AddressTypeID === 0);
      if (this.invalidAddress) {
        this.loadErrorMessages('AddressTypeID', constants.AddressControlMessages.SELECT_ADDRESSTYPE);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['AddressTypeID'];
      }

      // Additional validations for specific entity types
      if ([constants.EntityType.ParentEntity, constants.EntityType.CorporateController, constants.EntityType.Head_Office, constants.EntityType.UBO_Corporate].includes(this.CreatecontrollerDetails.EntityTypeID)) {

        // Validate Full Name of Entity
        if (!this.CreatecontrollerDetails.OtherEntityName) {
          this.loadErrorMessages('OtherEntityName', constants.ControllerMessages.ENTER_OTHER_ENTITY_NAME);
          console.log(constants.ControllerMessages.ENTER_OTHER_ENTITY_NAME);
          this.hasValidationErrors = true;
        }

        // Validate that AssnDateFrom is before AssnDateTo
        if (this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom) >= this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo)) {
          this.loadErrorMessages('AssnDateTo', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
          this.hasValidationErrors = true;
        }

        // Validate Place of Establishment
        if (!this.CreatecontrollerDetails.CountryOfIncorporation) {
          this.loadErrorMessages('PlaceOfEstablishment', constants.ControllerMessages.Select_Place_Establishment);
          this.hasValidationErrors = true;
        }

        // Validate Type of Control
        if (this.CreatecontrollerDetails.ControllerControlTypeID == 0) {
          this.loadErrorMessages('ControllerControlTypeDesc', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
          this.hasValidationErrors = true;
        }

        this.invalidRegulator = this.regulatorList.find(regulator => !regulator.RegulatorID || regulator.RegulatorID === 0);
        if (this.invalidRegulator) {
          // this.loadErrorMessages('RegulatorID',);
          this.errorMessages['RegulatorID'] = 'Please select a value for the "Regulator" field.';
          this.hasValidationErrors = true;
        } else {
          delete this.errorMessages['RegulatorID'];
        }

        // Validate Percentage of Holding
        if (this.CreatecontrollerDetails.PctOfShares && (this.CreatecontrollerDetails.ControllerControlTypeID === 1)) {
          const newPct = parseFloat(this.CreatecontrollerDetails.PctOfShares);

          // Check if the newPct is a valid percentage (0–100)
          if (isNaN(newPct) || newPct < 0 || newPct >= 100) {
            this.loadErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_VALID_PERCENTAGE);
            this.hasValidationErrors = true;
          }
          // If valid, then proceed to check total percentage
          else if (!this.validateTotalPercentage(this.CreatecontrollerDetails.OtherEntityID, newPct)) {
          }
        }

      } else {
        // Additional validations for other entities
        if (!this.CreatecontrollerDetails.FirstName || this.CreatecontrollerDetails.FirstName.trim().length === 0) {
          this.loadErrorMessages('firstName', constants.ControllerMessages.ENTER_FIRSTNAME);
          this.hasValidationErrors = true;
        }

        if (!this.CreatecontrollerDetails.FamilyName || this.CreatecontrollerDetails.FamilyName.trim().length === 0) {
          this.loadErrorMessages('familyName', constants.ControllerMessages.ENTER_FAMILYNAME);
          this.hasValidationErrors = true;
        }

        // Validate Date of Birth
        if (this.firmService.isNullOrEmpty(this.CreatecontrollerDetails.DateOfBirth) || this.CreatecontrollerDetails.DateOfBirth === undefined) {
          this.loadErrorMessages('dateOfBirth', constants.ControllerMessages.ENTER_VALID_BIRTHDATE);
          this.hasValidationErrors = true;
        }

        // Validate Is PEP
        if (this.CreatecontrollerDetails.isPEP === undefined || this.CreatecontrollerDetails.isPEP === null) {
          this.loadErrorMessages('isPEP', constants.ControllerMessages.SELECT_ISPEP, 'Is Politically Exposed Person (PEP)?*');
          this.hasValidationErrors = true;
        }

        // Validate Type of Control
        if (!this.CreatecontrollerDetails.ControllerControlTypeID) {
          this.loadErrorMessages('ControllerControlTypeDesc', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
          this.hasValidationErrors = true;
        }


        // Valdiate Cessation Date greater than Effective Date
        if (!(this.firmService.isNullOrEmpty(this.CreatecontrollerDetails.AssnDateFrom)) && !(this.firmService.isNullOrEmpty(this.CreatecontrollerDetails.AssnDateTo))) {
          if (this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom) >= this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo)) {
            this.loadErrorMessages('AssnDateTo', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
            this.hasValidationErrors = true;
          }
        }

        // Validate Percentage of Holding
        if (this.CreatecontrollerDetails.PctOfShares) {
          const newPct = parseFloat(this.CreatecontrollerDetails.PctOfShares);

          // Check if the newPct is a valid percentage (0–100)
          if (isNaN(newPct) || newPct < 0 || newPct >= 100) {
            this.loadErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_VALID_PERCENTAGE);
            this.hasValidationErrors = true;
          }
          // If valid, then proceed to check total percentage
          else if (!this.validateTotalPercentage(this.CreatecontrollerDetails.OtherEntityID, newPct)) {
          }
        }
      }

      // Resolve or Reject based on Validation Errors
      if (this.hasValidationErrors) {
        resolve(); // Form has errors
      } else {
        resolve(); // Form is valid
      }
    });
  }




  editController(): void {
    this.isEditModeController = true;
    this.applySecurityOnPage(this.Page.Controller, this.isEditModeController);
    this.initializeAddressTypes();
    if (this.selectedController.EntityTypeID === constants.EntityType.ParentEntity ||
      this.selectedController.EntityTypeID === constants.EntityType.CorporateController ||
      this.selectedController.EntityTypeID === constants.EntityType.UBO_Corporate ||
      this.selectedController.EntityTypeID === constants.EntityType.Head_Office)
      this.getAllRegulater(this.firmId, this.selectedController.CountryOfIncorporation, this.existingRegulatorList)
  }

  loadControllers(): void {
    this.isLoading = true;
    this.controllerService.getFIRMControllers(this.firmId).subscribe(
      data => {
        if (data && Array.isArray(data.response)) {
          this.FIRMControllers = data.response.filter(controller =>
            [
              constants.EntityType.ParentEntity,
              constants.EntityType.CorporateController,
              constants.EntityType.Head_Office,
              constants.EntityType.IndividualController,
            ].includes(controller.EntityTypeID)
          );
          console.log('Filtered Firm FIRM Controllers details:', this.FIRMControllers);
          this.isLoading = false;
        } else {
          console.error('Invalid data structure:', data);
          this.FIRMControllers = [];
          this.isLoading = false;
        }
      },
      error => {
        console.error('Error fetching firm controllers', error);
        this.isLoading = false;
      }
    );
  }

  loadControllersIndividual(): void {
    this.isLoading = true;
    this.controllerService.getFIRMControllers(this.firmId).subscribe(
      (data) => {
        console.log('Raw API Data:', data);
        if (Array.isArray(data.response)) {
          this.FIRMControllersIndividual = data.response.filter(controller =>
            [constants.EntityType.UBO_Corporate, constants.EntityType.UBO_Individual].includes(controller.EntityTypeID)
          );
        } else {
          console.error('Data is not an array:', data);
          this.FIRMControllersIndividual = [];
          this.isLoading = false;
        }
        console.log('Filtered Controllers:', this.FIRMControllersIndividual);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching firm controllers', error);
        this.isLoading = false;
      }
    );
  }

  loadControllerCorporateFirmAdresses(entityID: number, entityTypeID: number, userId: number, opTypeId: number): void {
    this.isLoading = true;

    // Fetch firm addresses from the service
    this.addressService.getControllerCorporateFirmAddresses(entityID, entityTypeID, userId, opTypeId).subscribe(
      data => {
        if (data.response) {
          this.ControllerCorporateAddresses = data.response;
          this.existingControllerCorporateAddresses = this.ControllerCorporateAddresses.filter(addr => addr.Valid);
          console.log('Controller Corporate Firm Addresses:', this.ControllerCorporateAddresses);
        } else {
          console.warn('No addresses found for this firm');
        }
        this.isLoading = false;
      },
      error => {
        console.error('Error Fetching Firm Addresses', error);
        this.existingControllerCorporateAddresses = [];
        this.isLoading = false;
      }
    );
  }


  loadControllerIndividualAdresses(contactAssId: number, userId: number, opTypeId: number): void {
    this.isLoading = true;

    // Fetch firm addresses from the service
    this.addressService.getControllerIndividualAddresses(contactAssId, userId, opTypeId).subscribe(
      data => {
        if (data.response) {
          this.ControllerIndividualAddresses = data.response;
          this.existingControllerIndividualAddresses = this.ControllerIndividualAddresses.filter(addr => addr.Valid);
          console.log('Controller Individual Firm Addresses:', this.ControllerIndividualAddresses);
        } else {
          console.warn('No addresses found for this firm');
        }
        this.isLoading = false;
      },
      error => {
        console.error('Error Fetching Firm Addresses', error);
        this.existingControllerIndividualAddresses = [];
        this.isLoading = false;
      }
    );
  }


  populateCountries() {
    this.firmDetailsService.getCountries().subscribe(
      countries => {
        this.allCountries = countries;
      },
      error => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  populateAddressTypes() {
    this.firmDetailsService.getAddressTypes().subscribe(
      addressTypes => {
        this.allAddressTypes = addressTypes;
        this.currentAddressTypes = this.allAddressTypes; // Assign after data is loaded
      },
      error => {
        console.error('Error fetching address types:', error);
      }
    );
  }

  populateContactAddressTypes() {
    this.firmDetailsService.getContactAddressTypes().subscribe(
      addressTypes => {
        this.allContactAddressTypes = addressTypes;
        this.currentAddressTypes = this.allContactAddressTypes; // Assign after data is loaded
      },
      error => {
        console.error('Error fetching contact address types:', error);
      }
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  get filteredControllerAddresses() {
    if (this.selectedController.EntityTypeID === 11 || this.selectedController.EntityTypeID === 9) {
      return this.existingControllerIndividualAddresses.filter(addr => !addr.isRemoved);
    } else {
      return this.existingControllerCorporateAddresses.filter(addr => !addr.isRemoved);
    }

  }


  initializeAddressTypes() {
    if (this.selectedController.EntityTypeID === constants.EntityType.UBO_Individual ||
      this.selectedController.EntityTypeID === constants.EntityType.IndividualController) {
      this.populateContactAddressTypes();
    } else {
      this.populateAddressTypes();
    }
  }

  checkCanAddNewAddressOnEditMode() {
    const { canAddNewAddressOnEdit, isAllAddressesAddedOnEdit } =
      this.firmDetailsService.checkCanAddNewAddressOnEditMode(this.existingAddresses, this.currentAddressTypes);

    this.canAddNewAddressOnEdit = canAddNewAddressOnEdit;
    this.isAllAddressesAddedOnEdit = isAllAddressesAddedOnEdit;
  }


  getFilteredAddressTypes() {
    return this.getExistingAddresses()
      .filter(address => address.AddressTypeID && address.AddressTypeID !== 0) // Exclude blank and '0' entries
      .map(address => ({
        AddressTypeID: address.AddressTypeID,
        AddressTypeDesc: address.AddressTypeDesc
      }))
      .filter((value, index, self) =>
        index === self.findIndex((t) => t.AddressTypeID === value.AddressTypeID)
      ); // Remove duplicates
  }

  onAddressTypeChangeOnEditMode(event: any, address: any) {
    const selectedAddressTypeId = Number(event.target.value);
    if (selectedAddressTypeId === 0) {
      // Do nothing if the "Select" option is chosen
      address.AddressTypeID = 0;
      address.AddressTypeDesc = '';
      return;
    }

    this.existingAddresses = this.getExistingAddresses();

    // Get all valid addresses
    const validAddresses = this.existingAddresses;

    // Check if the selected address type already exists in valid addresses
    const isDuplicate = validAddresses.some(addr => addr.AddressTypeID === selectedAddressTypeId);

    if (isDuplicate) {
      // Show an alert message if duplicate is found
      this.showError(constants.AddressControlMessages.DUPLICATE_ADDRESSTYPES);

      // Reset the dropdown to default ("Select" option)
      event.target.value = "0";
      address.AddressTypeID = 0;  // Also reset the AddressTypeID in the model
      address.AddressTypeDesc = ''; // Reset the description as well
      return;
    }


    // Update the AddressTypeID and AddressTypeDesc based on the selection
    const selectedAddressType = this.currentAddressTypes.find(type => type.AddressTypeID === selectedAddressTypeId);

    if (selectedAddressType) {
      // Update the Address model
      address.AddressTypeID = selectedAddressType.AddressTypeID;
      address.AddressTypeDesc = selectedAddressType.AddressTypeDesc;
    }
  }


  addNewAddressOnEditMode() {
    this.existingAddresses = this.getExistingAddresses();
    const { canAddNewAddress, newAddress } = this.firmDetailsService.addNewAddressOnEditMode(
      this.existingAddresses, this.currentAddressTypes, this.currentDate
    );

    if (newAddress) {
      this.newAddressOnEdit = newAddress;
      this.canAddNewAddressOnEdit = canAddNewAddress; // Update the flag for the button state
      this.disableAddressFieldsOnEdit = false;
    } else {
      this.canAddNewAddressOnEdit = false; // Disable button if new address cannot be added
    }
  }


  removeAddressOnEditMode(index: number) {
    this.existingAddresses = this.getExistingAddresses();

    this.firmDetailsService.removeAddressOnEditMode(
      index,
      this.existingAddresses,
      this.removedAddresses,
      this.currentAddressTypes.length,
      this.errorMessages
    ).then(({ canAddNewAddress, updatedArray }) => {
      this.canAddNewAddressOnEdit = canAddNewAddress;
      this.existingAddresses = updatedArray;
    });
  }

  onSameAsTypeChangeOnEditMode(selectedTypeID: number, index: number) {
    this.existingAddresses = this.getExistingAddresses();
    this.disableAddressFieldsOnEdit = selectedTypeID && selectedTypeID != 0; // Set disableAddressFields here
    this.firmDetailsService.onSameAsTypeChangeOnEditMode(selectedTypeID, index, this.existingAddresses, this.newAddressOnEdit);
  }

  // Assign Corporate Addresses if condition is true else it will asign Individual Addresses
  getExistingAddresses(): any[] {
    if (
      this.selectedController.EntityTypeID === constants.EntityType.ParentEntity ||
      this.selectedController.EntityTypeID === constants.EntityType.CorporateController ||
      this.selectedController.EntityTypeID === constants.EntityType.UBO_Corporate ||
      this.selectedController.EntityTypeID === constants.EntityType.Head_Office
    ) {
      return this.existingControllerCorporateAddresses;
    } else {
      return this.existingControllerIndividualAddresses;
    }
  }

  get controllerAddresses() {
    if (
      this.selectedController.EntityTypeID === constants.EntityType.ParentEntity ||
      this.selectedController.EntityTypeID === constants.EntityType.CorporateController ||
      this.selectedController.EntityTypeID === constants.EntityType.UBO_Corporate ||
      this.selectedController.EntityTypeID === constants.EntityType.Head_Office
    ) {
      return this.ControllerCorporateAddresses;
    } else {
      return this.ControllerIndividualAddresses;
    }
  }



  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  addNewAddressOnCreateMode() {
    this.firmDetailsService.addNewAddressOnCreateMode(this.addedAddresses, this.currentAddressTypes, this.currentDate);

    // Now call checkCanAddNewAddressOnCreateMode to get the updated flags
    this.checkCanAddNewAddressOnCreateMode()
  }

  createDefaultAddress(): any {
    return {
      AddressID: null,
      AddressTypeID: 0,
      AddressTypeDesc: '',
      AddressLine1: '',
      AddressLine2: '',
      AddressLine3: '',
      AddressLine4: '',
      City: '',
      Province: '',
      CountryID: 0,
      CountryName: '',
      PostalCode: '',
      PhoneNumber: '',
      FaxNumber: '',
      LastModifiedBy: 0,
      LastModifiedDate: this.currentDate,
      addressState: 2,
      FromDate: null,
      ToDate: null,
      Valid: true
    };
  }

  removeAddressOnCreateMode(index: number) {
    this.firmDetailsService.removeAddressOnCreateMode(index, this.addedAddresses, this.currentAddressTypes).then(() => {
      // Check flags again after removal
      this.checkCanAddNewAddressOnCreateMode();
    })
  }

  onSameAsTypeChangeOnCreateMode(selectedTypeID: number, index: number) {
    this.disableAddressFieldsOnEdit = selectedTypeID && selectedTypeID != 0; // Set disableAddressFields here
    this.firmDetailsService.onSameAsTypeChangeOnCreateMode(selectedTypeID, index, this.addedAddresses);
  }

  getAvailableSameAsTypeOptionsOnCreateMode(index: number) {
    return this.firmDetailsService.getAvailableSameAsTypeOptionsOnCreateMode(index, this.addedAddresses);
  }

  checkCanAddNewAddressOnCreateMode() {
    const { canAddNewAddressOnCreate, isAllAddressesAddedOnCreate } =
      this.firmDetailsService.checkCanAddNewAddressOnCreateMode(this.addedAddresses, this.currentAddressTypes);

    // Assign the values to component-level properties
    this.canAddNewAddressOnCreate = canAddNewAddressOnCreate;
    this.isAllAddressesAddedOnCreate = isAllAddressesAddedOnCreate;
  }

  onAddressTypeChangeOnCreateMode(event: any, index: number) {
    const selectedTypeID = Number(event.target.value); // Convert the selected value to a number
    const currentAddress = this.addedAddresses[index];

    if (!currentAddress) {
      console.error('No current address found at index:', index);
      return;
    }

    // Check if the selected type is already in use by another address
    const isDuplicate = this.addedAddresses.some((address, i) => {
      return i !== index && address.AddressTypeID === selectedTypeID;
    });

    if (isDuplicate) {
      // Show an alert message if a duplicate is found
      this.showError(constants.AddressControlMessages.DUPLICATE_ADDRESSTYPES);

      // Reset the dropdown to default ("Select" option)
      event.target.value = "0";
      currentAddress.AddressTypeID = 0;  // Also reset the AddressTypeID in the model
      currentAddress.AddressTypeDesc = ''; // Reset the description as well
    } else {
      // If not a duplicate, update the current address
      const selectedAddressType = this.currentAddressTypes.find(type => type.AddressTypeID === selectedTypeID);
      if (selectedAddressType) {
        currentAddress.AddressTypeID = selectedAddressType.AddressTypeID;
        currentAddress.AddressTypeDesc = selectedAddressType.AddressTypeDesc;
      }
      currentAddress.isAddressTypeSelected = true; // Disable the dropdown after selection
    }

    // Check if the "Add Address" button should be enabled
    this.checkCanAddNewAddressOnCreateMode();
  }

  getAddressTypeHistory(addressTypeId: number, entityTypeId: number, entityId: number, contactAssnID: number) {
    this.callAddressType = true;
    this.addressService.getAddressesTypeHistory(null, addressTypeId, entityTypeId, entityId, contactAssnID).subscribe(
      data => {
        this.controllerFirmAddressesTypeHistory = data.response;
      }, error => {
        console.error('Error Fetching Firm History Addresses Type', error);
      })
    setTimeout(() => {
      const popupWrapper = document.querySelector('.addressHistoryPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .addressHistoryPopup not found');
      }
    }, 0)
  }

  closeAddressTypeHistory() {
    this.callAddressType = false;
    const popupWrapper = document.querySelector('.addressHistoryPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .addressHistoryPopup not found');
    }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  controllerDetails = {
    OtherEntityName: '',
    RegisteredNum: '',
    ControllerControlTypeDesc: '',
    AssnDateFrom: '',
    AssnDateTo: '',
    IsCompanyRegulated: false,
    LegalStatusTypeDesc: '',
    CountryName: '',
    PctOfShares: '',
    AdditionalDetails: '',
    LastModifiedByOfOtherEntities: '',
    LastModifiedDate: '',
    addressType: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
    city: '',
    stateProvince: '',
    country: '',
    zipPostalCode: '',
    regulator: '',
    regulatorContact: ''
  };

  openControllerPopup(controller: any): void {
    this.applySecurityOnPage(this.Page.Controller, this.isEditModeController);
    this.selectedController = JSON.parse(JSON.stringify(controller)); // Deep copy of controller
    this.controllerDetails = { ...this.selectedController }; // Populate the controller details if needed
    this.isPopupOpen = true;
    this.ControllerCorporateAddresses = []; // Clear
    this.ControllerIndividualAddresses = []; // Clear
    this.existingControllerCorporateAddresses = []; // Clear
    this.existingControllerIndividualAddresses = []; // Clear
    this.existingAddresses = []; // Clear

    if (this.selectedController.EntityTypeID === 2 || this.selectedController.EntityTypeID === 6 ||
      this.selectedController.EntityTypeID === 8 || this.selectedController.EntityTypeID === 10
    ) {
      this.loadControllerCorporateFirmAdresses(
        this.selectedController.OtherEntityID,
        this.selectedController.EntityTypeID,
        this.userId,
        constants.ObjectOpType.View // Static opTypeId
      );

      this.parentEntity.getRegulatorDetails(this.selectedController.OtherEntityID, this.selectedController.EntityTypeID)
        .subscribe(data => {
          if (data.response && data.response.length > 0) {
            this.existingRegulatorList = data.response;
          }
        });

      this.getAllRegulater(this.selectedController.CountryOfIncorporation, this.firmId, this.existingRegulatorList);
    }



    if (this.selectedController.EntityTypeID === 11 || this.selectedController.EntityTypeID === 9) {
      let functionTypeId = 0;
      const firmId = this.firmId;
      if (this.selectedController.EntityTypeID === constants.EntityType.IndividualController) {
        functionTypeId = FunctionType.IndividualController;
      } else if (this.selectedController.EntityTypeID === constants.EntityType.UBO_Individual) {
        functionTypeId = FunctionType.UBO_IndividualController;
      }
      
      const contactId = this.selectedController.OtherEntityID;
      const contactAssId = this.selectedController.RelatedEntityID;

      this.loadControllerIndividualAdresses(contactAssId, this.userId, constants.ObjectOpType.View);
      this.loadControllerIndividualDetails(firmId, functionTypeId, contactId, contactAssId);
    }

    console.log("Selected view controller details: ", this.controllerDetails);
  }



  loadControllerIndividualDetails(firmId: number, functionTypeId: number, contactId: number, contactAssId: number): void {
    this.controllerService.loadControllerIndividualDetails(firmId, functionTypeId, contactId, contactAssId).subscribe(
      data => {
        if (data.response) {
          this.selectedIndividualController = data.response[0]; // Assign the response to selectedController
          console.log('Individual Selected Controller:', this.selectedIndividualController);
        }
      },
      error => {
        console.error('Error loading individual controller details:', error);
      }
    );
  }

  // onTitleChange(newTitle: string): void {
  //   this.selectedIndividualController = {
  //     ...this.selectedIndividualController,
  //     Title: newTitle
  //   };
  // }

  closeControllerPopup(): void {
    this.isPopupOpen = false;
    this.isEditModeController = false;
    this.errorMessages = {}; // Clear previous error messages
    this.hasValidationErrors = false;
    this.existingControllerCorporateAddresses.push(this.defaultAddress);
    this.existingControllerIndividualAddresses.push(this.defaultAddress);
    this.existingRegulatorList = [];
    this.selectedController = [];
    this.controllerDetails = this.selectedController;
    this.canAddNewAddressOnEdit = true;
  }

  closeCreateControllerPopup(): void {
    this.isEditModeController = false;
    this.showCreateControllerSection = false; // Close the popup
    this.errorMessages = {}; // Clear previous error messages
    this.hasValidationErrors = false;
  }


  createController() {
    this.getControllerType();
    this.showCreateControllerSection = true;
    
    this.CreatecontrollerDetails.EntityTypeID = 0;
    this.CreatecontrollerDetails.OtherEntityID = 0;
    this.CreatecontrollerDetails.OtherEntityName = '';
    this.CreatecontrollerDetails.LegalStatusTypeID = 0;
    this.CreatecontrollerDetails.PctOfShares = '';
    this.CreatecontrollerDetails.Title = '';
    this.CreatecontrollerDetails.FirstName = '';
    this.CreatecontrollerDetails.SecondName = '';
    this.CreatecontrollerDetails.FamilyName = '';
    this.CreatecontrollerDetails.PlaceOfBirth = '';
    this.CreatecontrollerDetails.DateOfBirth = '';
    this.CreatecontrollerDetails.PassportNum = '';
    this.CreatecontrollerDetails.isPEP = null;
    this.CreatecontrollerDetails.IsPublicallyTraded = null;
    this.CreatecontrollerDetails.ControllerControlTypeID = 0;
    this.CreatecontrollerDetails.RegisteredNum = '';
    this.CreatecontrollerDetails.ControllerControlTypeDesc = '';
    this.CreatecontrollerDetails.HoldingsPercentage = '';
    this.CreatecontrollerDetails.EffectiveDate = '';
    this.CreatecontrollerDetails.CessationDate = '';
    this.CreatecontrollerDetails.More10UBOs = null;
    this.CreatecontrollerDetails.IsParentController = null;
    this.CreatecontrollerDetails.AssnDateFrom = '';
    this.CreatecontrollerDetails.AssnDateTo = '';
    this.CreatecontrollerDetails.IsCompanyRegulated = null;
    this.CreatecontrollerDetails.LegalStatusTypeDesc = '';
    this.CreatecontrollerDetails.CountryName = '';
    this.CreatecontrollerDetails.AdditionalDetails = '';
    this.CreatecontrollerDetails.LastModifiedByOfOtherEntities = '';
    this.CreatecontrollerDetails.LastModifiedDate = '';
    this.CreatecontrollerDetails.AddressType = '';
    this.CreatecontrollerDetails.addressLine1 = '';
    this.CreatecontrollerDetails.addressLine2 = '';
    this.CreatecontrollerDetails.addressLine3 = '';
    this.CreatecontrollerDetails.addressLine4 = '';
    this.CreatecontrollerDetails.city = '';
    this.CreatecontrollerDetails.stateProvince = '';
    this.CreatecontrollerDetails.country = '';
    this.CreatecontrollerDetails.zipPostalCode = '';
    this.CreatecontrollerDetails.regulator = '';
    this.CreatecontrollerDetails.RegulatorContact = '';
    this.CreatecontrollerDetails.CreatedBy = 30;
    this.CreatecontrollerDetails.RelatedEntityID = 0;
    this.CreatecontrollerDetails.EntitySubTypeID = null;
    this.CreatecontrollerDetails.EntityTypeID = 0;
    this.CreatecontrollerDetails.RelatedEntityEntityID = 0;
    this.CreatecontrollerDetails.MyState = 2;
    this.CreatecontrollerDetails.PlaceOfIncorporation = '';
    this.CreatecontrollerDetails.CountryOfIncorporation = 0;
    this.CreatecontrollerDetails.webSiteAddress = '';
    this.CreatecontrollerDetails.IsAuditor = 0;
    this.CreatecontrollerDetails.ControllerInfo = '';
    this.CreatecontrollerDetails.FirmID = 0;
    this.CreatecontrollerDetails.Output = 0;
    this.CreatecontrollerDetails.NumOfShares = 0;
    this.CreatecontrollerDetails.CountryID = 0;
    this.CreatecontrollerDetails.AddressTypeID = 0;
    this.CreatecontrollerDetails.CreatedDate = '';
    this.CreatecontrollerDetails.EntityID = 0;
    this.CreatecontrollerDetails.ContactID = 0;
    this.CreatecontrollerDetails.ObjectID = 0;
    this.CreatecontrollerDetails.PrefferdMethod = '';
    this.CreatecontrollerDetails.ContactId = 0;
    this.CreatecontrollerDetails.ThirdName = '';
    this.CreatecontrollerDetails.ObjectInstanceID = 0;
    this.CreatecontrollerDetails.AddressTypeDesc = '';
    this.CreatecontrollerDetails.StatusDate = '';
    this.CreatecontrollerDetails.MobilePhone = '';
    this.CreatecontrollerDetails.businessEmail = '';
    this.CreatecontrollerDetails.OtherEmail = '';
    this.CreatecontrollerDetails.RegulatorID = 0;
    this.CreatecontrollerDetails.PreferredMethodType = '';
    this.CreatecontrollerDetails.RegulatorName = '';

    if (this.CreatecontrollerDetails.EntityTypeID === 0) {
      this.hideForms = true;
    } else {
      this.hideForms = false;
    }
  }

  getControllerControlTypes(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.ControllerControlTypes, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.controlTypeOptionsEdit = data.response;
        console.log("getControllerControlTypes", data)
      }, error => {
        console.error("Error fetching controller control types:", error);
      });
  }
  getControllerControlTypesCreate(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.ControllerControlTypes, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.controlTypeOptionsCreate = data.response;
        console.log("getControllerControlTypes", data)
      }, error => {
        console.error("Error fetching controller control types:", error);
      });
  }

  getTitleCreate(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.Title, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.Titles = data.response;
        console.log("Countries", data)
      }, error => {
        console.error("Error fetching TitleTypes", error);
      });
  }

  getAddressTypesControllerCreate(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.addressTypes, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.addressTypeOptionsEdit = data.response;
        console.log("getAddressTypesController", data)
      }, error => {
        console.error("Error fetching AddressTypes", error);
      });
  }

  getlegalStatusController(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.legalStatusController, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.legalStatusOptionsEdit = data.response;
        console.log("getlegalStatusController", data)
      }, error => {
        console.error("Error fetching legalStatus", error);
      });
  }

  getlegalStatusControllerCreate(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.legalStatusController, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.legalStatusOptionsCreate = data.response;
        console.log("getlegalStatusController", data)
      }, error => {
        console.error("Error fetching legalStatus", error);
      });
  }

  getCorporateController(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.CorporateController, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.CorporateControllerEdit = data.response;
        console.log("getCorporateController", data)
      }, error => {
        console.error("Error fetching controller", error);
      });
  }
  getCorporateControllerCreate(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.CorporateController, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.CorporateControllerEdit = data.response;
        console.log("getCorporateController", data)
      }, error => {
        console.error("Error fetching controller", error);
      });
  }

  updateControlTypeDesc(selectedValue: any) {
    switch (selectedValue) {
      case '1':
        this.selectedController.ControllerControlTypeDesc = 'Percentage';
        break;
      case '2':
        this.selectedController.ControllerControlTypeDesc = 'Exercise Control';
        break;
      default:
        this.selectedController.ControllerControlTypeDesc = '';
        break;
    }
  }

  getControllerType(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.ControllerType, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.controllerTypeOption = data.response;

        // Filter out option Head Office of a Branch if LegalStatusTypeID is not 3 (Branch)
        if (this.firmDetails?.LegalStatusTypeID !== 3) {
          this.controllerTypeOption = this.controllerTypeOption.filter(
            (option: any) => option.EntityTypeID !== 10
          );
        }

        console.log("Filtered Controllers", this.controllerTypeOption);
      }, error => {
        console.error("Error fetching Controllers", error);
      });
  }


  changeControlType() {
    if (this.CreatecontrollerDetails.EntityTypeID == 0) {
      this.hideForms = true;
    } else {
      this.hideForms = false;
    }
    this.isAllAddressesAddedOnCreate = false;
    this.addedAddresses = [this.createDefaultAddress()];
    this.regulatorList = [this.createDefaultRegulator()];
    this.CreatecontrollerDetails.IsCompanyRegulated = null;
    this.errorMessages = {};
    if (this.CreatecontrollerDetails.EntityTypeID === this.ControllerType.UBO_Individual || this.CreatecontrollerDetails.EntityTypeID === this.ControllerType.IndividualController) {
      this.populateContactAddressTypes();
    } else {
      this.populateAddressTypes();
    }
  }


  confirmDeleteControllerDetails(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this controller detail?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.DeleteControllerPopup(); // Pass the ID to the method
      }
    });
  }

  saveControllerPopupChanges(): void {
    this.isLoading = true;
    this.EditControllerValidateForm();
    if (this.hasValidationErrors) {
      this.firmDetailsService.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.isLoading = false;
      return;
    }
    console.log("Selected Controller:", this.selectedController);
    if (
      [constants.EntityType.ParentEntity, constants.EntityType.CorporateController, constants.EntityType.Head_Office, constants.EntityType.CorporateController].includes(this.selectedController.EntityTypeID)
    ) {
      const saveControllerPopupChangesObj = {
        otherEntityDetails: {
          UserID: this.userId,
          UserName: null,
          OtherEntityName: this.selectedController.OtherEntityName,
          otherEntityID: this.selectedController.OtherEntityID,
          DateOfIncorporation: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
          createdBy: this.userId,
          CreatedDate: null,
          relatedEntityID: this.selectedController.RelatedEntityID,
          entitySubTypeID: this.selectedController.EntitySubTypeID,
          relatedEntityTypeID: this.selectedController.EntityTypeID,
          relatedEntityEntityID: this.selectedController.RelatedEntityEntityID,
          myState: this.selectedController.myState,
          LegalStatusTypeID: this.selectedController.LegalStatusTypeID,
          LegalStatusTypeDesc: this.selectedController.LegalStatusTypeDesc,
          placeOfIncorporation: this.selectedController.PlaceOfIncorporation,
          countryOfIncorporation: this.selectedController.CountryOfIncorporation,
          registeredNumber: this.selectedController.RegisteredNum,
          webSiteAddress: this.selectedController.webSiteAddress,
          lastModifiedBy: this.userId,
          ControllerControlTypeDesc: null,
          isAuditor: this.selectedController.isAuditor,
          isCompanyRegulated: this.selectedController.IsCompanyRegulated,
          additionalDetails: this.selectedController.AdditionalDetails,
          isParentController: this.selectedController.isParentController,
          isPublicallyTraded: this.selectedController.isPublicallyTraded,
          areAnyUBOs: this.selectedController.areAnyUBOs,
          controllerInfo: this.selectedController.controllerInfo,
          output: this.selectedController.output,
          FirmID: this.selectedController.FirmID,
          EntityTypeID: this.selectedController.EntityTypeID,
          EntityID: this.selectedController.FirmID,
          controllerControlTypeID: this.selectedController.ControllerControlTypeID,
          numOfShares: this.selectedController.numOfShares,
          PctOfShares: this.selectedController.ControllerControlTypeID === 1 ? this.selectedController.PctOfShares : null,
          MajorityStockHolder: false,
          AssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.AssnDateFrom),
          AssnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.AssnDateTo),
          LastModifiedByOfOtherEntity: this.userId,
        },
        addressList: [...this.existingControllerCorporateAddresses, ...this.removedAddresses].map(address => {
          let addressState: number;

          if (address.isRemoved) {
            addressState = 4; // Deleted address
          } else if (address.AddressID === null) {
            addressState = 2; // New address
          } else {
            addressState = 3; // Modified address
          }

          return {
            firmID: this.firmId,
            countryID: Number(address.CountryID) || 0,
            addressTypeID: address.AddressTypeID || 0,
            sameAsTypeID: address.SameAsTypeID || null,
            lastModifiedBy: this.userId, // must be dynamic
            addressAssnID: address.AddressAssnID || null,
            entityTypeID: address.EntityTypeID || 1,
            entityID: address.EntityID || this.firmId,
            contactAssnID: 0,
            contactID: 0,
            addressID: address.AddressID?.toString() || '',
            addressLine1: address.AddressLine1 || '',
            addressLine2: address.AddressLine2 || '',
            addressLine3: address.AddressLine3 || '',
            addressLine4: address.AddressLine4 || '',
            city: address.City || '',
            province: address.Province || '',
            postalCode: address.PostalCode || '',
            phoneNumber: address.PhoneNumber || '',
            phoneExt: address.PhoneExt || '',
            faxNumber: address.FaxNumber || '',
            lastModifiedDate: this.currentDate, // Default to current date
            addressState: addressState, // New address state is 2, existing modified or unchanged is 6, 4 is delete
            fromDate: address.FromDate || null,
            toDate: address.ToDate || null,
            objectID: address.ObjectID || this.Page.Controller,
            objectInstanceID: address.ObjectInstanceID || this.firmId,
            objectInstanceRevNumber: address.ObjectInstanceRevNumber || 1,
            sourceObjectID: address.SourceObjectID || this.Page.Controller,
            sourceObjectInstanceID: address.SourceObjectInstanceID || this.firmId,
            sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNumber || 1,
            objAis: null,
          };
        }),

        regulatorList: this.selectedController.IsCompanyRegulated ? [...this.existingRegulatorList, ...this.removedRegulators].map(regulator => {
          let regulatorState: number;

          if (regulator.isRemoved) {
            regulatorState = 4; // Deleted address
          } else if (regulator.RegulatorName === "") {
            regulatorState = 2; // New address
          } else {
            regulatorState = 3; // Modified address
          }

          return {
            regulatorState: regulatorState,
            regulatorID: regulator.RegulatorID,
            entityTypeID: this.selectedController.EntityTypeID,
            entityID: null,
            relatedEntityTypeID: 5, // constant
            relatedEntityID: regulator.RelatedEntityID,
            contactAssnID: null
          };
        }) : []

      };

      // Call the insert/update endpoint
      this.controllerService.insertupdateotherentitydetails(saveControllerPopupChangesObj).subscribe(
        response => {
          console.log("Save successful:", response);
          this.isLoading = false;
          this.isEditModeController = false;
          this.isPopupOpen = false;
          this.closeControllerPopup();
          this.getPlaceOfEstablishmentName();
          this.loadControllers();
          this.loadControllersIndividual();
          this.applySecurityOnPage(this.Page.Controller, this.isEditModeController);
          this.firmDetailsService.showSaveSuccessAlert(constants.ControllerMessages.RECORD_MODIFIED);
        },
        error => {
          this.isLoading = false;
          console.error("Error saving changes:", error);
        }
      );
    } else if (
      [constants.EntityType.IndividualController, constants.EntityType.UBO_Individual].includes(this.selectedController.EntityTypeID)
    ) {
      let functionTypeId = 0;

      if (this.selectedController.EntityTypeID === constants.EntityType.UBO_Individual) {
        functionTypeId = FunctionType.UBO_IndividualController;
      } else if (this.selectedController.EntityTypeID === constants.EntityType.IndividualController) {
        functionTypeId = FunctionType.IndividualController;
      }

      const saveControllerPopupChangesIndividualObj = {
        contactDetails: {
          contactDetails: {
            firmID: this.firmId,
            contactID: this.selectedIndividualController.ContactID,
            contactAssnID: this.selectedIndividualController.ContactAssnID,
            QfcNumber: this.firmDetails.QFCNum,
            OtherEntityName: null,
            EntityTypeID: this.selectedIndividualController.EntityTypeID,
            Title: this.selectedIndividualController.Title,
            FirstName: this.selectedIndividualController.FirstName,
            secondName: this.selectedIndividualController.SecondName,
            thirdName: this.selectedIndividualController.ThirdName,
            familyName: this.selectedIndividualController.FamilyName,
            PctOfShares: this.selectedIndividualController.ControllerControlTypeID === 1 ? this.selectedIndividualController.PctOfShares : null,
            tempContactID: 0,
            countryOfResidence: null,
            ControllerControlTypeID: this.selectedIndividualController.ControllerControlTypeID,
            createdBy: this.userId,
            dateOfBirth: this.dateUtilService.convertDateToYYYYMMDD(this.selectedIndividualController.DateOfBirth),
            fullName: null,
            lastModifiedBy: this.userId,
            MyState: 3,
            nationalID: null,
            nationality: null,
            EntityID: this.firmId,
            passportNum: this.selectedIndividualController.PassportNum,
            placeOfBirth: this.selectedIndividualController.PlaceOfBirth,
            previousName: null,
            isExists: null,
            FunctionTypeId: functionTypeId,
            nameInPassport: null,
            contactAddnlInfoTypeID: null,
            isFromContact: null,
            countryofBirth: null,
            juridictionID: null,
            objectID: this.Page.Controller,
            isPEP: this.selectedIndividualController.IsPep,
            AssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.selectedIndividualController.AssnDateFrom),
            AssnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.selectedIndividualController.AssnDateTo),
            LastModifiedByOfOtherEntity: this.userId,
            JurisdictionId: this.selectedIndividualController.JurisdictionID,
          },
          lstContactFunctions: null,
        },
        Addresses: [...this.existingControllerIndividualAddresses, ...this.removedAddresses].map(address => {
          let addressState: number;

          if (address.isRemoved) {
            addressState = 4; // Deleted address
          } else if (address.AddressID === null) {
            addressState = 2; // New address
          } else {
            addressState = 3; // Modified address
          }

          return {
            firmID: this.firmId,
            countryID: Number(address.CountryID) || 0,
            addressTypeID: address.AddressTypeID || 0,
            sameAsTypeID: address.SameAsTypeID || null,
            lastModifiedBy: this.userId, // must be dynamic
            addressAssnID: address.AddressAssnID || null,
            entityTypeID: address.EntityTypeID || 1,
            entityID: address.EntityID || this.firmId,
            contactAssnID: this.selectedController.RelatedEntityID,
            contactID: this.selectedController.OtherEntityID,
            addressID: address.AddressID?.toString() || '',
            addressLine1: address.AddressLine1 || '',
            addressLine2: address.AddressLine2 || '',
            addressLine3: address.AddressLine3 || '',
            addressLine4: address.AddressLine4 || '',
            city: address.City || '',
            province: address.Province || '',
            postalCode: address.PostalCode || '',
            phoneNumber: address.PhoneNumber || '',
            phoneExt: address.PhoneExt || '',
            faxNumber: address.FaxNumber || '',
            lastModifiedDate: this.currentDate,
            addressState: addressState, // New address state is 2, existing modified or unchanged is 6, 4 is delete
            fromDate: address.FromDate || null,
            toDate: address.ToDate || null,
            objectID: address.ObjectID || this.Page.Controller,
            objectInstanceID: address.ObjectInstanceID || this.firmId,
            objectInstanceRevNumber: address.ObjectInstanceRevNumber || 1,
            sourceObjectID: address.SourceObjectID || this.Page.Controller,
            sourceObjectInstanceID: address.SourceObjectInstanceID || this.firmId,
            sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNumber || 1,
            objAis: null,
          }
        })
      };

      // Call the save/update contact form endpoint
      this.contactService.saveupdatecontactform(saveControllerPopupChangesIndividualObj).subscribe(
        response => {
          console.log("Contact save successful:", response);
          this.isEditModeController = false;
          this.isLoading = false;
          this.isPopupOpen = false;
          this.loadControllers();
          this.loadControllersIndividual();
          this.firmDetailsService.showSaveSuccessAlert(constants.ControllerMessages.RECORD_MODIFIED);
        },
        error => {
          console.error("Error saving contact:", error);
          this.isLoading = false;
        }
      );
    }
  }

  cancelController() {
    this.isEditModeController = false;
    this.applySecurityOnPage(this.Page.Controller,this.isEditModeController)
  }


  getPlaceOfEstablishmentName(): string {
    const place = this.allCountries.find(option => option.CountryID === parseInt(this.selectedController.CountryOfIncorporation));
    return place ? place.CountryName : '';
  }

  getLegalStatusDescription(): string {
    const status = this.legalStatusOptionsEdit.find(option => option.LegalStatusTypeID === this.selectedController.LegalStatusTypeID);
    return status ? status.LegalStatusTypeDesc : '';
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

  showError(messageKey: number) {
    this.firmDetailsService.showErrorAlert(messageKey, this.isLoading);
  }

  validateTotalPercentage(otherEntityId: number, newPctOfShares: number): boolean {
    // Calculate the current total of percentages, excluding the controller being updated
    const currentTotal = this.FIRMControllers.reduce((total, controller) => {
      if (controller.OtherEntityID === otherEntityId) {
        // Skip the old value of the controller being updated
        return total;
      }
      const pct = parseFloat(controller.PctOfShares) || 0;
      return total + pct;
    }, 0);

    // Check if adding the new percentage would exceed 100%
    if (currentTotal + newPctOfShares > 100) {
      this.loadErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_PERCENTAGE_NOTEXCEED);
      this.hasValidationErrors = true;
      return false;
    } else {
      delete this.errorMessages['PCTOFSHARESLESSTHAN100'];
    }
    return true;
  }




  EditControllerValidateForm(): Promise<void> {
    if (
      [constants.EntityType.ParentEntity, constants.EntityType.CorporateController, constants.EntityType.Head_Office, constants.EntityType.UBO_Corporate].includes(this.selectedController.EntityTypeID)
    ) {
      return new Promise<void>((resolve, reject) => {
        this.errorMessages = {}; // Clear previous error messages
        this.hasValidationErrors = false;

        // ADDRESS TYPE VALIDATION
        this.invalidAddress = this.existingControllerCorporateAddresses.find(address => !address.AddressTypeID || address.AddressTypeID === 0);
        if (this.invalidAddress) {
          this.loadErrorMessages('AddressTypeID', constants.AddressControlMessages.SELECT_ADDRESSTYPE);
          this.hasValidationErrors = true;
        } else {
          delete this.errorMessages['AddressTypeID'];
        }

        // Validate Full Name of Entity
        if (!this.selectedController.OtherEntityName) {
          this.loadErrorMessages('OtherEntityName', constants.ControllerMessages.ENTER_OTHER_ENTITY_NAME);
          this.hasValidationErrors = true;
        }

        // Valdiate Cessation Date greater than Effective Date
        if (!(this.firmService.isNullOrEmpty(this.CreatecontrollerDetails.AssnDateFrom)) && !(this.firmService.isNullOrEmpty(this.CreatecontrollerDetails.AssnDateTo))) {
          if (this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom) >= this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo)) {
            this.loadErrorMessages('AssnDateTo', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
            this.hasValidationErrors = true;
          }
        }

        // Validate Place of Establishment
        if (!this.selectedController.CountryOfIncorporation) {
          this.loadErrorMessages('PlaceOfEstablishment', constants.ControllerMessages.Select_Place_Establishment);
          this.hasValidationErrors = true;
        }

        // Validate Type of Control
        if (!this.selectedController.ControllerControlTypeID) {
          this.loadErrorMessages('ControllerControlTypeDesc', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
          this.hasValidationErrors = true;
        }

        // Validate Percentage of Holding
        if (this.selectedController.PctOfShares) {
          const newPct = parseFloat(this.selectedController.PctOfShares);

          // Check if the newPct is a valid percentage (0–100)
          if (isNaN(newPct) || newPct < 0 || newPct >= 100) {
            this.loadErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_VALID_PERCENTAGE);
            this.hasValidationErrors = true;
          }
          // If valid, then proceed to check total percentage
          else if (!this.validateTotalPercentage(this.selectedController.OtherEntityID, newPct)) {
          }
        }


        // Check if there are any validation errors
        if (Object.keys(this.errorMessages).length > 0) {
          this.hasValidationErrors = true;
          resolve(); // Resolve the promise with errors
        } else {
          resolve(); // Resolve with no errors
        }
      });
    } else {
      return new Promise<void>((resolve, reject) => {
        this.errorMessages = {}; // Clear previous error messages
        this.hasValidationErrors = false;

        // Validate First Name
        if (!this.selectedIndividualController.FirstName || this.selectedIndividualController.FirstName.trim().length === 0) {
          this.loadErrorMessages('firstName', constants.ControllerMessages.ENTER_FIRSTNAME);
          this.hasValidationErrors = true;
        }

        // Validate Family Name
        if (!this.selectedIndividualController.FamilyName || this.selectedIndividualController.FamilyName.trim().length === 0) {
          this.loadErrorMessages('familyName', constants.ControllerMessages.ENTER_FAMILYNAME);
          this.hasValidationErrors = true;
        }


        // Validate Is PEP
        if (this.selectedIndividualController.IsPep === undefined || this.selectedIndividualController.IsPep === null) {
          this.loadErrorMessages('isPEP', constants.ControllerMessages.SELECT_ISPEP, 'Is Politically Exposed Person (PEP)?*');
          this.hasValidationErrors = true;
        }

        // Validate Type of Control
        if (!this.selectedIndividualController.ControllerControlTypeID) {
          this.loadErrorMessages('ControllerControlTypeDesc', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
          this.hasValidationErrors = true;
        }

        // Validate Date of Birth
        if (this.firmService.isNullOrEmpty(this.selectedIndividualController.DateOfBirth) || this.selectedIndividualController.DateOfBirth === undefined) {
          this.loadErrorMessages('dateOfBirth', constants.ControllerMessages.ENTER_VALID_BIRTHDATE);
          this.hasValidationErrors = true;
        }

        // 
        if (!(this.firmService.isNullOrEmpty(this.CreatecontrollerDetails.AssnDateFrom)) && !(this.firmService.isNullOrEmpty(this.CreatecontrollerDetails.AssnDateTo))) {
          if (this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom) >= this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo)) {
            this.loadErrorMessages('AssnDateTo', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
            this.hasValidationErrors = true;
          }
        }

        // ADDRESS TYPE VALIDATION
        this.invalidAddress = this.existingControllerIndividualAddresses.find(address => !address.AddressTypeID || address.AddressTypeID === 0);
        if (this.invalidAddress) {
          this.loadErrorMessages('AddressTypeID', constants.AddressControlMessages.SELECT_ADDRESSTYPE);
          this.hasValidationErrors = true;
        } else {
          delete this.errorMessages['AddressTypeID'];
        }

        // Validate Percentage of Holding
        if (this.selectedIndividualController.PctOfShares) {
          const newPct = parseFloat(this.selectedIndividualController.PctOfShares);

          // Check if the newPct is a valid percentage (0–100)
          if (isNaN(newPct) || newPct < 0 || newPct >= 100) {
            this.loadErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_VALID_PERCENTAGE);
            this.hasValidationErrors = true;
          }
          // If valid, then proceed to check total percentage
          else if (!this.validateTotalPercentage(this.selectedController.OtherEntityID, newPct)) {
          }
        }
        // Resolve promise based on validation result
        if (this.hasValidationErrors) {
          resolve(); // Form is invalid
        } else {
          resolve(); // Form is valid
        }
      });
    }
  }
  DeleteControllerPopup(): void {
    const otherEntityID = this.selectedController.OtherEntityID;
    const relatedEntityID = this.selectedController.RelatedEntityID;
    const entitySubTypeID = 5;
    const output = 0; // As per your requirement
    const objectID = FrimsObject.Controller;
    const contactID = this.selectedController.OtherEntityID;
    const contactAssnID = this.selectedController.RelatedEntityID;

    console.log("DeleteControllerPopup", otherEntityID, relatedEntityID, entitySubTypeID)
    // Make the DELETE request with all required query parameters
    if (
      [constants.EntityType.ParentEntity, constants.EntityType.CorporateController, constants.EntityType.Head_Office, constants.EntityType.UBO_Corporate].includes(this.selectedController.EntityTypeID)
    ) {
      this.controllerService.deleteotherentitydetails(otherEntityID, relatedEntityID, entitySubTypeID, output).subscribe(
        response => {
          console.log("Controller Details Deleted successfully:", response);
          Swal.fire('Deleted!', 'Controller detail has been deleted.', 'success');
          this.loadControllers();
          this.loadControllersIndividual();
          this.isPopupOpen = false;
        },
        error => {
          console.error("Error deleting Controller:", error);
          Swal.fire('Error!', 'There was a problem deleting the controller detail.', 'error');
        }
      );
    } else {
      this.contactService.deleteContactDetails(objectID, contactID, contactAssnID, this.userId).subscribe(
        response => {
          console.log("Controller Details Deleted successfully:", response);
          this.firmDetailsService.showSaveSuccessAlert(constants.ControllerMessages.RECORD_DELETED);
          this.loadControllers();
          this.loadControllersIndividual();
          this.isPopupOpen = false;
        },
        error => {
          console.error("Error deleting Controller:", error);
          Swal.fire('Error!', 'There was a problem deleting the controller detail.', 'error');
        }
      );
    }
  }
}
