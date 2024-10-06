import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TaskServiceService } from 'src/app/ngServices/task-service.service';
import * as constants from 'src/app/app-constants';
import { FirmService } from 'src/app/ngServices/firm.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tasks-i-assigned',
  templateUrl: './tasks-i-assigned.component.html',
  styleUrls: ['./tasks-i-assigned.component.scss']
})
export class TasksIAssignedComponent implements OnInit {
  userId = 30 // must be dynamic
  @Input() pageSize: number = 10;
  isLoading: boolean = true;
  TaskUserHaveAssignedTasksTo: any[] = [];
  filteredTasks: any[] = [];
  taskTypes: string[] = [];
  firmNames: string[] = [];
  usersAssignedTaskTo: string[] = [];
  paginatedTasks: any[] = [];
  totalRows: number = 0;
  totalPages: number = 0;
  currentPage: number = 1;
  startRow: number = 0;
  endRow: number = 0;

  TaskDropdownVisible: boolean = false;
  FirmsDropdownVisible: boolean = false;
  dueDateInputVisible: boolean = false;
  daysOverDueDropdownVisible: boolean = false;
  showTaskPopup: boolean = false;
  UsersAssignedToDropdownVisible: boolean = false;

  hasValidationErrors: boolean = false;
  /* error messages */
  errorMessages: { [key: string]: string } = {};

  selectedTaskType: string = '';
  selectedFirmName: string = '';
  selectedDueDate: string = '';
  selectedDaysOverDue: string = '';
  selectedUsersAssignedTo: string = '';
  selectedTask: any = null;
  safeHtmlDescription: SafeHtml = ''; // for html tags
  noteText: string = '';

  constructor(
    private TaskService: TaskServiceService,
    private firmService: FirmService,
    private router: Router,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.loadTasksUserAssignedTo();
  }

  loadTasksUserAssignedTo(): void {
    this.isLoading = true;
    this.TaskService.getMyTasksAssignedByUser(this.userId).subscribe(
      data => {
        this.TaskUserHaveAssignedTasksTo = data.response;
        this.filteredTasks = [...this.TaskUserHaveAssignedTasksTo];  // Initialize with all tasks
        this.totalRows = this.TaskUserHaveAssignedTasksTo.length;
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        this.getTaskTypes();
        this.getFirmNames();
        this.getTaskAssignedToUsers();
        this.updatePagination();  // Apply pagination after fetching tasks
        this.isLoading = false;
        console.log('Task list loaded at: ', new Date());  // Log when data is loaded
      },
      error => {
        console.error('Error fetching Tasks', error);
        this.isLoading = false;
      }
    );
  }

  // Get unique task types from the task
  getTaskTypes(): void {
    const types = this.TaskUserHaveAssignedTasksTo.map(task => task.TaskType);
    this.taskTypes = Array.from(new Set(types)).sort(); // Remove duplicates
    console.log(this.taskTypes);
  }

  // Get unique firm names from the task list
  getFirmNames() {
    const firms = this.TaskUserHaveAssignedTasksTo.map(task => task.FirmName);
    this.firmNames = Array.from(new Set(firms)).sort();
    console.log(this.firmNames);
  }

  // Get unique assigned task to usernames from the task list
  getTaskAssignedToUsers() {
    const taskAssignedTo = this.TaskUserHaveAssignedTasksTo.map(task => task.TaskAssignedToUserName);
    this.usersAssignedTaskTo = Array.from(new Set(taskAssignedTo)).sort();
    console.log(this.usersAssignedTaskTo);
  }

  filterTasks(): void {
    this.filteredTasks = this.TaskUserHaveAssignedTasksTo.filter(task => {
      const dueDateFormatted = this.convertApiDateToStandard(task.TaskDueDate);
      const daysDue = task.DaysOverDue;

      // Check for matching conditions
      const matchesTaskType = this.selectedTaskType === '' || task.TaskType === this.selectedTaskType;
      const matchesFirmName = this.selectedFirmName === '' || task.FirmName === this.selectedFirmName;
      const matchesDueDate = this.selectedDueDate === '' || dueDateFormatted === this.selectedDueDate;
      const matchesPrimarySupervisor = this.selectedUsersAssignedTo === '' || task.TaskAssignedToUserName === this.selectedUsersAssignedTo;


      // Handle Days Over Due filtering
      let matchesDaysOverDue = true; // Default to true for "All"
      if (this.selectedDaysOverDue === '>10') {
        matchesDaysOverDue = daysDue > 10;
      } else if (this.selectedDaysOverDue === '>20') {
        matchesDaysOverDue = daysDue > 20;
      } else if (this.selectedDaysOverDue === '>30') {
        matchesDaysOverDue = daysDue > 30;
      } else if (this.selectedDaysOverDue === '>40') {
        matchesDaysOverDue = daysDue > 40;
      }

      return matchesTaskType && matchesFirmName && matchesDueDate && matchesDaysOverDue && matchesPrimarySupervisor;
    });

    // Update pagination
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
    this.filteredTasks = this.TaskUserHaveAssignedTasksTo.filter(task => {
      let matchesDaysOverDue = true; // Default to true for "All"
      if (this.selectedDaysOverDue === '>10') {
        matchesDaysOverDue = task.DaysOverDue > 10;
      } else if (this.selectedDaysOverDue === '>20') {
        matchesDaysOverDue = task.DaysOverDue > 20;
      } else if (this.selectedDaysOverDue === '>30') {
        matchesDaysOverDue = task.DaysOverDue > 30;
      } else if (this.selectedDaysOverDue === '>40') {
        matchesDaysOverDue = task.DaysOverDue > 40;
      }
      return matchesDaysOverDue; // Ensure return for the filter
    });
    // Automatically close the dropdown after selecting an option
    this.filterTasks(); // Further refine filters (if any)
    this.daysOverDueDropdownVisible = false;
  }

