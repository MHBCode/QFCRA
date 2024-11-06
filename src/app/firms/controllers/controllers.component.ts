import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FrimsObject } from 'src/app/app-constants';
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

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss', '../firms.scss']
})
export class ControllersComponent implements OnInit {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  Page = FrimsObject;
  firmDetails: any;
  userId = 30;
  loading: boolean;
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
  isEditable: boolean = false;
  AllRegulater: any = [];
  Address: any = {};
  allCountries: any = [];
  hideForms: boolean = true;
  selectedController: any;
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


  // used variables on create mode
  addedAddresses: any = []; // Array will hold the newly added addresses
  addedAddressesOnCreate: any = [];
  canAddNewAddressOnCreate: boolean = true;
  isAllAddressesAddedOnCreate: boolean;



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
      this.getControllerType();
      if (this.FIRMControllers.length === 0) {
        this.loadControllers();
        this.loadControllersIndividual();
      }
      this.getAllRegulater(this.Address.countryID, this.firmId);
      this.populateCountries();
      this.getlegalStatusController();
      this.getlegalStatusControllerCreate()
      this.getCorporateController();
      this.getControllerControlTypesCreate();
      this.getTitleCreate();
      this.getAddressTypesControllerCreate();
      this.getlegalStatusControllerCreate();
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

