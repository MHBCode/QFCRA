import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-edit-firm',
  templateUrl: './edit-firm.component.html',
  styleUrls: ['./edit-firm.component.scss']
})
export class EditFirmComponent implements OnInit {
  isDateDifferent: boolean = false;
  editFIRM: FormGroup;
  firmId: number = 0; 
  call: Boolean = false;
  firmFYearHistory: any;
  firmAppDetailsLicensed: any[] = [];
  firmAppDetailsAuthorization: any[] = [];
  
  constructor(private fb: FormBuilder, private editRowService: FirmService,
    private router: Router,
    private route: ActivatedRoute,  // Inject ActivatedRoute
  ) {
    this.editFIRM = this.fb.group({
      firmID: [this.firmId], // not yet
      firmName: ['0'], //done
      qfcNum: ['0'], //done
      firmCode: ['0'], //done
      legalStatusTypeID: [0],
      qfcTradingName: ['0'], //done
      prevTradingName: ['0'],
      placeOfIncorporation: ['0'],
      countryOfIncorporation: [0],
      isIncorporationDateDifferent: [false],
      incorporationDate: [new Date()],
      FYearEnd: [0],
      FYearEffectiveFrom: [new Date()],
      accountingStandards: [0],
      accountingStandardsEffectiveFrom: [new Date()],
      websiteAddress: ['0'],
      firmAppDate: ['0'], //done
      firmAppTypeID: [0],
      licenseStatusTypeID: [0],
      licenseDate: ['0'],
      authorisationStatusTypeID: [0],
      authorisationDate: ['0'],
      loginUserID: [0],
      finYearEndTypeID: [0]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];  // Retrieve the firm ID from the route parameters
    });
  }

  getFYearHistory(){
    this.call = true;
    this.editRowService.getFYearEndHistory(this.firmId).subscribe(
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

  getApplicationDetailsHistory() {
    this.editRowService.getAppDetailsLicensedAndAuthHistory(this.firmId,2,false).subscribe(
      data => {
        this.firmAppDetailsLicensed = data.response;
        console.log('Firm app details licensed history:', this.firmAppDetailsLicensed);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
    this.editRowService.getAppDetailsLicensedAndAuthHistory(this.firmId,3,false).subscribe(
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

  onSubmitEditFirm(): void {
    const userId = 10044; // Replace with dynamic userId as needed
    this.editRowService.editFirm(userId, this.editFIRM.value).subscribe(response => {
      console.log('Row edited successfully:', response);
    }, error => {
      console.error('Error editing row:', error);
    });
  }

}
