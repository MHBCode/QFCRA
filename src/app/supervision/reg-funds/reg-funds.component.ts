import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { RegisteredfundService } from 'src/app/ngServices/registeredfund.service';

@Component({
  selector: 'app-reg-funds',
  templateUrl: './reg-funds.component.html',
  styleUrls: ['./reg-funds.component.scss','../supervision.scss']
})
export class RegFundsComponent {
  regFunds: any;
  isLoading: boolean = false;
  firmId: number = 0;
  userId:number = 30;
  paginatedItems: any[] = []; 
  pageSize : number = 10;
  firmDetails:any;
  selectedRegisteredFund:any;
  showPopup: boolean = false;
  showCreatePopup: boolean = false;
  popupMode: 'create' | 'view' = 'view';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private registeredFundService: RegisteredfundService,
    private firmDetailsService: FirmDetailsService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadFirmDetails(this.firmId);
      this.loadRegFunds();
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

  loadRegFunds() {
    this.registeredFundService.getFIRMRegisteredFund(this.userId,this.firmId).subscribe(
      data => {
        this.regFunds = data.response;
        this.applySearchAndPagination();
        console.log("regFunds", this.regFunds)
      },
      error => {
        console.error('Error fetching Firm regFunds ', error);
      }
    );
  }


  applySearchAndPagination(): void {
    this.paginatedItems = this.regFunds.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
  }

  openRegisteredFundPopup(reg: any,firmDetails : any): void {
    this.selectedRegisteredFund = reg;
    this.showPopup = true;
    this.popupMode = 'view';
    console.log("openRegisteredFundPopup")
  }
  closePopup(): void {
    this.showPopup = false;
    this.selectedRegisteredFund = null; // Reset the selected review
  }
   

  //////// Create Registered Funds
  closeCreatePopup(){
    this.showCreatePopup = false;
  }
  openCreatePopup(): void {
    this.popupMode = 'create';
    this.showCreatePopup = true;
  }
}
