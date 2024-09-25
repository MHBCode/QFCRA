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
  showPopup: boolean = false;
  isSortDropdownOpen: boolean = false;
  // Form search fields with defaults
  firmName: string = 'all';
  qfcNumber: string = '';
  firmType: boolean = true;
  firmStatus: boolean = true;
  licenseStatus: string = 'all';
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
    this.firmService.getAssignedFirms(10044).subscribe(
      data => {
        if (data && data.response) {
          this.firms = data.response;
          this.filteredFirms = [...this.firms];

          this.licenseStatuses = [...new Set(this.firms.map(firm => firm.LicenseStatusTypeDesc))];
          this.supervisorSupervisions = [...new Set(this.firms.map(firm => firm.Supervisor))];
          this.authorisationStatuses = [...new Set(this.firms.map(firm => firm.AuthorisationStatusTypeDesc))];
          this.amlSupervisors = [...new Set(this.firms.map(firm => firm.Supervisor_AML))];
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

  // Search functionality for firms
  searchFirms(): void {
    this.filteredFirms = this.firms.filter(firm => {
      console.log("Filters: ", {
        firmName: this.firmName,
        qfcNumber: this.qfcNumber,
        licenseStatus: this.licenseStatus,
        supervisorSupervision: this.supervisorSupervision,
        checkboxes: this.checkboxes
      });
      return (
        (this.firmName === 'all' || firm.FirmName.includes(this.firmName)) &&
        (this.qfcNumber === '' || firm.QFCNum.includes(this.qfcNumber)) &&
        (this.licenseStatus === 'all' || firm.LicenseStatusTypeDesc === this.licenseStatus) &&
        (this.supervisorSupervision === 'all' || firm.Supervisor === this.supervisorSupervision) &&
        (this.checkboxes.authorized && firm.FirmType === 'Authorized' ||
         this.checkboxes.dnfbp && firm.FirmType === 'DNFBP' ||
         this.checkboxes.licensed && firm.FirmType === 'Licensed' ||
         (!this.checkboxes.authorized && !this.checkboxes.dnfbp && !this.checkboxes.licensed)) &&
        (this.checkboxes.active && firm.FirmStatus === 'Active' ||
         this.checkboxes.inactive && firm.FirmStatus === 'Inactive' ||
         (!this.checkboxes.active && !this.checkboxes.inactive))
      );
      
    });

  }

  // Filter firms by letter
  filterFirmsByLetter(letter: string): void {
    if (letter === '#') {
      this.filteredFirms = this.firms;
    } else {
      this.filteredFirms = this.firms.filter(firm => firm.FirmName.startsWith(letter));
    }
  }

  // Reset all filters to default values
  resetFilters(): void {
    this.setDefaultFilters();
    this.filteredFirms = [...this.firms];
  }

  // Set default filter values
  setDefaultFilters(): void {
    this.firmName = 'all';
    this.qfcNumber = '';
    this.firmType = true;
    this.firmStatus = true;
    this.licenseStatus = 'all';
    this.supervisorSupervision = 'all';
    this.prudentialCategory = true;
    this.sectors = true;
  }

  // Navigate to firm details
  viewFirm(firmId: number): void {
    if (firmId) {
      this.router.navigate(['home/view-firm', firmId]);
    } else {
      console.error('Invalid firm ID:', firmId);
    }
  }
  // Existing methods...

  toggleSortDropdown(): void {
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
  }

  sortFirms(option: string): void {
    switch (option) {
      case 'AtoZ':
        this.filteredFirms.sort((a, b) => a.FirmName.localeCompare(b.FirmName));
        break;
      case 'ZtoA':
        this.filteredFirms.sort((a, b) => b.FirmName.localeCompare(a.FirmName));
        break;
      case 'newFirms':
        // Assuming there's a date property to sort by creation date
        this.filteredFirms.sort((a, b) => new Date(b.CreationDate).getTime() - new Date(a.CreatedDate).getTime());
        break;
      case 'oldFirms':
        this.filteredFirms.sort((a, b) => new Date(a.CreationDate).getTime() - new Date(b.CreationDate).getTime());
        break;
    }
    console.log("sortFirms",option)
    this.isSortDropdownOpen = false; // Close dropdown after selecting
  }

}