  filterByTasksAssignedToUser(selectedUser: string): void {
    this.selectedUsersAssignedTo = selectedUser;
    this.filterTasks();  // Apply both filters
    this.UsersAssignedToDropdownVisible = false;  // Close the dropdown after selection
  }

  toggleTaskPopup(selectedRow: any) {
    this.isLoading = true;  // Set loader active before making the request
    this.showTaskPopup = !this.showTaskPopup;  // Toggle popup visibility

    // Fetch task details using the new endpoint
    this.TaskService.getMyTaskByObjectDetails(
      selectedRow.ObjectID,
      selectedRow.ObjectInstanceID,
      selectedRow.ObjectInstanceRevNum
    ).subscribe(
      (data: any) => {
        this.selectedTask = data.response;  // Replace the selected task with detailed data from the new endpoint
        console.log('Detailed task data:', this.selectedTask);

        // If LongDescription exists, sanitize it for display
        if (this.selectedTask[0]?.LongDescription) {
          const updatedDescription = this.selectedTask[0].LongDescription.replace(/<BR\s*\/?>\s*<BR\s*\/?>/, '');
          this.safeHtmlDescription = this.sanitizer.bypassSecurityTrustHtml(updatedDescription);
        }

        // Initialize the note text area for adding a new note
        this.noteText = '';
        this.isLoading = false;  // Stop loader after data is loaded
      },
      (error: any) => {
        console.error('Error fetching detailed task data', error);
        this.isLoading = false;  // Stop loader on error as well
      }
    );
  }

  closeTaskPopup() {
    this.showTaskPopup = false;
    this.errorMessages = {};
  }

  prepareNoteObject() {
    return {
        objectID: this.selectedTask[0].ObjectID,
        objectInstanceID: parseInt(this.selectedTask[0].ObjectInstanceID, 10),
        objectInstanceRevNum: this.selectedTask[0].ObjectInstanceRevNum,
        notes: this.noteText,
        createdBy: this.userId,
    };
  }


  saveNote() {
    this.isLoading = true;
    this.hasValidationErrors = false;
    const note = this.prepareNoteObject();

    if (this.noteText === null || this.noteText === '') {
      this.getErrorMessages('note');
      this.hasValidationErrors = true;
      this.isLoading = false;
    } else {
      delete this.errorMessages['note'];
    }

    // Step 2: Handle Validation Errors
    if (this.hasValidationErrors) {
      this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      return; // Prevent further action if validation fails
    }
  
    // Start the note save and task reload in parallel
    const saveNotePromise = this.TaskService.saveReminderNote(note).toPromise();
    const loadTasksPromise = this.TaskService.getMyTasksAssignedByUser(this.userId).toPromise();
  
    Promise.all([saveNotePromise, loadTasksPromise])
      .then(([saveNoteResponse, loadTasksResponse]) => {
        console.log('Note updated successfully:', saveNoteResponse);
        
        // Update the task list after saving the note
        this.TaskUserHaveAssignedTasksTo = loadTasksResponse.response;
        this.filteredTasks = [...this.TaskUserHaveAssignedTasksTo];
        this.totalRows = this.TaskUserHaveAssignedTasksTo.length;
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        this.updatePagination();
  
        this.showTaskPopup = false;
        this.isLoading = false;
        this.noteText = '';
        console.log('Task list reloaded after note save:', new Date());
      })
      .catch(error => {
        console.error('Error:', error);
        this.isLoading = false;
      });
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

  toggleUsersAssignedToDropdown(): void {
    this.UsersAssignedToDropdownVisible = !this.UsersAssignedToDropdownVisible;
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

  getErrorMessages(fieldName: string) {
    let errorMessage = 'Please Enter the Note';
    this.errorMessages[fieldName] = errorMessage;
}

  showErrorAlert(messageKey: number) {
    this.firmService.errorMessages(messageKey).subscribe(
      (response) => {
        Swal.fire({
          title: 'Alert!',
          text: response.response,
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      },
    );
  }
}