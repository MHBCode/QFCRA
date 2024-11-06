import { Component, Input, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { FirmService } from 'src/app/ngServices/firm.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-return-review',
  templateUrl: './return-review.component.html',
  styleUrls: ['./return-review.component.scss', '../supervision.scss']
})
export class ReturnReviewComponent implements OnInit, OnChanges {
  allReturnreView: any[] = [];
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

  constructor(
    private firmService: FirmService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      this.isFirmAuthorised();
    });
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
        this.totalRows = this.allReturnreView.length;
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        this.currentPage = 1; // Reset to the first page whenever new data is fetched
        this.updatePagination();
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching rptSchedule', error);
        this.isLoading = false;
      }
    );
  }

  updatePagination(): void {
    if (this.allReturnreView.length > 0) {
      this.totalRows = this.allReturnreView.length;
      this.totalPages = Math.ceil(this.totalRows / this.pageSize);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
      this.paginatedFirms = this.allReturnreView.slice(startIndex, endIndex);
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
}