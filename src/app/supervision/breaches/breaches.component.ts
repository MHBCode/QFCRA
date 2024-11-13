import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { BreachesService } from 'src/app/ngServices/breaches.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import * as constants from 'src/app/app-constants';
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
  filteredBreaches: any;
  userId : number = 30;
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;
  totalRows: number = 0;
  startRow: number = 0;
  endRow: number = 0;
  breachesTypes:any;
  breachCategories:any;
  breachLevels:any;
  breachAllStatus:any;

  breachNumber: string | null = null;
  breachType: string | null = null;
  breachCategory: number | null = null;
  breachLevel: string | null = null;
  breachStatus: string | null = null;
  roleId: number | null = null;
  objectOpType: number | null = null;

  objectOpTypeList = constants.ObjectOpType.List;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firmDetailsService: FirmDetailsService,
    private breachesService : BreachesService,
    private securityService: SecurityService
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

  togglePopup(): void {
    this.showPopup = !this.showPopup;
  }

  loadBreaches() {
    this.breachesService.getBreachesList({ firmId: this.firmId }).subscribe(
      data => {
        this.FIRMBreaches = data.response;
        this.filteredBreaches = data.response;
        console.log('filteredBreaches',this.filteredBreaches);
        this.totalRows = this.filteredBreaches.length;
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        this.updatePagination();
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching FIRMBreaches ', error);
      }
    );
  }

  resetFilters(): void {
    this.setDefaultFilters();
    this.updatePagination();
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
        this.togglePopup();
      },
      error => {
        this.filteredBreaches = [];
        this.togglePopup();
        console.error('Error fetching filtered breaches ', error);
      }
    );
  }


  // Update pagination based on current page and page size
  updatePagination(): void {
    if (this.FIRMBreaches && this.FIRMBreaches.length > 0) {
      this.totalRows = this.FIRMBreaches.length;
      this.totalPages = Math.ceil(this.totalRows / this.pageSize);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
      this.filteredBreaches = this.FIRMBreaches.slice(startIndex, endIndex); // Paginated data
      this.startRow = startIndex + 1;
      this.endRow = endIndex;
    } else {
      this.filteredBreaches = []; // Reset paginated firms if no data
    }
  }

  // Navigate to the previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // Navigate to the next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  
  getBreachesTypes() {
    this.securityService.getobjecttypetableEdit(this.userId, constants.breachTypes, this.objectOpTypeList)
      .subscribe(data => {
        this.breachesTypes = data.response;
        console.log("General breachesTypes fetched:", this.breachesTypes);
      }, error => {
        console.error("Error fetching breachesTypes:", error);
      });
  }

  getBreachesCategory() {
    this.securityService.getobjecttypetableEdit(this.userId, constants.breachCategories, this.objectOpTypeList)
      .subscribe(data => {
        this.breachCategories = data.response;
        console.log("General breachCategories fetched:", this.breachCategories);
      }, error => {
        console.error("Error fetching breachCategories:", error);
      });
  }

  getBreachesLevel() {
    this.securityService.getobjecttypetableEdit(this.userId, constants.breachLevelTypes, this.objectOpTypeList)
      .subscribe(data => {
        this.breachLevels = data.response;
        console.log("General breachLevels fetched:", this.breachLevels);
      }, error => {
        console.error("Error fetching breachLevels:", error);
      });
  }

  getBreachesStatus() {
    this.securityService.getobjecttypetableEdit(this.userId, constants.breachStatusTypes, this.objectOpTypeList)
      .subscribe(data => {
        this.breachAllStatus = data.response;
        console.log("General breachAllStatus fetched:", this.breachAllStatus);
      }, error => {
        console.error("Error fetching breachAllStatus:", error);
      });
  }


}
