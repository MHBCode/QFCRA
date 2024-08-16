import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-edit-scope-authorized',
  templateUrl: './edit-scope-authorized.component.html',
  styleUrls: ['./edit-scope-authorized.component.scss']
})
export class EditScopeAuthorizedComponent {
  firmId: number = 0;  // Add firmId property
  ActivityLicensed: any;
  ActivityAuth: any;
  firmDetails: any;
  islamicFinance: any;

  isCollapsed: { [key: string]: boolean } = {};

  constructor(private route: ActivatedRoute,private firmService: FirmService) {}

  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];  // Retrieve the firm ID from the route parameters
      console.log(`Loaded firm with ID: ${this.firmId}`);
      this.loadFirmDetails(this.firmId);  // Fetch the firm details
      this.loadActivitiesAuthorized();
      this.loadIslamicFinance();
    });
  }

  toggleCollapse(section: string) {
    this.isCollapsed[section] = !this.isCollapsed[section];
}

  loadFirmDetails(firmId: number) {
    this.firmService.getFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.response;
        console.log('Firm details:', this.firmDetails);
      },
      error => {
        console.error('Error fetching firm details', error);
      }
    );
  }

  loadActivitiesAuthorized() {
    this.firmService.getFirmActivityLicensedAndAuthorized(this.firmId, 3).subscribe(
      data => {
        this.ActivityAuth = data.response[0];
        console.log('Firm FIRM License scope details:', this.ActivityAuth);
      },
      error => {
        console.error('Error fetching License scope ', error);
      }
    );
  }

  loadIslamicFinance() {
    this.firmService.getIslamicFinance(this.firmId).subscribe(
      data => {
        this.islamicFinance = data.response;
        console.log('Firm Islamic Finance:', this.islamicFinance);
    }, error => {
        console.error('Error Fetching islamic finance',error);
    })
  }
}
