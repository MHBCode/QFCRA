import { ChangeDetectorRef, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from 'src/app/ngServices/security.service';
import { FirmService } from '../firm.service';
import { FirmDetailsService } from '../firmsDetails.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { ContactService } from 'src/app/ngServices/contact.service';
import * as constants from 'src/app/app-constants';
import Swal from 'sweetalert2';
import { ParententityService } from 'src/app/ngServices/parententity.service';
import { AddressesService } from 'src/app/ngServices/addresses.service';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import { FrimsObject } from 'src/app/app-constants';
import { AiElectronicswfService } from 'src/app/ngServices/ai-electronicswf.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss', '../firms.scss']
})
export class ContactsComponent {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  Page = FrimsObject;
  userId = 30; // Replace with dynamic userId as needed
  firmId: number = 0;
  errorMessages: { [key: string]: string } = {};
  firmDetails: any;
  AllRegulater: any = [];
  hasValidationErrors: boolean = false;
  loading: boolean;
  isLoading: boolean = false;
  now = new Date();
  isCIP: string = '';
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  FIRMContacts: any[] = [];
  isPopupVisible: boolean = false;
  selectedContact: any = null;
  displayInactiveContacts: boolean = false;
  showCreateContactSection: boolean = false;
  Address: any = {};
  allCountries: any = [];
  allAddressTypes: any = [];
  controlTypeOptionsCreate: any[] = [];
  controllerTypeOption: any = [];
  objectOpTypeIdEdit = 41;
  objectOpTypeIdCreate = 40;
  legalStatusOptionsEdit: any[] = [];
  Titles: any[] = [];
  MethodofContactOption: any = [];
  AllContactFrom: any = [];
  AllAvilabilContact: any = [];
  contactTypeOption: any = [];
  Column2: string = '';
  isEditContact: boolean = false;
  ContactFunctionTypeList: any[] = [];
  selectedContactFunctions: any[] = [];
  showMLROSection: boolean = false;
  /* Contact Addresses */
  existingContactAddresses: any = [];
  contactFirmAddresses: any = [];
  contactFirmAddressesTypeHistory: any = [];
  removedAddresses: any[];
  hideAddresses: boolean = true;
  callAddressType: boolean = false;


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
    private contactService: ContactService,
    private parentEntity: ParententityService,
    private cdr: ChangeDetectorRef,
    private addressService: AddressesService,
    private flatpickrService: FlatpickrService,
    private logForm: LogformService,
    private aiElectronicswfService:AiElectronicswfService,
  ) {

  }

  ngOnInit(): void {
    this.firmService.scrollToTop();
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      if (this.FIRMContacts.length === 0) {
        this.loadContacts();
      }
      this.loadFirmDetails(this.firmId);
      this.getAllRegulater(this.Address.countryID, this.firmId);
      this.populateCountries();
      this.getlegalStatusController();
      this.getAllContactFromByFrimsId();
      this.getControllerControlTypesCreat();
      this.getlegalStatusController();
      this.getContactType();
      this.getPreferredMethodofContact();
      this.getAvilabilContact();
      this.getTitleCreate();
      this.getAddressTypesContact();
       this.getContactFunctionType();
       this.fetchResidencyStatus();
       this.convertFunctionsToArray();
       this.initializeSelectedFunctions();
       this.initializeCheckboxes();
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
        console.log(" this.firmDetails", this.firmDetails)
      },
      error => {
        console.error(error);
      }
    );
  }


  loadContacts() {
    this.isLoading = true;
    this.contactService.getContactsOfFIRM(this.firmId).subscribe(
      data => {
        this.FIRMContacts = data.response;
        console.log('Firm FIRM Contacts details:', this.FIRMContacts);
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching firm details', error);
        this.isLoading = false;
      }
    );
  }

  loadContactFirmAdresses(contactAssId: number, userId: number, opTypeId: number): void {
    this.isLoading = true;

    // Fetch firm addresses from the service
    this.addressService.getContactFirmAddresses(contactAssId, userId, opTypeId).subscribe(
      data => {
        if (data.response) {
          this.contactFirmAddresses = data.response;

          console.log('Controller Corporate Firm Addresses:', this.contactFirmAddresses);
        } else {
          console.warn('No addresses found for this firm');
        }
        this.isLoading = false;
      },
      error => {
        console.error('Error Fetching Firm Addresses', error);
        this.contactFirmAddresses = [];
        this.isLoading = false;
      }
    );
  }


  confirmDelete() {
    console.log("confirmDelete called: ", this.selectedContact)
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this contact?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteContact(true); // Just pass output here, no need for ": boolean"
      }
    });
  }
  onRowClick(contact: any): void {
    // Reset the selected contact and hide the popup until data is loaded
    this.selectedContact = {};
    this.isPopupVisible = false;

    // Fetch contact details based on the selected row
    this.contactService.getContactDetails(this.firmId, contact.ContactID, contact.ContactAssnID).subscribe(
      (data) => {
        if (data && data.response) {
          this.selectedContact = data.response; // Assign the received data to selectedContact
          console.log("Selected contact: ", this.selectedContact); // Log to check data

          // Convert lstContactFunctions to an array if needed
          
          this.convertFunctionsToArray();
          // Fetch additional data after the contact details are set
          this.fetchResidencyStatus();
          this.initializeSelectedFunctions();
          
          this.initializeCheckboxes();
          // Trigger change detection to update the view
          this.cdr.detectChanges();

          // Show the popup after data is loaded and processed
          this.isPopupVisible = true;
        } else {
          console.error('No contact data received:', data);
          this.isPopupVisible = false; // Hide popup if no data is received
        }
      },
      (error) => {
        console.error('Error fetching contact details', error);
        this.isPopupVisible = false; // Hide popup if there's an error
      }
    );
  }
  // onRowClick(contact: any): void {
  //   // Reset the selected contact and hide the popup until data is loaded
  //   this.selectedContact = {};
  //   this.isPopupVisible = false;

  //   // Fetch contact details based on selected row
  //   this.contactService.getContactDetails(this.firmId, contact.ContactID, contact.ContactAssnID).subscribe(
  //     data => {
  //       if (data && data.response) {
  //         this.selectedContact = data.response; // Assign the received data to selectedContact
  //         console.log("Selected contact: ", this.selectedContact); // Log to check data
  //         this.isPopupVisible = true; // Show the popup after data is loaded
  //         //this.cdr.detectChanges(); // Trigger change detection to update the view
  //         this.loadContactFirmAdresses(
  //           this.selectedContact.contactAssnID,
  //           this.userId,
  //           this.Page.Contatcs // Static opTypeId
  //         );
  //         this.fetchResidencyStatus();
  //       } else {
  //         console.error('No contact data received:', data);
  //         this.isPopupVisible = false; // Hide popup if no data is received
  //       }
  //     },
  //     error => {
  //       console.error('Error fetching contact details', error);
  //       this.isPopupVisible = false; // Hide popup if there's an error
  //     }
  //   );
  // }

  get filteredContacts() {
    if (this.displayInactiveContacts) {
      return this.FIRMContacts;
    } else {
      return this.FIRMContacts.filter(contact => contact.ContactTypeDesc !== 'Contact- No Longer');
    }
  }
  // Method to handle the checkbox change
  onInactiveContactsToggle(event: any): void {
    this.displayInactiveContacts = event.target.checked;
  }

  closeContactPopup() {
    this.isPopupVisible = false;
    this.isEditContact = false;
    this.errorMessages = {}; // Clear previous error messages
    this.hasValidationErrors = false;
    this.selectedContact = {};
    this.ContactFunctionTypeList.forEach(contactFunction => {
      contactFunction.isSelected = false;
      contactFunction.effectiveDate = '';
      contactFunction.endDate = '';
      contactFunction.reviewStatus = '';
    });
    this.selectedContactFunctions = [];
  this.ResidencyStatusCheck = { AttributeValue: '' };
    // this.contactFirmAddresses.push(this.defaultAddress);
    // this.existingContactAddresses.push(this.defaultAddress);
  }
  getContactType(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.ContactTypes, 40)
      .subscribe(data => {
        this.contactTypeOption = data.response;
        console.log("Controllers", data)
      }, error => {
        console.error("Error fetching Controllers", error);
      });
  }

  saveContactPopupChanges(): void {
    this.existingContactAddresses = this.contactFirmAddresses.filter(address => address.Valid);
    // Prepare the selectedContact object (which is bound to the form) to be saved
    const contactDetails = {
      firmId: this.firmId, // Ensure firmId is correctly passed
      contactID: this.selectedContact?.ContactID,
      title: this.selectedContact?.Title,
      firstName: this.selectedContact?.FirstName,
      secondName: this.selectedContact?.SecondName,
      thirdName: this.selectedContact?.ThirdName,
      familyName: this.selectedContact?.FamilyName,
      countryOfResidence: this.selectedContact?.countryOfResidence,
      createdBy: this.selectedContact?.createdBy,
      dateOfBirth: this.selectedContact?.dateOfBirth,
      fullName: this.selectedContact?.FirstName,
      lastModifiedBy: this.selectedContact?.LastModifiedBy,
      nationalID: this.selectedContact?.NationalID,
      nationality: this.selectedContact?.Nationality,
      passportNum: this.selectedContact?.PassportNum,
      placeOfBirth: this.selectedContact?.PlaceOfBirth,
      previousName: this.selectedContact?.PreviousName,
      isExists: this.selectedContact?.IsExists,
      nameInPassport: this.selectedContact?.NameInPassport,
      contactAddnlInfoTypeID: this.selectedContact?.ContactAddnlInfoTypeID,
      isFromContact: this.selectedContact?.IsFromContact,
      countryofBirth: this.selectedContact?.CountryofBirth,
      juridictionID: this.selectedContact?.JuridictionID,
      objectID: this.selectedContact?.ObjectID,
      isPeP: this.selectedContact?.IsPeP,
    };

    console.log("Data to be saved:", contactDetails);

    this.contactService.saveContactDetails(contactDetails).subscribe(
      (response) => {
        console.log('Contact saved successfully:', response);
        Swal.fire('Saved!', 'The contact details have been saved.', 'success');
        this.closeContactPopup();
        this.loadContacts(); // Reload the contacts list after saving
      },
      (error) => {
        console.error('Error saving contact details:', error);
        Swal.fire('Error!', 'There was an issue saving the contact.', 'error');
      }
    );
  }

  UpdateContactPopupChange() {
    this.closeContactPopup();
  }

  createContact() {
    this.showCreateContactSection = true;
    this.addedAddresses = [];
    this.addedAddresses = [this.createDefaultAddress()];
  }

  closeCreateContactPopup() {
    this.isEditContact = false;
    this.errorMessages = {}; // Clear previous error messages
    this.hasValidationErrors = false;
    this.addedAddresses = [this.createDefaultAddress()];
    this.showCreateContactSection = false;
    this.CreatecontrollerDetails = this.CreatecontrollerDetailsDefualt();
    this.createContactObj = this.initializeCreateContactObj();
    this.ContactFunctionTypeList.forEach(contactFunction => {
      contactFunction.isSelected = false;
      contactFunction.effectiveDate = '';
      contactFunction.endDate = '';
      contactFunction.reviewStatus = '';
    });
  }
  initializeCreateContactObj(): any {
    return {
      firmID: 0,
      contactID: 0,
      contactAssnID: 0,
      title: "",
      contactType: 0,
      firstName: "",
      secondName: "",
      thirdName: "",
      familyName: "",
      countryOfResidence: 0,
      ContactMethodTypeID: 0,
      aIsContactTypeID: null,
      createdBy: 0,
      dateOfBirth: "",
      fullName: "",
      lastModifiedBy: 0,
      ContactFrom: '',
      nationalID: "",
      nationality: 0,
      passportNum: "",
      placeOfBirth: "",
      previousName: "",
      isExists: true,
      nameInPassport: "",
      contactAddnlInfoTypeID: 0,
      isFromContact: true,
      countryofBirth: 0,
      juridictionID: 0,
      objectID: 0,
      isPeP: null,
      EntityTypeID: 0,
      contactTypeId: 0,
      functionTypeId: 0,
      mobileNum: "",
      busEmail: "",
      otherEmail: "",
      contactMethodTypeID: 0,
      entitySubTypeID: 0,
      numOfShares: 0,
      pctOfShares: 0,
      majorityStockHolder: true,
      assnDateFrom: "",
      assnDateTo: "",
      controllerControlTypeID: 0,
      jobTitle: "",
      nameAsInPassport: "",
      busPhone: "",
      residencePhone: "",
      strContactAddnlInfoTypeID:"",
      strContactAddnInfoTypes:"",
      fax: "",
      qfcNumber: "",
      isContactSelected: true,
      isIndividualRegulated: true,
      additionalDetails: "",
      ipAddress: "",
      ainId: 0,
      ainNumber: 0,
      applicationID: 0,
      docID: 0,
      dateRecieved: "",
      formProcessor: 0,
      comment: "",
      condApprovalReasonTypeID: 0,
      reasonForDelayInFiling: "",
      residentStatus: "",
      isOrdinarilyResident: true,
      applFeeReceived: "",
      applFeeComment: "",
      wcfAddnlInfo: "",
      placeOfBirthCountryID: 0,
      jurisdictionId: 0,
      totalIndiustryExperenceYear: 0,
      totalIndustryExperenceMonth: 0,
      roleExperenceMonth: 0,
      roleExperenceYear: 0,
      pastPositionFlag: 0,
      experience: "",
      appIndividualArrangementTypeID: 0,
      otherArrangementTypeDesc: "",
      appIndividualDataID: 0,
      pastPositionDesc: "",
      fandPAddnlInfo: "",
      poposedJobTitle: "",
      jobDescription: "",
      cfExercise: "",
      withdrawlReasonDesc: "",
      altArrangementDesc: "",
      competenciesAndExp: "",
      createdDate: "",
      lastModifedDate: "",
      proposedToQatarDateDays: "",
      proposedToQatarDateMonth: "",
      proposedToQatarDateYear: "",
      contactFunctionID: 0,
      contactFunctionTypeID: 0,
      contactFunctionTypeDesc: "",
      effectiveDate: "",
      endDate: "",
      lastModifiedDate: "",
      reviewStatus: "",
      selected: true,
      isFunctionActive: true,
      isRecordEditable: 0,
      countryID: 0,
      addressTypeID: 0,
      sameAsTypeID: 0,
      addressAssnID: 0,
      addressID: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      addressLine4: "",
      city: "",
      province: "",
      postalCode: "",
      entityId: this.firmId,
      phoneNumber: "",
      phoneExt: "",
      faxNumber: "",
      addressState: 0,
      fromDate: "",
      toDate: "",
      objectInstanceID: 0,
      objectInstanceRevNumber: 0,
      sourceObjectID: 0,
      sourceObjectInstanceID: 0,
      sourceObjectInstanceRevNumber: 0,
      selectedContactFrom: '',
    }
  }
  CreatecontrollerDetailsDefualt() {
    return {
      SelectedControlType: '',
      TypeOfControl: '',
      EntityTypeDesc: '',
      OtherEntityID: 0,
      OtherEntityName: '',
      LegalStatusTypeID: 0,
      PctOfShares: '',
      PlaceOfEstablishment: '',
      aIsContactTypeID: '',
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
    aIsContactTypeID: '',
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

  removeRegulator(index: number) {
    this.regulatorList.splice(index, 1);
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



  getControllerControlTypesCreat(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.ControllerControlTypes, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.controlTypeOptionsCreate = data.response;
        console.log("getControllerControlTypes", data)
      }, error => {
        console.error("Error fetching controller control types:", error);
      });
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


  getlegalStatusController(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.legalStatusController, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.legalStatusOptionsEdit = data.response;
        console.log("getlegalStatusController", data)
      }, error => {
        console.error("Error fetching legalStatus", error);
      });
  }

  getAddressTypesContact(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.contactAddressTypes, this.objectOpTypeIdEdit)
      .subscribe(data => {
        this.allAddressTypes = data.response;
        console.log("getAddressTypesContact", data)
      }, error => {
        console.error("Error fetching AddressTypes", error);
      });
  }

  getTitleCreate(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.Title, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.Titles = data.response;
        console.log("All Titles", data)
      }, error => {
        console.error("Error fetching TitleTypes", error);
      });
  }
  showError(messageKey: number) {
    this.firmDetailsService.showErrorAlert(messageKey, this.isLoading);
  }
  selectedContactFrom: string = 'select';
  onContactFromChange(selectedValue: string): void {
  //  this.addedAddresses.push(this.defaultAddress);
    this.selectedContactFrom = selectedValue;
    const selectedContact = this.AllContactFrom.find(item => item.EntityTypeID === selectedValue);

    if (selectedContact) {
      const entityTypeIDParts = selectedContact.EntityTypeID.split(',');
      this.createContactObj.ContactFrom = selectedContact.EntityTypeName;
      this.createContactObj.EntityTypeID = entityTypeIDParts[0]; // Take the first part
    }
  }
  getAllContactFromByFrimsId() {
    this.contactService.getEntityTypesByFrimsId(this.firmId).subscribe(data => {
      this.AllContactFrom = data.response;
      console.log("ContactFrom", this.AllContactFrom)
      this.setDefaultContactFrom();
    }, error => {
      console.error("Error fetching ContactFrom", error);

    });
  }
  setDefaultContactFrom(): void {
    const entity = this.AllContactFrom.find(contact => contact.EntityTypeID.startsWith('1'));
    if (entity) {
      this.selectedContactFrom = entity.EntityTypeID; // This will trigger the dropdown selection
      this.onContactFromChange(this.selectedContactFrom); // Make sure to update createContactObj accordingly
    }
  }
  isFirmSelected(): boolean {
    const selectedEntity = this.AllContactFrom.find(contact => contact.EntityTypeID === this.selectedContactFrom);
    return selectedEntity ? selectedEntity.EntityTypeName.includes('Firm') : false;
  }
  selectedAvilableContact: boolean = false;
  onContactChange(selectedValue: string) {
    if (selectedValue !== "select") {
      // Parse the selected value (Column1) to extract contactId and contactAssnID
      const [contactId, contactAssnID] = selectedValue.split(',').map(Number);
      this.selectedAvilableContact = true;
      // Call the method to fetch contact details
      this.fitchContactDetailsCreateContact(contactId, contactAssnID);
    }else{
      this.selectedAvilableContact = false;
    }
  }
  selectedAvilableContactDetails: any = [];
  fitchContactDetailsCreateContact(contactId: number, contactAssnID: number) {
    this.contactService.getContactDetailsCreateContact(this.firmId, contactId, contactAssnID).subscribe(
      data => {
        if (data && data.response) {
          const response = data.response;

          // Map the response data to createContactObj
          this.createContactObj = {
            ...this.createContactObj, // Keep other properties unchanged
            firmID: response.firmID || 0,
            contactID: response.contactID || 0,
            contactAssnID: response.contactAssnID || 0,
            title: response.title || '',
            contactType: response.contactTypeID || '',
            firstName: response.firstName || '',
            secondName: response.secondName || '',
            familyName: response.familyName || '',
            countryOfResidence: response.countryID || 0,
            dateOfBirth: response.dateOfBirth || '',
            nationalID: response.nationalID || '',
            nationality: response.nationality || 0,
            passportNum: response.passportNum || '',
            placeOfBirth: response.placeOfBirth || '',
            isPeP: response.isPEP || false,
            mobileNum: response.mobileNum || '',
            busEmail: response.busEmail,
            otherEmail: response.otherEmail || '',
            contactMethodTypeID: response.contactMethodTypeID || 0,
            entityId: response.entityID || 0,
            jobTitle: response.jobTitle || '',
            fax: response.fax || '',
            // Map any other relevant fields...
          };

          console.log("Updated createContactObj: ", this.createContactObj);
          this.cdr.detectChanges(); // Trigger change detection to update the view
        } else {
          console.error('No contact data received:', data);
          this.isPopupVisible = false; // Hide popup if no data is received
        }
      },
      error => {
        console.error('Error fetching contact details', error);
        this.isPopupVisible = false; // Hide popup if there's an error
      }
    );
  }

  getAvilabilContact(): void {
    this.contactService.getPopulateAis(this.firmId).subscribe(data => {
      this.AllAvilabilContact = data.response;
      console.log("AllAvilabilContact", this.AllAvilabilContact)
    }, error => {
      console.error("Error fetching ContactFrom", error);
    });
  }
  createContactObj = {
    firmID: 0,
    contactID: 0,
    contactAssnID: 0,
    title: "",
    contactType: 0,
    firstName: "",
    secondName: "",
    thirdName: "",
    familyName: "",
    countryOfResidence: 0,
    ContactMethodTypeID: 0,
    aIsContactTypeID: null,
    createdBy: 0,
    dateOfBirth: "",
    fullName: "",
    lastModifiedBy: 0,
    ContactFrom: '',
    nationalID: "",
    nationality: 0,
    passportNum: "",
    placeOfBirth: "",
    previousName: "",
    isExists: true,
    nameInPassport: "",
    contactAddnlInfoTypeID: 0,
    isFromContact: true,
    countryofBirth: 0,
    juridictionID: 0,
    objectID: 0,
    isPeP: null,
    EntityTypeID: 0,
    contactTypeId: 0,
    functionTypeId: 0,
    mobileNum: "",
    busEmail: "",
    otherEmail: "",
    contactMethodTypeID: 0,
    entitySubTypeID: 0,
    numOfShares: 0,
    pctOfShares: 0,
    majorityStockHolder: true,
    assnDateFrom: "",
    assnDateTo: "",
    controllerControlTypeID: 0,
    jobTitle: "",
    nameAsInPassport: "",
    busPhone: "",
    residencePhone: "",
    strContactAddnlInfoTypeID:"",
    strContactAddnInfoTypes:"",
    fax: "",
    qfcNumber: "",
    isContactSelected: true,
    isIndividualRegulated: true,
    additionalDetails: "",
    ipAddress: "",
    ainId: 0,
    ainNumber: 0,
    applicationID: 0,
    docID: 0,
    dateRecieved: "",
    formProcessor: 0,
    comment: "",
    condApprovalReasonTypeID: 0,
    reasonForDelayInFiling: "",
    residentStatus: "",
    isOrdinarilyResident: true,
    applFeeReceived: "",
    applFeeComment: "",
    wcfAddnlInfo: "",
    placeOfBirthCountryID: 0,
    jurisdictionId: 0,
    totalIndiustryExperenceYear: 0,
    totalIndustryExperenceMonth: 0,
    roleExperenceMonth: 0,
    roleExperenceYear: 0,
    pastPositionFlag: 0,
    experience: "",
    appIndividualArrangementTypeID: 0,
    otherArrangementTypeDesc: "",
    appIndividualDataID: 0,
    pastPositionDesc: "",
    fandPAddnlInfo: "",
    poposedJobTitle: "",
    jobDescription: "",
    cfExercise: "",
    withdrawlReasonDesc: "",
    altArrangementDesc: "",
    competenciesAndExp: "",
    createdDate: "",
    lastModifedDate: "",
    proposedToQatarDateDays: "",
    proposedToQatarDateMonth: "",
    proposedToQatarDateYear: "",
    contactFunctionID: 0,
    contactFunctionTypeID: 0,
    contactFunctionTypeDesc: "",
    effectiveDate: "",
    endDate: "",
    lastModifiedDate: "",
    reviewStatus: "",
    selected: true,
    isFunctionActive: true,
    isRecordEditable: 0,
    countryID: 0,
    addressTypeID: 0,
    sameAsTypeID: 0,
    addressAssnID: 0,
    addressID: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    addressLine4: "",
    city: "",
    province: "",
    postalCode: "",
    entityId: this.firmId,
    phoneNumber: "",
    phoneExt: "",
    faxNumber: "",
    addressState: 0,
    fromDate: "",
    toDate: "",
    objectInstanceID: 0,
    objectInstanceRevNumber: 0,
    sourceObjectID: 0,
    sourceObjectInstanceID: 0,
    sourceObjectInstanceRevNumber: 0,
    selectedContactFrom: '',
  };

  ContactFunctionsObject = {
    contactFunctionID: null, 
    contactID: null,
    contactAssnID: 0, 
    functionTypeID: 0, 
    functionTypeDesc:"", 
    effectiveDate: "", 
    endDate: "", 
    reviewStatus: "", 
    isFunctionActive: 0, 
    isRecordEditable: 0,
  }
  createContactPopup(): void {
    this.CreateContactValidateForm();

    if (this.hasValidationErrors) {
      this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.isLoading = false;
      return;
    }
    const saveCreateContactObj = {
      contactDetails: {
        contactDetails: {
          firmID: this.firmId,
          contactID: null,
          contactAssnID: null,
          AdditionalDetails: 'test',
          BusPhone: this.createContactObj.mobileNum,
          BusEmail: this.createContactObj.busEmail,
          MobileNum: this.createContactObj.mobileNum, // Correct binding
          NameAsInPassport: 'test',
          ContactTypeID: this.createContactObj.contactType,
          OtherEmail: this.createContactObj.otherEmail,
          QfcNumber: this.firmDetails.QFCNum,
          Fax: this.createContactObj.fax,
          aIsContactTypeID: this.createContactObj.aIsContactTypeID,
          ResidencePhone: 'test',
          JobTitle: this.createContactObj.jobTitle,
          EntityTypeID: this.createContactObj.EntityTypeID,
          contactMethodTypeID: this.createContactObj.ContactMethodTypeID,
          Title: this.createContactObj.title,
          FirstName: this.createContactObj.firstName,
          secondName: this.createContactObj.secondName,
          thirdName: this.createContactObj.thirdName,
          familyName: this.createContactObj.familyName,
          PctOfShares: this.createContactObj.pctOfShares,
          tempContactID: 0,
          countryOfResidence: null,
          ContactFrom: this.createContactObj.ContactFrom,
          ControllerControlTypeID: null,
          createdBy: this.userId,
          dateOfBirth: this.dateUtilService.convertDateToYYYYMMDD(this.createContactObj.dateOfBirth),
          fullName: null,
          lastModifiedBy: this.userId,
          MyState: 0,
          nationalID: null,
          nationality: null,
          EntityID: this.firmId,
          passportNum: this.createContactObj.passportNum,
          placeOfBirth: this.createContactObj.placeOfBirth,
          previousName: null,
          isExists: false,
          FunctionTypeId: null,
          ContactAddnlInfoTypeID: this.createContactObj.strContactAddnlInfoTypeID,
          strContactAddnInfoType: this.createContactObj.strContactAddnInfoTypes,
          // ContactAddnlInfoTypeID: this.createContactObj.strContactAddnlInfoTypeID,
          // strContactAddnInfoTypes: this.createContactObj.strContactAddnInfoTypes,
          // ContactAddnInfoType:this.createContactObj.strContactAddnInfoTypes,
          nameInPassport: null,
          strContactFunctionType: null,
          isFromContact: true,
          countryofBirth: null,
          isFunctionActive : this.firmDetails?.FirmTypeID === 2,
          juridictionID: null,
          objectID: 523,
          isPEP: this.createContactObj.isPeP,
          AssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.createContactObj.assnDateFrom),
          AssnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.createContactObj.assnDateTo),
          LastModifiedByOfOtherEntity: 30,
          JurisdictionId: 3,
        },
        lstContactFunctions: this.selectedContactFunctions,
      },
      Addresses: this.addedAddresses.map(address => ({
        firmID: this.firmId,
        countryID: address.CountryID,
        addressTypeID: address.AddressTypeID,
        LastModifiedBy: this.userId,
        entityTypeID: this.createContactObj.EntityTypeID,
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
    console.log("Contact Object to be creted", saveCreateContactObj)
    if (this.createContactObj.contactType !== 1 || !this.createContactObj.contactType) {
      this.saveContactForm(saveCreateContactObj);
      this.closeContactPopup();
      Swal.fire(
        'Created!',
        'The contact has been Created successfully.',
        'success'
      );
      this.loadContacts();
    } else {
      this.contactService.IsMainContact(this.firmId, this.createContactObj.entityId, this.createContactObj.contactType)
        .subscribe(response => {
          if (response != null) {
            this.showErrorAlert(constants.ContactMessage.MAIN_CONTACT_EXISTS);
            this.isLoading = false;
            return;
          } else {
            this.saveContactForm(saveCreateContactObj);
          }
        });
    }
  }
  private saveContactForm(data: any): void {
    this.contactService.saveupdatecontactform(data).subscribe(
      response => {
        console.log("Contact save successful:", response);
        this.isEditContact = false;
        this.getPlaceOfEstablishmentName();
        this.firmDetailsService.showSaveSuccessAlert(constants.ControllerMessages.RECORD_MODIFIED);
        this.loadContacts();
      },
      error => {
        console.error("Error saving contact:", error);
      }
    );
  }
  showErrorAlert(messageKey: number) {
    this.logForm.errorMessages(messageKey).subscribe(
      (response) => {
        Swal.fire({
          text: response.response,
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      },
    );
    this.isLoading = false;
  }
  CreateContactValidateForm(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.errorMessages = {}; // Clear previous error messages
      this.hasValidationErrors = false;

      // Validate First Name
      if (!this.createContactObj.firstName || this.createContactObj.firstName.trim().length === 0) {
        this.loadErrorMessages('firstName', constants.ControllerMessages.ENTER_FIRSTNAME);
        this.hasValidationErrors = true;
      }

      if (this.createContactObj.isPeP === undefined || this.createContactObj.isPeP === null) {
        this.loadErrorMessages('isPeP', constants.ContactMessage.SELECT_ISPEP, 'Is Politically Exposed Person (PEP)?*');
        this.hasValidationErrors = true;
      }
      if (!this.createContactObj.contactType) {
        this.loadErrorMessages('contactType', constants.ContactMessage.SELECTCONTACTTYPE);
        this.hasValidationErrors = true;
      }


      if (this.hasValidationErrors) {
        resolve(); // Form is invalid
      } else {
        resolve(); // Form is valid
      }
    });
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
  getPreferredMethodofContact(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.PreferredMethodofContact, 40)
      .subscribe(data => {
        this.MethodofContactOption = data.response;
        console.log("Controllers", data)
      }, error => {
        console.error("Error fetching Controllers", error);
      });
  }

  editContact() {
    this.existingContactAddresses = this.contactFirmAddresses.filter(address => address.Valid);
    if (this.existingContactAddresses.length === 0) {
      this.contactFirmAddresses = [this.createDefaultAddress()];
      // this.contactFirmAddresses.push(this.defaultAddress);
      // this.existingContactAddresses.push(this.defaultAddress);
    }
    this.isEditContact = true
  }

  saveEditContactPopup(): void {
    this.EditContactValidateForm();
    if (this.hasValidationErrors) {
      this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.isLoading = false;
      return;
    }
    const saveEditContactObj = {
      contactDetails: {
        contactDetails: {
          firmID: this.firmId,
          contactID: this.selectedContact.contactID,
          contactAssnID: this.selectedContact.contactAssnID,
          AdditionalDetails: 'test',
          BusPhone: this.selectedContact.BusPhone,
          BusEmail: this.selectedContact.busEmail,
          MobileNum: this.selectedContact.mobileNum, // Correct binding
          NameAsInPassport: 'test',
          ContactTypeID: this.selectedContact.contactTypeID,
          OtherEmail: this.selectedContact.otherEmail,
          QfcNumber: this.firmDetails.QFCNum,
          Fax: this.selectedContact.fax,
          ResidencePhone: 'test',
          JobTitle: this.selectedContact.jobTitle,
          EntityTypeID: this.selectedContact.entityTypeID,
          Title: this.selectedContact.title,
          FirstName: this.selectedContact.firstName,
          secondName: this.selectedContact.secondName,
          thirdName: this.selectedContact.thirdName,
          familyName: this.selectedContact.familyName,
          PctOfShares: this.selectedContact.pctOfShares,
          contactMethodTypeID: this.selectedContact.ContactMethodTypeID,
          tempContactID: 0,
          countryOfResidence: null,
          ContactFrom: this.selectedContact.ContactFrom,
          ControllerControlTypeID: null,
          createdBy: this.userId,
          dateOfBirth: this.dateUtilService.convertDateToYYYYMMDD(this.selectedContact.dateOfBirth),
          fullName: null,
          lastModifiedBy: this.userId,
          MyState: 3,
          nationalID: null,
          nationality: null,
          EntityID: this.firmId,
          passportNum: this.selectedContact.passportNum,
          placeOfBirth: this.selectedContact.placeOfBirth,
          previousName: null,
          isExists: true,
          FunctionTypeId: null,
          nameInPassport: null,
          contactAddnlInfoTypeID: this.createContactObj.strContactAddnlInfoTypeID,
          isFromContact: true,
          countryofBirth: null,
          juridictionID: null,
          objectID: 523,
          isPEP: this.selectedContact.isPEP,
          AssnDateFrom: this.dateUtilService.convertDateToYYYYMMDD(this.selectedContact.assnDateFrom),
          AssnDateTo: this.dateUtilService.convertDateToYYYYMMDD(this.selectedContact.assnDateTo),
          LastModifiedByOfOtherEntity: 30,
          JurisdictionId: 3,
        },
        lstContactFunctions: this.selectedContactFunctions,
      },
      Addresses: this.existingContactAddresses.map(address => ({
        firmID: this.firmId,
        countryID: address.CountryID,
        addressTypeID: address.AddressTypeID,
        LastModifiedBy: this.userId,
        entityTypeID: this.createContactObj.EntityTypeID,
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
    console.log("saveEditContactObj", saveEditContactObj)
    if (this.selectedContact.contactTypeID !== 1 || !this.selectedContact.contactTypeID) {
      this.saveContactForm(saveEditContactObj);
      Swal.fire(
        'Modified!',
        'The contact has been Modified successfully.',
        'success'
      );
      this.closeContactPopup();
      this.loadContacts();
    } else {
      this.contactService.IsMainContact(this.firmId, this.selectedContact.entityID, this.selectedContact.entityTypeID)
        .subscribe(response => {
          if (response != null) {
            this.showErrorAlert(constants.ContactMessage.MAIN_CONTACT_EXISTS);
            this.isLoading = false;
            return;
          } else {
            this.contactService.IsContactTypeExists(this.firmId, this.selectedContact.entityID, this.selectedContact.entityTypeID, this.selectedContact.contactID, this.selectedContact.contactAssnID)
              .subscribe(response => {
                if (response != null) {
                  this.showErrorAlert(constants.ContactMessage.CONTACT_TYPE_EXISTS);
                  this.isLoading = false;
                  return;
                } else {
                  this.saveContactForm(saveEditContactObj);
                }
              })
          }
        });
    }
  }
  EditContactValidateForm(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.errorMessages = {}; // Clear previous error messages
      this.hasValidationErrors = false;

      // Validate First Name
      if (!this.selectedContact.firstName || this.selectedContact.firstName.trim().length === 0) {
        this.loadErrorMessages('firstName', constants.ControllerMessages.ENTER_FIRSTNAME);
        this.hasValidationErrors = true;
      }

      if (this.selectedContact.isPEP === undefined || this.selectedContact.isPEP === null) {
        this.loadErrorMessages('isPEP', constants.ContactMessage.SELECT_ISPEP, 'Is Politically Exposed Person (PEP)?*');
        this.hasValidationErrors = true;
      }
      if (!this.selectedContact.contactTypeDesc) {
        this.loadErrorMessages('contactTypeDesc', constants.ContactMessage.SELECTCONTACTTYPE);
        this.hasValidationErrors = true;
      }


      if (this.hasValidationErrors) {
        resolve(); // Form is invalid
      } else {
        resolve(); // Form is valid
      }
    });
  }
  confirmDeleteContact() {
    console.log("confirmDelete called: ", this.selectedContact)
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this contact?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteContact(true); // Just pass output here, no need for ": boolean"
      }
    });
  }
  deleteContact(output: boolean): void {
    // Replace these with actual values from your component
    const objectID = 523; // Assuming firmTypeID is fixed to 1
    const contactID = this.selectedContact.contactID;
    const contactAssId = this.selectedContact.contactAssnID;
    const userID = this.userId;
    console.log(contactID, contactAssId, "contactAssnID contactID")
    this.contactService.deleteContactDetails(objectID, contactID, contactAssId, userID).subscribe(
      (response) => {
        Swal.fire(
          'Deleted!',
          'The contact has been deleted successfully.',
          'success'
        );
        this.closeContactPopup();
        this.loadContacts();  // Reload contacts after deletion
      },
      (error) => {
        Swal.fire(
          'Error!',
          'There was an issue deleting the contact. Please try again.',
          'error'
        );
      }
    );
  }
  getPlaceOfEstablishmentName(): string {
    const place = this.allCountries.find(option => option.CountryID === parseInt(this.selectedContact.CountryOfIncorporation));
    return place ? place.CountryName : '';
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  get filteredContactAddresses() {
    return this.existingContactAddresses.filter(addr => !addr.isRemoved);
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
    const validAddresses = this.contactFirmAddresses.filter(addr => addr.Valid);

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


  addNewAddressOnEditMode() {
    const { canAddNewAddress, newAddress } = this.firmDetailsService.addNewAddressOnEditMode(this.contactFirmAddresses, this.allAddressTypes, this.currentDate);
    if (newAddress) {
      this.newAddressOnEdit = newAddress;
      this.canAddNewAddressOnEdit = canAddNewAddress;
    }
  }

  removeAddressOnEditMode(index: number) {
    this.firmDetailsService.removeAddressOnEditMode(
      index,
      this.contactFirmAddresses,
      this.removedAddresses,
      this.allAddressTypes.length,
      this.errorMessages
    ).then(({ canAddNewAddress, updatedArray }) => {
      this.canAddNewAddressOnEdit = canAddNewAddress;
      this.contactFirmAddresses = updatedArray;
    });
  }

  onSameAsTypeChangeOnEditMode(selectedTypeID: number, index: number) {
    this.disableAddressFieldsOnEdit = selectedTypeID && selectedTypeID != 0; // Set disableAddressFields here
    this.firmDetailsService.onSameAsTypeChangeOnEditMode(selectedTypeID, index,this.existingContactAddresses, this.newAddressOnEdit);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  addNewAddressOnCreateMode() {
    this.firmDetailsService.addNewAddressOnCreateMode(this.addedAddresses, this.allAddressTypes, this.currentDate);

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
    this.firmDetailsService.removeAddressOnCreateMode(index, this.addedAddresses, this.allAddressTypes).then(() => {
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
      this.firmDetailsService.checkCanAddNewAddressOnCreateMode(this.addedAddresses, this.allAddressTypes);

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
      const selectedAddressType = this.allAddressTypes.find(type => type.AddressTypeID === selectedTypeID);
      if (selectedAddressType) {
        currentAddress.AddressTypeID = selectedAddressType.AddressTypeID;
        currentAddress.AddressTypeDesc = selectedAddressType.AddressTypeDesc;
      }
      currentAddress.isAddressTypeSelected = true; // Disable the dropdown after selection
    }

    // Check if the "Add Address" button should be enabled
    this.checkCanAddNewAddressOnCreateMode();
  }

  getAddressTypeHistory(addressTypeId: number, entityTypeId: number, entityId: number,contactAssnID: number) {
    this.callAddressType = true;
    this.addressService.getAddressesTypeHistory(null, addressTypeId, entityTypeId, entityId,contactAssnID).subscribe(
      data => {
        this.contactFirmAddressesTypeHistory = data.response;
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
///////////// function section 
  getContactFunctionType() {
    this.contactService.getContactFunctionType().subscribe(
      data => {
        if (data.isSuccess) {
          this.ContactFunctionTypeList = data.response.map(item => ({
            ContactFunctionTypeID: item.FunctionTypeID,
            contactFunctionTypeDesc: item.FunctionTypeDesc,
            isSelected: false,
            effectiveDate: '',
            endDate: '',
            reviewStatus: ''
          }));
        }
      },
      error => {
        console.error('Error Fetching Contact Function Types', error);
      }
    );
  }
  updateFunctionDates(index: number, field: string, value: string) {
    const contactFunction = this.ContactFunctionTypeList[index];
    const selectedFunctionIndex = this.selectedContactFunctions.findIndex(
      func => func.ContactFunctionTypeID === contactFunction.ContactFunctionTypeID
    );
  
    if (selectedFunctionIndex !== -1) {
      // Update the field in the selectedContactFunctions list
      this.selectedContactFunctions[selectedFunctionIndex][field] = value;
    }
  }

 onFunctionCheckboxChange(contactFunction: any, index: number) {
  if (contactFunction.isSelected) {
    const existingFunctionIndex = this.selectedContactFunctions.findIndex(
      func => func.ContactFunctionTypeID === contactFunction.ContactFunctionTypeID
    );

    if (existingFunctionIndex === -1) {
      // Add to the selected list if not already present
      this.selectedContactFunctions.push({
        contactFunctionID: null,
        contactID: null,
        contactAssnID: null,
        ContactFunctionTypeID: contactFunction.ContactFunctionTypeID,
        ContactFunctionTypeDesc: contactFunction.ContactFunctionTypeDesc,
        effectiveDate: contactFunction.effectiveDate || '',
        endDate: contactFunction.endDate || '',
        reviewStatus: contactFunction.reviewStatus || '',
        isFunctionActive: false,
        isRecordEditable: 1,
        CreatedBy: this.userId,
      });

      // Show additional section if "DNFBP MLRO" is selected
      if (contactFunction.ContactFunctionTypeID === 17) {
        this.showMLROSection = true;
      }
    }
  } else {
    Swal.fire({
      text: 'De-selecting this function will cause this record to be deleted from the system permanently.',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedContactFunctions = this.selectedContactFunctions.filter(
          func => func.ContactFunctionTypeID !== contactFunction.ContactFunctionTypeID
        );

        if (contactFunction.ContactFunctionTypeID === 17) {
          this.showMLROSection = false;
        }
      } else {
        contactFunction.isSelected = true;
      }
    });
  }
}
ResidencyStatusCheck: any = { AttributeValue: '' };

fetchResidencyStatus(): void {
  const ObjectID = 523;
  const ObjectInstanceID = this.selectedContact.contactID;
  const ObjectInstanceRevNum = 1;
  const SourceObjectID = 523;
  const SourceObjectInstanceID = this.selectedContact.contactAssnID;
  const SourceObjectInstanceRevNum = 1;
  const ActiveFlag = true;

  this.aiElectronicswfService.getListObjectAttribute(
    ObjectID,
    ObjectInstanceID,
    ObjectInstanceRevNum,
    ActiveFlag,
    SourceObjectID,
    SourceObjectInstanceID,
    SourceObjectInstanceRevNum
  ).subscribe(
    (data) => {
      if (data.isSuccess && data.response?.length > 0) {
        this.ResidencyStatusCheck = data.response[0];
      } else {
        this.ResidencyStatusCheck = { AttributeValue: '' };
      }
      this.cdr.detectChanges(); // Trigger change detection
    },
    (error) => {
      console.error("Error fetching Residency Status:", error);
      this.ResidencyStatusCheck = { AttributeValue: '' };
    }
  );
}

convertFunctionsToArray(): void {
  if (this.selectedContact && this.selectedContact.lstContactFunctions) {
    if (!Array.isArray(this.selectedContact.lstContactFunctions)) {
      // Convert to an array if it's a single object
      this.selectedContact.lstContactFunctions = [this.selectedContact.lstContactFunctions];
    }
  } else {
    // Initialize as an empty array if it doesn't exist
    this.selectedContact.lstContactFunctions = [];
  }
  console.log("Converted lstContactFunctions:", this.selectedContact.lstContactFunctions);
}

initializeSelectedFunctions(): void {
  if (this.selectedContact?.lstContactFunctions) {
    this.selectedContact.lstContactFunctions.forEach(contactFunction => {
      const matchingFunction = this.ContactFunctionTypeList.find(
        functionType => functionType.ContactFunctionTypeID === contactFunction.functionTypeID
      );

      if (matchingFunction) {
        matchingFunction.isSelected = true;
        matchingFunction.effectiveDate = contactFunction.effectiveDate;
        matchingFunction.endDate = contactFunction.endDate;
        matchingFunction.reviewStatus = contactFunction.reviewStatus;
        matchingFunction.isFunctionActive = true
        // Add to selectedContactFunctions if not already there
        const existsInSelected = this.selectedContactFunctions.find(
          func => func.ContactFunctionTypeID === matchingFunction.ContactFunctionTypeID
        );
        if (!existsInSelected) {
          this.selectedContactFunctions.push({
            contactFunctionID: contactFunction.contactFunctionID,
            contactID: contactFunction.contactID,
            contactAssnID: contactFunction.contactAssnID,
            ContactFunctionTypeID: contactFunction.functionTypeID,
            ContactFunctionTypeDesc: contactFunction.functionTypeDesc,
            effectiveDate: contactFunction.effectiveDate,
            endDate: contactFunction.endDate,
            reviewStatus: contactFunction.reviewStatus,
            isFunctionActive: true,
            isRecordEditable: contactFunction.isRecordEditable,
            CreatedBy: this.userId
          });
        }
      }
    });
  }
}
////////////////////
  isMobileNumExsits: boolean = false;
  getSearchMobileNumber(mobileNum: string): void {
    this.contactService.getSearchMobileNumber(mobileNum).subscribe(
      data => {
        this.isMobileNumExsits = data.response;
  
        // Show SweetAlert if the mobile number exists
        if (this.isMobileNumExsits) {
          Swal.fire({
            title: 'Mobile Number Exists',
            text: 'This mobile number is already exists.',
            icon: 'warning',
            confirmButtonText: 'OK',
          });
  
          // Optionally, clear the input field if the number exists
          this.createContactObj.mobileNum = '';
        }
      },
      error => {
        console.error('Error finding the mobile number', error);
      }
    );
  }
  checkMobileNumberExists(mobileNum: string): void {
    if (!mobileNum) return; // Exit if the input is empty
  
    // Call the service to check if the mobile number exists
    this.getSearchMobileNumber(mobileNum);
  }
  
  /////////////////////////// for contact modal 
  ContactDetailsByPassingParam:any = [];
  SearchContactDetails(firstName: string, familyName: string,){
    this.contactService.SearchContactDetailsByPassingParam(firstName, familyName, this.firmId).subscribe(
      data => {
        if (data.isSuccess && data.response.length > 0) {
          this.ContactDetailsByPassingParam = data.response;
          this.showContactModal = true;
          console.log("ContactDetailsByPassingParam",this.ContactDetailsByPassingParam)
        }
      },
      error => {
        console.error('Error finding contact details', error);
      }
    );
  }
  showContactModal: boolean = false;
  ShowcreateContactObj = {
    firstName: '',
    familyName: '',
    mobileNum: '',
    busEmail: '',
    ContactMethodTypeID: null,
    jobTitle: '',
    title: '',
    isPeP: false,
    aIsContactTypeID: null
  };
  onNameBlur(): void {
    const { firstName, familyName } = this.createContactObj;
  
    // Check if both fields are filled before calling the API
    if (firstName && familyName) {
      this.SearchContactDetails(firstName, familyName);
    }
  }
  ShowselectContact(contact: any) {
    this.createContactObj.firstName = contact.FirstName;
    this.createContactObj.familyName = contact.FamilyName;
    this.createContactObj.mobileNum = contact.MobileNum;
    this.createContactObj.busEmail = contact.BusEmail;
    this.createContactObj.jobTitle = contact.JobTitle;
    this.createContactObj.title = contact.Title;
    this.createContactObj.isPeP = contact.isPeP;
    this.createContactObj.ContactMethodTypeID = contact.ContactMethodTypeID;
    this.closeModal();

  }
  // Close the modal
  closeModal() {
    this.showContactModal = false;
  }
  //////////////////////// for additional details Checkboxes 

  selectedAdditionalInfo: Set<number> = new Set<number>();
  selectedAdditionalInfoLabels: Set<string> = new Set<string>();
  
  // Method to update selected checkboxes
  updateAdditionalInfo(event: any, label: string): void {
    const value = Number(event.target.value);
  
    if (event.target.checked) {
      // Add value and label if checked
      this.selectedAdditionalInfo.add(value);
      this.selectedAdditionalInfoLabels.add(label);
    } else {
      // Remove value and label if unchecked
      this.selectedAdditionalInfo.delete(value);
      this.selectedAdditionalInfoLabels.delete(label);
    }
  
    // Update the strContactAddnlInfoTypeID field (comma-separated values)
    this.createContactObj.strContactAddnlInfoTypeID = Array.from(this.selectedAdditionalInfo).join(',');
  
    // Update the strContactAddnInfoTypes field (comma-separated labels)
    this.createContactObj.strContactAddnInfoTypes = Array.from(this.selectedAdditionalInfoLabels).join(', ');
  
    console.log('Selected IDs:', this.createContactObj.strContactAddnlInfoTypeID);
    console.log('Selected Labels:', this.createContactObj.strContactAddnInfoTypes);
  }
  selectedInfoTypes: { [key: string]: boolean } = {
    '1': false,  // VIP
    '3': false,  // Annual Report
    '4': false,  // Christmas/New Year
    '5': false,  // Eid Cards
    '6': false   // Publications
  };
  
  initializeCheckboxes(): void {
    if (this.selectedContact?.strContactAddnInfoTypes) {
      const infoTypesArray = this.selectedContact.strContactAddnInfoTypes.split(',').map(item => item.trim());
  
      // Map the stored names to IDs
      this.selectedInfoTypes['1'] = infoTypesArray.includes('VIP');
      this.selectedInfoTypes['3'] = infoTypesArray.includes('Annual Report');
      this.selectedInfoTypes['4'] = infoTypesArray.includes('Christmas/New Year');
      this.selectedInfoTypes['5'] = infoTypesArray.includes('Eid Cards');
      this.selectedInfoTypes['6'] = infoTypesArray.includes('Publications');
    }
  }
  
  updateContactInfoTypes(): void {
    const selectedTypeIds: number[] = [];
  
    if (this.selectedInfoTypes['1']) selectedTypeIds.push(1);
    if (this.selectedInfoTypes['3']) selectedTypeIds.push(3);
    if (this.selectedInfoTypes['4']) selectedTypeIds.push(4);
    if (this.selectedInfoTypes['5']) selectedTypeIds.push(5);
    if (this.selectedInfoTypes['6']) selectedTypeIds.push(6);
  
    // Join the selected IDs into a string and update the selectedContact object
    this.selectedContact.strContactAddnInfoTypeId = selectedTypeIds.join(', ');
  
    console.log('Updated Info Type IDs:', this.selectedContact.strContactAddnInfoTypeId);
  }
}
