import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { BreachesService } from 'src/app/ngServices/breaches.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import * as constants from 'src/app/app-constants';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';
@Component({
  selector: 'app-breaches',
  templateUrl: './breaches.component.html',
  styleUrls: ['./breaches.component.scss', '../supervision.scss']
})
export class BreachesComponent {
  FirmWaivers: any;
  isLoading: boolean = false;
  firmId: number = 0;
  firmDetails: any;
  FIRMBreaches: any;
  paginatedBreaches: any = [];
  showPopup: boolean = false;
  showSearchPopup: boolean = false;
  filteredBreaches: any;
  userId : number = 30;
  pageSize: number = 10;
  
  breachesTypes:any;
  breachCategories:any;
  breachLevels:any;
  breachAllStatus:any;
  paginatedItems: any[] = []; 
  showRevision : boolean = false;
  revisionList: any[] = []; 
  selectedRevision: any = null;
  selectedBreach: any = null;

  breachNumber: string | null = null;
  breachType: string | null = null;
  breachCategory: number | null = null;
  breachLevel: string | null = null;
  breachStatus: string | null = null;
  roleId: number | null = null;
  objectOpType: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firmDetailsService: FirmDetailsService,
    private breachesService : BreachesService,
    private securityService: SecurityService,
    private objectwfService : ObjectwfService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.loadFirmDetails(this.firmId);
      this.loadBreaches();
      this.getBreachesCategory();
      this.getBreachesLevel();
      this.getBreachesStatus();
      this.getBreachesTypes();
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

  toggleSearchPopup(): void {
    this.showSearchPopup = !this.showSearchPopup;
  }

  loadBreaches() {
    this.breachesService.getBreachesList({ firmId: this.firmId }).subscribe(
      data => {
        this.filteredBreaches = data.response;
        this.applySearchAndPagination();
      },
      error => {
        console.error('Error fetching FIRMBreaches ', error);
      }
    );
  }

  resetFilters(): void {
    this.setDefaultFilters();
    this.loadBreaches();
  }
  // Set default filter values
  setDefaultFilters(): void {
    this.breachNumber = null;
    this.breachType = null;
    this.breachCategory = null;
    this.breachLevel = null;
    this.breachStatus = null;
    this.roleId = null;
    this.objectOpType = null;
  }

  searchBreaches(): void {
    const params = {
      firmID: this.firmId,
      breachNumber:this.breachNumber,
      breachType:this.breachType,
      breachCategory:this.breachCategory,
      breachLevel:this.breachLevel,
      breachStatus:this.breachStatus,
      roleId:this.roleId,
      objectOpType:this.objectOpType
    };

    this.breachesService.getBreachesList(params).subscribe(
      data => {
        this.filteredBreaches = data.response;
        this.applySearchAndPagination();
        this.toggleSearchPopup();
      },
      error => {
        this.filteredBreaches = [];
        this.toggleSearchPopup();
        console.error('Error fetching filtered breaches ', error);
      }
    );
  }

  applySearchAndPagination(): void {
    this.paginatedItems = this.filteredBreaches.slice(0, this.pageSize); // First page
  }

  updatePaginatedItems(paginatedItems: any[]): void {
    this.paginatedItems = paginatedItems; // Update current page items
  }

  
  getBreachesTypes() {
    this.securityService.getObjectTypeTable(this.userId, constants.breachTypes, constants.ObjectOpType.List)
      .subscribe(data => {
        this.breachesTypes = data.response;
        console.log("General breachesTypes fetched:", this.breachesTypes);
      }, error => {
        console.error("Error fetching breachesTypes:", error);
      });
  }

  getBreachesCategory() {
    this.securityService.getObjectTypeTable(this.userId, constants.breachCategories, constants.ObjectOpType.List)
      .subscribe(data => {
        this.breachCategories = data.response;
        console.log("General breachCategories fetched:", this.breachCategories);
      }, error => {
        console.error("Error fetching breachCategories:", error);
      });
  }

  getBreachesLevel() {
    this.securityService.getObjectTypeTable(this.userId, constants.breachLevelTypes, constants.ObjectOpType.List)
      .subscribe(data => {
        this.breachLevels = data.response;
        console.log("General breachLevels fetched:", this.breachLevels);
      }, error => {
        console.error("Error fetching breachLevels:", error);
      });
  }

  getBreachesStatus() {
    this.securityService.getObjectTypeTable(this.userId, constants.breachStatusTypes, constants.ObjectOpType.List)
      .subscribe(data => {
        this.breachAllStatus = data.response;
        console.log("General breachAllStatus fetched:", this.breachAllStatus);
      }, error => {
        console.error("Error fetching breachAllStatus:", error);
      });
  }


  getRevision(breach: any, event: Event) {
    debugger;
    event.stopPropagation();
    const objectId = constants.FrimsObject.Breach;
    const objectInstanceId = breach.BreachRevNum;
    this.selectedBreach = breach;
    this.objectwfService.getRevisions(objectId, objectInstanceId).subscribe(
      data => {
        this.revisionList = data.response;
        console.log("this.revisionList", this.revisionList)
        if (this.revisionList.length > 0) {
          this.showRevision = true
        }
      },
      error => {
        console.error(error);
      }
    )

  }

  closeRevisionModal() {
    this.showRevision = false;
    this.revisionList = [];
  }

  openViewPopup(breach: any): void {
    this.selectedBreach = breach;
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
    this.selectedRevision = null;
  }

  openRevisionDetails(Revision: any, Breach: any): void {
    this.selectedRevision = Revision;
    this.selectedRevision = Revision;
    this.selectedBreach = Breach;
    this.showPopup = true;
    console.log("this.selectedRevision", this.selectedRevision)
    this.closeRevisionModal()
  }

}
