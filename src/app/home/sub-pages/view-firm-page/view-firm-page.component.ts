import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';  // Import ActivatedRoute
import { FirmService } from 'src/app/ngServices/firm.service';  // Import FirmService
import flatpickr from 'flatpickr';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as constants from 'src/app/app-constants';
import { Address } from 'src/app/models/address.model';




@Component({
  selector: 'app-view-firm-page',
  templateUrl: './view-firm-page.component.html',
  styleUrls: ['./view-firm-page.component.scss']
})
export class ViewFirmPageComponent implements OnInit {
  /* for Auditors */
  IsViewAuditorVisible: boolean = false;
  IsCreateAuditorVisible: boolean = false;
  IsEditAuditorVisible: boolean = false;
  isAddingNewAddress: boolean = false;
  selectedAuditor: any = null;
  categorizedData = [];
  selectedAuditorNameFromSelectBox: string = 'select';
  flatpickrInstance: any;
  initialized = false;
  @ViewChildren('auditorRadio') auditorRadios!: QueryList<any>;
  @ViewChildren('dateInputs') dateInputs: QueryList<ElementRef<HTMLInputElement>>;
  /* */
  call: Boolean = false;
  callInactiveUsers: Boolean = false;
  menuId: Number = 0;
  menuWidth: string = '2%';
  dataWidth: string = '98%';
  width1: string = '15%';
  width2: string = '2%';
  widthData1: string = '98%';
  widthData2: string = '85%';
  firmId: number = 0;  // Add firmId property
  ASSILevel: number = 4;
  firmDetails: any = {};  // Add firmDetails property
  firmAddress: any = {}; // Used to edit firm Address
  firmApp: any = {};
  firmOPDetails: any;
  prudReturnTypesDropdown: any;
  firmFYearHistory: any = [];
  firmNamesHistory: any = [];
  firmAccountingStandardHistory: any = [];
  firmAddresses: any = [];
  existingAddressTypes: any[] = [];
  appDetails: any = [];
  applicationTypeId: number;
  selectedFirmTypeID: number;
  originalFirmAddresses: any = [];
  firmAddressesTypeHistory: any = [];
  ActivityLicensed: any = [{}];
  ActivityAuth: any = [];
  AuthTableDocument: any = [];
  islamicFinance: any = {};
  activityCategories: any[] = [];
  licensedActivities: any = [];
  AuthRegulatedActivities: any = [];
  firmInactiveUsers: any[] = [];
  firmAppDetailsLicensed: any[] = [];
  firmAppDetailsAuthorization: any[] = [];
  firmAppDetailsCurrentLicensed: any;
  firmAppDetailsCurrentAuthorized: any;
  FIRMAuditors: any[] = [];
  FIRMContacts: any[] = [];
  FIRMControllers: any[] = [];
  RegisteredFund: any[] = [];
  FIRMRA: any[] = [];
  FirmAdminFees: any[] = [];
  FirmWaivers: any;
  FIRMRMP: any;
  FIRMNotices: any;
  allowEditFirmDetails: string | boolean = true;
  /* for scope */
  allowEditLicScopeDetails: string | boolean = true;
  allowEditAuthScopeDetails: string | boolean = true;
  showPermittedActivitiesTable: string | boolean = false;
  isIslamicFinanceChecked: boolean = true;
  scopeRevNum: number;
  selectedCategory: string;
  selectedActivity: string;
  documentDetails: any = {}


  selectedStatusId: number | null = null;
  selectedAuthStatusId: number | null = null;
  licenseStatusDates: { [key: number]: string | null } = {};
  authorisationStatusDates: { [key: number]: string | null } = {};

  /*dropdowns arrays*/
  allCountries: any = [];
  allQFCLicenseStatus: any = [];
  allAuthorisationStatus: any = [];
  allLegalStatus: any = [];
  allFinYearEnd: any = [];
  allFinAccStd: any = [];
  allFirmTypes: any = [];
  allAddressTypes: any = [];
  usedAddressTypes: Set<number> = new Set();
  activeTab: string = '';

  isCollapsed: { [key: string]: boolean } = {};
  selectedFile: File | null = null;
  fileError: string = '';
  categoriesWithProducts: any[] = [];

  objFirmScope: any = {};
  lstFirmActivities: any = [];
  objectProductActivity: any = [];
  objPrudentialCategory: any = {};
  objSector: any = {};
  lstFirmScopeCondition: any = [];
  objFirmIslamicFinance: any = {};
  rstFirmSector: boolean;
  firmSectorID: any;


  AllProducts: any[] = [];


  constructor(
    private router: Router,
    private route: ActivatedRoute,  // Inject ActivatedRoute
    private firmService: FirmService,  // Inject FirmService
    private el: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.scrollToTop();

    this.route.params.subscribe(params => {
      this.firmId = +params['id']; // Retrieve the firm ID from the route parameters
      console.log(`Loaded firm with ID: ${this.firmId}`);
      this.loadFirmDetails(this.firmId);  // Fetch the firm details
      this.loadCurrentAppDetails();
      this.loadFirmOPDetails(this.firmId); // Fetch Operational Data
      this.loadAssiRA();
      this.loadAdminFees();
      this.loadActivitiesLicensed();
      this.loadActivitiesAuthorized();
      this.loadRegulatedActivities();
      this.loadIslamicFinance();
      this.loadActivityCategories();
      this.loadActivitiesTypesForLicensed();
      this.loadFirmAdresses();
      this.loadPrudReturnTypes(); // change to populate dropdown
      this.populateCountries();
      this.populateQFCLicenseStatus();
      this.populateAuthorisationStatus();
      this.populateLegalStatus();
      this.populateFinYearEnd();
      this.populateFinAccStd();
      this.populateFirmAppTypes();
      this.populateAddressTypes();
    });
  }

  ngAfterViewInit() {
    // Ensure the query list is available
    this.dateInputs.changes.subscribe(() => {
      this.initializeFlatpickr();
    });
    // Initialize Flatpickr if already available
    this.initializeFlatpickr();
  }

  initializeFlatpickr() {
    this.dateInputs.forEach((input: ElementRef<HTMLInputElement>) => {
      flatpickr(input.nativeElement, {
        allowInput: true,
        dateFormat: 'd/M/Y', // Adjust date format as needed
        onChange: (selectedDates, dateStr) => {
          console.log('Selected Date:', selectedDates);
          console.log('Formatted Date String:', dateStr);
          input.nativeElement.value = dateStr;
        }
      });
    });
  }

