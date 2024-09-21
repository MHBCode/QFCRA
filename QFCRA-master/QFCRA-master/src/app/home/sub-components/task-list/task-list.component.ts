import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskServiceService } from 'src/app/ngServices/task-service.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {

  @Input() listCount: number = 50;
  @Input() isMainView: boolean = false;
  @Input() customClass: string = '';
  Tasks: any[] = [];
  paginatedTasks: any[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalTasks: number = 0;
  totalPages: number = 0;
  startRow: number = 0;
  endRow: number = 0;
  showTitle: boolean = true;
  isExpanded: { [key: string]: boolean } = {};
  isLoading: boolean = true;
  totalRows: number = 0;

  constructor(
    private TaskService: TaskServiceService,
    private router: Router,
  ) { };

  ngOnInit(): void {
    this.getTasksList();
    this.checkRoute();
  }

  getTasksList(): void {
    this.TaskService.getAssignedTaskReminders(30).subscribe(
      data => {
        this.Tasks = data.response;
        this.totalRows = this.Tasks.length;
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        this.updatePagination();
        console.log("Tasks Reminders: ", this.Tasks)
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching Tasks', error);
        this.isLoading = false;
      }
    )
  }

  goToAllTasks() {
    this.router.navigate(['home/tasks-page']);
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
    this.paginatedTasks = this.Tasks.slice(startIndex, endIndex);
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
  checkRoute(): void {
    const currentUrl = this.router.url;
    this.showTitle = !currentUrl.includes('home/tasks-page');
  }
}