// import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { FirmService } from 'src/app/ngServices/firm.service';
// @Component({
//   selector: 'app-firms-page',
//   templateUrl: './firms-page.component.html',
//   styleUrls: ['./firms-page.component.scss'],
// })
// export class FirmsPageComponent implements OnInit {

//   @Input() listCount: number = 50;

//   firms: any[] = [];
//   licenseStatuses: string[] = [];
//   supervisorSupervisions: string[] = [];
//   legalStatuses: string[] = [];
//   authorisationStatuses: string[] = [];
//   amlSupervisors: string[] = [];

//   filteredFirms: any[] = [];
//   showSearchSection: boolean = false;

//   // Form search fields with defaults
//   firmName: string = 'all';
//   qfcNumber: string = '';
//   firmType: boolean = true;
//   firmStatus: boolean = true;
//   licenseStatus: string = 'all';
//   supervisorSupervision: string = 'all';
//   prudentialCategory: boolean = true;
//   sectors: boolean = true;

//   // Toggling Options for expanded views
//   toggleOptions = {
//     firmType: false,
//     firmStatus: false,
//     prudentialCategory: false,
//     sectors: false
//   };

//   // Checkbox model properties
//   checkboxes = {
//     authorized: false,
//     dnfbp: false,
//     licensed: false,
//     applicant: false,
//     applicationWithdrawn: false,
//     applicationRejected: false,
//     active: false,
//     inactive: false,
//     withdrawn: false,
//     piib1: false,
//     piib2: false,
//     piib3: false,
//     piib4: false,
//     piib5: false,
//     directInsurer: false,
//     reinsurer: false,
//     insuranceIntermediary: false,
//     investmentManager: false,
//     insurer: false,
//     bank: false,
//     advisor: false,
//     repOffice: false
//   };

//   alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

//   constructor(private router: Router, private firmService: FirmService) { }

//   ngOnInit(): void {
//     this.loadFirms();
//   }

//   toggleSearch() {
//     this.showSearchSection = !this.showSearchSection;
//   }
//   // Load initial firms
//   loadFirms(): void {
//     this.firmService.getAssignedFirms(10044).subscribe(
//       data => {
//         if (data && data.response) {
//           this.firms = data.response;
//           this.filteredFirms = [...this.firms];

//           this.licenseStatuses = [...new Set(this.firms.map(firm => firm.LicenseStatusTypeDesc))];
//           this.supervisorSupervisions = [...new Set(this.firms.map(firm => firm.Supervisor))];
//           this.authorisationStatuses = [...new Set(this.firms.map(firm => firm.AuthorisationStatusTypeDesc))];
//           this.amlSupervisors = [...new Set(this.firms.map(firm => firm.Supervisor_AML))];

//           console.log(this.firms);
//         } else {
//           console.warn('No firms data found.');
//         }
//       },
//       error => {
//         console.error('Error fetching firms', error);
//       }
//     );
//   }

//   // Toggle options for different categories (like Prudential Category)
//   toggleCategoryOptions(category: string): void {
//     this.toggleOptions[category] = !this.toggleOptions[category];
//   }

//   // Generalize search functionality for firms
//   searchFirms(): void {
//     const searchCriteria = {
//       firmName: this.firmName !== 'all' ? this.firmName : null,
//       qfcNumber: this.qfcNumber || null,
//       firmType: this.firmType,
//       firmStatus: this.firmStatus,
//       licenseStatus: this.licenseStatus !== 'all' ? this.licenseStatus : null,
//       supervisorSupervision: this.supervisorSupervision !== 'all' ? this.supervisorSupervision : null,
//       prudentialCategory: this.prudentialCategory,
//       sectors: this.sectors
//     };

//     this.firmService.getFirmsList(searchCriteria).subscribe(
//       data => {
//         if (data && data.response) {
//           this.filteredFirms = data.response;
//           console.log(this.filteredFirms);
//         } else {
//           console.warn('No filtered firms found.');
//         }
//       },
//       error => {
//         console.error('Error fetching firms', error);
//       }
//     );
//   }

//   // Filter firms by letter
//   filterFirmsByLetter(letter: string): void {
//     if (letter === '#') {
//       this.filteredFirms = this.firms;
//     } else {
//       this.filteredFirms = this.firms.filter(firm => firm.FirmName.startsWith(letter));
//     }
//   }