  scrollToTop(): void {
    console.log('scrollToTop called');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleCollapse(section: string) {
    this.isCollapsed[section] = !this.isCollapsed[section];
  }

  toggleMenu(inputNumber: Number) {
    if (this.menuId == 0) {
      this.menuId = inputNumber;
      this.menuWidth = this.width1;
      this.dataWidth = this.widthData2;
    } else if (this.menuId == inputNumber) {
      this.menuId = 0;
    }
    else {
      this.menuId = inputNumber;
    }
  }

  toggleFulMenu() {
    if (this.menuWidth !== this.width2) {
      this.menuWidth = this.width2;
      this.dataWidth = this.widthData1;
    } else {
      this.menuWidth = this.width1;
      this.dataWidth = this.widthData2;
    }
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
    // Get all section elements
    const sections = this.el.nativeElement.getElementsByTagName('section');

    // Loop through all section elements and set display to none
    for (let i = 0; i < sections.length; i++) {
      this.renderer.setStyle(sections[i], 'display', 'none');
    }
    console.log('yes its', tabId)
    const neededSection = document.getElementById(tabId);
    this.renderer.setStyle(neededSection, 'display', 'flex');

    if (tabId == 'CD') {
      this.loadPrevFirmAndDate();
      //this.loadApplicationDetails();
    }

    if (tabId == 'Scope') {
      this.isCollapsed['LicensedSection'] = true
    }

    if (tabId == 'Auditors' && this.FIRMAuditors.length === 0) {
      this.loadAuditors();
    }
    if (tabId == 'Contacts' && this.FIRMContacts.length === 0) {
      this.loadContacts();
    }
    if (tabId == 'Controllers' && this.FIRMControllers.length === 0) {
      this.loadControllers();
    }
    if (tabId == 'SPRegFunds' && this.RegisteredFund.length === 0) {
      this.loadRegisteredFund();
    }
    if (tabId == 'SPWaivers') {
      this.loadWaivers();
    }
    if (tabId == 'SPRMPs') {
      this.loadRMPs();
    }
    if (tabId == 'SPNotices') {
      this.loadNotices();
    }
    // if(tabId == 'CD'){

    // }
    // if(tabId == 'CD'){
    //   console.log('yes its', tabId)
    //   const neededSection = document.getElementById(tabId);
    //   this.renderer.setStyle(neededSection, 'display', 'flex');
    // }
  }

  editFirm() {
    console.log("allowEditFirmDetails :", this.allowEditFirmDetails);

    this.allowEditFirmDetails = !this.allowEditFirmDetails;
    const existingAddresses = this.firmAddresses;

    if (this.allowEditFirmDetails) {
      console.log("firms details after edit:", this.firmDetails);
      const userId = 10044; // Replace with dynamic userId as needed  //TODO: Remove hardcoded userId

      if (this.firmDetails?.AuthorisationStatusTypeID > 0) {
        this.firmDetails.firmApplDate = this.firmDetails.FirmAuthApplDate ? this.convertDateToYYYYMMDD(this.firmDetails.FirmAuthApplDate) : null;
      } else {
        this.firmDetails.firmApplDate = this.firmDetails.FirmLicApplDate ? this.convertDateToYYYYMMDD(this.firmDetails.FirmLicApplDate) : null;
      }

      const updatedAddresses = existingAddresses.map(address => ({
        firmID: this.firmId,
        countryID: address.CountryID,
        addressTypeID: address.AddressTypeID,
        sameAsTypeID: address.SameAsTypeID,
        lastModifiedBy: userId, // must be dynamic
        addressAssnID: address.AddressAssnID,
        entityTypeID: address.EntityTypeID,
        entityID: address.EntityID,
        contactAssnID: 0,
        contactID: 0,
        addressID: address.AddressID.toString(),
        addressLine1: address.AddressLine1,
        addressLine2: address.AddressLine2,
        addressLine3: address.AddressLine3,
        addressLine4: address.AddressLine4,
        city: address.City,
        province: '',
        postalCode: address.PostalCode,
        phoneNumber: address.PhoneNum,
        phoneExt: '',
        faxNumber: address.FaxNum,
        lastModifiedDate: address.LastModifiedDate, // Ensure date format is expected
        addressState: 3,
        fromDate: address.FromDate, // Ensure date format is expected
        toDate: address.ToDate, // Ensure date format is expected
        objectID: address.ObjectID,
        objectInstanceID: address.ObjectInstanceID,
        objectInstanceRevNumber: address.ObjectInstanceRevNum,
        sourceObjectID: address.SourceObjectID,
        sourceObjectInstanceID: address.SourceObjectInstanceID,
        sourceObjectInstanceRevNumber: address.SourceObjectInstanceRevNum,
        objAis: {
          ainId: 0,
          contactId: 0,
          natinality: 0,
          countryOfResidence: 0,
          functionId: 0,
          formTypeId: 0,
          formProcessorId: 0,
          statusofApplicationId: 0,
          applicatioState: 0,
          fromType: 0,
          contactAssId: 0,
          firmId: 0,
          prefferdMethod: 0,
          customFacingId: 0,
          ainNumber: "",
          title: "",
          firstName: "",
          secondName: "",
          thirdName: "",
          familyname: "",
          fullName: "",
          previousName: "",
          dateOfBirth: "",
          placeOfBirth: "",
          nationality: "",
          copyOfResidence: "",
          passportNumber: "",
          nationalId: "",
          functions: "",
          conditions: "",
          formType: "",
          dateRecieved: "",
          formProcessor: "",
          paymentRequest: "",
          paymentRecieved: "",
          createdBy: "",
          statusOfApplications: "",
          statusDate: "",
          appicationStatusDate: "",
          customFacingActivity: "",
          paymentRequestSenton: "",
          paymentRecievedon: "",
          conditionsRestriction: "",
          applicationID: "",
          createdDate: "",
          mobilePhone: "",
          bussinessEmail: "",
          otherEmail: "",
          prefferedMethodType: "",
          showReadOnly: true,
          showEnabled: true
        }
      }));
      const firmObj = {
        firmDetails: {
          firmID: this.firmId,
          firmName: this.firmDetails.FirmName,
          qfcNumber: this.firmDetails.QFCNum,
          firmCode: this.firmDetails.FirmCode,
          legalStatusTypeID: this.firmDetails.LegalStatusTypeID,
          qfcTradingName: this.firmDetails.QFCTradingName,
          prevTradingName: this.firmDetails.PrevTradingName,
          placeOfIncorporation: this.firmDetails.PlaceOfIncorporation,
          countyOfIncorporation: this.firmDetails.CountyOfIncorporation,
          webSiteAddress: this.firmDetails.WebSiteAddress,
          firmApplDate: this.firmDetails.firmApplDate,
          firmApplTypeID: this.selectedFirmTypeID,
          licenseStatusTypeID: this.firmDetails.LicenseStatusTypeID,
          licensedDate: this.convertDateToYYYYMMDD(this.firmDetails.LicensedDate),
          authorisationStatusTypeID: this.firmDetails.AuthorisationStatusTypeID,
          authorisationDate: this.convertDateToYYYYMMDD(this.firmDetails.AuthorisationDate),
          createdBy: userId,
          finYearEndTypeID: this.firmDetails.FinYearEndTypeID,
          firmAccountingDataID: this.firmDetails.FirmAccountingDataID,
          firmApplicationDataComments: this.firmDetails.FirmApplicationDataComments ? this.firmDetails.FirmApplicationDataComments : '',
          firmYearEndEffectiveFrom: this.convertDateToYYYYMMDD(this.firmDetails.FirmFinYearEndEffectiveFrom),
          finAccStandardTypeID: this.firmDetails.FinAccStdTypeID,
          finAccStandardID: this.firmDetails.FirmAccountingStandardID ?? 0,
          firmAccountingEffectiveFrom: this.convertDateToYYYYMMDD(this.firmDetails.FinAccStdTypeEffectiveFrom) ?? '',
          dateOfIncorporation: this.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
          differentIncorporationDate: this.firmDetails.DifferentIncorporationDate,
          firmNameAsinFactSheet: this.firmDetails.FirmNameAsinFactSheet ? this.firmDetails.FirmNameAsinFactSheet : '',
          requiresCoOp: this.firmDetails.RequiresCoOp ? this.firmDetails.RequiresCoOp : '',
          prComments: this.firmDetails.PublicRegisterComments ? this.firmDetails.PublicRegisterComments : ''
        },
        addressList: updatedAddresses
      };

      // const firmObj = {
      //   firmId: this.firmId,
      //   firmName: this.firmDetails.FirmName,
      //   qfcNum: this.firmDetails.QFCNum,
      //   firmCode: this.firmDetails.FirmCode,
      //   legalStatusTypeID: this.firmDetails.LegalStatusTypeID,
      //   qfcTradingName: this.firmDetails.QFCTradingName,
      //   prevTradingName: this.firmDetails.PrevTradingName,
      //   placeOfIncorporation: this.firmDetails.PlaceOfIncorporation,
      //   countyOfIncorporation: this.firmDetails.CountyOfIncorporation,
      //   webSiteAddress: this.firmDetails.WebSiteAddress,
      //   firmApplDate: this.firmDetails.firmApplDate ? this.convertDateToYYYYMMDD(this.firmDetails.firmApplDate) : null,
      //   firmApplTypeID: 0,
      //   licenseStatusTypeID: this.firmDetails.LicenseStatusTypeID,
      //   licensedDate: this.convertDateToYYYYMMDD(this.firmDetails.LicensedDate),
      //   authorisationStatusTypeID: this.firmDetails.AuthorisationStatusTypeID,
      //   authorisationDate: this.convertDateToYYYYMMDD(this.firmDetails.AuthorisationDate),
      //   loginuserId: userId,
      //   finYearEndTypeId: this.firmDetails.FinYearEndTypeID,
      //   firmAccDataId: this.firmDetails.FirmAccountingDataID,
      //   firmApplicationDataComments: this.firmDetails.FirmApplicationDataComments ? this.firmDetails.FirmApplicationDataComments : '',
      //   firmFinYearEndEffectiveFrom: this.convertDateToYYYYMMDD(this.firmDetails.FirmFinYearEndEffectiveFrom),
      //   firmFinStandardTypeID: this.firmDetails.FinAccStdTypeID,
      //   firmStandardID: this.firmDetails.FirmAccountingStandardID,
      //   firmFinStandardEffectiveFrom: this.convertDateToYYYYMMDD(this.firmDetails.FinAccStdTypeEffectiveFrom),
      //   dateOfIncorporation: this.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation),
      //   differentIncorporationDate: this.firmDetails.DifferentIncorporationDate,
      //   firmNameAsInFactSheet: this.firmDetails.FirmNameAsinFactSheet ? this.firmDetails.FirmNameAsinFactSheet : '',
      //   requiresCoIndex: this.firmDetails.RequiresCoOp ? this.firmDetails.RequiresCoOp : '',
      //   publicRegisterComments: this.firmDetails.PublicRegisterComments ? this.firmDetails.PublicRegisterComments : ''
      // };

      // update Addresses
      // add condition for addresstypeID to check which one you want to edit
      // Assuming originalFirmAddresses holds the original state of firmAddresses before editing
      // this.firmAddresses.forEach((address, index) => {
      //   // Retrieve the original address for comparison
      //   const originalAddress = this.originalFirmAddresses[index];

      //   let addressChanged = false;

      //   // Check if any address fields have changed
      //   if (address.AddressLine1 !== originalAddress.AddressLine1 ||
      //     address.AddressLine2 !== originalAddress.AddressLine2 ||
      //     address.AddressLine3 !== originalAddress.AddressLine3 ||
      //     address.AddressLine4 !== originalAddress.AddressLine4 ||
      //     address.City !== originalAddress.City ||
      //     address.Province !== originalAddress.Province ||
      //     address.PostalCode !== originalAddress.PostalCode ||
      //     address.CountryID !== originalAddress.CountryID ||
      //     address.PhoneNum !== originalAddress.PhoneNum ||
      //     address.PhoneExt !== originalAddress.PhoneExt ||
      //     address.FaxNum !== originalAddress.FaxNum) {
      //     addressChanged = true;
      //   }
      //   if (addressChanged) { // Change this to execute when changes are detected
      //     this.firmAddress.addressId = address.AddressID;
      //     this.firmAddress.addressAssnId = address.AddressAssnID;
      //     this.firmAddress.addressTypeId = address.AddressTypeID;
      //     this.firmAddress.addressLine1 = address.AddressLine1;
      //     this.firmAddress.addressLine2 = address.AddressLine2;
      //     this.firmAddress.addressLine3 = address.AddressLine3;
      //     this.firmAddress.addressLine4 = address.AddressLine4;
      //     this.firmAddress.city = address.City;
      //     this.firmAddress.province = address.Province;
      //     this.firmAddress.postalCode = address.PostalCode;
      //     this.firmAddress.countryId = address.CountryID;
      //     this.firmAddress.phone = address.PhoneNum;
      //     this.firmAddress.phoneExt = address.PhoneExt;
      //     this.firmAddress.fax = address.FaxNum;

      //     // Assigning other properties
      //     this.firmAddress.sameAsTypeId = address.SameAsTypeID;
      //     this.firmAddress.modifiedBy = address.LastModifiedBy;
      //     this.firmAddress.modifiedDate = address.LastModifiedDate;
      //     this.firmAddress.dateFrom = address.FromDate;
      //     this.firmAddress.dateTo = address.ToDate;
      //     this.firmAddress.objectID = address.ObjectID;
      //     this.firmAddress.objectInstanceID = address.ObjectInstanceID;
      //     this.firmAddress.objectInstanceRevNum = address.ObjectInstanceRevNum;
      //     this.firmAddress.sourceObjectID = address.SourceObjectID;
      //     this.firmAddress.sourceObjectInstanceID = address.SourceObjectInstanceID;
      //     this.firmAddress.sourceObjectInstanceRevNum = address.SourceObjectInstanceRevNum;
      //   }
      // });

      console.log("Final firm object to be sent:", firmObj);

      this.firmService.editFirm(userId, firmObj).subscribe(response => {
        console.log('Row edited successfully:', response);
        this.loadFirmDetails(this.firmId);
        //this.loadApplicationDetails();
        this.loadFirmAdresses();
        this.cdr.detectChanges();
      }, error => {
        console.error('Error editing row:', error);
      });
    }
  }





  cancelEditFirm() {
    this.allowEditFirmDetails = true;
  }


  // editLicenseScope() {
  //   this.allowEditLicScopeDetails = !this.allowEditLicScopeDetails;
  //   this.showPermittedActivitiesTable = !this.showPermittedActivitiesTable;

  //   const userId = 10044;
  //   if (this.allowEditLicScopeDetails) {

  //     // let container: any = {};
  //     // // objFirmScope
  //     // this.objFirmScope.firmScopeID = this.ActivityLicensed[0].FirmScopeID;
  //     // this.objFirmScope.scopeRevNum = this.ActivityLicensed[0].ScopeRevNum;
  //     // this.objFirmScope.docReferenceID = 0;
  //     // this.objFirmScope.firmID = this.ActivityLicensed[0].FirmID;
  //     // // this.objFirmScope.createdBy = this.ActivityLicensed[0].ScopeCreatedByName;
  //     // this.objFirmScope.createdBy = 1;
  //     // this.objFirmScope.objectID = 0;
  //     // this.objFirmScope.docIDs = this.ActivityLicensed[0].DocID ? this.ActivityLicensed[0].DocID : null;
  //     // this.objFirmScope.generalConditions = this.ActivityLicensed[0].GeneralConditions ? this.ActivityLicensed[0].GeneralConditions : null;
  //     // this.objFirmScope.effectiveDate = this.ActivityLicensed[0].ScopeEffectiveDate ? this.ActivityLicensed[0].ScopeEffectiveDate : null;
  //     // this.objFirmScope.scopeCertificateLink = this.ActivityLicensed[0].ScopeCertificateLink;
  //     // this.objFirmScope.applicationDate = this.ActivityLicensed[0].ScopeAppliedDate ? this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeAppliedDate) : null;
  //     // this.objFirmScope.licensedOrAuthorisedDate = this.ActivityLicensed[0].ScopeLicensedDate ? this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeLicensedDate) : null;;
  //     // // this.objFirmScope.firmApplTypeID = 2


  //     // //lstFirmActivities
  //     // this.lstFirmActivities.createdBy = 1;
  //     // this.lstFirmActivities.firmScopeTypeID = this.ActivityLicensed[0].FirmScopeTypeID;
  //     // this.lstFirmActivities.activityTypeID = this.ActivityLicensed[0].ActivityTypeID;
  //     // this.lstFirmActivities.effectiveDate = '';
  //     // this.lstFirmActivities.firmActivityConditions = this.ActivityLicensed[0].Column1;
  //     // this.lstFirmActivities.productTypeID = '';
  //     // this.lstFirmActivities.appliedDate = this.ActivityLicensed[0].ApliedDate;
  //     // this.lstFirmActivities.withDrawnDate = '';
  //     // this.lstFirmActivities.activityDetails = '';
  //     // // this.lstFirmActivities.objectProductActivity = [
  //     // //   this.objectProductActivity.productTypeID = 
  //     // //   this.objectProductActivity.appliedDate = 
  //     // //   this.objectProductActivity.withDrawnDate = 
  //     // //   this.objectProductActivity.effectiveDate = 
  //     // //   this.objectProductActivity.firmScopeTypeID = 
  //     // // ]

  //     // container.objFirmScope = this.objFirmScope;
  //     // container.lstFirmActivities = this.lstFirmActivities;
  //     // container.objPrudentialCategory = this.objPrudentialCategory;
  //     // container.objSector = this.objSector;
  //     // container.objFirmIslamicFinance = this.objFirmIslamicFinance;
  //     // container.lstFirmScopeCondition = this.lstFirmScopeCondition;
  //     // container.firmSectorID = this.firmSectorID;

  //     // this.firmService.editLicenseScope(userId, scopeLicensed).subscribe(response => {
  //     //   console.log('Row edited successfully:', response);
  //     // }, error => {
  //     //   console.error('Error editing row:', error);
  //     // })
  //   }

  // }
  // editLicenseScope(): void {
  //   this.allowEditLicScopeDetails = !this.allowEditLicScopeDetails;

  //   if (!this.allowEditLicScopeDetails) {
  //     // Save the changes when exiting edit mode
  //     this.saveLicenseScopeDetails();
  //   }
  // }

  // saveLicenseScopeDetails(): void {
  //   const updatedLicenseScope = {
  //     objFirmScope: {
  //       firmScopeID: this.ActivityLicensed[0]?.firmScopeID || 0,
  //       scopeRevNum: this.ActivityLicensed[0]?.scopeRevNum || 0,
  //       firmID: this.firmDetails?.FirmID || 0,
  //       objectID: this.ActivityLicensed[0]?.objectID || 0,
  //       createdBy: this.ActivityLicensed[0]?.createdBy || 0,
  //       docReferenceID: this.ActivityLicensed[0]?.docReferenceID || 0,
  //       firmApplTypeID: this.ActivityLicensed[0]?.firmApplTypeID || 0,
  //       docIDs: this.ActivityLicensed[0]?.docIDs || '',
  //       generalConditions: this.ActivityLicensed[0]?.generalConditions || '',
  //       scopeCertificateLink: this.ActivityLicensed[0]?.scopeCertificateLink || '',
  //       applicationDate: this.ActivityLicensed[0]?.applicationDate || '',
  //       licensedOrAuthorisedDate: this.ActivityLicensed[0]?.licensedOrAuthorisedDate || '',
  //     },
  //     lstFirmActivities: this.lstFirmActivities // Assuming these are activities already listed
  //   };

  //   // Call the API to save the changes
  //   this.firmService.editLicenseScope(10044, updatedLicenseScope).subscribe(
  //     response => {
  //       console.log('License scope updated successfully:', response);
  //       // Refresh the data or navigate to a confirmation page
  //     },
  //     error => {
  //       console.error('Error updating license scope:', error);
  //     }
  //   );
  // }

  convertDateToISO(dateString: string): string | null {
    if (!dateString || typeof dateString !== 'string') {
      console.error('Invalid date string:', dateString);
      return null;
    }

    // قائمة بالأشهر بالصيغة المختصرة
    const months: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    // تقسيم التاريخ إلى يوم، شهر، وسنة
    const [day, month, year] = dateString.split('/');

    // التحقق من صحة الشهر
    const monthIndex = months[month as keyof typeof months];
    if (monthIndex === undefined) {
      console.error('Invalid month:', month);
      return null; // إذا كان الشهر غير صالح، نعيد null
    }

    // إنشاء كائن Date
    const date = new Date(parseInt(year), monthIndex, parseInt(day));

    // التحقق من أن التاريخ صالح
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return null; // إذا كان التاريخ غير صالح، نعيد null
    }

    // إرجاع التاريخ بصيغة ISO
    return date.toISOString();
  }

