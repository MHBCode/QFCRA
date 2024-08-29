import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-firms-page',
  templateUrl: './firms-page.component.html',
  styleUrls: ['./firms-page.component.scss']
})
export class FirmsPageComponent {

  @Input() listCount: number = 50;

  firms: any[] = [];
  licenseStatuses: string[] = [];
  supervisorSupervisions: string[] = [];
  legalStatuses: string[] = [];
  authorisationStatuses: string[] = [];
  amlSupervisors: string[] = [];

  filteredFirms: any[] = [];
  showSearchSection: boolean = false;


  firmName: string = 'all';
  qfcNumber: string = '';
  firmType: boolean = true;
  firmStatus: boolean = true;
  licenseStatus: string = 'all';
  supervisorSupervision: string = 'all';
  legalStatus: string = 'all';
  prudentialCategory: boolean = true;
  sectors: boolean = true;
  supervisionCategory: boolean = true;
  authorisationCategory: boolean = true;
  authorisationStatus: string = 'all';
  supervisorAML: string = 'all';
  relevantPerson: boolean = false;

  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

  constructor(
    private router: Router,
    private firmService: FirmService
  ) { }

  ngOnInit(): void {
    this.loadFirms();
  }

  toggleSearch() {
    this.showSearchSection = !this.showSearchSection;
  }

  loadFirms(): void {
    this.firmService.getAssignedFirms(10044).subscribe(
      data => {
        this.firms = data.response;
        this.filteredFirms = [...this.firms];


        this.licenseStatuses = [...new Set(this.firms.map(firm => firm.LicenseStatusTypeDesc))];
        this.supervisorSupervisions = [...new Set(this.firms.map(firm => firm.Supervisor))];
        this.legalStatuses = [...new Set(this.firms.map(firm => firm.LegalStatusTypeDesc))];
        this.authorisationStatuses = [...new Set(this.firms.map(firm => firm.AuthorisationStatusTypeDesc))];
        this.amlSupervisors = [...new Set(this.firms.map(firm => firm.Supervisor_AML))];

        console.log(this.firms);
      },
      error => {
        console.error('Error fetching firms', error);
      }
    );
  }


  searchFirms(): void {
    this.filteredFirms = this.firms.filter(firm => {
      return (
        (this.firmName === 'all' || firm.FirmName === this.firmName) &&
        (this.qfcNumber === '' || firm.QFCNum === this.qfcNumber) &&
        (this.firmType || firm.FirmType === this.firmType) &&
        (this.firmStatus || firm.FirmStatus === this.firmStatus) &&
        (this.licenseStatus === 'all' || firm.LicenseStatusTypeDesc === this.licenseStatus) &&
        (this.supervisorSupervision === 'all' || firm.Supervisor === this.supervisorSupervision) &&
        (this.legalStatus === 'all' || firm.LegalStatusTypeDesc === this.legalStatus) &&
        (this.prudentialCategory || firm.PrudentialCategoryTypeDesc === this.prudentialCategory) &&
        (this.sectors || firm.SectorTypeShortDesc === this.sectors) &&
        (this.supervisionCategory || firm.SupervisionCategory === this.supervisionCategory) &&
        (this.authorisationCategory || firm.AuthorisationCategoryTypeDesc === this.authorisationCategory) &&
        (this.authorisationStatus === 'all' || firm.AuthorisationStatusTypeDesc === this.authorisationStatus) &&
        (this.supervisorAML === 'all' || firm.Supervisor_AML === this.supervisorAML) &&
        (!this.relevantPerson || firm.RelevantPerson === this.relevantPerson)
      );
    });
  }


  filterFirmsByLetter(letter: string): void {
    console.log('Filtering firms by letter:', letter);

    if (letter === '#') {
      this.filteredFirms = this.firms.filter(firm => !/^[A-Za-z]/.test(firm.FirmName));
      console.log('Filtered firms:', this.filteredFirms);

    } else {
      console.log('Filtered==============> firms:', this.firms.filter(firm => firm.FirmName.startsWith(letter)));

      this.filteredFirms = this.firms.filter(firm => firm.FirmName.startsWith(letter));
    }
  }


  resetFilters(): void {
    this.setDefaultFilters();
    this.filteredFirms = [...this.firms];
  }

  setDefaultFilters(): void {
    this.firmName = 'all';
    this.qfcNumber = '';
    this.firmType = true;
    this.firmStatus = true;
    this.licenseStatus = 'all';
    this.supervisorSupervision = 'all';
    this.legalStatus = 'all';
    this.prudentialCategory = true;
    this.sectors = true;
    this.supervisionCategory = true;
    this.authorisationCategory = true;
    this.authorisationStatus = 'all';
    this.supervisorAML = 'all';
    this.relevantPerson = false;
  }

  viewFirm(firmId: number) {
    if (firmId) {
      console.log("Navigating to firm with ID:", firmId);
      this.router.navigate(['home/view-firm', firmId]);
    } else {
      console.error('Invalid firm ID:', firmId);
    }
  }

  goToAllFirms() {
    this.router.navigate(['home/firms-page']);
  }
}
