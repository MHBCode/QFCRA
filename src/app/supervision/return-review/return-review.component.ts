import { Component, Input, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { FirmService } from 'src/app/ngServices/firm.service';
import { ActivatedRoute } from '@angular/router';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { LogformService } from 'src/app/ngServices/logform.service'; 


@Component({
  selector: 'app-return-review',
  templateUrl: './return-review.component.html',
  styleUrls: ['./return-review.component.scss', '../supervision.scss']
})
export class ReturnReviewComponent implements OnInit, OnChanges {
  allReturnreView: any[] = [];
  filteredReturnreView: any[] = [];
  firmId: number = 0;
  isAuthorise: boolean = true;
  isLoading: boolean = false;
  currentPage: number = 1;
  totalPages: number = 0;
  totalRows: number = 0;
  paginatedFirms: any[] = [];
  startRow: number = 0;
  endRow: number = 0;
  @Input() pageSize: number = 10;
  firmDetails: any;
  constructor(
    private firmService: FirmService,
    private route: ActivatedRoute,
    private firmDetailsService: FirmDetailsService,
    private logformService: LogformService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.isFirmAuthorised();
    });
    this.loadFirmDetails(this.firmId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageSize'] && !changes['pageSize'].firstChange) {
      this.updatePagination(); // Update pagination if pageSize input changes
    }
  }

  isFirmAuthorised() {
    this.firmService.checkisFirmAuthorised(this.firmId).subscribe(
      data => {
        this.isAuthorise = data.response;
        this.getReturnReviewList();
      },
      error => {
        console.error('Error fetching Firm Waivers ', error);
      }
    );
  }

  getReturnReviewList() {
    this.isLoading = true;
    this.firmService.getReturnReviewList(this.firmId).subscribe(
      data => {
        this.allReturnreView = data.response || [];
        this.filteredReturnreView = [...this.allReturnreView]; // Initialize filtered array with all data
        this.totalRows = this.filteredReturnreView.length;
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        this.currentPage = 1;
        this.updatePagination();
        this.isLoading = false;
        console.log(this.allReturnreView)
      },
      error => {
        console.error('Error fetching rptSchedule', error);
        this.isLoading = false;
      }
    );
  }

  filterReports(event: Event): void {
    const filterValue = (event.target as HTMLSelectElement).value;
    
    switch (filterValue) {
      case '1': // All
        this.filteredReturnreView = [...this.allReturnreView];
        break;
      case '2': // Non - AML Reports
        this.filteredReturnreView = this.allReturnreView.filter(item => item.RptReviewRevNum == 2);
        break;
      case '3': // AML Reports
        this.filteredReturnreView = this.allReturnreView.filter(item => item.RptReviewRevNum == 3);
        break;
      default:
        this.filteredReturnreView = [...this.allReturnreView];
    }
  
    this.totalRows = this.filteredReturnreView.length;
    this.totalPages = Math.ceil(this.totalRows / this.pageSize);
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    if (this.filteredReturnreView.length > 0) {
      this.totalRows = this.filteredReturnreView.length;
      this.totalPages = Math.ceil(this.totalRows / this.pageSize);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
      this.paginatedFirms = this.filteredReturnreView.slice(startIndex, endIndex);
      this.startRow = startIndex + 1;
      this.endRow = endIndex;
    } else {
      this.paginatedFirms = [];
      this.startRow = 0;
      this.endRow = 0;
      this.totalPages = 0;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
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

  documentTypeList:any = [];
  getDocumentType(docCategoryTypeID:number){
    this.logformService.getDocumentType(docCategoryTypeID).subscribe(
      data => {
        this.documentTypeList = data.response;
      },
      error => {
        console.error(error);
      }
    )
  }
  
}
