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
  Tasks: any[] = [];
  taskTypes: string[] = [];
  firmNames: string[] = [];
  filteredTasks: any[] = [];
  paginatedTasks: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalTasks: number = 0;
  totalPages: number = 0;
  startRow: number = 0;
  endRow: number = 0;
  showTitle: boolean = true;
  isLoading: boolean = true;
  totalRows: number = 0;
  TaskDropdownVisible: boolean = false;
  FirmsDropdownVisible: boolean = false;
  dueDateInputVisible: boolean = false;
  daysOverDueDropdownVisible: boolean = false;

  selectedTaskType: string = '';
  selectedFirmName: string = '';
  selectedDueDate: string = '';
  selectedDaysOverDue: string = '';

  constructor(
    private TaskService: TaskServiceService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getTasksList();
    this.checkRoute();
  }

  getTasksList(): void {
    this.TaskService.getAssignedTaskReminders(30).subscribe(
      data => {
        this.Tasks = data.response;
        this.filteredTasks = [...this.Tasks];  // Initialize with all tasks
        this.totalRows = this.Tasks.length;
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        this.getTaskTypes();
        this.getFirmNames();
        this.updatePagination();  // Apply pagination after fetching tasks
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching Tasks', error);
        this.isLoading = false;
      }
    )
  }

  // Get unique task types from the task list
  getTaskTypes(): void {
    const types = this.Tasks.map(task => task.TaskType);
    this.taskTypes = Array.from(new Set(types)).sort(); // Remove duplicates
    console.log(this.taskTypes);
  }

  // Get unique firm names from the task list
  getFirmNames() {
    const firms = this.Tasks.map(task => task.FirmName);
    this.firmNames = Array.from(new Set(firms)).sort();
    console.log(this.firmNames);
  }

  toggleTaskDropdown(): void {
    this.TaskDropdownVisible = !this.TaskDropdownVisible;
  }

  toggleFirmDropdown(): void {
    this.FirmsDropdownVisible = !this.FirmsDropdownVisible;
  }

  toggleDueDateInput(): void {
    this.dueDateInputVisible = !this.dueDateInputVisible;
  }

  toggleDaysOverDueDropdown(): void {
    this.daysOverDueDropdownVisible = !this.daysOverDueDropdownVisible;
  }

  goToAllTasks() {
    this.router.navigate(['home/tasks-page']);
  }


  filterTasks(): void {
    this.filteredTasks = this.Tasks.filter(task => {
      const dueDateFormatted = this.convertApiDateToStandard(task.TaskDueDate);
      const daysDue = task.DaysOverDue
      const matchesTaskType = this.selectedTaskType === '' || task.TaskType === this.selectedTaskType;
      const matchesFirmName = this.selectedFirmName === '' || task.FirmName === this.selectedFirmName;
      const matchesDueDate = this.selectedDueDate === '' || dueDateFormatted === this.selectedDueDate;
      const matchDaysOverDue = this.selectedDaysOverDue === '' || daysDue === this.selectedDaysOverDue;
      return matchesTaskType && matchesFirmName && matchesDueDate && matchDaysOverDue;
    });

    this.currentPage = 1;
    this.totalRows = this.filteredTasks.length;
    this.totalPages = Math.ceil(this.totalRows / this.pageSize);
    this.updatePagination();
  }


  filterByTaskType(selectedType: string): void {
    this.selectedTaskType = selectedType;
    this.filterTasks();  // Apply both filters
    this.TaskDropdownVisible = false;  // Close the dropdown after selection
  }


  filterByFirmName(selectedFirm: string): void {
    this.selectedFirmName = selectedFirm;
    this.filterTasks();  // Apply both filters
    this.FirmsDropdownVisible = false;  // Close the dropdown after selection
  }

  filterByDueDate(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const selectedDate = inputElement.value;
    this.selectedDueDate = selectedDate;
    this.filterTasks();  // Apply all filters
    this.dueDateInputVisible = false;
  }

  filterByDaysOverDue(selectedValue: string): void {
    this.selectedDaysOverDue = selectedValue;

    this.filteredTasks = this.Tasks.filter(task => {
      const matchesTaskType = this.selectedTaskType === '' || task.TaskType === this.selectedTaskType;
      const matchesFirmName = this.selectedFirmName === '' || task.FirmName === this.selectedFirmName;
      const matchesDueDate = this.selectedDueDate === '' || this.convertApiDateToStandard(task.DueDate) === this.selectedDueDate;

      // Apply Days Over Due filter
      let matchesDaysOverDue = true;  // Default is true (for "All")

      if (this.selectedDaysOverDue === '>10') {
        matchesDaysOverDue = task.DaysOverDue > 10;
      } else if (this.selectedDaysOverDue === '>20') {
        matchesDaysOverDue = task.DaysOverDue > 20;
      } else if (this.selectedDaysOverDue === '>30') {
        matchesDaysOverDue = task.DaysOverDue > 30;
      } else if (this.selectedDaysOverDue === '>40') {
        matchesDaysOverDue = task.DaysOverDue > 40;
      }

      return matchesTaskType && matchesFirmName && matchesDueDate && matchesDaysOverDue;
    });

    this.currentPage = 1;
    this.totalRows = this.filteredTasks.length;
    this.totalPages = Math.ceil(this.totalRows / this.pageSize);
    this.updatePagination();

    // Automatically close the dropdown after selecting an option
    this.daysOverDueDropdownVisible = false;
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);
    this.paginatedTasks = this.filteredTasks.slice(startIndex, endIndex);
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

  convertApiDateToStandard(dateStr: string): string {
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    const [day, month, year] = dateStr.split('/');
    const monthNumber = months[month];

    // Return the date in 'YYYY-MM-DD' format
    return `${year}-${monthNumber}-${day.padStart(2, '0')}`;
  }
}
