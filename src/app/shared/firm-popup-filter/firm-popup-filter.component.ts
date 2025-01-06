import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as constants from 'src/app/app-constants';
import { SecurityService } from 'src/app/ngServices/security.service';


@Component({
  selector: 'app-firm-popup-filter',
  templateUrl: './firm-popup-filter.component.html',
  styleUrls: ['./firm-popup-filter.component.scss']
})
export class FirmPopupFilterComponent implements OnInit {
  allFirmTypes: any = [];
  allFirmStatus: any = [];
  allAuthStatus: any = [];
  allLicenseStatus: any = [];
  allLegalStatus: any = [];
  allprudentialCategoryTypes: any = [];
  userId: number = 30;


  @Output() closeFirmFilterPopup = new EventEmitter<void>();

  constructor(
    private securityService: SecurityService
  ) {

  }


  ngOnInit(): void {
    this.getAuthStatus();
    this.getFirmStatus();
    this.getFirmTypes();
    this.getLegalStatus();
    this.getLicenseStatus();
    this.getPrudentialCategory();
  }

  getFirmTypes() {
    this.securityService.getObjectTypeTable(this.userId, constants.firmTypes, constants.ObjectOpType.List).subscribe(
      firmTypes => {
        this.allFirmTypes = firmTypes;
      },
      error => {
        console.error('Error fetching Firm Types: ', error);
      }
    );
  }

  getFirmStatus() {
    this.securityService.getObjectTypeTable(this.userId, constants.firmStatus, constants.ObjectOpType.List).subscribe(
      items => {
        this.allFirmStatus = items;
      },
      error => {
        console.error('Error fetching Firm Types: ', error);
      }
    );
  }

  getAuthStatus() {
    this.securityService.getObjectTypeTable(this.userId, constants.authorisationStatus, constants.ObjectOpType.List).subscribe(
      items => {
        this.allAuthStatus = items;
      },
      error => {
        console.error('Error fetching Firm Types: ', error);
      }
    );
  }


  getLicenseStatus() {
    this.securityService.getObjectTypeTable(this.userId, constants.qfcLicenseStatus, constants.ObjectOpType.List).subscribe(
      items => {
        this.allLicenseStatus = items;
      },
      error => {
        console.error('Error fetching Firm Types: ', error);
      }
    );
  }


  getLegalStatus() {
    this.securityService.getObjectTypeTable(this.userId, constants.legalStatusfilter, constants.ObjectOpType.List).subscribe(
      items => {
        this.allLegalStatus = items;
      },
      error => {
        console.error('Error fetching Firm Types: ', error);
      }
    );
  }



  getPrudentialCategory() {
    this.securityService.getObjectTypeTable(this.userId, constants.prudentialCategoryTypes, constants.ObjectOpType.List).subscribe(
      items => {
        this.allprudentialCategoryTypes = items;
      },
      error => {
        console.error('Error fetching Firm Types: ', error);
      }
    );
  }



  onClose(): void {
    this.closeFirmFilterPopup.emit();
  }

}
