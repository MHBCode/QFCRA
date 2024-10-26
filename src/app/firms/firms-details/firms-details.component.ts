import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmService } from '../firm.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { ApplicationService } from 'src/app/ngServices/application.service';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';

@Component({
  selector: 'app-firms-details',
  templateUrl: './firms-details.component.html',
  styleUrls: ['./firms-details.component.scss','../firms.scss']
})
export class FirmsDetailsComponent implements OnInit{

  firmDetails: any = {};
  selectedFirmTypeID: number;
  dateOfApplication: any;
  formattedLicenseApplStatusDate: any;
  formattedAuthApplStatusDate: any;
  AuthorisationStatusTypeLabelDescFormatted: any;
  LicenseStatusTypeLabelDescFormatted: any;
  appDetails: any = [];
  applicationTypeId: number;
  firmId: number = 0;
  FIRMRA: any[] = [];
  isLoading: boolean = false;
  ASSILevel: number = 4;
  firmOPDetails: any;
  callInactiveUsers: boolean = false;
  firmInactiveUsers: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firmService: FirmService,
    private dateUtilService: DateUtilService,
    private applicationService: ApplicationService,
    private sanitizerService : SanitizerService
  ) {

  }


  ngOnInit(): void {
    this.firmService.scrollToTop();
    this.route.params.subscribe(params => {
      this.firmId = +params['id']; // Retrieve the firm ID from the route parameters
      console.log(`Loaded firm with ID: ${this.firmId}`);
      this.loadFirmDetails(this.firmId);
      this.loadFirmOPDetails(this.firmId); 
      this.loadAssiRA();
    })
  }

  loadFirmDetails(firmId: number) {
    this.firmService.getFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.response;
        this.selectedFirmTypeID = this.firmDetails.AuthorisationStatusTypeID != 0 ? 3 : 2;
        this.dateOfApplication = this.firmDetails.AuthorisationStatusTypeID > 0 ? this.dateUtilService.formatDateToCustomFormat(this.firmDetails.FirmAuthApplDate) : this.dateUtilService.formatDateToCustomFormat(this.firmDetails.FirmLicApplDate);
        this.formattedLicenseApplStatusDate = this.dateUtilService.formatDateToCustomFormat(this.firmDetails.LicenseApplStatusDate);
        this.formattedAuthApplStatusDate = this.dateUtilService.formatDateToCustomFormat(this.firmDetails.AuthApplStatusDate);
        this.AuthorisationStatusTypeLabelDescFormatted = this.firmDetails.AuthorisationStatusTypeLabelDesc.replace(/:/g, '');
        this.LicenseStatusTypeLabelDescFormatted = this.firmDetails.LicenseStatusTypeLabelDesc.replace(/:/g, '');
        this.getFirmTypes();
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
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }



  getFirmTypes() {
    this.applicationTypeId = this.firmDetails.AuthorisationStatusTypeID != 0 ? 3 : 2;
    this.applicationService.getApplications(this.firmId, this.applicationTypeId).subscribe(
      data => {
        this.appDetails = data.response[0];
        console.log('Loaded firm application types:', this.appDetails);
      },
      error => {
        console.error('Error fetching Application Types: ', error);
      }
    );
  }


  loadAssiRA() {
    this.isLoading = true;
    this.firmService.getFIRMUsersRAFunctions(this.firmId, this.ASSILevel).subscribe(
      data => {
        this.FIRMRA = data.response;
        console.log('Firm RA Functions details:', this.FIRMRA);
        this.isLoading = false;
      },
      error => {
        console.error('Error get Firm RA Functionsdetails', error);
        this.isLoading = false;
      }
    );
  }


  getSanitizedNotes(notes: string) {
    return this.sanitizerService.getSanitizedNotes(notes);
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
    this.callInactiveUsers = false;
    const popupWrapper = document.querySelector('.InactiveUsersPopUp') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }
}
