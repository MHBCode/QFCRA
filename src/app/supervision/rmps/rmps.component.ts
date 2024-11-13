import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { RiskService } from 'src/app/ngServices/risk.service';

@Component({
  selector: 'app-rmps',
  templateUrl: './rmps.component.html',
  styleUrls: ['./rmps.component.scss','../supervision.scss']
})
export class RmpsComponent {
  FIRMRMP: any;
  isLoading: boolean = false;
  firmId: number = 0;
  firmDetails:any;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private riskService: RiskService,
    private firmDetailsService: FirmDetailsService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadFirmDetails(this.firmId)
      this.loadRMPs();
    })
  }

  loadRMPs() {
    this.riskService.getFirmRisk(this.firmId).subscribe(
      data => {
        this.FIRMRMP = data.response;
        console.log('Firm FIRM RRM details:', this.FIRMRMP);
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }

  loadFirmDetails(firmId: number) {
    this.firmDetailsService.loadFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.firmDetails;
      },
      error => {
        console.error(error);
      }
    );

  }

}
