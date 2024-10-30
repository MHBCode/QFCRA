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

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss','../firms.scss']
})
export class ContactsComponent {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  userId = 30; // Replace with dynamic userId as needed
  firmId: number = 0;
  errorMessages: { [key: string]: string } = {};
  firmDetails: any;
  AllRegulater: any = [];
  hasValidationErrors: boolean = false;
  loading: boolean;
  isLoading: boolean = false;
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  FIRMContacts: any[] = [];
  isPopupVisible: boolean = false;
  isEditable: boolean = false; // Controls the readonly state of the input fields
  selectedContact: any = null;
  displayInactiveContacts: boolean = false;
  showCreateContactSection: boolean = false;
  Address: any = {};
  allCountries: any = [];
  allAddressTypes: any = [];
  firmAddresses: any = [];
  controlTypeOptionsCreate: any[] = [];
  controllerTypeOption: any = [];
  objectOpTypeIdEdit = 41;
  objectOpTypeIdCreate = 40;
  legalStatusOptionsEdit: any[] = [];
  TitleEdit: any[] = [];
  AllContactFrom: any = [];

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
    private flatpickrService: FlatpickrService
  ) {

  }

  ngOnInit(): void {
    this.firmService.scrollToTop();
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      if (this.FIRMContacts.length === 0) {
        this.loadContacts();
      }
      this.getAllRegulater(this.Address.countryID, this.firmId);
      this.populateCountries();
      this.populateAddressTypes();
      this.getlegalStatusController();
      this.getAllContactFromByFrimsId();
      this.getControllerControlTypesCreat();
      this.getlegalStatusController();

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
  deleteContact(output: boolean): void {
    // Replace these with actual values from your component
    const firmTypeID = '523'; // Assuming firmTypeID is fixed to 1
    const contactID = this.selectedContact.ContactID;
    const contactAssnID = this.selectedContact.ContactAssnID;
    
    this.contactService.deleteContactDetails(firmTypeID, contactID, contactAssnID,30, output).subscribe(
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
  onRowClick(contact: any): void {
    // Reset the selected contact and hide the popup until data is loaded
    this.selectedContact = {};
    this.isPopupVisible = false;

    // Fetch contact details based on selected row
    this.contactService.getContactDetails(this.firmId, contact.ContactID, contact.ContactAssnID).subscribe(
      data => {
        if (data && data.response) {
          this.selectedContact = data.response; // Assign the received data to selectedContact
          console.log("Selected contact: ", this.selectedContact); // Log to check data
          this.isPopupVisible = true; // Show the popup after data is loaded
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
  }
  saveContactPopupChanges(): void {
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

  enableEditing() {
    this.isEditable = true;
  }

  UpdateContactPopupChange() {
    this.closeContactPopup();
  }

  createContact() {
    this.showCreateContactSection = true;
  }
  closeCreateContactPopup(){
    this.showCreateContactSection = false;
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

  // loadFirmAdresses() {
  //   this.isLoading = true;
  //   this.addressService.getCoreFirmAddresses(this.firmId).subscribe(
  //     data => {
  //       this.firmAddresses = data.response;
  //       this.isLoading = false;
  //     }, error => {
  //       console.error('Error Fetching Firm Addresses', error);
  //       this.isLoading = false;
  //     })
  // }

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

  getTitleCreate(): void {
    this.securityService.getobjecttypetableEdit(this.userId, constants.Title, this.objectOpTypeIdCreate)
      .subscribe(data => {
        this.TitleEdit = data.response;
        console.log("Countries", data)
      }, error => {
        console.error("Error fetching TitleTypes", error);
      });
  }

  getAllContactFromByFrimsId(){
    this.contactService.getEntityTypesByFrimsId(this.firmId).subscribe(data => {
      this.AllContactFrom = data.response;
      console.log("ContactFrom",this.AllContactFrom)
    }, error => {
      console.error("Error fetching ContactFrom", error);
    });
  }

  showError(messageKey: number) {
    this.firmDetailsService.showErrorAlert(messageKey, this.isLoading);
  }
}
