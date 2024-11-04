import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private riskService: RiskService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
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
}
