import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
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
  pageSize: number = 10; // Define pageSize here
  paginatedItems: any[] = []; 
  firmDetails:any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private waiverService: WaiverService,
    private firmDetailsService: FirmDetailsService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadWaivers();
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

  loadWaivers() {
    this.waiverService.getFirmwaiver(this.firmId).subscribe(
      data => {
        this.FirmWaivers = data.response;
        this.applySearchAndPagination();
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }

  applySearchAndPagination(): void {
    this.paginatedItems = this.FirmWaivers.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
  }
}
