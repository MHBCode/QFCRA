import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-edit-scope-licensed',
  templateUrl: './edit-scope-licensed.component.html',
  styleUrls: ['./edit-scope-licensed.component.scss']
})
export class EditScopeLicensedComponent implements OnInit{
  firmId: number = 0;  // Add firmId property
  ActivityLicensed: any;
  firmDetails: any;
  
  

  constructor(private route: ActivatedRoute,private firmService: FirmService) {}

  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];  // Retrieve the firm ID from the route parameters
      console.log(`Loaded firm with ID: ${this.firmId}`);
      this.loadFirmDetails(this.firmId);  // Fetch the firm details
      this.loadActivitiesLicensed();
    });
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

  loadActivitiesLicensed() {
    this.firmService.getFirmActivityLicensedAndAuthorized(this.firmId, 2).subscribe(
      data => {
        this.ActivityLicensed = data.response;
        console.log('Firm FIRM License scope details:', this.ActivityLicensed);
      },
      error => {
        console.error('Error fetching License scope ', error);
      }
    );
  }
}
