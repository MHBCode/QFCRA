import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-breaches',
  templateUrl: './breaches.component.html',
  styleUrls: ['./breaches.component.scss','../supervision.scss']
})
export class BreachesComponent {
  FirmWaivers: any;
  isLoading: boolean = false;
  firmId: number = 0;
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadBreaches();
    })
  }

  loadBreaches() {
    // this.waiverService.getFirmwaiver(this.firmId).subscribe(
    //   data => {
    //     this.FirmWaivers = data.response;
    //     console.log('Firm FIRM Waivers details:', this.FirmWaivers);
    //   },
    //   error => {
    //     console.error('Error fetching Firm Waivers ', error);
    //   }
    // );
  }
}
