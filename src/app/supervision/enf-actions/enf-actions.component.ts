import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { BreachesService } from 'src/app/ngServices/breaches.service';

@Component({
  selector: 'app-enf-actions',
  templateUrl: './enf-actions.component.html',
  styleUrls: ['./enf-actions.component.scss','../supervision.scss']
})
export class EnfActionsComponent implements OnInit{
  enfActions: any;
  allEnfActions: any;
  isLoading: boolean = false;
  firmId: number = 0;
  paginatedItems: any[] = []; 
  pageSize : number = 10;
  userId : number = 30;
  firmDetails:any;
  showDeletedEnf : boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private breachesService :BreachesService,
    private firmDetailsService: FirmDetailsService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadFirmDetails(this.firmId);
      this.loadEnfActions();
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

  onDeletedEnfToggle(event: Event) {
    this.showDeletedEnf = (event.target as HTMLInputElement).checked;
    this.loadEnfActions();
  }

  loadEnfActions() {
    this.breachesService.getEnfData(this.userId,this.firmId).subscribe(
      data => {
        this.allEnfActions = data.response;
        if(this.showDeletedEnf){
          this.enfActions = this.allEnfActions;
        }
        else{
          this.enfActions = this.allEnfActions.filter(item => !item.IsDeleted);
        }
        this.applySearchAndPagination();
        console.log('Firm FIRM Waivers details:', this.allEnfActions);
      },
      error => {
        console.error('Error fetching Enf Actions', error);
      }
    );
  }

  applySearchAndPagination(): void {
    this.paginatedItems = this.enfActions.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
  }
  
}
