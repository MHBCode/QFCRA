import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-firm-list',
  templateUrl: './firm-list.component.html',
  styleUrls: ['./firm-list.component.scss']
})
export class FirmListComponent implements OnInit, OnChanges {

  @Input() pageSize: number = 10;
  @Input() firms: any[] = [];
  @Input() isMainView: boolean = false;
  isLoading: boolean = true;
  currentPage: number = 1;
  totalPages: number = 0;
  totalRows: number = 0;
  paginatedFirms: any[] = [];
  startRow: number = 0;
  endRow: number = 0;
  showTitle: boolean = true;

  constructor(private router: Router, private firmService: FirmService) { }

  ngOnInit(): void {
    this.updatePagination(); // Initial pagination
    this.checkRoute(); // Check the current route to decide the title visibility
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
    this.router.navigate(['home/firms-page']);
  }

  // Check the current route to display the title correctly
  checkRoute(): void {
    const currentUrl = this.router.url;
    this.showTitle = !currentUrl.includes('home/firms-page');
  }
}

// import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
// import { Router } from '@angular/router';
// import { FirmService } from 'src/app/ngServices/firm.service';

// @Component({
//   selector: 'app-firm-list',
//   templateUrl: './firm-list.component.html',
//   styleUrls: ['./firm-list.component.scss']
// })
// export class FirmListComponent implements OnInit, OnChanges {

//   @Input() pageSize: number = 10;
//   @Input() firms: any[] = [];
//   @Input() isMainView: boolean = false;
//   isLoading: boolean = true;
//   currentPage: number = 1;
//   totalPages: number = 0;
//   totalRows: number = 0;
//   paginatedFirms: any[] = [];
//   startRow: number = 0;
//   endRow: number = 0;
//   showTitle: boolean = true;

//   constructor(private router: Router, private firmService: FirmService) { }

//   ngOnInit(): void {
//     this.checkRoute(); // Check the current route to decide the title visibility
//     this.updatePagination(); // Initial pagination
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     // When firms input changes, apply pagination and sorting
//     if (changes['firms'] && changes['firms'].currentValue) {
//       this.currentPage = 1;  // Reset to first page when data changes
//       this.updatePagination(); // Update pagination whenever firms input changes
//     }
//   }
//   loadFirms(): void {
//     this.firmService.getAssignedFirms(10044).subscribe(
//       data => {
//         this.isLoading = true;
//         this.firms = data.response;
//         console.log('Fetched Firms:', this.firms.length);  // Check how many firms are loaded
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
//   // Update pagination based on current page and page size
//   updatePagination(): void {
//     if (this.firms && this.firms.length > 0) {
//       this.totalRows = this.firms.length;
//       this.totalPages = Math.ceil(this.totalRows / this.pageSize);
//       const startIndex = (this.currentPage - 1) * this.pageSize;
//       const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
//       this.paginatedFirms = this.firms.slice(startIndex, endIndex); // Paginated data
//       this.startRow = startIndex + 1;
//       this.endRow = endIndex;
//     } else {
//       this.paginatedFirms = []; // Reset paginated firms if no data
//     }
//   }

//   // Navigate to the previous page
//   previousPage(): void {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//       this.updatePagination();
//     }
//   }

//   // Navigate to the next page
//   nextPage(): void {
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//       this.updatePagination();
//     }
//   }

//   // Navigate to firm details
//   viewFirm(firmId: number): void {
//     if (firmId) {
//       this.router.navigate(['home/view-firm', firmId]);
//     } else {
//       console.error('Invalid firm ID:', firmId);
//     }
//   }

//   // Go to the firms page
//   goToAllFirms(): void {
//     this.router.navigate(['home/firms-page']);
//   }

//   // Check the current route to display the title correctly
//   checkRoute(): void {
//     const currentUrl = this.router.url;
//     this.showTitle = !currentUrl.includes('home/firms-page');
//   }

//   // Apply sorting and update pagination
//   applySorting(sortOption: string): void {
//     // Implement your sorting logic here, for example:
//     if (sortOption === 'AtoZ') {
//       this.firms.sort((a, b) => a.FirmName.localeCompare(b.FirmName));
//     } else if (sortOption === 'ZtoA') {
//       this.firms.sort((a, b) => b.FirmName.localeCompare(a.FirmName));
//     } else if (sortOption === 'newFirms') {
//       this.firms.sort((a, b) => new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime());
//     } else if (sortOption === 'oldFirms') {
//       this.firms.sort((a, b) => new Date(a.CreatedDate).getTime() - new Date(b.CreatedDate).getTime());
//     }

//     // Reset to the first page after sorting
//     this.currentPage = 1;
//     this.updatePagination();  // Update pagination after sorting
//   }

//   // Apply filtering and update pagination
//   applyFiltering(filteredFirms: any[]): void {
//     this.firms = filteredFirms; // Assign the filtered firms
//     this.currentPage = 1; // Reset to first page after filtering
//     this.updatePagination(); // Update pagination after filtering
//   }
// }
