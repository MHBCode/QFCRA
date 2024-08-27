import { Component, ElementRef, Input, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';  // Import ActivatedRoute
import { FirmService } from 'src/app/ngServices/firm.service';  // Import FirmService
import flatpickr from 'flatpickr';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import * as constants from 'src/app/app-constants';




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
  firmAppTypeID: number;
  firmOPDetails: any;
  prudReturnTypesDropdown: any;
  firmFYearHistory: any[] = [];
  firmNamesHistory: any;
  firmAccountingStandardHistory: any[] = [];
  firmAddresses: any = [];
  firmAddressesTypeHistory: any = [];
  ActivityLicensed: any = [];
  ActivityAuth: any = [];
  islamicFinance: any = {};
  activityCategories: any[] = [];
  licensedActivities: any[] = [];
  AuthRegulatedActivities: any = [];
  firmInactiveUsers: any[] = [];
  firmAppDetailsLicensed: any[] = [];
  firmAppDetailsAuthorization: any[] = [];
  firmAppDetailsLatestLicensed: any;
  firmAppDetailsLatestAuthorized: any;
  FIRMAuditors: any[] = [];
  FIRMContacts: any[] = [];
  FIRMControllers: any[] = [];
  RegisteredFund: any[] = [];
  FIRMRA: any[] = [];
  FirmAdminFees: any[] = [];
  FirmWaivers: any;
  FIRMRMP: any;
  FIRMNotices: any;
  License: string = 'License';
  Authorize: string = 'Authorisation';
  allowEditFirmDetails: string | boolean = true;
  /* for scope */
  allowEditScopeDetails: string | boolean = true;
  showPermittedActivitiesTable: string | boolean = false;
  isIslamicFinanceChecked: boolean = true;
  selectedCategory: string;
  selectedActivity: string;


  selectedStatusId: number | null = null;
  selectedAuthStatusId: number | null = null;
  licenseStatusDates: { [key: number]: string | null } = {};
  authorisationStatusDates: { [key: number]: string | null } = {};

  /*dropdowns arrays*/
  allCountries: any = [];
  allQFCLicenseStatus: any = [];
  allAuthorisationStatus: any = [];

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
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.scrollToTop();

    this.route.params.subscribe(params => {
      this.firmId = +params['id']; // Retrieve the firm ID from the route parameters
      console.log(`Loaded firm with ID: ${this.firmId}`);
      this.loadFirmDetails(this.firmId);  // Fetch the firm details
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
      this.loadPrudReturnTypes();
      this.populateCountries();
      this.populateQFCLicenseStatus();
      this.populateAuthorisationStatus();
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
          input.nativeElement.value = dateStr; // Update the input value
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

  editFirm() {
    //this.router.navigate(['home/edit-firm', this.firmId]);
    console.log("allowEditFirmDetails :", this.allowEditFirmDetails);

    this.allowEditFirmDetails = !this.allowEditFirmDetails;

    if (this.allowEditFirmDetails) {
      console.log("firms details after edit:", this.firmDetails);
      const userId = 10044; // Replace with dynamic userId as needed

      if (this.firmDetails?.AuthorisationStatusTypeID > 0) {

        this.firmDetails.FirmApplDate = this.firmDetails.FirmAuthApplDate
          ? formatDate(this.firmDetails.FirmAuthApplDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US')
          : '';
      } else {
        this.firmDetails.FirmApplDate = this.firmDetails.FirmLicApplDate
          ? formatDate(this.firmDetails.FirmLicApplDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US')
          : '';
      }

      this.firmDetails.firmId = this.firmId;
      this.firmDetails.LicensedDate = this.firmDetails.LicensedDate ? this.convertDateToYYYYMMDD(this.firmDetails.LicensedDate) : null;
      this.firmDetails.AuthorisationDate = this.firmDetails.AuthorisationDate ? this.convertDateToYYYYMMDD(this.firmDetails.AuthorisationDate) : null;
      this.firmDetails.DateOfIncorporation = this.firmDetails.DateOfIncorporation ? this.convertDateToYYYYMMDD(this.firmDetails.DateOfIncorporation) : null;
      this.firmDetails.FirmAccDataId = this.firmDetails.FirmAccountingDataID;
      this.firmDetails.FirmStandardID = this.firmDetails.FirmAccountingStandardID ? this.firmDetails.FirmAccountingStandardID : 0;
      if (this.firmDetails.AuthorisationStatusTypeID > 0) {
        this.firmDetails.authorisationStatusTypeID = this.firmDetails.AuthorisationStatusTypeID;
      } else {
        this.firmDetails.authorisationStatusTypeID = 0;
      }
      this.firmDetails.licenseStatusTypeID = this.firmDetails.LicenseStatusTypeID;
      this.firmDetails.FirmApplTypeID = 0 // check this one belongs to which field
      this.firmDetails.FirmApplicationDataComments = this.firmDetails.FirmApplicationDataComments ? this.firmDetails.FirmApplicationDataComments : '';
      this.firmDetails.PublicRegisterComments = this.firmDetails.PublicRegisterComments ? this.firmDetails.PublicRegisterComments : '';
      this.firmDetails.FirmFinStandardTypeID = Number(this.firmDetails.FinAccStdTypeID);
      this.firmDetails.FirmFinStandardEffectiveFrom = this.firmDetails.FinAccStdTypeEffectiveFrom ? this.convertDateToYYYYMMDD(this.firmDetails.FinAccStdTypeEffectiveFrom) : null;
      this.firmDetails.FirmFinYearEndEffectiveFrom = this.firmDetails.FirmFinYearEndEffectiveFrom ? this.convertDateToYYYYMMDD(this.firmDetails.FirmFinYearEndEffectiveFrom) : null;
      this.firmDetails.LoginuserId = userId;

      this.firmService.editFirm(userId, this.firmDetails).subscribe(response => {
        console.log('Row edited successfully:', response);
        this.loadFirmDetails(this.firmId);
        this.loadApplicationDetails();
      }, error => {
        console.error('Error editing row:', error);
      });

    }
  }

  cancelEditFirm() {
    this.allowEditFirmDetails = true;
  }

  editScope() {
    // this.router.navigate(['home/edit-scope-licensed',this.firmId]);
    this.allowEditScopeDetails = !this.allowEditScopeDetails;
    this.showPermittedActivitiesTable = !this.showPermittedActivitiesTable;

    const userId = 10044;
    if (this.allowEditScopeDetails) {
      let container: any = {};
      // objFirmScope
      this.objFirmScope.firmScopeID = this.ActivityLicensed[0].FirmScopeID;
      this.objFirmScope.scopeRevNum = this.ActivityLicensed[0].ScopeRevNum;
      this.objFirmScope.docReferenceID = 0;
      this.objFirmScope.firmID = this.ActivityLicensed[0].FirmID;
      // this.objFirmScope.createdBy = this.ActivityLicensed[0].ScopeCreatedByName;
      this.objFirmScope.createdBy = 1; // userid must be dynamic
      this.objFirmScope.objectID = 0;
      this.objFirmScope.docIDs = (Object.keys(this.ActivityLicensed[0].DocID).length !== 0) ? this.ActivityLicensed[0].DocID : '';
      this.objFirmScope.generalConditions = (Object.keys(this.ActivityLicensed[0].GeneralConditions).length !== 0) ? this.ActivityLicensed[0].GeneralConditions : '';
      this.objFirmScope.effectiveDate = (Object.keys(this.ActivityLicensed[0].ScopeEffectiveDate).length !== 0) ? this.ActivityLicensed[0].ScopeEffectiveDate : '';
      this.objFirmScope.scopeCertificateLink = this.ActivityLicensed[0].ScopeCertificateLink;
      this.objFirmScope.applicationDate = this.ActivityLicensed[0].ScopeAppliedDate;
      this.objFirmScope.licensedOrAuthorisedDate = this.ActivityLicensed[0].ScopeLicensedDate;
      // this.objFirmScope.firmApplTypeID = 2


      //lstFirmActivities
      this.lstFirmActivities.createdBy = 0
      this.lstFirmActivities.firmScopeTypeID = this.ActivityAuth.FirmScopeID;
      this.lstFirmActivities.activityTypeID = this.ActivityAuth.ActivityTypeID;
      this.lstFirmActivities.effectiveDate = ''
      this.lstFirmActivities.firmActivityConditions = this.AuthRegulatedActivities.Column1;
      this.lstFirmActivities.productTypeID = '';
      this.lstFirmActivities.withDrawnDate = '';
      // this.lstFirmActivities.objectProductActivity = [
      //   this.objectProductActivity.productTypeID = 
      //   this.objectProductActivity.appliedDate = 
      //   this.objectProductActivity.withDrawnDate = 
      //   this.objectProductActivity.effectiveDate = 
      //   this.objectProductActivity.firmScopeTypeID = 
      // ]

      //objPrudentialCategory
      this.objPrudentialCategory.firmPrudentialCategoryID = this.ActivityAuth.FirmPrudentialCategoryID;
      this.objPrudentialCategory.firmID = this.ActivityAuth.FirmID;
      this.objPrudentialCategory.prudentialCategoryTypeID = this.ActivityAuth.PrudentialCategoryTypeID;
      this.objPrudentialCategory.firmScopeID = this.ActivityAuth.FirmScopeID;
      this.objPrudentialCategory.scopeRevNum = this.ActivityAuth.ScopeRevNum;
      this.objPrudentialCategory.lastModifiedByID = 0;
      this.objPrudentialCategory.effectiveDate = this.ActivityAuth.PrudentialCategoryEffectiveDate;
      this.objPrudentialCategory.expirationDate = '';
      this.objPrudentialCategory.lastModifiedDate = this.ActivityAuth.PrudentialCategoryLastModifiedDate;
      this.objPrudentialCategory.authorisationCategoryTypeID = this.ActivityAuth.AuthorisationCategoryTypeID;


      //objSector
      this.objSector.firmSectorID = this.ActivityAuth.FirmSectorID;
      this.objSector.sectorTypeID = this.ActivityAuth.SectorTypeID;
      this.objSector.lastModifiedByID = 0
      this.objSector.effectiveDate = this.ActivityAuth.SectorEffectiveDate;


      //lstFirmScopeCondition
      this.lstFirmScopeCondition.scopeConditionTypeId = 0
      this.lstFirmScopeCondition.lastModifiedBy = 0
      this.lstFirmScopeCondition.restriction = 0

      if (this.isIslamicFinanceChecked) {
        this.objFirmIslamicFinance.iFinTypeId = this.islamicFinance?.IFinTypeId;
        this.objFirmIslamicFinance.iFinTypeDesc = this.islamicFinance?.IFinTypeDesc;
        this.objFirmIslamicFinance.endorsement = this.islamicFinance?.Endorsement;
        this.objFirmIslamicFinance.lastModifiedByName = this.islamicFinance?.IFinLastModifiedByName;
        this.objFirmIslamicFinance.iFinFlag = true;
      } else {
        this.objFirmIslamicFinance.iFinTypeId = 0;
        this.objFirmIslamicFinance.iFinTypeDesc = '';
        this.objFirmIslamicFinance.endorsement = '';
        this.objFirmIslamicFinance.lastModifiedByName = '';
        this.objFirmIslamicFinance.iFinFlag = false;
      }
      this.objFirmIslamicFinance.savedIFinTypeID = 0;
      this.objFirmIslamicFinance.scopeRevNum = this.ActivityAuth.ScopeRevNum;



      //firmSectorID
      this.firmSectorID = '0';





      container.objFirmScope = this.objFirmScope;
      container.lstFirmActivities = this.lstFirmActivities;
      container.objPrudentialCategory = this.objPrudentialCategory;
      container.objSector = this.objSector;
      container.objFirmIslamicFinance = this.objFirmIslamicFinance;
      container.lstFirmScopeCondition = this.lstFirmScopeCondition;
      container.firmSectorID = this.firmSectorID;

      this.firmService.editScope(userId, container).subscribe(response => {
        console.log('Row edited successfully:', response);
      }, error => {
        console.error('Error editing row:', error);
      })
    }

  }

  cancelEditScope() {
    this.allowEditScopeDetails = true;
  }

  convertDateToYYYYMMDD(dateStr: any): string | null {
    if (!dateStr || typeof dateStr !== 'string') {
      return null; // Return null if dateStr is not a valid string
    }

    const months = {
      "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
      "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
      "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
    };

    const [day, month, year] = dateStr.split('/');
    if (month && day && year) {
      const formattedMonth = months[month];
      return `${year}-${formattedMonth}-${day.padStart(2, '0')}`;
    }
    return null;
  }

  // Method to load firm details
  loadFirmDetails(firmId: number) {
    this.firmService.getFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.response;
        console.log('1) Firm details:', this.firmDetails);


        this.firmAppTypeID = Number(this.firmDetails.AuthorisationStatusTypeID) > 0 ? 3 : 2; // if authorized then store 3 in firmAppTypeID else store 2, this is for Firm Application Type Field dropdown

        console.log('2) Firm details:', this.firmDetails);
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


  loadActivitiesLicensed() {
    this.firmService.getFirmActivityLicensedAndAuthorized(this.firmId, 2).subscribe(
      data => {
        this.ActivityLicensed = data.response;
        // if ((Object.keys(this.ActivityLicensed[0].ScopeAppliedDate).length != 0)) {
        //   this.ActivityLicensed[0].ScopeAppliedDate = this.convertDateToYYYYMMDD(this.ActivityLicensed[0].ScopeAppliedDate);
        // }
        console.log('Firm License scope details:', this.ActivityLicensed[0]);
      },
      error => {
        console.error('Error fetching License scope ', error);
      }
    );
  }

  loadActivitiesAuthorized() {
    this.firmService.getFirmActivityLicensedAndAuthorized(this.firmId, 3).subscribe(
      data => {
        this.ActivityAuth = data.response[0];
        console.log('Firm Authorized scope details:', this.ActivityAuth);
      },
      error => {
        console.error('Error fetching License scope ', error);
      }
    );
  }

  loadRegulatedActivities() {
    this.firmService.getFirmActivityLicensedAndAuthorized(this.firmId, 3).subscribe(
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
            if (!this.allowEditScopeDetails && activity.selectedCategory) {
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

  loadFirmAdresses() {
    this.firmService.getFirmAddresses(this.firmId).subscribe(
      data => {
        this.firmAddresses = data.response;
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

  loadApplicationDetails() {
    this.firmService.getAppDetailsLicensedAndAuthHistory(this.firmId, 2, true).subscribe(
      data => {
        this.firmAppDetailsLatestLicensed = data.response[0];
        console.log('Firm app details licensed history:', this.firmAppDetailsLatestLicensed);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    this.firmService.getAppDetailsLicensedAndAuthHistory(this.firmId, 3, true).subscribe(
      data => {
        this.firmAppDetailsLatestAuthorized = data.response[0];
        console.log('Firm app details licensed history:', this.firmAppDetailsLatestAuthorized);
      },
      error => {
        console.error('Error fetching firm details', error);
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
      this.loadApplicationDetails();
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


  onFirmCoreAppDetailsFieldsChanges(selectedValue: number) {
    this.firmAppTypeID = selectedValue;
    console.log('Firm Application Type ID Changed:', this.firmAppTypeID);
  }

  toggleIslamicFinanceFields() {
    if (this.islamicFinance && this.islamicFinance.IFinTypeId !== undefined) {
      this.isIslamicFinanceChecked = true;
    } else {
      this.isIslamicFinanceChecked = false;
    }
  }

  onLicenseStatusChange(selectedValue: any) {
    const numericValue = Number(selectedValue);
    const selectedOption = this.allQFCLicenseStatus.find(option => option.FirmApplStatusTypeID === numericValue);

    // Update License Status Type Label
    this.allQFCLicenseStatus.FirmApplStatusTypeDesc = selectedOption ? 'Date ' + selectedOption.FirmApplStatusTypeDesc : '';

    // Save the current status and date
    if (this.selectedStatusId !== null) {
      this.licenseStatusDates[this.selectedStatusId] = this.firmDetails.LicenseApplStatusDate;
    }

    if (numericValue === 4) { // 4: Application Option in QFC Status
      this.firmDetails.LicenseApplStatusDate = this.firmDetails.AuthorisationStatusTypeID == 0
        ? this.firmDetails.FirmLicApplDate
        : this.firmDetails.FirmAuthApplDate
    } else {

      // Update License Type Label based on new selection
      if (this.licenseStatusDates[numericValue] !== undefined) {
        this.firmDetails.LicenseApplStatusDate = this.licenseStatusDates[numericValue];
      } else {
        this.firmDetails.LicenseApplStatusDate = null;
      }
    }
    // Update selectedStatusId for license
    this.selectedStatusId = numericValue;
  }

  onAuthorizedStatusChange(selectedValue: any) {
    const numericValue = Number(selectedValue);
    const selectedOption = this.allAuthorisationStatus.find(option => option.FirmApplStatusTypeID === numericValue);

    // Update Authorisation Status Type Label
    this.firmDetails.AuthorisationStatusTypeLabelDesc = selectedOption ? 'Date ' + selectedOption.FirmApplStatusTypeDesc : '';

    // Save the current status and date
    if (this.selectedAuthStatusId !== null) {
      this.authorisationStatusDates[this.selectedAuthStatusId] = this.firmDetails.AuthApplStatusDate;
    }

    // Update AuthApplStatusDate based on new selection
    if (this.authorisationStatusDates[numericValue] !== undefined) {
      this.firmDetails.AuthApplStatusDate = this.authorisationStatusDates[numericValue];
    } else {
      this.firmDetails.AuthApplStatusDate = null;
    }

    // Update selectedStatusId for authorisation
    this.selectedAuthStatusId = numericValue;
  }


}
