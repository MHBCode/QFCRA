import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-firm-list',
  templateUrl: './firm-list.component.html',
  styleUrls: ['./firm-list.component.scss']
})
export class FirmListComponent implements OnInit {

  @Input() listCount: number = 5;
  @Input() firms: any[] = [];
  @Input() customClass: string = '';

  isExpanded: { [key: string]: boolean } = {};
  isLoading: boolean = true;
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  totalRows: number = 0;
  paginatedFirms: any[] = [];
  startRow: number = 0;
  endRow: number = 0;
  showTitle: boolean = true;

  constructor(
    private router: Router,
    private firmService: FirmService
  ) { }

  ngOnInit(): void {
    this.loadFirms();
    this.checkRoute();
  }

  loadFirms(): void {
    this.firmService.getAssignedFirms(10044).subscribe(
      data => {
        this.firms = data.response;
        this.totalRows = this.firms.length;
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        this.updatePagination();
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching firms', error);
        this.isLoading = false;
      }
    );
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
    this.paginatedFirms = this.firms.slice(startIndex, endIndex);
    this.startRow = startIndex + 1;
    this.endRow = endIndex;
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

  viewFirm(firmId: number) {
    if (firmId) {
      console.log("Navigating to firm with ID:", firmId);
      this.router.navigate(['home/view-firm', firmId]);
    } else {
      console.error('Invalid firm ID:', firmId);
    }
  }

  goToAllFirms() {
    this.router.navigate(['home/firms-page']);
  }

  checkRoute(): void {
    const currentUrl = this.router.url;
    this.showTitle = !currentUrl.includes('home/firms-page');
  }

}
