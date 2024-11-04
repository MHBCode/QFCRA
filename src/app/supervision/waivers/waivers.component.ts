import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WaiverService } from 'src/app/ngServices/waiver.service';

@Component({
  selector: 'app-waivers',
  templateUrl: './waivers.component.html',
  styleUrls: ['./waivers.component.scss','../supervision.scss']
})
export class WaiversComponent {
  FirmWaivers: any;
  isLoading: boolean = false;
  firmId: number = 0;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private waiverService: WaiverService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadWaivers();
    })
  }

  loadWaivers() {
    this.waiverService.getFirmwaiver(this.firmId).subscribe(
      data => {
        this.FirmWaivers = data.response;
        console.log('Firm FIRM Waivers details:', this.FirmWaivers);
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }
}
