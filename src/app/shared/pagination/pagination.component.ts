import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() pageSize: number = 10;
  @Input() items: any[] = [];
  @Output() paginatedItemsChange = new EventEmitter<any[]>();
  
  currentPage: number = 1;
  totalPages: number = 0;
  totalRows: number = 0;
  startRow: number = 0;
  endRow: number = 0;
  paginatedItems: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.currentPage = 1;
      this.updatePagination();
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

  updatePagination(): void {
    const totalRows = this.items.length;
    this.totalRows = totalRows;
    
    this.totalPages = Math.ceil(totalRows / this.pageSize);
  
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, totalRows);
  
    const paginatedItems = this.items.slice(startIndex, endIndex);
    this.paginatedItemsChange.emit(paginatedItems);
    
    this.startRow = startIndex + 1;
    this.endRow = endIndex;
  }

}
