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
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-firms-page',
  templateUrl: './firms-page.component.html',
  styleUrls: ['./firms-page.component.scss'],
})
export class FirmsPageComponent implements OnInit {
  @Input() listCount: number = 50;
  firms: any[] = [];
  licenseStatuses: string[] = [];
  supervisorSupervisions: string[] = [];
  authorisationStatuses: string[] = [];
  amlSupervisors: string[] = [];
  
  filteredFirms: any[] = [];
  filteredFirmsdata: any = [];
  showPopup: boolean = false;
  isSortDropdownOpen: boolean = false;
  selectedSortOption: string = 'AtoZ'; // Default sort option
 
  // Form search fields with defaults
  firmName: string = 'all';
  qfcNumber: string = '';
  firmType: boolean = true;
  firmStatus: boolean = true;
  licenseStatus: string = 'all';
  authorisationStatus: string = 'all'
  supervisorSupervision: string = 'all';
  prudentialCategory: boolean = true;
  sectors: boolean = true;

  // Toggling Options for expanded views
  toggleOptions = {
    firmType: false,
    firmStatus: false,
    prudentialCategory: false,
    sectors: false
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
    repOffice: false
  };
  
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

  constructor(private router: Router, private firmService: FirmService) { }

  ngOnInit(): void {
    this.loadFirms();
  }

  // Toggle popup visibility
  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }

  // Load initial firms data
  loadFirms(): void {
    this.firmService.getAssignedFirms(30).subscribe(
      data => {
        if (data && data.response) {
          
          this.firms = data.response;
          this.filteredFirms = [...this.firms];

          this.licenseStatuses = [...new Set(this.firms.map(firm => firm.LicenseStatusTypeDesc))];
          this.supervisorSupervisions = [...new Set(this.firms.map(firm => firm.Supervisor))];
          this.authorisationStatuses = [...new Set(this.firms.map(firm => firm.AuthorisationStatusTypeDesc))];
          this.amlSupervisors = [...new Set(this.firms.map(firm => firm.Supervisor_AML))];
          
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
      },
      (error) => {
        console.error('Error fetching firms:', error);
       // alert(`Error: ${error.message}`);
      }
    );
  }
  
  prepareFilterData() {
    const filterData = {
      FirmID: this.firmName !== 'all' ? this.firms.find(firm => firm.FirmName === this.firmName)?.FirmID || 0 : 0, 
      LicenseStatusId: this.licenseStatus !== 'all' ? this.firms.find(firm => firm.LicenseStatusTypeDesc === this.licenseStatus)?.LicenseStatusId || 0 : 0, 
      AuthorisationStatusId: this.authorisationStatus !== 'all' ? this.authorisationStatus : 0,  
      OperationalStatusId: 0, // Adjust based on your logic
      QFCNumber: this.qfcNumber || 0,
      LegalStatusId: 0, 
      AuthorisationCaseOfficerId: 0, // Example value
      SupervisionCaseOfficerId: 0, // Example value
      PrudentialCategotyId: 0, // Adjust based on your logic
      UserID:0, // Adjust based on your logic
      RelevantPerson: 0, 
      CSVAuthorisationStatus: this.authorisationStatus !== 'all' ? this.authorisationStatus : 0,
      CSVLicenseStatus: 0,
      CSVLegalStatus: 0, 
      CSVPrudentialCategory:this.getPrudentialCategoriesCSV(), 
      CSVSectorTypes:this.getSectorsCSV(), 
      LoginUserID: 30, 
      CSVFirmTypes: this.getFirmTypesCSV(),
      CSVFirmStatus: this.getFirmStatusCSV(),
      CSVSupCategories:0, 
      startChar: this.startCharLatter || 0,
    };

    console.log('Filter Data:', filterData); 
    return filterData;
  }
  startCharLatter : string;
  getstartChar(letter: string): string {

    this.startCharLatter = letter === '#' ? '0' : letter; 
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
      repOffice: '6'
    };
    return valueMapping[key] || '0'; // Default value if no match found
  }
  getPrudentialCategoriesCSV(): string {
    return Object.keys(this.checkboxes)
      .filter(key => this.checkboxes[key] && key.startsWith('piib'))
      .map((key, index) => (index + 1).toString()) // Assuming PIIBs are numbered 1-5
      .join(',');
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
          default: return '0';
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
          default: return '0';
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
          default: return '0';
          
        }
      })
      .join(',');
      
  }

  getSupCategoriesCSV(): string {
    // Logic to collect supervision categories as CSV
    return '5,7'; // Adjust based on your logic
  }

  getAuthorisationCategoriesCSV(): string {
    // Logic to collect authorisation categories as CSV
    return '3,5'; // Adjust based on your logic
  }
  // Filter firms by letter


  // Reset all filters to default values
  resetFilters(): void {
    this.setDefaultFilters();
    this.filteredFirms = [...this.firms];
    // Apply sorting after reset
    this.sortFirms(this.selectedSortOption);
  }

  // Set default filter values
  setDefaultFilters(): void {
    this.firmName = 'all';
    this.qfcNumber = '';
    this.licenseStatus = 'all';
    this.supervisorSupervision = 'all';
    this.firmType = true;
    this.firmStatus = true;
    this.prudentialCategory = true;
    this.sectors = true;
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
  }

  // Handle sorting option selection
  onSortOptionSelected(option: string): void {
    this.selectedSortOption = option;
    this.sortFirms(option);
    this.toggleSortDropdown(); // Close dropdown after selection
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
}