//   // Reset all filters to default values
//   resetFilters(): void {
//     this.setDefaultFilters();
//     this.filteredFirms = [...this.firms];
//   }

//   // Set default filter values
//   setDefaultFilters(): void {
//     this.firmName = 'all';
//     this.qfcNumber = '';
//     this.firmType = true;
//     this.firmStatus = true;
//     this.licenseStatus = 'all';
//     this.supervisorSupervision = 'all';
//     this.prudentialCategory = true;
//     this.sectors = true;
//   }

//   // Navigate to firm details
//   viewFirm(firmId: number) {
//     if (firmId) {
//       this.router.navigate(['home/view-firm', firmId]);
//     } else {
//       console.error('Invalid firm ID:', firmId);
//     }
//   }
// }
import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';
import * as constants from 'src/app/app-constants';
import { SecurityService } from 'src/app/ngServices/security.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';

@Component({
  selector: 'app-firms-page',
  templateUrl: './firms-page.component.html',
  styleUrls: ['./firms-page.component.scss'],
})
export class FirmsPageComponent implements OnInit {
  userId = 30;
  @Input() listCount: number = 50;
  firms: any[] = [];
  licenseStatuses: string[] = [];
  supervisorSupervisions: string[] = [];
  authorisationStatuses: string[] = [];
  amlSupervisors: string[] = [];
  legalStatuses: string[] = [];
  filteredFirms: any[] = [];
  filteredFirmsdata: any = [];
  controlsPermissions: any = [];
  showPopup: boolean = false;
  isSortDropdownOpen: boolean = false;
  selectedSortOption: string = 'newFirms'; // Default sort option
  relevantPerson: boolean = false;
  private unlistenDocumentClick: () => void;
  allQFCLicenseStatus: any = [];
  allSupervisionCaseOfficer: any = [];
  isLoading: boolean = true;
  allfirms :any = [];
  sortedFirms: any = [];
  // Form search fields with defaults
  firmName: string = 'all';
  qfcNumber: string = '';
  firmType: boolean = true;
  firmStatus: boolean = true;
  licenseStatus: string = 'all';
  legalStatus: string = 'all';
  amlSup: string = 'all';
  authorisationStatus: string = 'all'
  supervisorSupervision: string = 'all';
  prudentialCategory: boolean = true;
  sectors: boolean = true;
  supervisionCategory: boolean = true;
  authorisationCategory : boolean = true;
  legalStatusOptions: any = [];
  authorisationStatusOptions : any = [];
  allAuthorisationCaseOfficer : any = [];
  // Toggling Options for expanded views
  toggleOptions = {
    firmType: false,
    firmStatus: false,
    prudentialCategory: false,
    sectors: false,
    supervisionCategory: false,
    authorisationCategory: false,
  };
  
  // Checkbox model properties
  checkboxes = {
    authorized: false,
    dnfbp: false,
    licensed: false,
    applicant: false,
    applicationWithdrawn: false,
    applicationRejected: false,
    active: false,
    inactive: false,
    withdrawn: false,
    piib1: false,
    piib2: false,
    piib3: false,
    piib4: false,
    piib5: false,
    directInsurer: false,
    reinsurer: false,
    insuranceIntermediary: false,
    investmentManager: false,
    insurer: false,
    bank: false,
    advisor: false,
    repOffice: false,
    corporateBank:false,
    investmentManagerSupCat:false,
    auditAndAccountingServices:false,
    trustServices:false,
    singleFamilyOffice:false,
    insuranceIntermediarySupCat:false,
    captiveInsurer:false,
    captiveManager:false,
    investmentBank:false,
    advisorSupCat:false,
    legalServices:false,
    professionalServices:false,
    directInsurerSupCat:false,
    repOfficeSupCat:false,
    reinsurerSupCat:false,
    wealthManager:false,    
    iBANK:false,
    iNMA:false,
    cAPI:false,
    iMEB: false,
    pINS:false,
    rEPO:false,
    dMEX:false,
    relevantPerson: false,
  };
  
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

  constructor(private router: Router, private firmService: FirmService,private renderer: Renderer2,private securityService: SecurityService) { }

  ngOnInit(): void {
    this.applySecurityOnPage(FrimsObject.CoreDetail);
    this.loadFirms();
    this.LoadAllFirms();
    this.populateQFCLicenseStatus();
    this.getlegalStatus();
    this.getauthorisationStatus();
    this.getSupervisionCaseOfficer();
    this.getAuthorisationCaseOfficer();
  }

