import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-admin-fee',
  templateUrl: './admin-fee.component.html',
  styleUrls: ['./admin-fee.component.scss','../supervision.scss']
})
export class AdminFeeComponent {
  FirmAdminFees: any;
  isLoading: boolean = false;
  firmId: number = 0;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firmService: FirmService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadAdminFees();
    })
  }

  loadAdminFees() {
    this.isLoading = true;
    this.firmService.getFIRMAdminFees(this.firmId).subscribe(
      data => {
        this.FirmAdminFees = data.response;
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching firm Admin Fees', error);
        this.isLoading = false;
      }
    );
  }
}
