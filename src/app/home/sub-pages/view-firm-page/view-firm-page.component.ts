import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';  // Import ActivatedRoute
import { FirmService } from 'src/app/ngServices/firm.service';  // Import FirmService

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
  isCollapsed: boolean = false;
  showPrevFirmNameandDateFields = true;
  selectedAuditor: any = null;
  selectedAuditorNameFromSelectBox: string = 'select'
  @ViewChildren('auditorRadio') auditorRadios!: QueryList<any>;
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
  firmOPDetails: any;
  firmFYearHistory: any;
  firmNamesHistory: any;
  firmAccountingStandard: any;
  ActivityLicensed: any;
  ActivityAuth: any;
  firmInactiveUsers: any[] = [];
  firmAppDetailsLicensed: any[] = [];
  firmAppDetailsAuthorization: any[] = [];
  firmAppDetailsLatestLicensed: any;
  firmAppDetailsLatestAuthorized: any;
  FIRMAuditors: any[] = [];
  FIRMContacts: any[] = [];
  FIRMControllers: any[] = [];
  RegisteredFund: any [] = [];
  FIRMRA: any[] = [];
  FirmAdminFees: any[] = [];
  FirmWaivers: any;
  FIRMRMP: any;
  FIRMNotices: any;
  License: string = 'License';
  Authorize: string = 'Authorisation';
  allowEditFirmDetails: string | boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,  // Inject ActivatedRoute
    private firmService: FirmService,  // Inject FirmService
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.scrollToTop();

    this.route.params.subscribe(params => {
      this.firmId = +params['id'];  // Retrieve the firm ID from the route parameters
      console.log(`Loaded firm with ID: ${this.firmId}`);
      this.loadFirmDetails(this.firmId);  // Fetch the firm details
      this.loadFirmOPDetails(this.firmId); // Fetch Operational Data
      this.loadAssiRA();
      this.loadAdminFees();
      this.loadActivitiesLicensed();
      this.loadActivitiesAuthorized();
    });
  }

  scrollToTop(): void {
    console.log('scrollToTop called');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
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

    if (this.allowEditFirmDetails){
      console.log("firms details after edit:", this.firmDetails);
      const userId = 10044; // Replace with dynamic userId as needed
      if ((Object.keys(this.firmDetails.FirmApplicationDataComments).length === 0) ){
        this.firmDetails.FirmApplicationDataComments = "";
      };
      if ((Object.keys(this.firmDetails.PublicRegisterComments).length === 0) ){
        this.firmDetails.PublicRegisterComments = "";
      };

      if(this.firmDetails?.AuthorisationStatusTypeID == 0){
        this.firmDetails.FirmApplDate = this.firmDetails?.FirmLicApplDate;
      }
      else{
        this.firmDetails.FirmApplDate = this.firmDetails?.FirmAuthApplDate;
      }
      this.firmDetails.firmId = this.firmId;
      this.firmDetails.FirmAccDataId = this.firmDetails.FirmAccountingDataID;
      this.firmDetails.FirmStandardID = this.firmDetails.FirmAccountingStandardID;
      this.firmDetails.FirmApplTypeID = this.firmDetails.FirmTypeID;
      this.firmDetails.FirmFinStandardTypeID = this.firmDetails.FinAccStdTypeID;

      this.firmService.editFirm(userId, this.firmDetails).subscribe(response => {
        console.log('Row edited successfully:', response);
      }, error => {
        console.error('Error editing row:', error);
      });

    }
  }

  convertDate(oldFormate:any) {
    const months = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
        "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
        "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
    };

    const [day, month, year] = oldFormate.split('/');
    const formattedMonth = months[month];
    return `${year}-${formattedMonth}-${day}`;
}

  // Method to load firm details
  loadFirmDetails(firmId: number) {
    this.firmService.getFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.response;
        this.firmDetails.LicensedDate = this.convertDate(this.firmDetails.LicensedDate);
        this.firmDetails.AuthorisationDate = this.convertDate(this.firmDetails.AuthorisationDate);
        this.firmDetails.DateOfIncorporation = this.convertDate(this.firmDetails.DateOfIncorporation);
        this.firmDetails.FinAccStdTypeEffectiveFrom = this.convertDate(this.firmDetails.FinAccStdTypeEffectiveFrom);
        this.firmDetails.FirmFinYearEndEffectiveFrom = this.convertDate(this.firmDetails.FirmFinYearEndEffectiveFrom);
        console.log('1) Firm details:', this.firmDetails);
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
  loadAuditors(){
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
  loadContacts(){
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
  loadControllers(){
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
  loadAssiRA(){
    this.firmService.getFIRMUsersRAFunctions(this.firmId,this.ASSILevel).subscribe(
      data => {
        this.FIRMRA = data.response;
        console.log('Firm RA Functions details:', this.FIRMRA);
      },
      error => {
        console.error('Error get Firm RA Functionsdetails', error);
      }
    );
  }
  loadRegisteredFund(){
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
  loadAdminFees(){
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
  loadActivitiesLicensed(){
    this.firmService.getFirmActivityLicensedAndAuthorized(this.firmId,2).subscribe(
      data => {
        this.ActivityLicensed = data.response;
        console.log('Firm FIRM License scope details:', this.ActivityLicensed);
      },
      error => {
        console.error('Error fetching License scope ', error);
      }
    );
  }
  loadActivitiesAuthorized() {
    this.firmService.getFirmActivityLicensedAndAuthorized(this.firmId,3).subscribe(
      data => {
        this.ActivityAuth = data.response[0];
        console.log('Firm FIRM License scope details:', this.ActivityAuth);
      },
      error => {
        console.error('Error fetching License scope ', error);
      }
    );
  }
  loadWaivers(){
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
  loadRMPs(){
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
  loadNotices(){
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
    this.firmService.getAppDetailsLicensedAndAuthHistory(this.firmId,2,true).subscribe(
      data => {
        this.firmAppDetailsLatestLicensed = data.response[0];
        console.log('Firm app details licensed history:', this.firmAppDetailsLatestLicensed);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    this.firmService.getAppDetailsLicensedAndAuthHistory(this.firmId,3,true).subscribe(
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
      (error: HttpErrorResponse) => {
        console.error('Error fetching firm details', error);
        if (error.status === 404) {
          this.showPrevFirmNameandDateFields = false; // Hide fields if 404 error occurs
        }
      }
    );
  }
  switchTab(tabId: string){
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

        if(tabId == 'Auditors' && this.FIRMAuditors.length === 0){
          this.loadAuditors();
        }
        if(tabId == 'Contacts' && this.FIRMContacts.length === 0){
          this.loadContacts();
        }
        if(tabId == 'Controllers' && this.FIRMControllers.length === 0){
          this.loadControllers();
        }
        if(tabId == 'SPRegFunds' && this.RegisteredFund.length === 0){
          this.loadRegisteredFund();
        }
        if(tabId == 'SPWaivers'){
          this.loadWaivers();
        }
        if(tabId == 'SPRMPs'){
          this.loadRMPs();
        }
        if(tabId == 'SPNotices'){
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

  getFYearHistory(){
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
  },0);
  }
  closeFYearHistory(){
    const popupWrapper = document.querySelector('.popup-wrapper') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .popup-wrapper not found');
    }
  }

  getInactiveUsers(){
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
  },0);
  }


  closeInactiveUsers(){
    const popupWrapper = document.querySelector('.InactiveUsersPopUp') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
    }
  }


  getApplicationDetailsHistory() {
    this.firmService.getAppDetailsLicensedAndAuthHistory(this.firmId,2,false).subscribe(
      data => {
        this.firmAppDetailsLicensed = data.response;
        console.log('Firm app details licensed history:', this.firmAppDetailsLicensed);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    this.firmService.getAppDetailsLicensedAndAuthHistory(this.firmId,3,false).subscribe(
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
    },0);
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
        this.firmAccountingStandard = data.response;
        console.log('Firm app details licensed history:', this.firmAccountingStandard);
      },
      error => {
        console.error('Error fetching firm details', error);
    })
    setTimeout(() => {
      const popupWrapper = document.querySelector('.accountingStandardsPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .prevFirmNamePopUp not found');
      }
    },0);
  }

  closeAccountingStandard() {
    const popupWrapper = document.querySelector(".accountingStandardsPopUp") as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class not found');
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
}