  editLicenseScope(): void {
    debugger
    this.allowEditLicScopeDetails = !this.allowEditLicScopeDetails;
    debugger
    const updatedLicenseScope = {
      objFirmScope: this.ActivityLicensed.map(activityLic => ({
        firmScopeID: activityLic.FirmScopeID,
        scopeRevNum: activityLic.ScopeRevNum,
        firmID: activityLic.FirmID,
        objectID: 524,
        createdBy: 10044,
        docReferenceID: activityLic.docReferenceID,
        firmApplTypeID: 1,
        docIDs: activityLic.DocID,
        generalConditions: activityLic.GeneralConditions || "None",
        effectiveDate: this.convertDateToISO(activityLic.EffectiveDate),
        scopeCertificateLink: activityLic.ScopeCertificateLink,
        applicationDate: this.convertDateToISO(activityLic.ApplicationDate),
        licensedOrAuthorisedDate: this.convertDateToISO(activityLic.LicensedOrAuthorisedDate),
      }))[0],

      lstFirmActivities: this.ActivityLicensed.map(activityLic => ({
        createdBy: 10044,
        firmScopeTypeID: activityLic.FirmScopeTypeID,
        activityTypeID: activityLic.ActivityTypeID,
        effectiveDate: this.convertDateToISO(activityLic.EffectiveDate),
        firmActivityConditions: activityLic.FirmActivityConditions || "None",
        productTypeID: activityLic.ProductTypeID || null,
        appliedDate: this.convertDateToISO(activityLic.AppliedDate),
        withDrawnDate: this.convertDateToISO(activityLic.WithdrawnDate),
        objectProductActivity: activityLic.ObjectProductActivity ? activityLic.ObjectProductActivity.map(product => ({
          productTypeID: product.ProductTypeID,
          appliedDate: this.convertDateToISO(product.AppliedDate),
          withDrawnDate: this.convertDateToISO(product.WithdrawnDate),
          effectiveDate: this.convertDateToISO(product.EffectiveDate),
          firmScopeTypeID: product.FirmScopeTypeID
        })) : [],
        activityDetails: activityLic.FirmActivityDetails
      }))
    };


    console.log('Updated License Scope:', updatedLicenseScope);
    debugger
    this.firmService.editLicenseScope(10044, updatedLicenseScope).subscribe(
      response => {
        console.log('License scope updated successfully:', response);
      },
      error => {
        console.error('Error updating license scope:', error);
      }
    );
  }



