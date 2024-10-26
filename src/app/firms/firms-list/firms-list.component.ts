import { Component, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { FirmService } from '../firm.service';

@Component({
  selector: 'firms-list',
  templateUrl: './firms-list.component.html',
  styleUrls: ['./firms-list.component.scss']
})
export class FirmsListComponent {

  @Input() pageSize: number = 10;
  @Input() firms: any[] = [];
  @Input() isMainView: boolean = false;
  @Input() showTitle: boolean = true;
  isLoading: boolean = true;
  currentPage: number = 1;
  totalPages: number = 0;
  totalRows: number = 0;
  paginatedFirms: any[] = [];
  startRow: number = 0;
  endRow: number = 0;

  constructor(private router: Router, private firmService: FirmService) { }

  ngOnInit(): void {
    this.updatePagination(); // Initial pagination
    this.loadFirms();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['firms'] && changes['firms'].currentValue) {
      this.updatePagination(); // Update pagination whenever firms input changes
    }
  }

  loadFirms(): void {
    this.firmService.getAssignedFirms(10044).subscribe(
      data => {
        this.isLoading = true;
        this.firms = data.response;
        this.totalRows = this.firms.length;
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        this.updatePagination();
        this.isLoading = false;
        console.log(this.firms)

      },
      error => {
        console.error('Error fetching firms', error);
        this.isLoading = false;
      }

    );
  }

  // Update pagination based on current page and page size
  updatePagination(): void {
    if (this.firms && this.firms.length > 0) {
      this.totalRows = this.firms.length;
      this.totalPages = Math.ceil(this.totalRows / this.pageSize);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
      this.paginatedFirms = this.firms.slice(startIndex, endIndex); // Paginated data
      this.startRow = startIndex + 1;
      this.endRow = endIndex;
    } else {
      this.paginatedFirms = []; // Reset paginated firms if no data
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

  // Navigate to firm details
  viewFirm(firmId: number): void {
    if (firmId) {
      this.router.navigate(['firms/view', firmId]);
    } else {
      console.error('Invalid firm ID:', firmId);
    }
  }

  // Go to the firms page
  goToAllFirms(): void {
    this.router.navigate(['firms']);
  }

}
