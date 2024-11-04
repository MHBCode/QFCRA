import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-enf-actions',
  templateUrl: './enf-actions.component.html',
  styleUrls: ['./enf-actions.component.scss','../supervision.scss']
})
export class EnfActionsComponent implements OnInit{
  enfActions: any;
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
      this.loadEnfActions();
    })
  }

  loadEnfActions() {
    // this.waiverService.getFirmwaiver(this.firmId).subscribe(
    //   data => {
    //     this.enfActions = data.response;
    //     console.log('Firm FIRM Waivers details:', this.enfActions);
    //   },
    //   error => {
    //     console.error('Error fetching Enf Actions', error);
    //   }
    // );
  }
}