  cancelEditLicScope() {
    this.allowEditLicScopeDetails = true;
  }

  editAuthScope() {
    this.allowEditAuthScopeDetails = !this.allowEditAuthScopeDetails;
    if (this.allowEditAuthScopeDetails) {


    }






    //   //objPrudentialCategory
    //   this.objPrudentialCategory.firmPrudentialCategoryID = this.ActivityAuth.FirmPrudentialCategoryID;
    //   this.objPrudentialCategory.firmID = this.ActivityAuth.FirmID;
    //   this.objPrudentialCategory.prudentialCategoryTypeID = this.ActivityAuth.PrudentialCategoryTypeID;
    //   this.objPrudentialCategory.firmScopeID = this.ActivityAuth.FirmScopeID;
    //   this.objPrudentialCategory.scopeRevNum = this.ActivityAuth.ScopeRevNum;
    //   this.objPrudentialCategory.lastModifiedByID = 0;
    //   this.objPrudentialCategory.effectiveDate = this.ActivityAuth.PrudentialCategoryEffectiveDate;
    //   this.objPrudentialCategory.expirationDate = '';
    //   this.objPrudentialCategory.lastModifiedDate = this.ActivityAuth.PrudentialCategoryLastModifiedDate;
    //   this.objPrudentialCategory.authorisationCategoryTypeID = this.ActivityAuth.AuthorisationCategoryTypeID;


    //   //objSector
    //   this.objSector.firmSectorID = this.ActivityAuth.FirmSectorID;
    //   this.objSector.sectorTypeID = this.ActivityAuth.SectorTypeID;
    //   this.objSector.lastModifiedByID = 0
    //   this.objSector.effectiveDate = this.ActivityAuth.SectorEffectiveDate;


    //   //lstFirmScopeCondition
    //   this.lstFirmScopeCondition.scopeConditionTypeId = 0
    //   this.lstFirmScopeCondition.lastModifiedBy = 0
    //   this.lstFirmScopeCondition.restriction = 0

    //   if (this.isIslamicFinanceChecked) {
    //     this.objFirmIslamicFinance.iFinTypeId = this.islamicFinance?.IFinTypeId;
    //     this.objFirmIslamicFinance.iFinTypeDesc = this.islamicFinance?.IFinTypeDesc;
    //     this.objFirmIslamicFinance.endorsement = this.islamicFinance?.Endorsement;
    //     this.objFirmIslamicFinance.lastModifiedByName = this.islamicFinance?.IFinLastModifiedByName;
    //     this.objFirmIslamicFinance.iFinFlag = true;
    //   } else {
    //     this.objFirmIslamicFinance.iFinTypeId = 0;
    //     this.objFirmIslamicFinance.iFinTypeDesc = '';
    //     this.objFirmIslamicFinance.endorsement = '';
    //     this.objFirmIslamicFinance.lastModifiedByName = '';
    //     this.objFirmIslamicFinance.iFinFlag = false;
    //   }
    //   this.objFirmIslamicFinance.savedIFinTypeID = 0;
    //   this.objFirmIslamicFinance.scopeRevNum = this.ActivityAuth.ScopeRevNum;



    //   //firmSectorID
    //   this.firmSectorID = '0';
  }