  // Toggle popup visibility
  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }

  // Navigate to new firm page
  navigateToNewfirm() {
    this.router.navigate(['home/new-firm']);
  }
  populateQFCLicenseStatus() {
    this.firmService.getObjectTypeTable(constants.qfcLicenseStatus).subscribe(data => {
      this.allQFCLicenseStatus = data.response;
      console.log("allQFCLicenseStatus",this.allQFCLicenseStatus)
    }, error => {
      console.error('Error Fetching QFC License Status dropdown: ', error);
    })
    console.log("allQFCLicenseStatus",this.allQFCLicenseStatus)
  }
  getSupervisionCaseOfficer() {
    this.firmService.getObjectTypeTable(constants.SupervisionCaseOfficer).subscribe(data => {
      this.allSupervisionCaseOfficer = data.response;
      console.log("allQFCLicenseStatus",this.allQFCLicenseStatus)
    }, error => {
      console.error('Error Fetching QFC License Status dropdown: ', error);
    })
    console.log("allQFCLicenseStatus",this.allQFCLicenseStatus)
  }
  getAuthorisationCaseOfficer() {
    this.firmService.getObjectTypeTable(constants.AuthorisationCaseOfficer).subscribe(data => {
      this.allAuthorisationCaseOfficer = data.response;
      console.log("allQFCLicenseStatus",this.allAuthorisationCaseOfficer)
    }, error => {
      console.error('Error Fetching QFC License Status dropdown: ', error);
    })
    console.log("allQFCLicenseStatus",this.allAuthorisationCaseOfficer)
  }
  getlegalStatus(): void {
    this.firmService.getObjectTypeTable(constants.legalStatusfilter)
        .subscribe(data => {
            this.legalStatusOptions = data.response;
            console.log("Fetched Legal Status Options:", this.legalStatusOptions);

            // Log each LegalStatusTypeDesc
            this.legalStatusOptions.forEach(status => {
                console.log("LegalStatusTypeDesc:", status.LegalStatusTypeDesc);
            });
        }, error => {
            console.error("Error fetching legalStatus", error);
        });
}
getauthorisationStatus(): void {
  this.firmService.getObjectTypeTable(constants.authorisationStatus)
    .subscribe(data => {
      this.authorisationStatusOptions = data.response;
      console.log("getlegalStatusController", data)
    }, error => {
      console.error("Error fetching legalStatus", error);
    });
}
  // Load initial firms data
  loadFirms(): void {
    this.firmService.getAssignedFirms(30).subscribe(
      data => {
        if (data && data.response) {
          this.isLoading = true;
          this.firms = data.response;
          this.filteredFirms = [...this.allfirms];

          this.licenseStatuses = [...new Set(this.firms.map(firm => firm.LicenseStatusTypeDesc))];
          this.supervisorSupervisions = [...new Set(this.firms.map(firm => firm.Supervisor))];
          this.authorisationStatuses = [...new Set(this.firms.map(firm => firm.AuthorisationStatusTypeDesc))];
          this.amlSupervisors = [...new Set(this.firms.map(firm => firm.Supervisor_AML))];
          this.legalStatuses = [...new Set(this.firms.map(firm => firm.LegalStatusTypeDesc))];
          // Apply default sorting after data load
          this.sortFirms(this.selectedSortOption);
          console.log(this.firms)
        } else {
          console.warn('No firms data found.');
        }
      },
      error => {
        console.error('Error fetching firms', error);
        
      }
    );
  }

  // Toggle options for different categories (like Prudential Category)
  toggleCategoryOptions(category: string): void {
    this.toggleOptions[category] = !this.toggleOptions[category];
  }
  checkboxesfilter(): void {

  }
  // Search functionality for firms
   
  /////////// Filter Area 
  searchFirms(): void {
    const filterData = this.prepareFilterData();
    this.firmService.getFirmsAlphabetically(filterData).subscribe(
      (data) => {
        console.log('Response from API:', data.response); 
        
        this.filteredFirmsdata = data.response ; 
        
        this.filteredFirms = this.filteredFirmsdata;
      
        console.log('Filtered Firms:', this.filteredFirms);
        this.togglePopup();
      },
      (error) => {
        console.error('Error fetching firms:', error);
       // alert(`Error: ${error.message}`);
      }
    );
  }
  
  LoadAllFirms(): void {
    this.firmService.getAllFirms().subscribe(
      (data) => {
        this.allfirms = data.response;
        this.sortedFirms = this.allfirms.sort((a, b) => a.FirmName.localeCompare(b.FirmName));
      },
      (error) => {
        console.error('Error fetching firms:', error);
      }
    )
  }
  prepareFilterData() {
    const filterData = {
      FirmID: this.firmName !== 'all' ? this.allfirms.find(firm => firm.FirmName === this.firmName)?.FirmID || 0 : 0, 
      CSVLicenseStatus: this.licenseStatus !== 'all' ? this.allQFCLicenseStatus.find(firm => firm.FirmApplStatusTypeDesc === this.licenseStatus)?.FirmApplStatusTypeID || 0 : 0,   
      CSVLegalStatus: this.legalStatus !== 'all' ? this.legalStatusOptions.find(firm => firm.LegalStatusTypeDesc === this.legalStatus)?.LegalStatusTypeID || 0 : 0, 
      OperationalStatusId: 0, // Adjust based on your logic
      QFCNumber: this.qfcNumber,
      SupervisionCaseOfficerId: this.supervisorSupervision !=='all' ? this.allSupervisionCaseOfficer.find(firm => firm.FullName === this.supervisorSupervision)?.UserID || 0 : 0,
      AuthorisationCaseOfficerId: this.amlSup !== 'all' ? this.allAuthorisationCaseOfficer.find(firm => firm.FullName === this.amlSup)?.UserID || 0 : 0,
      PrudentialCategotyId: 0, // Adjust based on your logic
      CSVAuthorisationStatus: this.authorisationStatus !== 'all' ? this.authorisationStatusOptions.find(firm => firm.FirmApplStatusTypeDesc === this.authorisationStatus)?.FirmApplStatusTypeID || 0 : 0,
      RelevantPerson: this.relevantPerson ? 1 : 0, 
      CSVauthorisationCategory: this.getAuthorisationCategoriesCSV(),
      CSVPrudentialCategory:this.getPrudentialCategoriesCSV() , 
      CSVSectorTypes:this.getSectorsCSV(), 
      LoginUserID: this.userId, 
      CSVFirmTypes: this.getFirmTypesCSV(),
      CSVFirmStatus: this.getFirmStatusCSV(),
      CSVSupCategories:this.getSupCategoriesCSV(), 
      startChar: this.startCharLatter || '',
    };

    console.log('Filter Data:', filterData); 
    return filterData;
  }
  startCharLatter : string;
  getstartChar(letter: string): string {

    this.startCharLatter = letter === '#' ? '' : letter; 
    return this.startCharLatter; 
  }
 
  getCSVSelection(type: string): string {
    const selected = Object.keys(this.checkboxes)
      .filter(key => this.checkboxes[key] && key.startsWith(type))
      .map(key => this.getCheckboxValue(key));
    return selected.join(',');
  }
  getCheckboxValue(key: string): string {
    const valueMapping: { [key: string]: string } = {
      authorized: '1',
      dnfbp: '2',
      licensed: '3',
      applicant: '1',
      applicationWithdrawn: '2',
      applicationRejected: '3',
      active: '4',
      inactive: '5',
      withdrawn: '6',
      piib1: '1',
      piib2: '2',
      piib3: '3',
      piib4: '4',
      piib5: '5',
      directInsurer: '6',
      reinsurer: '7',
      insuranceIntermediary: '8',
      investmentManager: '1',
      insurer: '2',
      bank: '4',
      advisor: '5',
      repOffice: '6',
    corporateBank:'1',
    auditAndAccountingServices:'3',
    trustServices:'4',
    singleFamilyOffice:'5',
    captiveInsurer:'7',
    captiveManager:'8',
    investmentBank:'9',
    legalServices:'11',
    professionalServices:'12',
    wealthManager:'16',   
    iBANK:'2',
    iNMA:'3',
    cAPI:'4',
    iMEB: '5',
    pINS:'6',
    rEPO:'7',
    dMEX:'8' 
    };
    return valueMapping[key] || '0'; // Default value if no match found
  }

  getSectorsCSV(): string {
    return Object.keys(this.checkboxes)
      .filter(key => this.checkboxes[key] && ['investmentManager', 'insurer', 'insuranceIntermediary', 'bank', 'advisor', 'repOffice'].includes(key))
      .map((key) => {
        switch (key) {
          case 'investmentManager': return '1';
          case 'insurer': return '2';
          case 'insuranceIntermediary': return '3';
          case 'bank': return '4';
          case 'advisor': return '5';
          case 'repOffice': return '6';
          default: return "";
        }
      })
      .join(',');
  }
  getFirmTypesCSV(): string {
    return Object.keys(this.checkboxes)
      .filter(key => this.checkboxes[key])
      .map((key) => {
        switch (key) {
          case 'authorized': return '1';
          case 'dnfbp': return '2';
          case 'licensed': return '3';
          default: return "";
        }
      })
      .join(',');
  }
  getFirmStatusCSV(): string {
    return Object.keys(this.checkboxes)
      .filter(key => this.checkboxes[key] && key.startsWith('firmStatus'))
      .map((key) => {
        switch (key) {
          case 'applicant': return '1';
          case 'applicationWithdrawn': return '2';
          case 'applicationRejected': return '3';
          case 'active': return '4';
          case 'inactive': return '5';
          case 'withdrawn': return '6';
          default: return "";        
        }
      })
      .join(',');
      
  }
  getPrudentialCategoriesCSV(): string {
    return Object.keys(this.checkboxes)
      .filter(key => this.checkboxes[key] && key.startsWith('piib'))
      .map((key) => {
        switch (key) {
          case 'piib1': return '1';
          case 'piib2': return '2';
          case 'piib3': return '3';
          case 'piib4': return '4';
          case 'piib5': return '5';          
          case 'directInsurer': return '6';
          case 'reinsurer': return '7';
          case 'insuranceIntermediary': return '8';
          default: return "";
        }
      })
      .join(',');
  }
  getSupCategoriesCSV(): string {
    return Object.keys(this.checkboxes)
        .filter(key => this.checkboxes[key])  // Check if the checkbox is checked
        .map(key => {
            // Return the corresponding value based on the key
            switch (key) {
                case 'corporateBank': return '1';
                case 'investmentManager': return '2';
                case 'auditAndAccountingServices': return '3';
                case 'trustServices': return '4';
                case 'singleFamilyOffice': return '5';
                case 'insuranceIntermediary': return '6';
                case 'captiveInsurer': return '7';
                case 'captiveManager': return '8';
                case 'investmentBank': return '9';
                case 'advisorSupCat': return '10';
                case 'legalServices': return '11';
                case 'professionalServices': return '12';
                case 'directInsurer': return '13';
                case 'repOffice': return '14';
                case 'reinsurer': return '15';
                case 'wealthManager': return '16';
                default: return "";  // Return an empty string for unknown keys
            }
        })
        .filter(value => value !== "")  // Filter out empty strings
        .join(',');  // Join the values into a comma-separated string
}

