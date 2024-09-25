// import { Component, Input, OnInit } from '@angular/core';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-firm-list',
//   templateUrl: './firm-list.component.html',
//   styleUrls: ['./firm-list.component.scss']
// })
// export class FirmListComponent implements OnInit {

//   @Input() listCount: number = 5;
//   @Input() firms: any[] = [];
//   @Input() isMainView: boolean = false;

//   isExpanded: { [key: string]: boolean } = {};
//   isLoading: boolean = true;
//   currentPage: number = 1;
//   pageSize: number = 10;
//   totalPages: number = 0;
//   totalRows: number = 0;
//   paginatedFirms: any[] = [];
//   startRow: number = 0;
//   endRow: number = 0;
//   showTitle: boolean = true;

//   constructor(
//     private router: Router,
//     private firmService: FirmService
//   ) { }

//   ngOnInit(): void {
//     this.loadFirms();
//     this.checkRoute();
//   }

//   loadFirms(): void {
//     this.firmService.getAssignedFirms(10044).subscribe(
//       data => {
//         this.firms = data.response;
//         this.totalRows = this.firms.length;
//         this.totalPages = Math.ceil(this.totalRows / this.pageSize);
//         this.updatePagination();
//         this.isLoading = false;
//       },
//       error => {
//         console.error('Error fetching firms', error);
//         this.isLoading = false;
//       }
//     );
//   }

//   updatePagination(): void {
//     const startIndex = (this.currentPage - 1) * this.pageSize;
//     const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
//     this.paginatedFirms = this.firms.slice(startIndex, endIndex);
//     this.startRow = startIndex + 1;
//     this.endRow = endIndex;
//   }

//   previousPage(): void {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//       this.updatePagination();
//     }
//   }

//   nextPage(): void {
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//       this.updatePagination();
//     }
//   }

//   viewFirm(firmId: number) {
//     if (firmId) {
//       console.log("Navigating to firm with ID:", firmId);
//       this.router.navigate(['home/view-firm', firmId]);
//     } else {
//       console.error('Invalid firm ID:', firmId);
//     }
//   }

//   goToAllFirms() {
//     this.router.navigate(['home/firms-page']);
//   }

//   checkRoute(): void {
//     const currentUrl = this.router.url;
//     this.showTitle = !currentUrl.includes('home/firms-page');
//   }

// }
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-firm-list',
  templateUrl: './firm-list.component.html',
  styleUrls: ['./firm-list.component.scss']
})
export class FirmListComponent implements OnInit, OnChanges {

  @Input() listCount: number = 5;
  @Input() firms: any[] = [];
  @Input() isMainView: boolean = false;

  isLoading: boolean = true;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRows: number = 0;
  paginatedFirms: any[] = [];
  startRow: number = 0;
  endRow: number = 0;
  showTitle: boolean = true;

  constructor(private router: Router, private firmService: FirmService) {}

  ngOnInit(): void {
    this.updatePagination(); // Initial pagination
    this.checkRoute(); // Check the current route to decide the title visibility
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['firms'] && changes['firms'].currentValue) {
      this.updatePagination(); // Update pagination whenever firms input changes
    }
  }

  // Update pagination based on current page and page size
  updatePagination(): void {
    if (this.firms && this.firms.length > 0) {
      this.totalRows = this.firms.length;
      this.totalPages = Math.ceil(this.totalRows / this.pageSize);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
      this.paginatedFirms = this.firms.slice(startIndex, endIndex);
      this.startRow = startIndex + 1;
      this.endRow = endIndex;
    } else {
      this.paginatedFirms = []; // Reset paginated firms if no data
    }
    this.isLoading = false; // Turn off loading indicator
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
      this.router.navigate(['home/view-firm', firmId]);
    } else {
      console.error('Invalid firm ID:', firmId);
    }
  }

  // Go to the firms page
  goToAllFirms(): void {
    this.router.navigate(['home/firms-page']);
  }

  // Check the current route to display the title correctly
  checkRoute(): void {
    const currentUrl = this.router.url;
    this.showTitle = !currentUrl.includes('home/firms-page');
  }
}
