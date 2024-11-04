import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reg-funds',
  templateUrl: './reg-funds.component.html',
  styleUrls: ['./reg-funds.component.scss','../supervision.scss']
})
export class RegFundsComponent {
  regFunds: any;
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
      this.loadRegFunds();
    })
  }

  loadRegFunds() {
    // this.waiverService.getFirmwaiver(this.firmId).subscribe(
    //   data => {
    //     this.regFunds = data.response;
    //     console.log('Firm FIRM regFunds details:', this.regFunds);
    //   },
    //   error => {
    //     console.error('Error fetching Firm regFunds ', error);
    //   }
    // );
  }
}