getAuthorisationCategoriesCSV(): string {
  return Object.keys(this.checkboxes)
      .filter(key => this.checkboxes[key])  // Check if the checkbox is checked
      .map(key => {
          // Return the corresponding value based on the key
          switch (key) {
              case 'bank': return '1';
              case 'iBANK': return '2';
              case 'iNMA': return '3';
              case 'cAPI': return '4';
              case 'iMEB': return '5';
              case 'pINS': return '6';
              case 'rEPO': return '7';
              case 'dMEX': return '8';
              default: return "";  // Return an empty string for unknown keys
          }
      })
      .filter(value => value !== "")  // Filter out empty strings
      .join(',');  // Join the values into a comma-separated string
}
  // Filter firms by letter


  // Reset all filters to default values
  resetFilters(): void {
    this.setDefaultFilters();
    this.filteredFirms = [...this.firms];
    // Apply sorting after reset
    this.sortFirms('newFirms');
  }

  // Set default filter values
  setDefaultFilters(): void {
    this.firmName = 'all';
    this.qfcNumber = '';
    this.licenseStatus = 'all';
    this.supervisorSupervision = 'all';
    this.authorisationStatus = 'all' ;
    this.legalStatus = 'all';
    this.amlSup = 'all';
    this.firmType = true;
    this.firmStatus = true;
    this.prudentialCategory = true;
    this.sectors = true;
    this.supervisionCategory = true;
    this.authorisationCategory = true;
    this.getstartChar("#");
    this.checkboxes = {
      authorized: false,
      dnfbp: false,
      licensed: false,
      applicant: false,
      applicationWithdrawn: false,
      applicationRejected: false,
      active: false,
      inactive: false,
      withdrawn: false,
      piib1: false,
      piib2: false,
      piib3: false,
      piib4: false,
      piib5: false,
      directInsurer: false,
      reinsurer: false,
      insuranceIntermediary: false,
      investmentManager: false,
      insurer: false,
      bank: false,
      advisor: false,
      repOffice: false,
      corporateBank: false,
      investmentManagerSupCat: false,  // Ensure this property is included
      auditAndAccountingServices: false,
      trustServices: false,
      singleFamilyOffice: false,
      insuranceIntermediarySupCat: false,  // Ensure this property is included
      captiveInsurer: false,
      captiveManager: false,
      investmentBank: false,
      advisorSupCat: false,  // Ensure this property is included
      legalServices: false,
      professionalServices: false,
      directInsurerSupCat: false,  // Ensure this property is included
      repOfficeSupCat: false,
      reinsurerSupCat: false,
      wealthManager: false,
      iBANK: false,
      iNMA: false,
      cAPI: false,
      iMEB: false,
      pINS: false,
      rEPO: false,
      dMEX: false,
      relevantPerson: false
  };  
  }
 //////////// End Filter Area

  // Navigate to firm details
  viewFirm(firmId: number): void {
    if (firmId) {
      this.router.navigate(['home/view-firm', firmId]);
    } else {
      console.error('Invalid firm ID:', firmId);
    }
  }

  // Toggle sorting dropdown visibility
  toggleSortDropdown(): void {
    this.isSortDropdownOpen = !this.isSortDropdownOpen;

    if (this.isSortDropdownOpen) {
      this.unlistenDocumentClick = this.renderer.listen('document', 'click', this.onDocumentClick.bind(this));
    } else if (this.unlistenDocumentClick) {
      this.unlistenDocumentClick();
    }

  }


  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isClickInside = target.closest('.button-style') || target.closest('.dropdown-menu');

    if (!isClickInside) {
      this.isSortDropdownOpen = false;
      if (this.unlistenDocumentClick) {
        this.unlistenDocumentClick();
      }
    }
  }

  // Handle sorting option selection
  onSortOptionSelected(option: string): void {
    this.selectedSortOption = option;
    this.sortFirms(option);
    this.isSortDropdownOpen = false;
    if (this.unlistenDocumentClick) {
      this.unlistenDocumentClick();
    }
  }

  // Sort firms based on the selected option
  sortFirms(option: string): void {
    this.filteredFirms = [...this.firms];

    this.filteredFirms.sort(this.getSortFunction(option));
  }
  
  // Get the appropriate sort function based on the selected option
  getSortFunction(option: string): (a: any, b: any) => number {
    return (a, b) => {
      // Debug statements to log the FirmName values
      console.log(`Sorting Option: ${option}`);
      console.log(`Firm A: ${a.FirmName}, Firm B: ${b.FirmName}`);
      
      switch (option) {
        case 'AtoZ':
          return a.FirmName.localeCompare(b.FirmName);
        case 'ZtoA':
          return b.FirmName.localeCompare(a.FirmName);
        case 'newFirms':
          return new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime();
        case 'oldFirms':
          return new Date(a.CreatedDate).getTime() - new Date(b.CreatedDate).getTime();
        default:
          return 0; // No sorting
      }
    };
  }

  /* Security */

  applySecurityOnPage(objectId: FrimsObject) {
    const currentOpType = ObjectOpType.Create;
    this.applyAppSecurity(this.userId,objectId,currentOpType);
  }

  applyAppSecurity(userId: number, objectId: number, OpType: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.securityService.getAppRoleAccess(userId, objectId, OpType).subscribe(
        (response) => {
          this.controlsPermissions = response.response;
          resolve(); // Resolve the promise after fetching data
        },
        (error) => {
          console.error('Error fetching app role access: ', error);
          reject(error); // Reject the promise if there's an error
        }
      );
    });
  }

  getControlVisibility(controlName: string): boolean {
    const control = this.controlsPermissions.find(c => c.ControlName === controlName);
    return control ? control.ShowProperty === 1 : false;
  }

  ngOnDestroy(): void {
    if (this.unlistenDocumentClick) {
      this.unlistenDocumentClick();
    }
  }
}




