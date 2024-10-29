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
  styleUrls: ['./controllers.component.scss','../firms.scss']
})
export class ControllersComponent implements OnInit{
  
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
  allAddressTypes: any = [];
  firmAddresses: any = [];
  hideForms: boolean = true;
  selectedController: any;
  isPopupOpen = false;
  ControllerfirmAddresses: any = [];
  existingControllerAddresses: any = [];
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
  TitleEdit: any[] = [];
  canAddNewAddress: boolean = true;

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
      this.getAddressTypesController();
      this.getlegalStatusController();
      this.getlegalStatusControllerCreate()
      this.getCorporateController();
      
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
    this.CreateControllerValidateForm().then(() => {
      if (!this.hasValidationErrors) {
        console.log("Selected Controller:", this.CreatecontrollerDetails.EntityTypeDesc);
        if (
          ["Parent Entity", "Corporate Controller", "Head Office of a Branch", "UBO – Corporate"].includes(this.CreatecontrollerDetails.EntityTypeDesc)
        ) {
          const saveControllerPopupChangesObj = {
            otherEntityDetails: {
              UserID: 30,
              UserName: null,
              OtherEntityName: this.CreatecontrollerDetails.OtherEntityName,
              OtherEntityID: null,
              ControllerControlTypeDesc: this.CreatecontrollerDetails.ControllerControlTypeDesc,
              EntityTypeDesc: this.CreatecontrollerDetails.EntityTypeDesc,
              DateOfIncorporation: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
              createdBy: this.userId,
              CessationDate: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.CessationDate),
              EffectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.EffectiveDate),
              CreatedDate: null,
              ControllerControlTypeID: this.CreatecontrollerDetails.ControllerControlTypeID,
              RelatedEntityID: null,
              EntitySubTypeID: null,
              EntityTypeID: this.CreatecontrollerDetails.EntityTypeID,
              RelatedEntityTypeID: this.CreatecontrollerDetails.EntityTypeID, /// yazan
              relatedEntityEntityID: null,
              MyState: 0,
              LegalStatusTypeID: this.CreatecontrollerDetails.LegalStatusTypeID,
              LegalStatusTypeDesc: this.CreatecontrollerDetails.LegalStatusTypeDesc,
              placeOfIncorporation: this.CreatecontrollerDetails.PlaceOfIncorporation,
              countryOfIncorporation: this.CreatecontrollerDetails.PlaceOfEstablishment,
              PctOfShares: this.CreatecontrollerDetails.PctOfShares,
              addressState: 2,
              registeredNumber: this.CreatecontrollerDetails.RegisteredNum,
              zebSiteAddress: this.CreatecontrollerDetails.zebSiteAddress,
              lastModifiedBy: 30,
              //LastModifiedDate : "2024-10-01T13:55:58.178Z",
              isAuditor: this.CreatecontrollerDetails.IsAuditor,
              isCompanyRegulated: this.CreatecontrollerDetails.IsCompanyRegulated,
              additionalDetails: this.CreatecontrollerDetails.AdditionalDetails,
              isParentController: this.CreatecontrollerDetails.IsParentController,
              isPublicallyTraded: this.CreatecontrollerDetails.IsPublicallyTraded,
              areAnyUBOs: this.CreatecontrollerDetails.More10UBOs,
              controllerInfo: this.CreatecontrollerDetails.ControllerInfo,
              Output: 0,
              FirmID: this.firmId,
              EntityID: this.firmId,
              numOfShares: this.CreatecontrollerDetails.NumOfShares,
              MajorityStockHolder: false,
              AssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom),
              AssnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo),
              LastModifiedByOfOtherEntity: 30,
            },
            addressList: this.addressForms.map(address => ({
              firmID: this.firmId,
              countryID: address.CountryID,
              addressTypeID: address.AddressTypeID,
              LastModifiedBy: this.userId,
              entityTypeID: this.CreatecontrollerDetails.EntityTypeID,
              entityID: this.firmId,
              contactID: address.contactID,
              addressID: null,
              addressLine1: address.addressLine1,
              addressLine2: address.addressLine2,
              addressLine3: address.addressLine3,
              addressLine4: address.addressLine4,
              city: address.city,
              // SameAsTypeID: address.AddressTypeID,
              stateProvince: address.stateProvince,
              createdBy: this.userId,
              addressAssnID: null,
              CreatedDate: address.CreatedDate,
              LastModifiedDate: address.LastModifiedDate,
              addressState: 2,
              fromDate: address.fromDate,
              toDate: address.toDate,
              Output: address.Output,
              objectID: address.objectID,
              objectInstanceID: this.firmId,
              sourceObjectInstanceID: this.firmId,
              ObjectInstanceRevNum: 1,
              SourceObjectInstanceRevNum: 1,
              zipPostalCode: address.zipPostalCode,
              SourceObjectID: 705,
            })),

            regulatorList: this.regulatorList.map(regulator => ({
              EntityTypeID: regulator.EntityTypeID,
              EntityID: regulator.EntityID,
              UserID: regulator.UserID,
              FirmID: regulator.FirmID,
              RelatedEntityTypeID: regulator.RelatedEntityTypeID,
              relatedEntityID: regulator.relatedEntityID,
              Output: regulator.Output,
              regulatorState: regulator.regulatorState,
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
          }
          console.log("Controller to be saved", saveControllerPopupChangesObj)
          // Call the insert/update endpoint
          this.controllerService.insertupdateotherentitydetails(saveControllerPopupChangesObj).subscribe(
            response => {
              console.log("Save successful:", response);
              this.isEditable = false;
              this.loadControllers();
            },
            error => {
              console.error("Error saving changes:", error);
            }
          );

        }

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
              isPeP: this.CreatecontrollerDetails.IsPEP,
              AssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateFrom),
              AssnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.AssnDateTo),
              LastModifiedByOfOtherEntity: 30,
              JurisdictionId: 3,
            },
            lstContactFunctions: null,
          },
          Addresses: this.addressForms.map(address => ({
            firmID: this.firmId,
            countryID: address.CountryID,
            addressTypeID: address.AddressTypeID,
            LastModifiedBy: this.userId,
            entityTypeID: this.CreatecontrollerDetails.EntityTypeID,
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
            addressState: 2,
            fromDate: "2024-10-01T14:38:59.118Z",
            toDate: "2024-10-01T14:38:59.118Z",
            Output: address.Output,
            objectID: 0,
            objectInstanceID: 0,
            zipPostalCode: "",
            objAis: null
          }))
        };

        this.contactService.saveupdatecontactform(saveControllerPopupChangesIndividualObj).subscribe(
          response => {
            console.log("Contact save successful:", response);
          },
          error => {
            console.error("Error saving contact:", error);
          }
        );
      }
      else {
        console.log('Validation errors found:', this.errorMessages);
      }
    });
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
    IsPEP: 0,
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
    zebSiteAddress: '',
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

  addressForms = [
    {
      AddressTypeID: 0,
      addressLine1: '',
      addressLine2: '',
      firmID: this.firmId,
      CountryID: '',
      addressTypeID: '',
      LastModifiedBy: 30,
      entityTypeID: this.CreatecontrollerDetails.EntityTypeID,
      entityID: this.CreatecontrollerDetails.EntityID,
      contactID: 0,
      addressID: null,
      addressLine3: '',
      addressLine4: '',
      city: '',
      sameAsTypeID: 0,
      createdBy: 0,
      addressAssnID: null,
      CreatedDate: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.CreatedDate),
      LastModifiedDate: this.currentDate,
      addressState: 2,
      fromDate: null,
      toDate: null,
      Output: 0,
      stateProvince: '',
      objectID: this.CreatecontrollerDetails.ObjectID,
      objectInstanceID: this.firmId,
      sourceObjectInstanceID: this.firmId,
      objAis: null,
      zipPostalCode: '',
    }
  ];

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
      RegulatorID: 39,
      RegulatorName: "Bahrain Monetary Agency",
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

      // Validate Full Name of Entity
      if (!this.CreatecontrollerDetails.OtherEntityName) {
        this.firmDetailsService.getErrorMessages('OtherEntityName', constants.ControllerMessages.ENTER_OTHER_ENTITY_NAME);
        this.hasValidationErrors = true;
      }

      // Validate Effective Date
      if (!this.CreatecontrollerDetails.AssnDateFrom) {
        this.firmDetailsService.getErrorMessages('AssnDateFrom', constants.ControllerMessages.ENTER_VALID_EFFECTIVEDATE);
      }

      // Validate Cessation Date
      if (!this.CreatecontrollerDetails.AssnDateTo) {
        this.firmDetailsService.getErrorMessages('AssnDateTo', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
      } else if (this.CreatecontrollerDetails.AssnDateFrom && new Date(this.CreatecontrollerDetails.AssnDateFrom) > new Date(this.CreatecontrollerDetails.AssnDateTo)) {
        this.firmDetailsService.getErrorMessages('AssnDateTo', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
      }

      // Validate Place of Establishment
      if (!this.CreatecontrollerDetails.PlaceOfEstablishment) {
        this.firmDetailsService.getErrorMessages('PlaceOfEstablishment', constants.ControllerMessages.SELECT_RECORD);
      }

      // Validate Type of Control
      if (!this.CreatecontrollerDetails.ControllerControlTypeDesc) {
        this.firmDetailsService.getErrorMessages('ControllerControlTypeDesc', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
      }

      // Validate Percentage of Holding
      if (this.CreatecontrollerDetails.PctOfShares) {
        const pct = parseFloat(this.CreatecontrollerDetails.PctOfShares);
        if (isNaN(pct) || pct < 0 || pct > 100) {
          this.firmDetailsService.getErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_VALID_PERCENTAGE);
        }
      }

      // Check for any validation errors
      if (Object.keys(this.errorMessages).length > 0) {
        this.hasValidationErrors = true;
        resolve(); // Resolve with errors
      } else {
        resolve(); // Resolve with no errors
      }
    });
  }



  editController(): void {
    this.isEditable = true;
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
      },
      error => {
        console.error('Error fetching address types:', error);
      }
    );
  }

  getAddressTypeDesc(addressTypeID: number): string {
    const selectedType = this.allAddressTypes.find(type => type.AddressTypeID === addressTypeID);
    return selectedType ? selectedType.AddressTypeDesc : 'Unknown';
  }

  onSameAsTypeChangeg(event: any, address: any): void {
    const selectedSameAsTypeID = event.target.value;

    // Set the AddressTypeID based on Same As Type selection
    if (selectedSameAsTypeID && selectedSameAsTypeID !== '0') {
      address.AddressTypeID = selectedSameAsTypeID;
    }
  }

  onAddressTypeChange(event: any, address: any) {
    const selectedAddressTypeId = Number(event.target.value);

    if (selectedAddressTypeId === 0) {
      // Do nothing if the "Select" option is chosen
      address.AddressTypeID = 0;
      address.AddressTypeDesc = '';
      return;
    }

    // Get all valid addresses
    const validAddresses = this.firmAddresses.filter(addr => addr.Valid);

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
    const selectedAddressType = this.allAddressTypes.find(type => type.AddressTypeID === selectedAddressTypeId);

    if (selectedAddressType) {
      // Update the Address model
      address.AddressTypeID = selectedAddressType.AddressTypeID;
      address.AddressTypeDesc = selectedAddressType.AddressTypeDesc;
    }
  }

  showError(messageKey: number) {
    this.firmDetailsService.showErrorAlert(messageKey, this.isLoading);
  }

  loadFirmAdresses() {
    this.isLoading = true;
    this.addressService.getFirmAddresses(this.firmId).subscribe(
      data => {
        this.firmAddresses = data.response;
        this.isLoading = false;
      }, error => {
        console.error('Error Fetching Firm Addresses', error);
        this.isLoading = false;
      })
  }
  removeAddressForm(index: number): void {
    this.addressForms.splice(index, 1);
  }

  addAddressForm(): void {
    if (this.addressForms.length === 0) {
      // If the array is empty, add the first form without validation
      this.addressForms.push({
        AddressTypeID: 0,
        addressLine1: '',
        addressLine2: '',
        firmID: this.firmId,
        CountryID: '',
        addressTypeID: '',
        LastModifiedBy: 30,
        entityTypeID: this.CreatecontrollerDetails.EntityTypeID,
        entityID: this.CreatecontrollerDetails.EntityID,
        contactID: 0,
        addressID: null,
        addressLine3: '',
        addressLine4: '',
        city: '',
        sameAsTypeID: 0,
        createdBy: 0,
        addressAssnID: null,
        CreatedDate: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.CreatedDate),
        LastModifiedDate: this.currentDate,
        addressState: 2,
        fromDate: null,
        toDate: null,
        Output: 0,
        objectID: this.CreatecontrollerDetails.ObjectID,
        objectInstanceID: this.firmId,
        sourceObjectInstanceID: this.firmId,
        objAis: null,
        zipPostalCode: '',
        stateProvince: '',
      });
    }
    else if (this.addressForms.length < 3 && this.isFormValid()) {
      this.addressForms.push({
        AddressTypeID: 0,
        addressLine1: '',
        addressLine2: '',
        sameAsTypeID: 0,
        firmID: this.firmId,
        CountryID: '',
        addressTypeID: '',
        LastModifiedBy: 30,
        entityTypeID: this.CreatecontrollerDetails.EntityTypeID,
        entityID: this.CreatecontrollerDetails.EntityID,
        contactID: 0,
        addressID: null,
        addressLine3: '',
        addressLine4: '',
        city: '',
        createdBy: 0,
        addressAssnID: null,
        CreatedDate: this.dateUtilService.convertDateToYYYYMMDD(this.CreatecontrollerDetails.CreatedDate),
        LastModifiedDate: this.currentDate,
        addressState: 2,
        fromDate: null,
        toDate: null,
        Output: 0,
        objectID: this.CreatecontrollerDetails.ObjectID,
        objectInstanceID: this.firmId,
        sourceObjectInstanceID: this.firmId,
        objAis: null,
        zipPostalCode: '',
        stateProvince: '',
      });
    }
  }

  isFormValid(): boolean {
    const lastForm = this.addressForms[this.addressForms.length - 1];
    if (!lastForm.AddressTypeID) {
      this.errorMessages['AddressTypeID'] = 'Address Type is required.';
      return false;
    }
    return true;
  }

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
    this.loadControllerFirmAdresses(
      this.selectedController.OtherEntityID,
      this.selectedController.EntityTypeID,
      this.userId,
      44 // Static opTypeId
    );
    this.existingControllerAddresses = this.ControllerfirmAddresses.filter(address => address.Valid);
    this.parentEntity.getRegulatorDetails(this.selectedController.OtherEntityID, this.selectedController.EntityTypeID).subscribe(
      data => {
        if (data.response && data.response.length > 0) {
          this.homeRegulater = data.response[0]; // Assuming it's an array and taking the first element
        }
      },
    );


  }

  closeControllerPopup(): void {
    this.isPopupOpen = false;
    this.errorMessages = {}; // Clear previous error messages
    this.hasValidationErrors = false;
  }
  closeCreateControllerPopup(): void {
    this.isEditable = false;
    this.showCreateControllerSection = false; // Close the popup
    this.errorMessages = {}; // Clear previous error messages
    this.hasValidationErrors = false;
    this.hideForms = true;
  }
  EditControllerValidateForm(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.errorMessages = {}; // Clear previous error messages
      this.hasValidationErrors = false;

      // Validate Full Name of Entity
      if (!this.selectedController.OtherEntityName) {
        this.firmDetailsService.getErrorMessages('OtherEntityName', constants.ControllerMessages.ENTER_OTHER_ENTITY_NAME);
      }

      // Validate Effective Date
      if (!this.selectedController.EffectiveDate) {
        this.firmDetailsService.getErrorMessages('EffectiveDate', constants.ControllerMessages.ENTER_VALID_EFFECTIVEDATE);
      }

      // Validate Cessation Date
      if (!this.selectedController.CessationDate) {
        this.firmDetailsService.getErrorMessages('CessationDate', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
      } else if (this.selectedController.EffectiveDate && new Date(this.selectedController.EffectiveDate) > new Date(this.selectedController.CessationDate)) {
        this.firmDetailsService.getErrorMessages('CessationDate', constants.ControllerMessages.ENTER_GREATER_CESSATION_DATE);
      }

      // Validate Place of Establishment
      if (!this.selectedController.PlaceOfEstablishment) {
        this.firmDetailsService.getErrorMessages('PlaceOfEstablishment', constants.ControllerMessages.SELECT_RECORD);
      }

      // Validate Type of Control
      if (!this.selectedController.ControllerControlTypeDesc) {
        this.firmDetailsService.getErrorMessages('ControllerControlTypeDesc', constants.ControllerMessages.SELECT_TYPEOFCONTROL);
      }

      // Validate Percentage of Holding
      if (this.selectedController.PctOfShares) {
        const pct = parseFloat(this.selectedController.PctOfShares);
        if (isNaN(pct) || pct < 0 || pct > 100) {
          this.firmDetailsService.getErrorMessages('PctOfShares', constants.ControllerMessages.ENTER_VALID_PERCENTAGE);
        }
      }

      // Check for any validation errors
      if (Object.keys(this.errorMessages).length > 0) {
        this.hasValidationErrors = true;
        resolve(); // Resolve with errors
      } else {
        resolve(); // Resolve with no errors
      }
    });
  }

  loadControllerFirmAdresses(entityID: number, entityTypeID: number, userId: number, opTypeId: number): void {
    this.isLoading = true;

    // Logging for debugging
    console.log("Sending Firm Addresses request with parameters:", { entityID, entityTypeID, userId, opTypeId });

    // Fetch firm addresses from the service
    this.addressService.getControllerFirmAddresses(entityID, entityTypeID, userId, opTypeId).subscribe(
      data => {
        if (data.response) {
          this.ControllerfirmAddresses = data.response;
          console.log('Firm Addresses:', this.ControllerfirmAddresses);
        } else {
          console.warn('No addresses found for this firm');
        }
        this.isLoading = false;
      },
      error => {
        console.error('Error Fetching Firm Addresses', error);
        this.isLoading = false;
      }
    );
  }
  createController() {
    this.showCreateControllerSection = true;
    this.getTitleCreate();
    this.getAddressTypesControllerCreate();
    this.getlegalStatusControllerCreate();
    this.getControllerControlTypesCreat();
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
  getControllerControlTypesCreat(): void {
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
        this.TitleEdit = data.response;
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

  getAddressTypesController(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.addressTypes, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.addressTypeOptionsEdit = data.response;
        console.log("getAddressTypesController", data)
      }, error => {
        console.error("Error fetching AddressTypes", error);
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
        console.log("Controllers", data)
      }, error => {
        console.error("Error fetching Controllers", error);
      });
  }

  changeControlType() {
    if (this.CreatecontrollerDetails.SelectedControlType === 'select') {
      this.hideForms = true;
    }
    else {
      this.hideForms = false;
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

  DeleteControllerPopup(): void {
    const otherEntityID = this.selectedController.OtherEntityID;
    const relatedEntityID = this.selectedController.RelatedEntityID;
    const entitySubTypeID = 5;
    const output = 0; // As per your requirement
    console.log("DeleteControllerPopup", otherEntityID, relatedEntityID, entitySubTypeID)
    // Make the DELETE request with all required query parameters
    this.controllerService.deleteotherentitydetails(otherEntityID, relatedEntityID, entitySubTypeID, output).subscribe(
      response => {
        console.log("Controller Details Deleted successfully:", response);
        Swal.fire('Deleted!', 'Controller detail has been deleted.', 'success');
        this.loadControllers();
      },
      error => {
        console.error("Error deleting Controller:", error);
        Swal.fire('Error!', 'There was a problem deleting the controller detail.', 'error');
      }
    );
  }

  saveControllerPopupChanges(): void {
    this.isEditable = false;
    this.existingControllerAddresses = this.ControllerfirmAddresses.filter(address => address.Valid);
    this.EditControllerValidateForm().then(() => {
      console.log("Selected Controller:", this.selectedController);
      if (
        ["Parent Entity", "Corporate Controller", "Head Office of a Branch", "UBO – Corporate"].includes(this.selectedController.EntityTypeDesc)
      ) {
        const saveControllerPopupChangesObj = {
          otherEntityDetails: {
            UserID: 30,
            UserName: null,
            OtherEntityName: this.selectedController.OtherEntityName,
            otherEntityID: this.selectedController.OtherEntityID,
            DateOfIncorporation: this.dateUtilService.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
            createdBy: this.selectedController.CreatedBy,
            CessationDate: this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.CessationDate),
            EffectiveDate: this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.EffectiveDate),
            CreatedDate: null,
            relatedEntityID: this.selectedController.RelatedEntityID,
            entitySubTypeID: this.selectedController.EntitySubTypeID,
            relatedEntityTypeID: this.selectedController.EntityTypeID,
            relatedEntityEntityID: this.selectedController.RelatedEntityEntityID,
            myState: this.selectedController.myState,
            LegalStatusTypeID: this.selectedController.LegalStatusTypeID,
            LegalStatusTypeDesc: this.selectedController.LegalStatusTypeDesc,
            placeOfIncorporation: this.selectedController.PlaceOfIncorporation,
            countryOfIncorporation: this.selectedController.countryOfIncorporation,
            registeredNumber: this.selectedController.RegisteredNum,
            zebSiteAddress: this.selectedController.zebSiteAddress,
            lastModifiedBy: 30,
            ControllerControlTypeDesc: null,
            isAuditor: this.selectedController.isAuditor,
            isCompanyRegulated: this.selectedController.IsCompanyRegulated,
            additionalDetails: this.selectedController.additionalDetails,
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
            LastModifiedByOfOtherEntity: 30,
          },
          addressList: this.existingControllerAddresses.map(address => ({
            firmID: this.firmId,
            countryID: address.CountryID,
            AddressTypeID: address.AddressTypeID,
            LastModifiedBy: this.userId,
            entityTypeID: this.CreatecontrollerDetails.EntityTypeID,
            entityID: this.firmId,
            contactID: address.contactID,
            AddressID: address.AddressID.toString(),
            addressState: 6,
            AddressLine1: address.AddressLine1,
            AddressLine2: address.AddressLine2,
            AddressLine3: address.AddressLine3,
            AddressLine4: address.AddressLine4,
            City: address.City,
            createdBy: address.createdBy,
            AddressAssnID: address.AddressAssnID,
            CreatedDate: address.CreatedDate,
            LastModifiedDate: address.LastModifiedDate,
            fromDate: address.fromDate,
            toDate: address.toDate,
            Output: address.Output,
            ObjectID: address.ObjectID,
            Province: address.Province,
            ObjectInstanceID: address.ObjectInstanceID,
            ObjectInstanceRevNumber: address.ObjectInstanceRevNumber,
            SourceObjectID: address.SourceObjectID,
            SourceObjectInstanceID: address.SourceObjectInstanceID,
            SourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNumber,
            PostalCode: address.PostalCode,
          })),

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
          },
          error => {
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
              OtherEntityName: this.selectedController.OtherEntityName,
              EntityTypeID: this.selectedController.EntityTypeID,
              Title: this.selectedController.Title,
              FirstName: this.selectedController.FirstName,
              secondName: this.selectedController.SecondName,
              thirdName: this.selectedController.ThirdName,
              familyName: this.selectedController.FamilyName,
              PctOfShares: this.selectedController.PctOfShares,
              tempContactID: 0,
              countryOfResidence: null,
              ControllerControlTypeID: this.selectedController.ControllerControlTypeID,
              createdBy: this.userId,
              dateOfBirth: this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.DateOfBirth),
              fullName: null,
              lastModifiedBy: this.userId,
              MyState: 0,
              nationalID: null,
              nationality: null,
              EntityID: this.firmId,
              passportNum: this.selectedController.PassportNum,
              placeOfBirth: this.selectedController.PlaceOfBirth,
              previousName: null,
              isExists: false,
              FunctionTypeId: 25,
              nameInPassport: null,
              contactAddnlInfoTypeID: null,
              isFromContact: null,
              countryofBirth: null,
              juridictionID: null,
              objectID: this.selectedController.ObjectID,
              isPeP: this.selectedController.IsPEP,
              AssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.AssnDateFrom),
              AssnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.selectedController.AssnDateTo),
              LastModifiedByOfOtherEntity: 30,
              JurisdictionId: 3,
            },
            lstContactFunctions: null,
          },
          Addresses: this.addressForms.map(address => ({
            firmID: this.firmId,
            countryID: 16,//address.CountryID,
            addressTypeID: 2,//address.AddressTypeID,
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
          },
          error => {
            console.error("Error saving contact:", error);
          }
        );
      }
    });
  }

  removeControllerAddress(index: number) {
    Swal.fire({
      text: 'Are you sure you want to delete this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.errorMessages = {};
        if (index > -1 && index < this.ControllerfirmAddresses.length) {
          const address = this.ControllerfirmAddresses[index];
          if (!address.AddressID) { // means newly added address
            // If the address doesn't have an AddressID, completely remove it from the array
            this.ControllerfirmAddresses.splice(index, 1);
          } else {
            // Otherwise, just mark it as removed
            address.isRemoved = true;
          }
          // Re-check if all address types have been added after removal
          const validAddressCount = this.ControllerfirmAddresses.filter(addr => addr.Valid && !addr.isRemoved).length;
          this.canAddNewAddress = validAddressCount < this.allAddressTypes.length;
        }
      }
      // No action needed if the user cancels
    });
  }

  get filteredControllerfirmAddresses() {
    return this.ControllerfirmAddresses.filter(addr => !addr.isRemoved);
  }

  getPlaceOfEstablishmentName(): string {
    const place = this.allCountries.find(option => option.CountryID === this.selectedController.PlaceOfEstablishment);
    return place ? place.CountryName : '';
  }

  getLegalStatusDescription(): string {
    const status = this.legalStatusOptionsEdit.find(option => option.LegalStatusTypeID === this.selectedController.LegalStatusTypeID);
    return status ? status.LegalStatusTypeDesc : '';
  }

}