  updateFirmScope() {
    if (!this.ActivityAuth || !this.ActivityAuth.FirmScopeID) {
      console.log('Firm activity scope not found');

      return;
    }

    const firmScopeData = {
      objFirmScope: {
        firmScopeID: this.ActivityAuth?.FirmScopeID,
        scopeRevNum: this.ActivityAuth?.ScopeRevNum,
        firmID: this.ActivityAuth?.FirmID,
        objectID: this.ActivityAuth?.ObjectID,
        createdBy: this.ActivityAuth?.CreatedBy,
        docReferenceID: this.ActivityAuth?.DocID,
        firmApplTypeID: this.ActivityAuth?.FirmApplTypeID,
        docIDs: this.ActivityAuth?.DocIDs,
        generalConditions: this.ActivityAuth?.GeneralConditions,
        effectiveDate: this.ActivityAuth?.EffectiveDate,
        scopeCertificateLink: 'http://intranet/sites/RSG/Shared%20Documents/REGISTERS/Licensed%20Firms/00129_Con%20Scope%20of%20Licence.pdf',
        applicationDate: this.ActivityAuth?.ApplicationDate,
        licensedOrAuthorisedDate: this.ActivityAuth?.LicensedDate
      },
      lstFirmActivities: [
        {
          createdBy: this.ActivityAuth?.CreatedBy,
          firmScopeTypeID: this.ActivityAuth?.FirmScopeTypeID,
          activityTypeID: this.ActivityAuth?.ActivityTypeID,
          effectiveDate: this.ActivityAuth?.EffectiveDate,
          firmActivityConditions: this.ActivityAuth?.FirmActivityConditions,
          productTypeID: this.ActivityAuth?.ProductTypeID,
          appliedDate: this.ActivityAuth?.AppliedDate,
          withDrawnDate: this.ActivityAuth?.WithDrawnDate,
          objectProductActivity: [
            {
              productTypeID: this.ActivityAuth?.ProductTypeID,
              appliedDate: this.ActivityAuth?.AppliedDate,
              withDrawnDate: this.ActivityAuth?.WithDrawnDate,
              effectiveDate: this.ActivityAuth?.EffectiveDate,
              firmScopeTypeID: this.ActivityAuth?.FirmScopeTypeID
            }
          ],
          activityDetails: this.ActivityAuth?.ActivityDetails
        }
      ],
      objPrudentialCategory: {
        firmPrudentialCategoryID: this.ActivityAuth?.FirmPrudentialCategoryID,
        firmID: this.ActivityAuth?.FirmID,
        prudentialCategoryTypeID: this.ActivityAuth?.PrudentialCategoryTypeID,
        firmScopeID: this.ActivityAuth?.FirmScopeID,
        scopeRevNum: this.ActivityAuth?.ScopeRevNum,
        lastModifiedByID: this.ActivityAuth?.LastModifiedByID,
        effectiveDate: this.ActivityAuth?.PrudentialCategoryEffectiveDate,
        expirationDate: this.ActivityAuth?.ExpirationDate,
        lastModifiedDate: this.ActivityAuth?.PrudentialCategoryLastModifiedDate,
        authorisationCategoryTypeID: this.ActivityAuth?.AuthorisationCategoryTypeID
      },
      objSector: {
        firmSectorID: this.ActivityAuth?.FirmSectorID,
        sectorTypeID: this.ActivityAuth?.SectorTypeID,
        lastModifiedByID: this.ActivityAuth?.LastModifiedByID,
        effectiveDate: this.ActivityAuth?.SectorEffectiveDate
      },
      lstFirmScopeCondition: [
        {
          scopeConditionTypeId: this.ActivityAuth?.ScopeConditionTypeId,
          lastModifiedBy: this.ActivityAuth?.LastModifiedBy,
          restriction: this.ActivityAuth?.Restriction
        }
      ],
      objFirmIslamicFinance: {
        iFinFlag: this.ActivityAuth?.IFinFlag,
        iFinTypeId: this.ActivityAuth?.IFinTypeId,
        iFinTypeDesc: this.ActivityAuth?.IFinTypeDesc,
        endorsement: this.ActivityAuth?.Endorsement,
        savedIFinTypeID: this.ActivityAuth?.SavedIFinTypeID,
        scopeRevNum: this.ActivityAuth?.ScopeRevNum,
        lastModifiedBy: this.ActivityAuth?.LastModifiedBy
      },
      resetFirmSector: this.ActivityAuth?.ResetFirmSector,
      firmSectorID: this.ActivityAuth?.FirmSectorID
    };


    this.firmService.editAuthorizedScope(10044, firmScopeData).subscribe(
      response => {
        console.log('Firm scope updated successfully:', response);
      },
      error => {
        console.error('Error updating firm scope:', error);
      }
    );
  }



  cancelEditAuthScope() {
    this.allowEditAuthScopeDetails = true;
  }


