import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { FirmService } from 'src/app/ngServices/firm.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';

@Component({
  selector: 'app-admin-fee',
  templateUrl: './admin-fee.component.html',
  styleUrls: ['./admin-fee.component.scss','../supervision.scss']
})
export class AdminFeeComponent {
  FirmAdminFees: any;
  isLoading: boolean = false;
  firmId: number = 0;
  firmDetails:any;
  pageSize: number = 10; // Define pageSize here
  paginatedItems: any[] = []; 

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firmService: FirmService,
    public dateUtilService: DateUtilService,
    private firmDetailsService: FirmDetailsService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadAdminFees();
      this.loadFirmDetails(this.firmId);
    })
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

  loadAdminFees() {
    this.isLoading = true;
    this.firmService.getFIRMAdminFees(this.firmId).subscribe(
      data => {
        this.FirmAdminFees = data.response;
        this.isLoading = false;
        this.applySearchAndPagination(); // Initialize pagination
      },
      error => {
        console.error('Error fetching firm Admin Fees', error);
        this.isLoading = false;
      }
    );
  }

  applySearchAndPagination(): void {
    this.paginatedItems = this.FirmAdminFees.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
  }

}
