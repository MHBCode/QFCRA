import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import flatpickr from 'flatpickr';
import { FirmService } from 'src/app/ngServices/firm.service';
import { TaskServiceService } from 'src/app/ngServices/task-service.service';
import { UsersService } from 'src/app/ngServices/users.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import Swal from 'sweetalert2';
import * as constants from 'src/app/app-constants';
import * as XLSX from 'xlsx';
import { LogformService } from 'src/app/ngServices/logform.service';
@Component({
  selector: 'app-my-team-tasks',
  templateUrl: './my-team-tasks.component.html',
  styleUrls: ['./my-team-tasks.component.scss']
})
export class MyTeamTasksComponent implements OnInit {

  @ViewChildren('dateInputs') dateInputs: QueryList<ElementRef<HTMLInputElement>>;

  userId = 10044;
  Users: any = [];
  managers: any[] = [];
  teamMembers: any[] = [];
  expandedManagers: Set<number> = new Set<number>();
  teamMembersByManager: { [managerId: number]: any[] } = {};
  checkedMembers: { [key: number]: boolean } = {};
  tasks: any[] = [];

  @Input() pageSize: number = 10;
  isLoading: boolean = true;
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

  /* error messages */
  hasValidationErrors: boolean = false;
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
    private userService: UsersService,
    private taskService: TaskServiceService,
    private dateUtilService: DateUtilService,
    private firmService: FirmService,
    private logForm: LogformService,
    private sanitizer: DomSanitizer,
  ) { }


  ngOnInit(): void {
    this.userTeamMembers();
  }

  ngAfterViewInit() {
    // Ensure the query list is available
    this.dateInputs.changes.subscribe(() => {
      this.initializeFlatpickr();
    });
    // Initialize Flatpickr if already available
    this.initializeFlatpickr();
  }

  initializeFlatpickr() {
    this.dateInputs.forEach((input: ElementRef<HTMLInputElement>) => {
      flatpickr(input.nativeElement, {
        allowInput: true,
        dateFormat: 'd/M/Y', // Adjust date format as needed
        onChange: (selectedDates, dateStr) => {
          console.log('Selected Date:', selectedDates);
          console.log('Formatted Date String:', dateStr);
          input.nativeElement.value = dateStr;
        }
      });
    });
  }


  userTeamMembers() {
    this.isLoading = true;
    this.userService.getUsersHierarchyByParent(this.userId).subscribe(data => {
      const members = data.response;
      this.organizeTeamMembers(members);
      this.isLoading = false;
    }, error => {
      console.error('Error Fetching Team Members:', error);
      this.isLoading = false;
    });
  }

  organizeTeamMembers(members: any[]) {
    members.forEach(member => {
      const managerId = member.ManagerID ?? 'root'; // Use 'root' for the top-level manager
      if (!this.teamMembersByManager[managerId]) {
        this.teamMembersByManager[managerId] = [];
      }
      this.teamMembersByManager[managerId].push(member);
    });
  }

  toggleManager(managerId: number): void {
    if (this.expandedManagers.has(managerId)) {
      this.expandedManagers.delete(managerId);  // Collapse
    } else {
      this.expandedManagers.add(managerId);     // Expand
    }
  }

  isManagerExpanded(managerId: number): boolean {
    return this.expandedManagers.has(managerId);
  }

  hasTeamMembers(managerId: number): boolean {
    return this.teamMembersByManager[managerId]?.length > 0;
  }


  checkAllMembers(managerId: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    console.log(`Manager ID: ${managerId}, Checked: ${isChecked}`); // Debugging line

    // Update checkedMembers for the manager
    this.checkedMembers[managerId] = isChecked; // Add this line

    const members = this.teamMembersByManager[managerId];
    if (members) {
      members.forEach(member => {
        this.checkedMembers[member.UserID] = isChecked; // Update for each member
        console.log(`Checked Members Updated: ${member.UserID} = ${isChecked}`); // Debugging line
        // Check for sub-members if applicable
        if (this.hasTeamMembers(member.UserID)) {
          this.checkAllMembers(member.UserID, event);
        }
      });
    }
  }



  // getTasks() {
  //   this.isLoading = true;
  //   const teamUsersID = this.getCheckedTeamMembers().join(',');

  //   // Check if any team members are selected
  //   if (teamUsersID.length === 0) {
  //     this.getErrorMessages('getTasks', constants.Firm_CoreDetails_Messages.SELECT_SUPERVISIORS);
  //     this.isLoading = false;
  //   } else {
  //     delete this.errorMessages['getTasks'];

  //     // Make the API call with only the checked user IDs
  //     this._taskService.getMyTeamsTasks(this.userId, teamUsersID).subscribe({
  //       next: (response) => {
  //         console.log('API Response:', response);
  //         if (response.isSuccess) {
  //           this.tasks = response.response; // Save tasks in the array
  //           this.filteredTasks = [...this.tasks]; // Update filtered tasks
  //           this.totalRows = this.tasks.length;
  //           this.totalPages = Math.ceil(this.totalRows / this.pageSize);
  //           this.getTaskTypes(); // Update task types
  //           this.getFirmNames(); // Update firm names
  //           this.getTaskAssignedToUsers(); // Update assigned users
  //           this.updatePagination(); // Update pagination
  //           this.isLoading = false;
  //         } else {
  //           console.error('Error fetching tasks:', response.errorMessage);
  //           this.isLoading = false;
  //           this.tasks = [];
  //         }
  //       },
  //       error: (err) => {
  //         console.error('HTTP Error:', err);
  //         this.isLoading = false;
  //         this.tasks = [];
  //       }
  //     });
  //   }
  // }

  getTasks() {
    this.isLoading = true;
    const teamUsersID = this.getCheckedTeamMembers().join(',');

    if (teamUsersID.length === 0) {
      this.getErrorMessages('getTasks', constants.Firm_CoreDetails_Messages.SELECT_SUPERVISIORS);
      this.isLoading = false;
    } else {
      delete this.errorMessages['getTasks'];

      // Call API with the selected team members
      this.taskService.getMyTeamsTasks(this.userId, teamUsersID).subscribe({
        next: (response) => {
          console.log('API Response:', response); // Log the response
          if (response.isSuccess) {
            this.tasks = response.response; // Save tasks in the array
            this.filteredTasks = [...this.tasks]; // Update filtered tasks
            this.totalRows = this.tasks.length;
            this.totalPages = Math.ceil(this.totalRows / this.pageSize);
            this.getTaskTypes(); // Update task types
            this.getFirmNames(); // Update firm names
            this.getTaskAssignedToUsers(); // Update assigned users
            this.updatePagination(); // Update pagination
            this.isLoading = false;
          } else {
            console.error('Error fetching tasks:', response.errorMessage);
            this.isLoading = false;
            this.tasks = [];
          }
        },
        error: (err) => {
          console.error('HTTP Error:', err);
          this.isLoading = false;
          this.tasks = [];
          this.updatePagination();
        }
      });
    }
  }


  // Helper method to get checked team members' IDs
  getCheckedTeamMembers(): number[] {
    const checkedIds: number[] = [];
    for (const userId in this.checkedMembers) {
      if (this.checkedMembers[userId]) {
        checkedIds.push(Number(userId)); // Add UserID to the array
      }
    }
    return checkedIds; // This will now return all checked members
  }



  // Get unique task types from the task
  getTaskTypes(): void {
    const types = this.tasks.map(task => task.TaskType);
    this.taskTypes = Array.from(new Set(types)).sort(); // Remove duplicates
    console.log(this.taskTypes);
  }

  // Get unique firm names from the task list
  getFirmNames() {
    const firms = this.tasks.map(task => task.FirmName);
    this.firmNames = Array.from(new Set(firms)).sort();
    console.log(this.firmNames);
  }

  // Get unique assigned task to usernames from the task list
  getTaskAssignedToUsers() {
    const taskAssignedTo = this.tasks.map(task => task.TaskAssignedToUserName);
    this.usersAssignedTaskTo = Array.from(new Set(taskAssignedTo)).sort();
    console.log(this.usersAssignedTaskTo);
  }

  filterTasks(): void {
    this.filteredTasks = this.tasks.filter(task => {
      // Safely convert TaskDueDate only if it's not null or empty
      let dueDateFormatted = '';
      if (task.TaskDueDate) {
        dueDateFormatted = this.dateUtilService.convertApiDateToStandard(task.TaskDueDate);
      }

      const daysDue = task.DaysOverDue;

      // Check for matching conditions
      const matchesTaskType = this.selectedTaskType === '' || task.TaskType === this.selectedTaskType;
      const matchesFirmName = this.selectedFirmName === '' || task.FirmName === this.selectedFirmName;
      const matchesDueDate = this.selectedDueDate === '' || dueDateFormatted === this.selectedDueDate;
      const matchesAssignedToUsers = this.selectedUsersAssignedTo === '' || task.TaskAssignedToUserName === this.selectedUsersAssignedTo;


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

      return matchesTaskType && matchesFirmName && matchesDueDate && matchesDaysOverDue && matchesAssignedToUsers;
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
    this.filteredTasks = this.tasks.filter(task => {
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
    this.taskService.getMyTaskByObjectDetails(
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
    const saveNotePromise = this.taskService.saveReminderNote(note).toPromise();
    const loadTasksPromise = this.taskService.getMyTasksAssignedByUser(this.userId).toPromise();

    Promise.all([saveNotePromise, loadTasksPromise])
      .then(([saveNoteResponse, loadTasksResponse]) => {
        console.log('Note updated successfully:', saveNoteResponse);

        // Update the task list after saving the note
        this.tasks = loadTasksResponse.response;
        this.filteredTasks = [...this.tasks];
        this.totalRows = this.tasks.length;
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
    this.FirmsDropdownVisible = false;
    this.dueDateInputVisible = false;
    this.daysOverDueDropdownVisible = false;
    this.UsersAssignedToDropdownVisible = false;
  }

  toggleFirmDropdown(): void {
    this.FirmsDropdownVisible = !this.FirmsDropdownVisible;
    this.TaskDropdownVisible = false;
    this.dueDateInputVisible = false;
    this.daysOverDueDropdownVisible = false;
    this.UsersAssignedToDropdownVisible = false;
  }

  toggleDueDateInput(): void {
    this.dueDateInputVisible = !this.dueDateInputVisible;
    this.TaskDropdownVisible = false;
    this.FirmsDropdownVisible = false;
    this.daysOverDueDropdownVisible = false;
    this.UsersAssignedToDropdownVisible = false;
  }

  toggleDaysOverDueDropdown(): void {
    this.daysOverDueDropdownVisible = !this.daysOverDueDropdownVisible;
    this.TaskDropdownVisible = false;
    this.FirmsDropdownVisible = false;
    this.dueDateInputVisible = false;
    this.UsersAssignedToDropdownVisible = false;
  }

  toggleUsersAssignedToDropdown(): void {
    this.UsersAssignedToDropdownVisible = !this.UsersAssignedToDropdownVisible;
    this.TaskDropdownVisible = false;
    this.FirmsDropdownVisible = false;
    this.dueDateInputVisible = false;
    this.daysOverDueDropdownVisible = false;
  }

  updatePagination(): void {
    if (this.tasks.length === 0) {
      // If no tasks, set pagination values to indicate no records
      this.paginatedTasks = [];
      this.startRow = 0;
      this.endRow = 0;
      this.totalRows = 0;
      this.totalPages = 0;
      console.log('No tasks found. Paginated Tasks Length:', this.tasks.length);
    } else {
      // Calculate the start and end indices for pagination
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, this.totalRows);

      // Assign paginated tasks
      this.paginatedTasks = this.filteredTasks.slice(startIndex, endIndex);

      // Update row tracking variables
      this.startRow = startIndex + 1;
      this.endRow = endIndex;

      // Log paginated tasks length
      console.log('Paginated Tasks Length:', this.paginatedTasks.length);
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

  isTaskOverdue(dueDate: string): boolean {
    return this.dateUtilService.isOverdue(dueDate);
  }

  getErrorMessages(fieldName: string, msgKey?: number) {
    if (fieldName === 'note' && !msgKey) {
      this.errorMessages['note'] = 'Please Enter The Note';
    } else {
      this.logForm.errorMessages(msgKey).subscribe(
        (response) => {
          let errorMessage = response.response;
          this.errorMessages[fieldName] = errorMessage;
        },
        (error) => {
          console.error(`Failed to load error message for ${fieldName}.`, error);
        }
      );
    }
  }

  showErrorAlert(messageKey: number) {
    this.logForm.errorMessages(messageKey).subscribe(
      (response) => {
        Swal.fire({
          text: response.response,
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      },
    );
  }
  exportRowToExcel(event: Event) {
    event.stopPropagation();

    // Map over the paginatedTasks array to create an array of row data
    const tableData = this.filteredTasks.map(item => {
      return {
        'Task Type': item.TaskType,
        'Firm Name': item.FirmName,
        'Description': item.ShortDescription,
        'Due Date': item.TaskDueDate,
        'Days Over Due': item.DaysOverDue > 0 ? item.DaysOverDue : '',
        'Comments': item.Comments,
        'Task Assigned To': item.TaskAssignedToUserName,
      };
    });

    // Convert the table data to a worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(tableData);

    // Create a new workbook and append the worksheet to it
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Export the file and trigger a download
    XLSX.writeFile(workbook, 'My_Teams_Tasks_table.xlsx');
 }
}