  convertDateToYYYYMMDD(dateStr: string | Date): string | null {
    console.log(dateStr);

    if (!dateStr) {
      return null; // Return null if the input is invalid or empty
    }
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    if (isNaN(date.getTime())) {
      console.error('Invalid date format:', dateStr);
      return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');

    // Only return the date in YYYY-MM-DD format, stripping the time part
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  }



  formatDateToCustomFormat(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }


  // Method to load firm details
  loadFirmDetails(firmId: number) {
    this.firmService.getFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.response;
        this.selectedFirmTypeID = this.firmDetails.AuthorisationStatusTypeID != 0 ? 3 : 2;
        this.getFirmTypes();
        console.log('Firm details:', this.firmDetails);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }
  loadFirmOPDetails(firmId: number) {
    this.firmService.getFIRMOPData(firmId).subscribe(
      data => {
        this.firmOPDetails = data.response;
        console.log('2) Firm Operational details:', this.firmOPDetails);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }
  loadAuditors() {
    this.firmService.getFIRMAuditors(this.firmId).subscribe(
      data => {
        this.FIRMAuditors = data.response;
        console.log('Firm Auditors details:', this.FIRMAuditors);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }
  loadContacts() {
    this.firmService.getContactsOfFIRM(this.firmId).subscribe(
      data => {
        this.FIRMContacts = data.response;
        console.log('Firm FIRM Contacts details:', this.FIRMContacts);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }
  loadControllers() {
    this.firmService.getFIRMControllers(this.firmId).subscribe(
      data => {
        this.FIRMControllers = data.response;
        console.log('Firm FIRM Controllers details:', this.FIRMControllers);
      },
      error => {
        console.error('Error fetching firm controllers', error);
      }
    );
  }
  loadAssiRA() {
    this.firmService.getFIRMUsersRAFunctions(this.firmId, this.ASSILevel).subscribe(
      data => {
        this.FIRMRA = data.response;
        console.log('Firm RA Functions details:', this.FIRMRA);
      },
      error => {
        console.error('Error get Firm RA Functionsdetails', error);
      }
    );
  }
  loadRegisteredFund() {
    this.firmService.getFIRMRegisteredFund(this.firmId).subscribe(
      data => {
        this.RegisteredFund = data.response;
        console.log('Firm FIRM RegisteredFund details:', this.RegisteredFund);
      },
      error => {
        console.error('Error fetching firm RegisteredFund', error);
      }
    );
  }
  loadAdminFees() {
    this.firmService.getFIRMAdminFees(this.firmId).subscribe(
      data => {
        this.FirmAdminFees = data.response;
        console.log('Firm FIRM Admin Fees details:', this.FirmAdminFees);
      },
      error => {
        console.error('Error fetching firm Admin Fees', error);
      }
    );
  }

  // this will be replaced or removed
  // fetchPreviousScopeVersions(firmId: number, firmApplicationTypeId: number) {
  //   // Prompt user to input the ScopeRevNo or fetch it from somewhere dynamically
  //   const scopeRevNum = parseInt(prompt('Enter Scope Revision Number:'));

  //   if (isNaN(scopeRevNum)) {
  //     alert('Invalid Scope Revision Number');
  //     return;
  //   }

  //   // Determine which service function to call based on firmApplicationTypeId
  //   if (firmApplicationTypeId === 2) {
  //     this.firmService.getFirmActivityLicensed(firmId, scopeRevNum).subscribe(data => {
  //       this.ActivityLicensed = data.response;
  //       console.log('Licensed Activities:', this.ActivityLicensed);
  //     });
  //   } else if (firmApplicationTypeId === 3) {
  //     this.firmService.getFirmActivityAuthorized(firmId, scopeRevNum).subscribe(data => {
  //       this.ActivityAuth = data.response;
  //       console.log('Authorized Activities:', this.ActivityAuth);
  //     });
  //   } else {
  //     alert('Invalid Firm Application Type ID');
  //   }
  // }


  loadActivitiesLicensed() {
    this.loadFormReference();
    this.firmService.getCurrentScopeRevNum(this.firmId, 2).subscribe( // 2 here is: Licensed
      data => {
        this.scopeRevNum = data.response.Column1;
        this.firmService.getFirmActivityLicensed(this.firmId, this.scopeRevNum).subscribe(
          data => {
            this.ActivityLicensed = data.response;
            console.log('Firm License scope details:', this.ActivityLicensed);
          },
          error => {
            console.error('Error fetching License scope', error);
          }
        );
      },
      error => {
        console.error('Error fetching current scope revision number for licensed: ', error);
      }
    );
  }

  loadFormReference() {
    this.firmService.getDocumentDetails(this.firmId).subscribe(
      data => {
        this.documentDetails = data.response;
      }, error => {
        console.error(error)
      })
  }

  loadActivitiesAuthorized() {
    this.firmService.getCurrentScopeRevNum(this.firmId, 3).subscribe( // 3 here is: Authorized
      data => {
        this.scopeRevNum = data.response.Column1;
        this.firmService.getFirmActivityAuthorized(this.firmId, this.scopeRevNum).subscribe(
          data => {
            this.ActivityAuth = data.response[0];
            console.log('Firm Authorized scope details:', this.ActivityAuth);
          },
          error => {
            console.error('Error fetching License scope ', error);
          }
        );
      },
      error => {
        console.error('Error fetching current scope revision number for authorized: ', error);
      }
    );
  }

  loadScopeOfAuth() {
    this.firmService.getFirmScopeIdAndRevNum(this.firmId).pipe(
      switchMap(({ scopeId, scopeRevNum }) =>
        this.firmService.get_document(scopeId, scopeRevNum)
      )
    ).subscribe(
      data => {
        this.AuthTableDocument = data.response;
        console.log('Document Data:', data);
        // Handle the document data here
      },
      error => {
        console.error('Error loading document:', error);
        // Handle the error here
      }
    );
  }

  loadRegulatedActivities() {
    this.firmService.getFirmActivityAuthorized(this.firmId, 2).subscribe(
      data => {
        this.AuthRegulatedActivities = data.response;

        this.AuthRegulatedActivities.forEach(activity => {
          console.log("Activity ID: " + activity.ActivityTypeID);  // Print activity ID

          if (activity.ActivityTypeID) {
            // Initialize categorizedData for each activity
            this.categorizedData = [];

            // Load all products for the given activity
            this.loadAllProducts(activity.ActivityTypeID).subscribe(allProducts => {
              let currentCategory = null;

              // Create a new object to represent the activity with its products
              const activityData = {
                activityId: activity.ActivityTypeID,
                ActivityCategoryDesc: activity?.ActivityCategoryDesc,
                ActivityTypeDesc: activity?.ActivityTypeDesc,
                specificCondition: activity?.Column1,
                products: []
              };

              // Categorize products into main categories and subcategories
              allProducts.forEach(item => {
                if (!currentCategory || item.ProductCategoryTypeID !== currentCategory.ProductCategoryTypeID) {
                  // Create a new main category
                  currentCategory = {
                    mainCategory: item.ProductCategoryTypeDesc1,
                    ProductCategoryTypeID: item.ProductCategoryTypeID,
                    subCategories: []
                  };
                  activityData.products.push(currentCategory);
                }

                // Check if the item is not the main category itself
                if (item.ID !== 0) {
                  // Add the current item as a subcategory
                  currentCategory.subCategories.push({
                    ID: item.ID,
                    ProductCategoryTypeDesc: item.ProductCategoryTypeDesc,
                    TotalProduct: item.TotalProduct
                  });
                }
              });

              // Push the activity data into categorizedData
              this.categorizedData.push(activityData);

              // Print the categorized data for debugging
              console.log("Activity ID " + activity.ActivityTypeID);

              activityData.products.forEach(category => {
                console.log("Product category " + category.ProductCategoryTypeID + ": " + category.mainCategory);

                category.subCategories.forEach(subCategory => {
                  console.log("Subcategories" + JSON.stringify(subCategory));
                });
              });
            });
          }

          // Set selected category if not already set
          if (!activity.selectedCategory) {
            activity.selectedCategory = this.activityCategories.find(
              category => category.ActivityCategoryDesc === activity.ActivityCategoryDesc
            );

            // Load activities for the selected category if allowEditScopeDetailsAuth is false
            if (!this.allowEditAuthScopeDetails && activity.selectedCategory) {
              this.onCategoryChange(activity); // Load activities for the selected category
            }
          }
        });
      },
      error => {
        console.error('Error fetching License scope', error);
      }
    );
  }



  loadAllProducts(activityID: any): Observable<any> {
    return this.firmService.getAllProducts(activityID).pipe(
      map(data => {
        const allProducts = data.response;
        return allProducts; // Return the transformed response
      })
    );
  }


  loadIslamicFinance() {
    this.firmService.getIslamicFinance(this.firmId).subscribe(
      data => {
        this.islamicFinance = data.response;
        console.log('Firm Islamic Finance:', this.islamicFinance);
      }, error => {
        console.error('Error Fetching islamic finance', error);
      })
  }

  addNewAddress() {
    const newAddress = {
      AddressTypeID: this.generateGuid(),
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
      PhoneNum: '',
      FaxNum: '',
      Valid: true,  // Assuming 'Valid' needs to be true for it to be displayed
      isNew: true   // This helps you know it's a newly added address
    };

    this.firmAddresses.unshift(newAddress);
  }


  generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // addAddress(): void {
  //   // this.isAddingNewAddress = true;
  //   const newAddress = this.getEmptyAddressObject();

  //   newAddress.isNew = true;
  //   // Find the first unused address type ID
  //   const unusedType = this.allAddressTypes.find(type => !this.usedAddressTypes.has(type.AddressTypeID));
  //   if (unusedType) {
  //     newAddress.AddressTypeID = unusedType.AddressTypeID;
  //   }
  //   this.firmAddresses.unshift(newAddress); // Adds the new address at the beginning of the array
  // }


  removeAddress(index: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this record?');
    if (confirmDelete) {
      if (index > -1 && index < this.firmAddresses.length) {
        this.firmAddresses.splice(index, 1); // Removes the address at the specified index
      }
    }
  }

  isAddressTypeUsed(addressTypeID: number): boolean {
    console.log("is address type used:", this.firmAddresses.some(addr => addr.AddressTypeID === addressTypeID && !addr.isNew))
    return this.firmAddresses.some(addr => addr.AddressTypeID === addressTypeID && !addr.isNew);
  }

  // // Method to check if all address types are present
  // areAllAddressTypesAdded(): boolean {
  //   const existingTypes = new Set(this.firmAddresses.map(addr => addr.AddressTypeID));
  //   return this.allAddressTypes.every(type => existingTypes.has(type.AddressTypeID));
  // }

  // filterExistingAddressTypes() {
  //   // Get the unique AddressTypeID from the firmAddresses
  //   const addressTypeIds = [...new Set(this.firmAddresses.map(address => address.AddressTypeID))];
  //   console.log('Used AddressTypeIDs: ', addressTypeIds);  // Debugging line

  //   // Filter allAddressTypes to include only those that match the existing AddressTypeIDs
  //   this.existingAddressTypes = this.allAddressTypes.filter(type => addressTypeIds.includes(type.AddressTypeID));
  //   console.log('Existing Address Types: ', this.existingAddressTypes);
  // }

  loadFirmAdresses() {
    this.firmService.getFirmAddresses(this.firmId).subscribe(
      data => {
        this.firmAddresses = data.response;
        // this.originalFirmAddresses = this.firmAddresses.map(address => ({
        //   ...address,
        //   isNew: false
        // }));
        //this.filterExistingAddressTypes();
        console.log('Firm Addresses: ', this.firmAddresses);
      }, error => {
        console.error('Error Fetching Firm Addresses', error);
      })
  }

  loadWaivers() {
    this.firmService.getFirmwaiver(this.firmId).subscribe(
      data => {
        this.FirmWaivers = data.response;
        console.log('Firm FIRM Waivers details:', this.FirmWaivers);
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }
  loadRMPs() {
    this.firmService.getFirmRisk(this.firmId).subscribe(
      data => {
        this.FIRMRMP = data.response;
        console.log('Firm FIRM RRM details:', this.FIRMRMP);
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }
  loadNotices() {
    this.firmService.getNotices(this.firmId).subscribe(
      data => {
        this.FIRMNotices = data.response;
        console.log('Firm FIRMNotices details:', this.FIRMNotices);
      },
      error => {
        console.error('Error fetching FIRMNotices ', error);
      }
    );
  }


  loadCurrentAppDetails() {
    this.firmService.getCurrentAppDetailsLicensedAndAuth(this.firmId, 2).subscribe(data => {
      this.firmAppDetailsCurrentLicensed = data.response;
      console.log(this.firmAppDetailsCurrentLicensed)
    }, error => {
      console.log(error)
    })

    this.firmService.getCurrentAppDetailsLicensedAndAuth(this.firmId, 3).subscribe(data => {
      this.firmAppDetailsCurrentAuthorized = data.response;
      console.log(this.firmAppDetailsCurrentAuthorized)
    }, error => {
      console.log(error)
    })
  }


  // Get Date Of Application Field for Application Details in Core Details
  get dateOfApplication(): string {
    return this.firmDetails.AuthorisationStatusTypeID > 0
      ? this.formatDateToCustomFormat(this.firmDetails.FirmAuthApplDate)
      : this.formatDateToCustomFormat(this.firmDetails.FirmLicApplDate);
  }

  // Set Date Of Application Field for Application Details in Core Details
  set dateOfApplication(value: string) {
    if (this.firmDetails.AuthorisationStatusTypeID > 0) {
      this.firmDetails.FirmAuthApplDate = this.convertDateToYYYYMMDD(value);
    } else {
      this.firmDetails.FirmLicApplDate = this.convertDateToYYYYMMDD(value);
    }
  }

  // Get Licensed Date for Application Details in Core Details (edit mode)
  get formattedLicenseApplStatusDate(): string {
    return this.firmDetails.LicenseApplStatusDate ? this.formatDateToCustomFormat(this.firmDetails.LicenseApplStatusDate) : null;
  }

  set formattedLicenseApplStatusDate(value: string) {
    this.firmDetails.LicenseApplStatusDate = this.convertDateToYYYYMMDD(value);
  }

  // Get Authorized Date for Application Details in Core Details (edit mode)
  get formattedAuthApplStatusDate(): string {
    return this.firmDetails.AuthApplStatusDate ? this.formatDateToCustomFormat(this.firmDetails.AuthApplStatusDate) : null;
  }

  set formattedAuthApplStatusDate(value: string) {
    this.firmDetails.AuthApplStatusDate = this.convertDateToYYYYMMDD(value);
  }

  getFirmTypes() {
    this.applicationTypeId = this.firmDetails.AuthorisationStatusTypeID != 0 ? 3 : 2;
    this.firmService.getApplications(this.firmId, this.applicationTypeId).subscribe(
      data => {
        this.appDetails = data.response[0];
        console.log('Loaded firm application types:', this.appDetails);
      },
      error => {
        console.error('Error fetching Application Types: ', error);
      }
    );
  }


  loadPrevFirmAndDate() {
    this.firmService.getFirmsNameHistory(this.firmId).subscribe(
      data => {
        this.firmNamesHistory = data.response;
        console.log('Firm app details licensed history:', this.firmNamesHistory);
      },
    );
  }

  loadActivityCategories() {
    this.firmService.getActivityCategories().subscribe(
      data => {
        this.activityCategories = data.response;
        console.log('Firm activity categories details:', this.activityCategories);
      }, error => {
        console.error('Error fetching activity categories', error);
      }
    );
  }

  loadActivitiesTypesForLicensed() {
    this.firmService.getLicActivityTypes().subscribe(data => {
      this.licensedActivities = data.response;
      console.log('Firm activity types for licensed', this.licensedActivities);
    }, error => {
      console.error('Error fetching activity types for licensed', error)
    })
  }

  loadPrudReturnTypes() {
    this.firmService.getPrudReturnTypes().subscribe(data => {
      this.prudReturnTypesDropdown = data.response;
      console.log('Firm Scope Prud Return Types: ', this.prudReturnTypesDropdown);
    }, error => {
      console.log('Error fetching prud types: ', error)
    })
  }

  populateCountries() {
    this.firmService.getObjectTypeTable(constants.countries).subscribe(data => {
      this.allCountries = data.response;
    }, error => {
      console.error('Error Fetching Countries dropdown: ', error);
    })
  }

  populateLegalStatus() {
    this.firmService.getObjectTypeTable(constants.legalStatus).subscribe(data => {
      this.allLegalStatus = data.response;
    }, error => {
      console.error('Error Fetching Legal Status dropdown: ', error);
    })
  }

  populateQFCLicenseStatus() {
    this.firmService.getObjectTypeTable(constants.qfcLicenseStatus).subscribe(data => {
      this.allQFCLicenseStatus = data.response;
    }, error => {
      console.error('Error Fetching QFC License Status dropdown: ', error);
    })
  }

  populateAuthorisationStatus() {
    this.firmService.getObjectTypeTable(constants.authorisationStatus).subscribe(data => {
      this.allAuthorisationStatus = data.response;
    }, error => {
      console.error('Error Fetching Authorisation Status dropdown: ', error);
    })
  }

  populateFinYearEnd() {
    this.firmService.getObjectTypeTable(constants.FinYearEnd).subscribe(data => {
      this.allFinYearEnd = data.response;
    }, error => {
      console.error('Error Fetching Fin Year End dropdown: ', error);
    })
  }

  populateFinAccStd() {
    this.firmService.getObjectTypeTable(constants.FinAccStd).subscribe(data => {
      this.allFinAccStd = data.response;
    }, error => {
      console.error('Error Fetching Fin Acc Std dropdown: ', error);
    })
  }

  populateFirmAppTypes() {
    this.firmService.getObjectTypeTable(constants.firmAppTypes).subscribe(data => {
      this.allFirmTypes = data.response;
    }, error => {
      console.error('Error Fetching Firm Application Types dropdown: ', error);
    })
  }

  populateAddressTypes() {
    this.firmService.getObjectTypeTable(constants.addressTypes).subscribe(data => {
      this.allAddressTypes = data.response;
      // this.updateUsedAddressTypes();
    }, error => {
      console.error('Error Fetching Address Types dropdown: ', error);
    })
  }


  onCategoryChange(activity: any) {
    const selectedCategory = activity.selectedCategory;
    if (selectedCategory) {
      console.log('Selected Category ID:', selectedCategory.ActivityCategoryID);

      this.firmService.getAuthActivityTypes(selectedCategory.ActivityCategoryID).subscribe(
        data => {
          console.log('Fetched Activities for Category:', selectedCategory.ActivityCategoryDesc, data.response);

          // Populate activities array
          activity.activities = data.response;

          // Automatically select the first activity if there are activities available
          activity.selectedActivity = activity.activities.length > 0
            ? activity.activities[0]
            : null;
        },
        error => {
          console.error('Error fetching activities', error);
        }
      );
    }
  }

  getFYearHistory() {
    this.call = true;
    this.firmService.getFYearEndHistory(this.firmId).subscribe(
      data => {
        this.firmFYearHistory = data.response;
        console.log('Firm Finance year end history details:', this.firmFYearHistory);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    setTimeout(() => {
      const popupWrapper = document.querySelector('.popup-wrapper') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .popup-wrapper not found');
      }
    }, 0);
  }
  closeFYearHistory() {
    const popupWrapper = document.querySelector('.popup-wrapper') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .popup-wrapper not found');
    }
  }

  getInactiveUsers() {
    this.callInactiveUsers = true;
    this.firmService.getInactiveUsersHistory(this.firmId).subscribe(
      data => {
        this.firmInactiveUsers = data.response;
        console.log('FirmInactive users history details:', this.firmInactiveUsers);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    setTimeout(() => {
      const popupWrapper = document.querySelector('.InactiveUsersPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class not found');
      }
    }, 0);
  }


  closeInactiveUsers() {
    const popupWrapper = document.querySelector('.InactiveUsersPopUp') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }


  getApplicationDetailsHistory() {
    this.firmService.getAppDetailsLicensedAndAuthHistory(this.firmId, 2, false).subscribe(
      data => {
        this.firmAppDetailsLicensed = data.response;
        console.log('Firm app details licensed history:', this.firmAppDetailsLicensed);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    this.firmService.getAppDetailsLicensedAndAuthHistory(this.firmId, 3, false).subscribe(
      data => {
        this.firmAppDetailsAuthorization = data.response;
        console.log('Firm app details licensed history:', this.firmAppDetailsAuthorization);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    const popupWrapper = document.querySelector('.ApplicationDetailsPopUp') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'flex';
    } else {
      console.error('Element with class not found');
    }
  }

  closeApplicationDetails() {
    const popupWrapper = document.querySelector(".ApplicationDetailsPopUp") as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }

  getPrevFirmName() {
    this.firmService.getFirmsNameHistory(this.firmId).subscribe(
      data => {
        this.firmNamesHistory = data.response;
        console.log('Firm app details licensed history:', this.firmNamesHistory);
      },
      error => {
        console.error('Error fetching firm details', error);
      })
    setTimeout(() => {
      const popupWrapper = document.querySelector('.prevFirmNamePopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .prevFirmNamePopUp not found');
      }
    }, 0);
  }

  closePrevFirmName() {
    const popupWrapper = document.querySelector(".prevFirmNamePopUp") as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }

  getAccountingStandardHistory() {
    this.firmService.getAccountingStandardsHistory(this.firmId).subscribe(
      data => {
        this.firmAccountingStandardHistory = data.response;
        console.log('Firm app details licensed history:', this.firmAccountingStandardHistory);
      },
      error => {
        console.error('Error fetching firm details', error);
      })
    setTimeout(() => {
      const popupWrapper = document.querySelector('.accountingStandardsPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .accountingStandardPopUp not found');
      }
    }, 0);
  }

  closeAccountingStandard() {
    const popupWrapper = document.querySelector(".accountingStandardsPopUp") as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }

  uploadDocument() {
    const popupWrapper = document.querySelector('.uploadDocumentPopUp') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'flex';
    } else {
      console.error('Element with class .uploadDocumentPopUp not found');
    }
  }

  closeUploadDocument() {
    const popupWrapper = document.querySelector(".uploadDocumentPopUp") as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }

  getAddressTypeHistory(addressTypeId: number) {
    this.firmService.getAddressesTypeHistory(this.firmId, addressTypeId).subscribe(
      data => {
        this.firmAddressesTypeHistory = data.response;
        console.log('Firm History Addresses Type: ', this.firmAddressesTypeHistory);
      }, error => {
        console.error('Error Fetching Firm History Addresses Type', error);
      })
    const popupWrapper = document.querySelector('.addressHistoryPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'flex';
    } else {
      console.error('Element with class .addressHistoryPopup not found');
    }
  }

  closeAddressTypeHistory() {
    const popupWrapper = document.querySelector('.addressHistoryPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .addressHistoryPopup not found');
    }
  }


  // getScopePreviousVersions(firmId: number, firmApplicationTypeId: number) {
  //   if (firmApplicationTypeId === 2) {
  //     this.firmService.getFirmActivityLicensed(firmId, scopeRevNum).subscribe(data => {
  //       this.ActivityLicensed = data.response;
  //       console.log('Licensed Activities:', this.ActivityLicensed);
  //     });
  //     const popupWrapper = document.querySelector('.addressHistoryPopup') as HTMLElement;
  //     if (popupWrapper) {
  //       popupWrapper.style.display = 'flex';
  //     } else {
  //       console.error('Element with class .addressHistoryPopup not found');
  //     }
  //   }
  // }
  closeScopePreviousVersions() {
    const popupWrapper = document.querySelector('.ScopePreviousVersionsPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .ScopePreviousVersionsPopup not found');
    }
  }

  viewController() {
    this.router.navigate(['home/view-controller']);
  }

  createController() {
    this.router.navigate(['home/create-controller']);
  }

  viewAuditor(auditor: any) {
    this.selectedAuditor = auditor;
    this.IsViewAuditorVisible = true;
    this.IsCreateAuditorVisible = false;
    this.IsEditAuditorVisible = false;
  }

  createAuditor() {
    this.IsCreateAuditorVisible = true;
    this.IsViewAuditorVisible = false;
    this.IsEditAuditorVisible = false;
  }

  editAuditor() {
    const selectedRadio = this.auditorRadios.find(radio => radio.nativeElement.checked);

    if (selectedRadio) {
      // Proceed with edit logic
      this.IsEditAuditorVisible = true;
      this.IsCreateAuditorVisible = false;
      this.IsViewAuditorVisible = false;
      this.selectedAuditor = selectedRadio.nativeElement.value; // Or fetch the auditor details
    } else {
      alert('Please select a record from the list of Auditors displayed.');
    }
  }

  getCleanedNotes(notes: string): string {
    if (typeof notes !== 'string') return '';

    // Remove <p> tags and replace <br> with newline
    let cleanedNotes = notes
      .replace(/<p\s*\/?>/gi, '\n') // <p> or <p />
      .replace(/<\/p>/gi, '\n') // </p>
      .replace(/<br\s*\/?>/gi, '\n'); // <br> or <br />
    return cleanedNotes;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile = file;
        this.fileError = ''; // Clear any previous error message
      } else {
        this.fileError = 'Please select a valid PDF file.';
        this.selectedFile = null;
      }
    }
  }

  confirmUpload() {
    if (this.selectedFile) {
      // Display the selected file name in the main section
      const uploadedDocumentsDiv = document.getElementById('uploaded-documents');
      if (uploadedDocumentsDiv) {
        uploadedDocumentsDiv.textContent = `Uploaded Document: ${this.selectedFile.name}`;
      }
      this.closeUploadDocument();
    } else {
      console.error('No valid PDF file selected.');
    }
  }




  toggleIslamicFinanceFields() {
    if (this.islamicFinance && this.islamicFinance.IFinTypeId !== undefined) {
      this.isIslamicFinanceChecked = true;
    } else {
      this.isIslamicFinanceChecked = false;
    }
  }

  //   isFirmLicensed(): any { // logic must be changned, this should be an API
  //     this.firmService.getApplications(this.firmId,2).subscribe(data => {
  //         if (data.response[0].FirmApplStatusTypeID == data.response[0].FirmApplStatusGroupTypeID) {
  //             console.log("Firm is licensed");
  //             return true;
  //         } else {
  //             console.log("Firm is not licensed");
  //             return false;
  //         }
  //     });
  // }

  FirmApplicationType_SelectedIndexChanged(selectedValue: number) {
    // if(this.isFirmLicensed()) {
    //   console.log('hello there');
    // }

    // this.firmAppTypeID = selectedValue;
    // console.log('Firm Application Type ID Changed:', this.firmAppTypeID);
    // if (this.firmId) {
    //   // Check firm application type
    //   if (this.firmAppTypeID == 2) { // 2: Licensed
    //     if (this.firmDetails.LicenseStatusTypeID === 4) { // 4: 'Application' option
    //       // Update date of license with the date of application
    //       this.firmDetails.FirmLicApplDate = this.firmDetails.FirmLicApplDate;
    //     } else {
    //       this.firmDetails.FirmLicApplDate = null;
    //     }
    //   } else if (this.firmAppTypeID == 3) { // 3: Authorized
    //     if (this.firmDetails.AuthorisationStatusTypeID == 10) {
    //       // Update date of authorization with the date of application
    //       this.firmDetails.FirmAuthApplDate = this.firmDetails.FirmAuthApplDate;
    //     } else {
    //       this.firmDetails.FirmAuthApplDate = null;
    //     }
    //   }
    // }
  }

  onLicenseStatusChange(selectedValue: any) {
    const numericValue = Number(selectedValue);

    if (isNaN(numericValue) || !this.firmId) {
      console.error('Invalid value or firm ID');
      return;
    }

    const currentDate = new Date().toISOString(); // Current date in ISO format

    this.firmService.getFirmStatusValidation(this.firmId, numericValue, currentDate, 2)
      .subscribe(response => {
        if (response.isSuccess && response.response) {
          const { OldFirmApplStatusTypeDesc, OldFirmApplStatusDate } = response.response;

          // Fallback to selected option's description if no status description is returned
          const selectedOption = this.allQFCLicenseStatus.find(option => option.FirmApplStatusTypeID === numericValue);
          const statusDescription = OldFirmApplStatusTypeDesc || selectedOption?.FirmApplStatusTypeDesc || '';

          // Update license status label
          this.firmDetails.LicenseStatusTypeLabelDesc = `Date ${statusDescription}`;

          // Set the date if available, otherwise make it null
          this.firmDetails.LicenseApplStatusDate = OldFirmApplStatusDate !== '1900-01-01T00:00:00'
            ? this.formatDateToCustomFormat(OldFirmApplStatusDate)
            : null;

          // Save the current status and date
          this.licenseStatusDates[numericValue] = this.firmDetails.LicenseApplStatusDate;
        } else {
          // Handle error or default case
          const selectedOption = this.allQFCLicenseStatus.find(option => option.FirmApplStatusTypeID === numericValue);
          this.firmDetails.LicenseStatusTypeLabelDesc = `Date ${selectedOption?.FirmApplStatusTypeDesc || ''}`;
          this.firmDetails.LicenseApplStatusDate = null;
        }
      });
  }

  onAuthorizedStatusChange(selectedValue: any) {
    const numericValue = Number(selectedValue);

    if (isNaN(numericValue) || !this.firmId) {
      console.error('Invalid value or firm ID');
      return;
    }

    const currentDate = new Date().toISOString(); // Current date in ISO format

    this.firmService.getFirmStatusValidation(this.firmId, numericValue, currentDate, 3)
      .subscribe(response => {
        if (response.isSuccess && response.response) {
          const { OldFirmApplStatusTypeDesc, OldFirmApplStatusDate } = response.response;

          // Fallback to selected option's description if no status description is returned
          const selectedOption = this.allAuthorisationStatus.find(option => option.FirmApplStatusTypeID === numericValue);
          const statusDescription = OldFirmApplStatusTypeDesc || selectedOption?.FirmApplStatusTypeDesc || '';

          // Update auth status label
          this.firmDetails.AuthorisationStatusTypeLabelDesc = `Date ${statusDescription}`;

          // Ensure that the date is null if OldFirmApplStatusDate is invalid or equal to 1900-01-01
          if (OldFirmApplStatusDate && OldFirmApplStatusDate !== '1900-01-01T00:00:00') {
            this.firmDetails.AuthApplStatusDate = this.formatDateToCustomFormat(OldFirmApplStatusDate);
          } else {
            this.firmDetails.AuthApplStatusDate = null; // Set to null if date is invalid
          }

          // Save the current status and date
          this.authorisationStatusDates[numericValue] = this.firmDetails.AuthApplStatusDate;
        } else {
          // Handle error or default case
          const selectedOption = this.allAuthorisationStatus.find(option => option.FirmApplStatusTypeID === numericValue);
          this.firmDetails.AuthorisationStatusTypeLabelDesc = `Date ${selectedOption?.FirmApplStatusTypeDesc || ''}`;
          this.firmDetails.AuthApplStatusDate = null; // Ensure it's set to null
        }
      });
  }




}