  removeRegulator(index: number) {
    this.regulatorList.splice(index, 1);
  }
  getAllRegulater(countryID: number, firmId: number): void {
    if (!countryID) {
      // If no country is selected, get general regulators
      this.securityService.getObjectTypeTable(constants.Regulaters)
        .subscribe(data => {
          this.AllRegulater = data.response;
          console.log("General Regulators fetched:", data);
        }, error => {
          console.error("Error fetching Regulators:", error);
        });
    } else {
      // If a country is selected, get regulators specific to the country
      this.parentEntity.getRegulatorsByCountry(firmId, countryID)
        .subscribe(data => {
          this.AllRegulater = data.response;
          console.log("Country-specific Regulators fetched for CountryID:", countryID, data);
        }, error => {
          console.error("Error fetching Country-specific Regulators:", error);
        });
    }
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
      ["Parent Entity", "Corporate Controller", "Head Office of a Branch", "UBO – Corporate"].includes(this.CreatecontrollerDetails.EntityTypeDesc)
    ) {
      const saveControllerPopupChangesObj = {
        otherEntityDetails: {
          otherEntityID: null,
          createdBy: this.userId,
          relatedEntityID: null,
          entitySubTypeID: null,
          relatedEntityTypeID: this.CreatecontrollerDetails.EntityTypeID, // yazan // not integrated in the form
          relatedEntityEntityID: null,
          myState: 0,
          otherEntityName: this.CreatecontrollerDetails.OtherEntityName,
          dateOfIncorporation: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
          legalStatusTypeID: this.CreatecontrollerDetails.LegalStatusTypeID,
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
          entityTypeID: this.CreatecontrollerDetails.EntityTypeID, // not integrated in the form
          entityID: this.firmId, // not integrated in the form
          controllerControlTypeID: this.CreatecontrollerDetails.ControllerControlTypeID,
          numOfShares: this.CreatecontrollerDetails.NumOfShares,
          pctOfShares: this.CreatecontrollerDetails.PctOfShares || null,
          majorityStockHolder: false, // not integrated in the form
          assnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom),
          assnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo)

          // UserID: 30,
          // UserName: null,
          // OtherEntityName: this.CreatecontrollerDetails.OtherEntityName,
          // OtherEntityID: null,
          // ControllerControlTypeDesc: this.CreatecontrollerDetails.ControllerControlTypeDesc,
          // EntityTypeDesc: this.CreatecontrollerDetails.EntityTypeDesc,
          // DateOfIncorporation: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
          // createdBy: this.userId,
          // CessationDate: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.CessationDate),
          // EffectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.EffectiveDate),
          // CreatedDate: null,
          // ControllerControlTypeID: this.CreatecontrollerDetails.ControllerControlTypeID,
          // RelatedEntityID: null,
          // EntitySubTypeID: null,
          // EntityTypeID: this.CreatecontrollerDetails.EntityTypeID,
          // RelatedEntityTypeID: this.CreatecontrollerDetails.EntityTypeID, /// yazan
          // relatedEntityEntityID: null,
          // MyState: 0,
          // LegalStatusTypeID: this.CreatecontrollerDetails.LegalStatusTypeID,
          // LegalStatusTypeDesc: this.CreatecontrollerDetails.LegalStatusTypeDesc,
          // placeOfIncorporation: this.CreatecontrollerDetails.PlaceOfIncorporation,
          // countryOfIncorporation: this.CreatecontrollerDetails.CountryOfIncorporation,
          // PctOfShares: this.CreatecontrollerDetails.PctOfShares || null,
          // addressState: 2,
          // registeredNumber: this.CreatecontrollerDetails.RegisteredNum,
          // zebSiteAddress: this.CreatecontrollerDetails.zebSiteAddress,
          // lastModifiedBy: 30,
          // //LastModifiedDate : "2024-10-01T13:55:58.178Z",
          // isAuditor: this.CreatecontrollerDetails.IsAuditor,
          // isCompanyRegulated: this.CreatecontrollerDetails.IsCompanyRegulated,
          // additionalDetails: this.CreatecontrollerDetails.AdditionalDetails,
          // isParentController: this.CreatecontrollerDetails.IsParentController,
          // isPublicallyTraded: this.CreatecontrollerDetails.IsPublicallyTraded,
          // areAnyUBOs: this.CreatecontrollerDetails.More10UBOs,
          // controllerInfo: this.CreatecontrollerDetails.ControllerInfo,
          // Output: 0,
          // FirmID: this.firmId,
          // EntityID: this.firmId,
          // numOfShares: this.CreatecontrollerDetails.NumOfShares,
          // MajorityStockHolder: false,
          // AssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom),
          // AssnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo),
          // LastModifiedByOfOtherEntity: 30,
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
          lastModifiedDate: address.LastModifiedDate || this.currentDate, // Default to current date
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

        regulatorList: this.regulatorList.map(regulator => ({
          regulatorState: 2, // add new regulator
          regulatorID: regulator.RegulatorID,
          entityTypeID: this.CreatecontrollerDetails.EntityTypeID,
          entityID: this.firmId,
          relatedEntityTypeID: this.CreatecontrollerDetails.EntityTypeID,
          relatedEntityID: null,
          contactAssnID: 0
          // EntityTypeID: regulator.EntityTypeID,
          // EntityID: regulator.EntityID,
          // UserID: regulator.UserID,
          // FirmID: regulator.FirmID,
          // RelatedEntityTypeID: regulator.RelatedEntityTypeID,
          // relatedEntityID: regulator.relatedEntityID,
          // Output: regulator.Output,
          // regulatorState: regulator.regulatorState,
          // RegulatorID: regulator.RegulatorID,
          // RegulatorName: regulator.RegulatorName,
          // RegulatorContacts: regulator.RegulatorContacts,
          // RelatedEntityID: regulator.RelatedEntityID,
          // ContactID: regulator.ContactID,
          // Title: regulator.Title,
          // FullName: regulator.FullName,
          // BussinessEmail: regulator.BussinessEmail,
          // AddressLine1: regulator.AddressLine1,
          // AddressLine2: regulator.AddressLine2,
          // AddressLine3: regulator.AddressLine3,
          // AddressLine4: regulator.AddressLine4,
          // City: regulator.City,
          // Province: regulator.Province,
          // CountryID: regulator.CountryID,
          // CountryName: regulator.CountryName,
          // PostalCode: regulator.PostalCode,
          // PhoneNumber: regulator.PhoneNumber,
          // PhoneExt: regulator.PhoneExt,
          // FaxNumber: regulator.FaxNumber,
          // EntityRegulators: regulator.EntityRegulators,
          // ShowReadOnly: regulator.ShowReadOnly,
          // ShowEnabled: regulator.ShowEnabled,
          // ContactAssnID: regulator.ContactAssnID
        }))
      }
      console.log("Controller to be saved", saveControllerPopupChangesObj)
      // Call the insert/update endpoint
      this.controllerService.insertupdateotherentitydetails(saveControllerPopupChangesObj).subscribe(
        response => {
          console.log("Save successful:", response);
          this.showCreateControllerSection = false;
          this.isLoading = false;
          this.loadControllers();
          this.firmDetailsService.showSaveSuccessAlert(constants.ControllerMessages.RECORD_INSERTED);
        },
        error => {
          console.error("Error saving changes:", error);
          this.isLoading = false;
        }
      );

    }
    else if (
      ["Individual Controller", "UBO - Individual"].includes(this.CreatecontrollerDetails.EntityTypeDesc)
    ) {
      const saveControllerPopupChangesIndividualObj = {
        contactDetails: {
          contactDetails: {
            firmID: this.firmId,
            contactID: null,
            contactAssnID: null,
            AdditionalDetails: 'test',
            BusPhone: 'test',
            BusEmail: 'test',
            MobileNum: 'test',
            NameAsInPassport: 'test',
            OtherEmail: 'test',
            QfcNumber: this.firmDetails.QFCNum,
            Fax: 'test',
            ResidencePhone: 'test',
            JobTitle: 'test',
            OtherEntityName: this.CreatecontrollerDetails.OtherEntityName,
            EntityTypeID: this.CreatecontrollerDetails.EntityTypeID,
            Title: this.CreatecontrollerDetails.Title, // Map your inputs accordingly
            FirstName: this.CreatecontrollerDetails.FirstName,
            secondName: this.CreatecontrollerDetails.SecondName,
            thirdName: this.CreatecontrollerDetails.ThirdName,
            familyName: this.CreatecontrollerDetails.FamilyName,
            PctOfShares: this.CreatecontrollerDetails.PctOfShares,
            tempContactID: 0,
            countryOfResidence: null,
            ControllerControlTypeID: this.CreatecontrollerDetails.ControllerControlTypeID,
            createdBy: this.userId,
            dateOfBirth: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.DateOfBirth),
            fullName: null,
            lastModifiedBy: this.userId,
            MyState: 0,
            nationalID: null,
            nationality: null,
            EntityID: this.firmId,
            passportNum: this.CreatecontrollerDetails.PassportNum,
            placeOfBirth: this.CreatecontrollerDetails.PlaceOfBirth,
            previousName: null,
            isExists: false,
            FunctionTypeId: 25,
            nameInPassport: null,
            contactAddnlInfoTypeID: null,
            isFromContact: null,
            countryofBirth: null,
            juridictionID: null,
            objectID: this.CreatecontrollerDetails.ObjectID,
            isPEP: this.CreatecontrollerDetails.isPEP,
            AssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom),
            AssnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo),
            LastModifiedByOfOtherEntity: this.userId,
            JurisdictionId: 3,
          },
          lstContactFunctions: null,
        },
        Addresses: this.addedAddresses.map(address => ({
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
          lastModifiedDate: address.LastModifiedDate || this.currentDate, // Default to current date
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
          this.loadControllersIndividual();
          this.isLoading = false;
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

  CreatecontrollerDetails = {
    SelectedControlType: '',
    TypeOfControl: '',
    EntityTypeDesc: '',
    OtherEntityID: 0,
    OtherEntityName: '',
    LegalStatusTypeID: 0,
    PctOfShares: '',
    PlaceOfEstablishment: '',
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
    EntityTypeID: 1,
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
    AddressTypeID: 0,
    CreatedDate: '',
    EntityID: 0,
    ContactID: 0,
    AddressID: '',
    AddressState: 0,
    RelatedEntityTypeID: 6,
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
  };

  createDefaultControllerDetails() {
    return {
      SelectedControlType: '',
      TypeOfControl: '',
      EntityTypeDesc: '',
      OtherEntityID: 0,
      OtherEntityName: '',
      LegalStatusTypeID: 0,
      PctOfShares: '',
      PlaceOfEstablishment: '',
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
      EntityTypeID: 1,
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
      AddressTypeID: 0,
      CreatedDate: '',
      EntityID: 0,
      ContactID: 0,
      AddressID: '',
      AddressState: 0,
      RelatedEntityTypeID: 6,
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
    };
  }



  regulatorList: Array<any> = [
    {
      EntityTypeID: this.CreatecontrollerDetails.EntityTypeID,
      EntityID: null,
      UserID: null,
      FirmID: null,
      RelatedEntityTypeID: this.CreatecontrollerDetails.RelatedEntityTypeID,
      relatedEntityID: this.CreatecontrollerDetails.RelatedEntityID,
      Output: 0,
      regulatorState: 2,
      RegulatorID: 0,
      RegulatorName: '',
      RegulatorContacts: "",
      RelatedEntityID: null,
      ContactID: null,
      Title: null,
      FullName: null,
      BussinessEmail: null,
      AddressLine1: null,
      AddressLine2: null,
      AddressLine3: null,
      AddressLine4: null,
      City: null,
      Province: null,
      CountryID: 0,
      CountryName: null,
      PostalCode: null,
      PhoneNumber: null,
      PhoneExt: null,
      FaxNumber: null,
      EntityRegulators: null,
      ShowReadOnly: false,
      ShowEnabled: true,
      ContactAssnID: null
    }
  ];
  addRegulator() {
    this.regulatorList.push({
      EntityTypeID: this.CreatecontrollerDetails.EntityTypeID,
      EntityID: null,
      UserID: null,
      FirmID: null,
      RelatedEntityTypeID: this.CreatecontrollerDetails.RelatedEntityTypeID,
      relatedEntityID: this.CreatecontrollerDetails.RelatedEntityID,
      Output: 0,
      regulatorState: 2,
      RegulatorID: null,
      RegulatorName: '',
      RegulatorContacts: '',
      RelatedEntityID: null,
      ContactID: null,
      Title: null,
      FullName: null,
      BussinessEmail: null,
      AddressLine1: null,
      AddressLine2: null,
      AddressLine3: null,
      AddressLine4: null,
      City: null,
      Province: null,
      CountryID: 0,
      CountryName: null,
      PostalCode: null,
      PhoneNumber: null,
      PhoneExt: null,
      FaxNumber: null,
      EntityRegulators: null,
      ShowReadOnly: false,
      ShowEnabled: true,
      ContactAssnID: null
    });
  }

  CreateControllerValidateForm(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.errorMessages = {}; // Clear previous error messages
      this.hasValidationErrors = false;

      // Validate for "Select" option in Controller Type
      if (this.CreatecontrollerDetails.EntityTypeDesc === 'select') {
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
      if (["Parent Entity", "Corporate Controller", "Head Office of a Branch", "UBO – Corporate"].includes(this.CreatecontrollerDetails.EntityTypeDesc)) {

        // Validate Full Name of Entity
        if (!this.CreatecontrollerDetails.OtherEntityName) {
          this.loadErrorMessages('OtherEntityName', constants.ControllerMessages.ENTER_OTHER_ENTITY_NAME);
          console.log(constants.ControllerMessages.ENTER_OTHER_ENTITY_NAME);
          this.hasValidationErrors = true;
        }

        // Validate Effective Date
        if (this.firmService.isNullOrEmpty(this.CreatecontrollerDetails.AssnDateFrom) || this.CreatecontrollerDetails.AssnDateFrom === undefined) {
          this.loadErrorMessages('AssnDateFrom', constants.ControllerMessages.ENTER_VALID_EFFECTIVEDATE);
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
        if (!this.CreatecontrollerDetails.ControllerControlTypeID) {
          this.loadErrorMessages('ControllerControlTypeDesc', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
          this.hasValidationErrors = true;
        }

        // Validate Percentage of Holding
        if (this.CreatecontrollerDetails.PctOfShares) {
          const pct = parseFloat(this.CreatecontrollerDetails.PctOfShares);
          if (isNaN(pct) || pct < 0 || pct > 100) {
            this.loadErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_VALID_PERCENTAGE);
            this.hasValidationErrors = true;
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

        // Validate Effective Date
        if (this.firmService.isNullOrEmpty(this.CreatecontrollerDetails.AssnDateFrom) || this.CreatecontrollerDetails.AssnDateFrom === undefined) {
          this.loadErrorMessages('AssnDateFrom', constants.ControllerMessages.ENTER_VALID_EFFECTIVEDATE);
          this.hasValidationErrors = true;
        }

        if (this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom) >= this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo)) {
          this.loadErrorMessages('AssnDateTo', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
          this.hasValidationErrors = true;
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
    this.isEditable = true;
    this.initializeAddressTypes();
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


  // loadControllerIndividualFirmAdresses(): void {
  //   this.isLoading = true;

  //   // Fetch firm addresses from the service
  //   this.addressService.getControllerIndividualFirmAddresses().subscribe(
  //     data => {
  //       if (data.response) {
  //         this.ControllerIndividualAddresses = data.response;
  //         this.existingControllerIndividualAddresses = this.ControllerIndividualAddresses.filter(addr => addr.Valid);
  //         console.log('Controller Individual Firm Addresses:', this.ControllerIndividualAddresses);
  //       } else {
  //         console.warn('No addresses found for this firm');
  //       }
  //       this.isLoading = false;
  //     },
  //     error => {
  //       console.error('Error Fetching Firm Addresses', error);
  //       this.existingControllerIndividualAddresses = [];
  //       this.isLoading = false;
  //     }
  //   );
  // }


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
  get filteredControllerCorporateAddresses() {
    return this.existingControllerCorporateAddresses.filter(addr => !addr.isRemoved);
  }

  
  initializeAddressTypes() {
    if (this.selectedController.EntityTypeDesc === 'UBO - Individual' ||
      this.selectedController.EntityTypeDesc === 'Individual Controller') {
      this.populateContactAddressTypes();
    } else {
      this.populateAddressTypes();
    }
  }

  getFilteredAddressTypes() {
    return this.existingControllerCorporateAddresses
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

    // Get all valid addresses
    const validAddresses = this.existingControllerCorporateAddresses;

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
    const { canAddNewAddress, newAddress } = this.firmDetailsService.addNewAddressOnEditMode(this.existingControllerCorporateAddresses, this.currentAddressTypes, this.currentDate);
    if (newAddress) {
      this.newAddressOnEdit = newAddress;
      this.canAddNewAddressOnEdit = canAddNewAddress;
      this.disableAddressFieldsOnEdit = false;
    }
  }

  removeAddressOnEditMode(index: number) {
    this.firmDetailsService.removeAddressOnEditMode(
      index,
      this.existingControllerCorporateAddresses,
      this.removedAddresses,
      this.currentAddressTypes.length,
      this.errorMessages
    ).then(({ canAddNewAddress, updatedArray }) => {
      this.canAddNewAddressOnEdit = canAddNewAddress;
      this.existingControllerCorporateAddresses = updatedArray;
    });
  }

  onSameAsTypeChangeOnEditMode(selectedTypeID: number, index: number) {
    this.disableAddressFieldsOnEdit = selectedTypeID && selectedTypeID != 0; // Set disableAddressFields here
    this.firmDetailsService.onSameAsTypeChangeOnEditMode(selectedTypeID, index, this.existingControllerCorporateAddresses, this.newAddressOnEdit);
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

  getAddressTypeHistory(addressTypeId: number, entityTypeId: number, entityId: number) {
    this.callAddressType = true;
    this.addressService.getAddressesTypeHistory(null, addressTypeId, entityTypeId, entityId).subscribe(
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
  homeRegulater: any = [];

  openControllerPopup(controller: any): void {
    this.selectedController = controller; // Set the firm name
    this.controllerDetails = { ...controller }; // Populate the controller details
    this.isPopupOpen = true; // Open the popup
    console.log('SSSSSSSSSSSSSSSSSSSSSSSdfgdfgdfhfgjfhjdhdj', this.selectedController.OtherEntityID, this.selectedController.EntityTypeID);
    this.loadControllerCorporateFirmAdresses(
      this.selectedController.OtherEntityID,
      this.selectedController.EntityTypeID,
      this.userId,
      44 // Static opTypeId
    );
    if (this.selectedController.EntityTypeID === 8 || this.selectedController.EntityTypeID === 9) {
      // For individual controller types (EntityTypeID 8 or 9)
      const firmId = this.firmId;
      const functionTypeId = 25;
      const contactId = this.selectedController.OtherEntityID; // Use OtherEntityID as contactId
      const contactAssId = this.selectedController.RelatedEntityID; // Use RelatedEntityID as contactAssId

      this.loadControllerIndividualDetails(firmId, functionTypeId, contactId, contactAssId);
    }
    this.parentEntity.getRegulatorDetails(this.selectedController.OtherEntityID, this.selectedController.EntityTypeID).subscribe(
      data => {
        if (data.response && data.response.length > 0) {
          this.homeRegulater = data.response[0]; // Assuming it's an array and taking the first element
        }
      },
    );

    console.log("controllerDetails", this.controllerDetails)
    console.log("selectedController", this.selectedController)

  }
  selectedIndividualController: any = [];

  loadControllerIndividualDetails(firmId: number, functionTypeId: number, contactId: number, contactAssId: number): void {
    this.controllerService.loadControllerIndividualDetails(firmId, functionTypeId, contactId, contactAssId).subscribe(
      data => {
        if (data.response) {
          this.selectedIndividualController = data.response[0]; // Assign the response to selectedController
          console.log('Updated Selected Controller:', this.selectedIndividualController);
        }
      },
      error => {
        console.error('Error loading individual controller details:', error);
      }
    );
  }
  onTitleChange(newTitle: string): void {
    this.selectedIndividualController = {
      ...this.selectedIndividualController,
      Title: newTitle
    };
  }
  closeControllerPopup(): void {
    this.isPopupOpen = false;
    this.isEditable = false;
    this.errorMessages = {}; // Clear previous error messages
    this.hasValidationErrors = false;
    this.existingControllerCorporateAddresses.push(this.defaultAddress);
  }

  closeCreateControllerPopup(): void {
    this.isEditable = false;
    this.showCreateControllerSection = false; // Close the popup
    this.errorMessages = {}; // Clear previous error messages
    this.hasValidationErrors = false;
    this.hideForms = true;
    this.addedAddresses.push(this.defaultAddress);
    this.CreatecontrollerDetails = this.createDefaultControllerDetails();
  }


  createController() {
    this.showCreateControllerSection = true;
    this.CreatecontrollerDetails.EntityTypeDesc = 'select'
  }


  objectOpTypeIdEdit = 41;
  objectOpTypeIdCreate = 40;
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
  CreateControlTypeDesc(selectedValue: any) {
    const selectedEntityTypeDesc = this.CreatecontrollerDetails.EntityTypeDesc;
    const selectedControllerType = this.controllerTypeOption.find(
      controllerType => controllerType.EntityTypeDesc === selectedEntityTypeDesc
    );

    if (selectedControllerType) {
      this.CreatecontrollerDetails.EntityTypeID = selectedControllerType.EntityTypeID;
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
    this.hideForms = this.CreatecontrollerDetails.EntityTypeDesc === 'select';
    this.isAllAddressesAddedOnCreate = false;
    this.addedAddresses = [this.createDefaultAddress()];

    if (this.CreatecontrollerDetails.EntityTypeDesc === 'UBO - Individual' || this.CreatecontrollerDetails.EntityTypeDesc === 'Individual Controller') {
      this.populateContactAddressTypes();
    } else {
      this.populateAddressTypes();
    }
  }


  confarmDeleteControllerDetials(): void {
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
      ["Parent Entity", "Corporate Controller", "Head Office of a Branch", "UBO – Corporate"].includes(this.selectedController.EntityTypeDesc)
    ) {
      const saveControllerPopupChangesObj = {
        otherEntityDetails: {
          UserID: this.userId,
          UserName: null,
          OtherEntityName: this.selectedController.OtherEntityName,
          otherEntityID: this.selectedController.OtherEntityID,
          DateOfIncorporation: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
          createdBy: this.selectedController.CreatedBy,
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
          zebSiteAddress: this.selectedController.zebSiteAddress,
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
          PctOfShares: this.selectedController.PctOfShares,
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
            lastModifiedDate: address.LastModifiedDate || this.currentDate, // Default to current date
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

        regulatorList: this.regulatorList.map(regulator => ({
          EntityTypeID: regulator.EntityTypeID,
          EntityID: regulator.EntityID,
          UserID: regulator.UserID,
          FirmID: regulator.FirmID,
          RelatedEntityTypeID: regulator.RelatedEntityTypeID,
          relatedEntityID: regulator.relatedEntityID,
          Output: regulator.Output,
          regulatorState: 6,
          RegulatorID: regulator.RegulatorID,
          RegulatorName: regulator.RegulatorName,
          RegulatorContacts: regulator.RegulatorContacts,
          RelatedEntityID: regulator.RelatedEntityID,
          ContactID: regulator.ContactID,
          Title: regulator.Title,
          FullName: regulator.FullName,
          BussinessEmail: regulator.BussinessEmail,
          AddressLine1: regulator.AddressLine1,
          AddressLine2: regulator.AddressLine2,
          AddressLine3: regulator.AddressLine3,
          AddressLine4: regulator.AddressLine4,
          City: regulator.City,
          Province: regulator.Province,
          CountryID: regulator.CountryID,
          CountryName: regulator.CountryName,
          PostalCode: regulator.PostalCode,
          PhoneNumber: regulator.PhoneNumber,
          PhoneExt: regulator.PhoneExt,
          FaxNumber: regulator.FaxNumber,
          EntityRegulators: regulator.EntityRegulators,
          ShowReadOnly: regulator.ShowReadOnly,
          ShowEnabled: regulator.ShowEnabled,
          ContactAssnID: regulator.ContactAssnID
        }))
      };

      // Call the insert/update endpoint
      this.controllerService.insertupdateotherentitydetails(saveControllerPopupChangesObj).subscribe(
        response => {
          console.log("Save successful:", response);
          this.isLoading = false;
          this.isEditable = false;
          this.closeControllerPopup();
          this.getPlaceOfEstablishmentName();
          this.firmDetailsService.showSaveSuccessAlert(constants.ControllerMessages.RECORD_MODIFIED);
        },
        error => {
          this.isLoading = false;
          console.error("Error saving changes:", error);
        }
      );
    } else if (
      ["Individual Controller", "UBO - Individual"].includes(this.selectedController.EntityTypeDesc)
    ) {
      const saveControllerPopupChangesIndividualObj = {
        contactDetails: {
          contactDetails: {
            firmID: this.firmId,
            contactID: this.selectedController.OtherEntityID,
            contactAssnID: this.selectedController.RelatedEntityID,
            QfcNumber: this.firmDetails.QFCNum,
            OtherEntityName: null,
            EntityTypeID: this.selectedController.EntityTypeID,
            Title: this.selectedIndividualController.Title,
            FirstName: this.selectedIndividualController.FirstName,
            secondName: this.selectedIndividualController.SecondName,
            thirdName: this.selectedIndividualController.ThirdName,
            familyName: this.selectedIndividualController.FamilyName,
            PctOfShares: this.selectedController.PctOfShares,
            tempContactID: 0,
            countryOfResidence: null,
            ControllerControlTypeID: this.selectedController.ControllerControlTypeID,
            createdBy: this.userId,
            dateOfBirth: this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.DateOfBirth),
            fullName: null,
            lastModifiedBy: this.userId,
            MyState: 3,
            nationalID: null,
            nationality: null,
            EntityID: this.firmId,
            passportNum: this.selectedController.PassportNum,
            placeOfBirth: this.selectedController.PlaceOfBirth,
            previousName: null,
            isExists: true,
            FunctionTypeId: 25,
            nameInPassport: null,
            contactAddnlInfoTypeID: null,
            isFromContact: null,
            countryofBirth: null,
            juridictionID: null,
            objectID: this.selectedController.ObjectID,
            isPEP: this.selectedController.isPEP,
            AssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.AssnDateFrom),
            AssnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.AssnDateTo),
            LastModifiedByOfOtherEntity: this.userId,
            JurisdictionId: 3,
          },
          lstContactFunctions: null,
        },
        Addresses: (Array.isArray(this.newAddressOnEdit) ? this.newAddressOnEdit : []).map(address => ({
          firmID: this.firmId,
          countryID: address.CountryID,
          addressTypeID: address.AddressTypeID,
          LastModifiedBy: this.userId,
          entityTypeID: this.selectedController.EntityTypeID,
          entityID: this.firmId,
          contactID: address.contactID,
          addressID: null,
          addressLine1: "",
          addressLine2: "",
          addressLine3: "",
          addressLine4: "",
          city: address.city,
          stateProvince: address.stateProvince,
          createdBy: 0,
          addressAssnID: null,
          CreatedDate: address.CreatedDate,
          LastModifiedDate: address.LastModifiedDate,
          addressState: 3,
          fromDate: "2024-10-01T14:38:59.118Z",
          toDate: "2024-10-01T14:38:59.118Z",
          Output: address.Output,
          objectID: 0,
          objectInstanceID: 0,
          zipPostalCode: "",
          objAis: null
        }))
      };

      // Call the save/update contact form endpoint
      this.contactService.saveupdatecontactform(saveControllerPopupChangesIndividualObj).subscribe(
        response => {
          console.log("Contact save successful:", response);
          this.isEditable = false;
          this.isLoading = false;
        },
        error => {
          console.error("Error saving contact:", error);
          this.isLoading = false;
        }
      );
    }
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
  EditControllerValidateForm(): Promise<void> {
    if (
      ["Parent Entity", "Corporate Controller", "Head Office of a Branch", "UBO – Corporate"].includes(this.selectedController.EntityTypeDesc)
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

        // Validate Effective Date
        if (this.firmService.isNullOrEmpty(this.selectedController.AssnDateFrom) || this.selectedController.AssnDateFrom === undefined) {
          this.loadErrorMessages('AssnDateFrom', constants.ControllerMessages.ENTER_VALID_EFFECTIVEDATE);
          this.hasValidationErrors = true;
        }
        if (this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.AssnDateFrom) >= this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.AssnDateTo)) {
          this.loadErrorMessages('AssnDateTo', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
          this.hasValidationErrors = true;
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
          const pct = parseFloat(this.selectedController.PctOfShares);
          if (isNaN(pct) || pct < 0 || pct > 100) {
            this.loadErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_VALID_PERCENTAGE);
            this.hasValidationErrors = true;
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

        // Validate Date of Birth


        // Validate Is PEP
        if (this.selectedController.isPEP === undefined || this.selectedController.isPEP === null) {
          this.loadErrorMessages('isPEP', constants.ControllerMessages.SELECT_ISPEP, 'Is Politically Exposed Person (PEP)?*');
          this.hasValidationErrors = true;
        }
        if (this.selectedController.isPEP === undefined || this.selectedController.isPEP === null) {
          this.loadErrorMessages('isPEP', constants.ControllerMessages.SELECT_ISPEP, 'Is Politically Exposed Person (PEP)?*');
          this.hasValidationErrors = true;
        }
        if (!this.selectedController.ControllerControlTypeID) {
          this.loadErrorMessages('ControllerControlTypeDesc', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
          this.hasValidationErrors = true;
        }

        if (this.firmService.isNullOrEmpty(this.selectedController.DateOfBirth) || this.selectedController.DateOfBirth === undefined) {
          this.loadErrorMessages('dateOfBirth', constants.ControllerMessages.ENTER_VALID_BIRTHDATE);
          this.hasValidationErrors = true;
        }
        if (this.firmService.isNullOrEmpty(this.selectedController.AssnDateFrom) || this.selectedController.AssnDateFrom === undefined) {
          this.loadErrorMessages('AssnDateFrom', constants.ControllerMessages.ENTER_VALID_EFFECTIVEDATE);
          this.hasValidationErrors = true;
        }
        if (this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.AssnDateFrom) >= this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.AssnDateTo)) {
          this.loadErrorMessages('AssnDateTo', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
          this.hasValidationErrors = true;
        }

        // ADDRESS TYPE VALIDATION
        this.invalidAddress = this.existingControllerCorporateAddresses.find(address => !address.AddressTypeID || address.AddressTypeID === 0);
        if (this.invalidAddress) {
          this.loadErrorMessages('AddressTypeID', constants.AddressControlMessages.SELECT_ADDRESSTYPE);
          this.hasValidationErrors = true;
        } else {
          delete this.errorMessages['AddressTypeID'];
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
      ["Parent Entity", "Corporate Controller", "Head Office of a Branch", "UBO – Corporate"].includes(this.selectedController.EntityTypeDesc)
    ) {
      this.controllerService.deleteotherentitydetails(otherEntityID, relatedEntityID, entitySubTypeID, output).subscribe(
        response => {
          console.log("Controller Details Deleted successfully:", response);
          Swal.fire('Deleted!', 'Controller detail has been deleted.', 'success');
          this.loadControllers();
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
