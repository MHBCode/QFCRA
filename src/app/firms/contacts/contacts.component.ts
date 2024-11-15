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
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { AiElectronicswfService } from 'src/app/ngServices/ai-electronicswf.service';
import { forkJoin, Observable, tap } from 'rxjs';

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
  allAvailableContact: any = [];
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
  invalidAddress: any = [];
  removedAddresses: any = [];
  hideAddresses: boolean = true;
  callAddressType: boolean = false;
  ResidencyStatusCheck: any = { AttributeValue: '' };
  selectedAdditionalInfo: Set<number> = new Set<number>();
  selectedAdditionalInfoLabels: Set<string> = new Set<string>();
  // Security
  FIRMRA: any[] = [];
  ASSILevel: number = 4;
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
  selectedInfoTypes: { [key: string]: boolean } = {};
  // used variables on edit mode
  newAddressOnEdit: any = {};
  canAddNewAddressOnEdit: boolean = true;
  disableAddressFieldsOnEdit: boolean = false;
  showContactModal: boolean = false;
  EditResidentStateObj: any = { attributeValue: '' };
  saveContactResponseObj: any = [];
  // used variables on create mode
  addedAddresses: any = []; // Array will hold the newly added addresses
  addedAddressesOnCreate: any = [];
  canAddNewAddressOnCreate: boolean = true;
  isAllAddressesAddedOnCreate: boolean;
  disableAddressFieldOnCreate = true;
  isMobileNumExsits: boolean = false;
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
    private aiElectronicswfService: AiElectronicswfService,
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
      this.populateCountries();
      this.getAllContactFromByFrimsId();
      this.getContactType();
      this.getPreferredMethodofContact();
      this.getAvailableContact();
      this.getTitleCreate();
      this.getAddressTypesContact();
      this.getContactFunctionType();
      this.initializeSelectedFunctions();
      //this.initializeCheckboxes();

      // Security
      forkJoin([
        this.firmDetailsService.loadAssignedUserRoles(this.userId),
        this.firmDetailsService.loadAssignedLevelUsers(),
        this.isValidFirmSupervisor(),
        this.isValidFirmAMLSupervisor(),
        this.loadAssiRA()
      ]).subscribe({
        next: ([userRoles, levelUsers]) => {
          // Assign the results to component properties
          this.assignedUserRoles = userRoles;
          this.assignedLevelUsers = levelUsers;

          this.applySecurityOnPage(this.Page.Contatcs, this.isEditContact);
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
        return;
      }
      else if (this.firmDetailsService.isValidAMLSupervisor() && !this.firmDetailsService.isAMLSupervisorAssignedToFirm(this.FIRMRA, this.assignedLevelUsers)) {
        return;
      }
      else {
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

  loadAssiRA(): Observable<any> {
    this.isLoading = true;
    return this.firmService.getFIRMUsersRAFunctions(this.firmId, this.ASSILevel).pipe(
      tap(data => {
        this.FIRMRA = data.response;
        console.log('Firm RA Functions details:', this.FIRMRA);
        this.isLoading = false;
      })
    );
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

  loadContactFirmAdresses(contactAssId: number, userId: number): void {
    this.isLoading = true;

    // Fetch firm addresses from the service
    this.addressService.getContactFirmAddresses(contactAssId, userId).subscribe(
      data => {
        if (data.response) {
          this.contactFirmAddresses = data.response;

          if (this.showCreateContactSection) {
            this.addedAddresses = this.contactFirmAddresses.filter(addr => addr.Valid);
            this.addedAddresses.forEach((address) => {
              if (address.AddressTypeID) {
                this.disableAddressFieldOnCreate = true;
              } else {
                this.disableAddressFieldOnCreate = false;
              }
            })
          } else {
            this.existingContactAddresses = this.contactFirmAddresses.filter(addr => addr.Valid);
          }
          console.log('Contact Firm Addresses:', this.contactFirmAddresses);
        }
        this.isLoading = false;
      },
      error => {
        console.error('Error Fetching Contact Firm Addresses', error);
        this.existingContactAddresses = [];
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
  openContactPopup(contact: any): void {
    // Reset the selected contact and hide the popup until data is loaded
    this.selectedContact = {};
    this.isPopupVisible = false;
    this.applySecurityOnPage(this.Page.Contatcs, this.isEditContact);
    // Fetch contact details based on the selected row
    this.contactService.getContactDetails(this.firmId, contact.ContactID, contact.ContactAssnID).subscribe(
      (data) => {
        if (data && data.response) {
          this.selectedContact = data.response; // Assign the received data to selectedContact
          console.log("Selected contact: ", this.selectedContact); // Log to check data

          // Convert lstContactFunctions to an array if needed
          this.loadContactFirmAdresses(this.selectedContact.contactAssnID, this.userId);
          this.convertFunctionsToArray();
          // Fetch additional data after the contact details are set
          this.fetchResidencyStatus();
          this.initializeSelectedFunctions();
          //this.initializeCheckboxes();
          this.initializeEditInfoTypes();
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
    this.disableAddressFieldOnCreate = false;
    this.addedAddresses = [];
    this.addedAddresses = [this.createDefaultAddress()];
    this.disableAddressFieldOnCreate = false;
    this.canAddNewAddressOnCreate = false;
  }

  closeCreateContactPopup() {
    this.isEditContact = false;
    this.errorMessages = {}; // Clear previous error messages
    this.hasValidationErrors = false;
    this.addedAddresses = [this.createDefaultAddress()];
    this.showCreateContactSection = false;
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
      strContactAddnlInfoTypeID: "",
      strContactAddnInfoTypes: "",
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
  // onContactFromChange(selectedValue: string): void {
  //   //  this.addedAddresses.push(this.defaultAddress);
  //   this.selectedContactFrom = selectedValue;
  //   const selectedContact = this.AllContactFrom.find(item => item.EntityTypeID === selectedValue);

  //   if (selectedContact) {
  //     const entityTypeIDParts = selectedContact.EntityTypeID.split(',');
  //     this.createContactObj.ContactFrom = selectedContact.EntityTypeName;
  //     this.createContactObj.EntityTypeID = entityTypeIDParts[0]; // Take the first part
  //   }
  // }
  onContactFromChange(selectedValue: string): void {
    // Ensure the value is defined and not "select"
    if (selectedValue && selectedValue !== 'select') {
      this.selectedContactFrom = selectedValue;

      // Find the selected entity from the list
      const selectedContact = this.AllContactFrom.find(item => item.EntityTypeID === selectedValue);

      if (selectedContact) {
        const entityTypeIDParts = selectedContact.EntityTypeID.split(',');
        this.createContactObj.ContactFrom = selectedContact.EntityTypeName;
        this.createContactObj.EntityTypeID = entityTypeIDParts[0]; // Take the first part if there are multiple IDs
      } else {
        // Reset if not found
        this.createContactObj.ContactFrom = '';
        this.createContactObj.EntityTypeID = null;
      }
    } else {
      // Reset if "select" is chosen
      this.createContactObj.ContactFrom = '';
      this.createContactObj.EntityTypeID = null;
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
  // setDefaultContactFrom(): void {
  //   const entity = this.AllContactFrom.find(contact => contact.EntityTypeID.startsWith('1'));
  //   if (entity) {
  //     this.selectedContactFrom = entity.EntityTypeID; // This will trigger the dropdown selection
  //     this.onContactFromChange(this.selectedContactFrom); // Make sure to update createContactObj accordingly
  //   }
  // }
  setDefaultContactFrom(): void {
    if (this.AllContactFrom && this.AllContactFrom.length > 0) {
      const entity = this.AllContactFrom.find(contact => contact.EntityTypeID.startsWith('1'));
      if (entity) {
        this.selectedContactFrom = entity.EntityTypeID;
        setTimeout(() => this.onContactFromChange(this.selectedContactFrom), 0);
      }
    }
  }
  // isFirmSelected(): boolean {
  //   const selectedEntity = this.AllContactFrom.find(contact => contact.EntityTypeID === this.selectedContactFrom);
  //   return selectedEntity ? selectedEntity.EntityTypeName.includes('Firm') : false;
  // }
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
      this.loadContactFirmAdresses(contactAssnID, this.userId);
    } else {
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

  getAvailableContact(): void {
    this.contactService.getPopulateAis(this.firmId).subscribe(data => {
      this.allAvailableContact = data.response;
      console.log("AllAvilabilContact", this.allAvailableContact)
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
    strContactAddnlInfoTypeID: "",
    strContactAddnInfoTypes: "",
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
    lstContactFunctions: []
  };

  ContactFunctionsObject = {
    contactFunctionID: null,
    contactID: null,
    contactAssnID: 0,
    functionTypeID: 0,
    functionTypeDesc: "",
    effectiveDate: "",
    endDate: "",
    reviewStatus: "",
    isFunctionActive: 0,
    isRecordEditable: 0,
  }

  createContactPopup(): void {
    this.CreateContactValidateForm();

    if (this.hasValidationErrors) {
      this.firmDetailsService.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
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
          isFunctionActive: this.firmDetails?.FirmTypeID === 2,
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
        objectID: address.ObjectID || this.Page.Contatcs,
        objectInstanceID: address.ObjectInstanceID || this.firmId,
        objectInstanceRevNumber: address.ObjectInstanceRevNumber || 1,
        sourceObjectID: address.SourceObjectID || this.Page.Contatcs,
        sourceObjectInstanceID: address.SourceObjectInstanceID || this.firmId,
        sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNumber || 1,
        objAis: null,
      }))
    };
    console.log("Contact Object to be creted", saveCreateContactObj)
    if (this.createContactObj.contactType !== 1 || !this.createContactObj.contactType) {
      this.saveContactForm(saveCreateContactObj);
      this.loadContacts();
    } else {
      this.contactService.IsMainContact(this.firmId, this.createContactObj.entityId, this.createContactObj.contactType)
        .subscribe(response => {
          if (response != null) {
            this.firmDetailsService.showErrorAlert(constants.ContactMessage.MAIN_CONTACT_EXISTS);
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
      data => {
        console.log("Contact save successful:", data);

        this.saveContactResponseObj = data.response
        const contactAssnID = this.saveContactResponseObj.contactAssnID;
        const contactID = this.saveContactResponseObj.contactID;

        // Call createFunctionResidentState with the extracted IDs
        this.createFunctionResidentState(contactAssnID, contactID);


        this.isEditContact = false;
        this.loadContacts();
        this.closeContactPopup();
        this.closeCreateContactPopup();
        this.applySecurityOnPage(this.Page.Contatcs, this.isEditContact);
        this.firmDetailsService.showSaveSuccessAlert(constants.ContactMessage.UPDATECONTACT);
      },
      error => {
        console.error("Error saving contact:", error);
      }
    );
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
      if (
        !this.createContactObj.busEmail ||
        !(this.createContactObj.busEmail.includes('@') && this.createContactObj.busEmail.includes('.com'))
      ) {
        this.loadErrorMessages('busEmail', constants.ContactMessage.INVALIDEMAIL, "Business");
        this.hasValidationErrors = true;
      }

      // ADDRESS TYPE VALIDATION
      this.invalidAddress = this.addedAddresses.find(address => !address.AddressTypeID || address.AddressTypeID === 0);
      if (this.invalidAddress) {
        this.loadErrorMessages('AddressTypeID', constants.AddressControlMessages.SELECT_ADDRESSTYPE);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['AddressTypeID'];
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
    if (this.existingContactAddresses.length === 0) {
      this.existingContactAddresses = [this.createDefaultAddress()];
    }
    const validAddressCount = this.existingContactAddresses.filter(addr => addr.Valid && !addr.isRemoved).length;
    const totalAddressTypes = this.allAddressTypes.length;
    if (validAddressCount >= totalAddressTypes) {
      this.canAddNewAddressOnEdit = false;
    } else {
      this.canAddNewAddressOnEdit = true;
    }
    this.isEditContact = true
    this.applySecurityOnPage(this.Page.Contatcs, this.isEditContact);
  }

  saveEditContactPopup(): void {
    this.EditContactValidateForm();
    if (this.hasValidationErrors) {
      this.firmDetailsService.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
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
          contactAddnlInfoTypeID: this.selectedContact.strContactAddnlInfoTypeID,
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
      addresses: [...this.existingContactAddresses, ...this.removedAddresses].map(address => {
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
          fromDate: '1970-01-01',
          toDate: '1970-01-01',
          objectID: address.ObjectID || this.Page.Contatcs,
          objectInstanceID: this.firmId,
          objectInstanceRevNumber: address.ObjectInstanceRevNumber || 1,
          sourceObjectID: address.SourceObjectID || this.Page.Contatcs,
          sourceObjectInstanceID: address.SourceObjectInstanceID || this.firmId,
          sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNumber || 1,
          objAis: null,
        };
      }),
    };
    console.log("saveEditContactObj", saveEditContactObj)
    if (this.selectedContact.contactTypeID !== 1 || !this.selectedContact.contactTypeID) {
      this.saveContactForm(saveEditContactObj);
    } else {
      this.contactService.IsMainContact(this.firmId, this.selectedContact.entityID, this.selectedContact.entityTypeID)
        .subscribe(response => {
          if (response != null) {
            this.firmDetailsService.showErrorAlert(constants.ContactMessage.MAIN_CONTACT_EXISTS);
            this.isLoading = false;
            return;
          } else {
            this.contactService.IsContactTypeExists(this.firmId, this.selectedContact.entityID, this.selectedContact.entityTypeID, this.selectedContact.contactID, this.selectedContact.contactAssnID)
              .subscribe(response => {
                if (response != null) {
                  this.firmDetailsService.showErrorAlert(constants.ContactMessage.CONTACT_TYPE_EXISTS);
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

  cancelContact() {
    this.isEditContact = false;
    this.loadContactFirmAdresses(this.selectedContact.contactAssnID, this.userId)
    this.applySecurityOnPage(this.Page.Contatcs, this.isEditContact);
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

      // ADDRESS TYPE VALIDATION
      this.invalidAddress = this.existingContactAddresses.find(address => !address.AddressTypeID || address.AddressTypeID === 0);
      if (this.invalidAddress) {
        this.loadErrorMessages('AddressTypeID', constants.AddressControlMessages.SELECT_ADDRESSTYPE);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['AddressTypeID'];
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
    const validAddresses = this.existingContactAddresses;

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

  getFilteredAddressTypes() {
    return this.existingContactAddresses
      .filter(address => address.AddressTypeID && address.AddressTypeID !== 0) // Exclude blank and '0' entries
      .map(address => ({
        AddressTypeID: address.AddressTypeID,
        AddressTypeDesc: address.AddressTypeDesc
      }))
      .filter((value, index, self) =>
        index === self.findIndex((t) => t.AddressTypeID === value.AddressTypeID)
      ); // Remove duplicates
  }


  addNewAddressOnEditMode() {
    const { canAddNewAddress, newAddress } = this.firmDetailsService.addNewAddressOnEditMode(this.existingContactAddresses, this.allAddressTypes, this.currentDate);
    if (newAddress) {
      this.newAddressOnEdit = newAddress;
      this.canAddNewAddressOnEdit = canAddNewAddress;
    }
  }

  removeAddressOnEditMode(index: number) {
    this.firmDetailsService.removeAddressOnEditMode(
      index,
      this.existingContactAddresses,
      this.removedAddresses,
      this.allAddressTypes.length,
      this.errorMessages
    ).then(({ canAddNewAddress, updatedArray }) => {
      this.canAddNewAddressOnEdit = canAddNewAddress;
      this.existingContactAddresses = updatedArray;
    });
  }

  onSameAsTypeChangeOnEditMode(selectedTypeID: number, index: number) {
    this.disableAddressFieldsOnEdit = selectedTypeID && selectedTypeID != 0; // Set disableAddressFields here
    this.firmDetailsService.onSameAsTypeChangeOnEditMode(selectedTypeID, index, this.existingContactAddresses, this.newAddressOnEdit);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  addNewAddressOnCreateMode() {
    const result = this.firmDetailsService.addNewAddressOnCreateMode(this.addedAddresses, this.allAddressTypes, this.currentDate);

    this.canAddNewAddressOnCreate = result.canAddNewAddressOnCreate;
    this.isAllAddressesAddedOnCreate = result.isAllAddressesAddedOnCreate;

    this.checkCanAddNewAddressOnCreateMode();
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
    }

    // Check if the "Add Address" button should be enabled
    this.checkCanAddNewAddressOnCreateMode();
  }

  getAddressTypeHistory(addressTypeId: number, entityTypeId: number, entityId: number, contactAssnID: number) {
    this.callAddressType = true;
    this.addressService.getAddressesTypeHistory(null, addressTypeId, entityTypeId, entityId, contactAssnID).subscribe(
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



  ///////////// DNFBP Functions 
  // getContactFunctionType() {
  //   this.contactService.getContactFunctionType().subscribe(
  //     data => {
  //       if (data.isSuccess) {
  //         this.ContactFunctionTypeList = data.response.map(item => ({
  //           ContactFunctionTypeID: item.FunctionTypeID,
  //           contactFunctionTypeDesc: item.FunctionTypeDesc,
  //           isSelected: false,
  //           effectiveDate: '',
  //           endDate: '',
  //           reviewStatus: ''
  //         }));
  //       }
  //     },
  //     error => {
  //       console.error('Error Fetching Contact Function Types', error);
  //     }
  //   );
  // }
  getContactFunctionType() {
    this.contactService.getContactFunctionType().subscribe(
      (data) => {
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
      (error) => {
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
  onFunctionCheckboxChangeCreate(contactFunction: any) {
    if (contactFunction.isSelected) {
      this.selectedContactFunctions.push({
        ContactFunctionTypeID: contactFunction.ContactFunctionTypeID,
        ContactFunctionTypeDesc: contactFunction.contactFunctionTypeDesc,
        effectiveDate: contactFunction.effectiveDate,
        endDate: contactFunction.endDate,
        reviewStatus: contactFunction.reviewStatus,
        isFunctionActive: true,
        CreatedBy: this.userId
      });

      if (contactFunction.ContactFunctionTypeID === 17) {
        this.showMLROSection = true;
      }
    } else {
      this.selectedContactFunctions = this.selectedContactFunctions.filter(
        func => func.ContactFunctionTypeID !== contactFunction.ContactFunctionTypeID
      );
      if (contactFunction.ContactFunctionTypeID === 17) {
        this.showMLROSection = false;
      }
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


  // fetchResidencyStatus(): void {
  //   const ObjectID = 523;
  //   const ObjectInstanceID = this.selectedContact.contactID;
  //   const ObjectInstanceRevNum = 1;
  //   const SourceObjectID = 523;
  //   const SourceObjectInstanceID = this.selectedContact.contactAssnID;
  //   const SourceObjectInstanceRevNum = 1;
  //   const ActiveFlag = true;

  //   this.aiElectronicswfService.getListObjectAttribute(
  //     ObjectID,
  //     ObjectInstanceID,
  //     ObjectInstanceRevNum,
  //     ActiveFlag,
  //     SourceObjectID,
  //     SourceObjectInstanceID,
  //     SourceObjectInstanceRevNum
  //   ).subscribe(
  //     (data) => {
  //       if (data.isSuccess && data.response?.length > 0) {
  //         this.ResidencyStatusCheck = data.response[0];
  //       } else {
  //         this.ResidencyStatusCheck = { AttributeValue: '' };
  //       }
  //       this.cdr.detectChanges(); // Trigger change detection
  //     },
  //     (error) => {
  //       console.error("Error fetching Residency Status:", error);
  //       this.ResidencyStatusCheck = { AttributeValue: '' };
  //     }
  //   );
  // }
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
  onFunctionCheckboxChangeEdit(contactFunction: any): void {
    if (contactFunction.isSelected) {
      const existingFunctionIndex = this.selectedContactFunctions.findIndex(
        (func) => func.ContactFunctionTypeID === contactFunction.ContactFunctionTypeID
      );

      if (existingFunctionIndex === -1) {
        // Add a new function to the list
        this.selectedContactFunctions.push({
          contactAssnID: this.selectedContact.contactAssnID,
          contactFunctionID: null,
          contactID: this.selectedContact.contactID,
          ContactFunctionTypeID: contactFunction.ContactFunctionTypeID,
          ContactFunctionTypeDesc: contactFunction.contactFunctionTypeDesc,
          effectiveDate: contactFunction.effectiveDate || '',
          endDate: contactFunction.endDate || '',
          reviewStatus: contactFunction.reviewStatus || 'Pending',
          isFunctionActive: true,
          isRecordEditable: 1,
          CreatedBy: this.userId
        });
      }
      if (contactFunction.ContactFunctionTypeID === 17) {
        this.showMLROSection = true;
      }
    } else {
      // Confirm before removing a function
      Swal.fire({
        text: 'De-selecting this function will cause this record to be deleted from the system permanently.',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.selectedContactFunctions = this.selectedContactFunctions.filter(
            (func) => func.ContactFunctionTypeID !== contactFunction.ContactFunctionTypeID
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

  // initializeSelectedFunctions(): void {
  //   if (this.selectedContact?.lstContactFunctions) {
  //     this.selectedContact.lstContactFunctions.forEach(contactFunction => {
  //       const matchingFunction = this.ContactFunctionTypeList.find(
  //         functionType => functionType.ContactFunctionTypeID === contactFunction.functionTypeID
  //       );

  //       if (matchingFunction) {
  //         matchingFunction.isSelected = true;
  //         matchingFunction.effectiveDate = contactFunction.effectiveDate;
  //         matchingFunction.endDate = contactFunction.endDate;
  //         matchingFunction.reviewStatus = contactFunction.reviewStatus;
  //         matchingFunction.isFunctionActive = true
  //         // Add to selectedContactFunctions if not already there
  //         const existsInSelected = this.selectedContactFunctions.find(
  //           func => func.ContactFunctionTypeID === matchingFunction.ContactFunctionTypeID
  //         );
  //         if (!existsInSelected) {
  //           this.selectedContactFunctions.push({
  //             contactFunctionID: contactFunction.contactFunctionID,
  //             contactID: contactFunction.contactID,
  //             contactAssnID: contactFunction.contactAssnID,
  //             ContactFunctionTypeID: contactFunction.functionTypeID,
  //             ContactFunctionTypeDesc: contactFunction.functionTypeDesc,
  //             effectiveDate: contactFunction.effectiveDate,
  //             endDate: contactFunction.endDate,
  //             reviewStatus: contactFunction.reviewStatus,
  //             isFunctionActive: true,
  //             isRecordEditable: contactFunction.isRecordEditable,
  //             CreatedBy: this.userId
  //           });
  //         }
  //       }
  //     });
  //   }
  // }
  initializeSelectedFunctions(): void {
    // Clear previous selections
    this.selectedContactFunctions = [];

    if (this.selectedContact?.lstContactFunctions) {
      this.selectedContact.lstContactFunctions.forEach((contactFunction: any) => {
        // Find the matching function type from ContactFunctionTypeList
        const matchingFunction = this.ContactFunctionTypeList.find(
          (functionType) => functionType.ContactFunctionTypeID === contactFunction.functionTypeID
        );

        if (matchingFunction) {
          // Mark the function as selected and populate its fields
          matchingFunction.isSelected = true;
          matchingFunction.effectiveDate = contactFunction.effectiveDate || '';
          matchingFunction.endDate = contactFunction.endDate || '';
          matchingFunction.reviewStatus = contactFunction.reviewStatus || 'Pending';

          const isFunctionActive = contactFunction.isFunctionActive === 1 || contactFunction.isFunctionActive === '1';

          // Add to the selectedContactFunctions list
          this.selectedContactFunctions.push({
            contactAssnID: contactFunction.contactAssnID,
            contactFunctionID: contactFunction.contactFunctionID,
            contactID: contactFunction.contactID,
            ContactFunctionTypeID: contactFunction.functionTypeID,
            ContactFunctionTypeDesc: contactFunction.functionTypeDesc,
            effectiveDate: contactFunction.effectiveDate,
            endDate: contactFunction.endDate,
            reviewStatus: contactFunction.reviewStatus,
            isFunctionActive: isFunctionActive,
            isRecordEditable: contactFunction.isRecordEditable,
            CreatedBy: this.userId
          });
        }
      });

      console.log("Initialized selectedContactFunctions:", this.selectedContactFunctions);
    }
  }
  isHistoryPopupVisible: boolean = false;
  isHistoryCheckboxChecked: boolean = false;
  FunctionsHistoryList: any = [];
  toggleFunctionsHistory(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.getContactFunctionsHistoryList();
      this.isHistoryPopupVisible = true;
    } else {
      this.closeHistoryPopup();
    }
  }
  getContactFunctionsHistoryList(): void {
    const contactId = this.selectedContact.contactID;
    const contactAssId = this.selectedContact.contactAssnID;

    this.contactService.getContactFunctionsList(contactId, contactAssId).subscribe(
      (data) => {
        if (data?.response) {
          this.FunctionsHistoryList = data.response;
          console.log("FunctionsHistoryList:", this.FunctionsHistoryList);
        }
      },
      (error) => {
        console.error("Error fetching Functions History:", error);
      }
    );
  }

  // Method to close the History Popup
  closeHistoryPopup(): void {
    this.isHistoryPopupVisible = false;
    this.isHistoryCheckboxChecked = false;
  }
  createResidentStateObj = {
    attributeValue: "",

  }
  createFunctionResidentState(contactAssnID: number, contactID: number) {
    const savecreateResidentStateObj = {
      objectAttributeID: null,
      objectAttributeDefID: 1,
      firmID: this.firmId,
      objectID: constants.FrimsObject.Contatcs,
      objectInstanceID: contactID, // Set the contactID here
      objectInstanceRevNum: 1,
      attributeName: "Residency Status",
      attributeValue: this.createResidentStateObj.attributeValue,
      activeFlag: true,
      createdBy: this.userId,
      sourceObjectID: constants.FrimsObject.Contatcs,
      sourceObjectInstanceID: contactAssnID, // Set the contactAssnID here
      sourceObjectInstanceRevNum: 1,
      lastModifiedBy: "30",
      lastModifiedDate: "03/Dec/2024"
    };
    console.log("save create Resident State Obj ", savecreateResidentStateObj)
    this.aiElectronicswfService.InsertUpdateObjectAttributes(savecreateResidentStateObj).subscribe(
      data => {
        console.log("Function Resident State Saved Successfully");
      },
      error => {
        console.error("Error saving Function Resident State", error);
      }
    );
  }

  ///////////// Resident State  && Counrty
  onCountryChange(event: Event): void {
    const selectedCountryID = Number((event.target as HTMLSelectElement).value);
    this.addedAddresses.CountryID = selectedCountryID;

    const residentStatus = this.createResidentStateObj.attributeValue;
    if (selectedCountryID !== 0) {
      if (residentStatus === 'Resident' && selectedCountryID !== this.getQatarCountryID()) {
        this.firmDetailsService.showErrorAlert(6503);
      }

      // Check if the resident status is "Non-Resident" and country is Qatar
      if (residentStatus === 'Non-Resident' && selectedCountryID === this.getQatarCountryID()) {
        this.firmDetailsService.showErrorAlert(6503);
      }
    }
    // Check if the resident status is "Resident" and country is not Qatar

  }
  onResidentStatusChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.createResidentStateObj.attributeValue = selectedValue;

    if (this.addedAddresses.CountryID !== 0) {

      if (selectedValue === 'Resident' && this.addedAddresses.CountryID !== this.getQatarCountryID()) {
        this.firmDetailsService.showErrorAlert(6503);
      }

      // Check if the resident status is "Non-Resident" and country is Qatar
      if (selectedValue === 'Non-Resident' && this.addedAddresses.CountryID === this.getQatarCountryID()) {
        this.firmDetailsService.showErrorAlert(6503);
      }
    }

  }
  showAlert(message: string): void {
    Swal.fire({
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK'
    });
  }
  getQatarCountryID(): number {
    const qatar = this.allCountries.find(country => country.CountryName === 'Qatar');
    return qatar ? qatar.CountryID : 0;
  }
  onResidentStatusEditChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.EditResidentStateObj.attributeValue = selectedValue;
  }
  //////////////////////////// 

  EditFunctionResidentState(contactAssnID: number, contactID: number) {
    const saveCreateResidentStateObj = {
      objectAttributeID: null,
      objectAttributeDefID: 1,
      firmID: this.firmId,
      objectID: constants.FrimsObject.Contatcs,
      objectInstanceID: contactID,
      objectInstanceRevNum: 1,
      attributeName: "Residency Status",
      attributeValue: this.EditResidentStateObj.attributeValue, // Bind the selected value here
      activeFlag: true,
      createdBy: this.userId,
      sourceObjectID: constants.FrimsObject.Contatcs,
      sourceObjectInstanceID: contactAssnID,
      sourceObjectInstanceRevNum: 1,
      lastModifiedBy: "30",
      lastModifiedDate: this.dateUtilService.convertDateToYYYYMMDD(new Date())
    };

    console.log("Saving Residency Status:", saveCreateResidentStateObj);

    this.aiElectronicswfService.InsertUpdateObjectAttributes(saveCreateResidentStateObj).subscribe(
      data => {
        console.log("Function Resident State Saved Successfully");
      },
      error => {
        console.error("Error saving Function Resident State", error);
      }
    );
  }
  ////////////// end DNFBP Functions  






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
  ContactDetailsByPassingParam: any = [];
  SearchContactDetails(firstName: string, familyName: string,) {
    this.contactService.SearchContactDetailsByPassingParam(firstName, familyName, this.firmId).subscribe(
      data => {
        if (data.isSuccess && data.response.length > 0) {
          this.ContactDetailsByPassingParam = data.response;
          this.showContactModal = true;
          console.log("ContactDetailsByPassingParam", this.ContactDetailsByPassingParam)
        }
      },
      error => {
        console.error('Error finding contact details', error);
      }
    );
  }

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




  //////////////////////// for Additional Information Checkboxes 


  updateAdditionalInfoCreate(event: Event, label: string): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);

    if (target.checked) {
      this.selectedAdditionalInfo.add(value);
      this.selectedAdditionalInfoLabels.add(label);
    } else {
      this.selectedAdditionalInfo.delete(value);
      this.selectedAdditionalInfoLabels.delete(label);
    }

    this.createContactObj.strContactAddnlInfoTypeID = Array.from(this.selectedAdditionalInfo).join(',');
    this.createContactObj.strContactAddnInfoTypes = Array.from(this.selectedAdditionalInfoLabels).join(', ');

    console.log('Create - Selected IDs:', this.createContactObj.strContactAddnlInfoTypeID);
    console.log('Create - Selected Labels:', this.createContactObj.strContactAddnInfoTypes);
  }
  updateAdditionalInfoEdit(event: Event, label: string): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);

    if (target.checked) {
      this.selectedAdditionalInfo.add(value);
      this.selectedAdditionalInfoLabels.add(label);
    } else {
      this.selectedAdditionalInfo.delete(value);
      this.selectedAdditionalInfoLabels.delete(label);
    }

    this.selectedContact.strContactAddnlInfoTypeID = Array.from(this.selectedAdditionalInfo).join(',');
    this.selectedContact.strContactAddnInfoTypes = Array.from(this.selectedAdditionalInfoLabels).join(', ');

    console.log('Edit - Selected IDs:', this.selectedContact.strContactAddnlInfoTypeID);
    console.log('Edit - Selected Labels:', this.selectedContact.strContactAddnInfoTypes);
  }
  getInfoTypeID(label: string): string | null {
    const mapping = {
      'VIP': '1',
      'Annual Report': '3',
      'Christmas/New Year': '4',
      'Eid Cards': '5',
      'Publications': '6'
    };
    return mapping[label] || null;
  }


  initializeEditInfoTypes(): void {

    this.selectedInfoTypes = {};
    this.selectedAdditionalInfo.clear();
    this.selectedAdditionalInfoLabels.clear();

    if (this.selectedContact.strContactAddnInfoTypes) {
      const selectedLabels = this.selectedContact.strContactAddnInfoTypes.split(', ').map(label => label.trim());

      selectedLabels.forEach(label => {
        const value = this.getInfoTypeID(label);
        if (value) {
          this.selectedInfoTypes[value] = true;
          this.selectedAdditionalInfo.add(Number(value));
          this.selectedAdditionalInfoLabels.add(label);
        }
      });
    }
    console.log('Loaded from DB:', this.selectedInfoTypes);
  }

  updateAdditionalInfoLabels(): void {
    this.createContactObj.strContactAddnlInfoTypeID = Array.from(this.selectedAdditionalInfo).join(',');
    this.createContactObj.strContactAddnInfoTypes = Array.from(this.selectedAdditionalInfoLabels).join(', ');
  }

}
