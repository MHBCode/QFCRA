import * as constants from 'src/app/app-constants';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';
import { WaiverService } from 'src/app/ngServices/waiver.service';
import { FlatpickrService } from '../flatpickr/flatpickr.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import Swal from 'sweetalert2';
import { UsersService } from 'src/app/ngServices/users.service';
import { SupervisionService } from 'src/app/supervision/supervision.service';
import { DateUtilService } from '../date-util/date-util.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss', '../popup.scss', '../../../assets/styles/forms.scss']
})
export class ReviewComponent implements OnInit {

  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;


  @Input() ObjectWFStatusID: number = 0;
  @Input() Page: number = 0;
  @Input() ObjectInstanceID: number = 0;
  @Input() ObjectInstanceRevNo: number = 0;
  @Input() isEdit: boolean = false;

  WfStatus: number;

  @Output() userObjTasksChange: EventEmitter<any> = new EventEmitter();
  userObjTasks: any[] = [];
  RevisionCommentsList: any[] = [];
  allUsers: any[] = [];
  recipientsTempUsersList: any[] = [];

  selectedUser: number = 0;
  selectedTask: any = null;

  showPreviousCommentsPopup: boolean = false;
  showEmailRecipients: boolean = false;

  errorMessage: string = "";

  constructor(
    private objectWF: ObjectwfService,
    private waiverService: WaiverService,
    private flatpickrService: FlatpickrService,
    private securityService: SecurityService,
    private userService: UsersService,
    private supervisionService: SupervisionService,
    private dateUtilService: DateUtilService,
  ) {

  }

  ngOnInit(): void {
    this.getUsersForEmailPopup() // Load users first
      .then(() => this.getUserObjectWfTasks()) // Then get tasks
      .then(() => this.getWorkflowTaskRoles())
      .catch(error => {
        console.error("Error in initializing tasks:", error);
      });
    this.getObjectInstanceWorkflowStatus();
  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }

  getUserObjectWfTasks(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.objectWF.getUserObjectWfTasks(this.ObjectWFStatusID).subscribe({
        next: (data) => {

          const currentDate = new Date();

          const formattedCurrentDate = this.dateUtilService.formatDateToCustomFormat(currentDate.toString());

          this.userObjTasks = data.response;

          if (this.isEdit) {
            this.userObjTasks.forEach(task => {
              if (this.supervisionService.isNullOrEmpty(task.wfTaskDueDate)) {
                task.wfTaskDueDate = formattedCurrentDate; // Assign today's date
              }
              if (task.wfTaskAssignedToUser === null) {
                task.emailToIDs = "";
              }
            });
          }

          this.userObjTasks.forEach(task => {
            if (task.emailCCIDs) {
              const userEmailIDs = task.emailCCIDs.split(';');
              task.userDetails = userEmailIDs
                .map(userID => {
                  const user = this.allUsers.find(u => u.UserID === parseInt(userID.trim()));
                  if (user) {
                    return {
                      UserID: user.UserID,
                      UserName: user.UserName,
                      UserEmailAddress: user.UserEmailAddress
                    };
                  }
                  return null;
                })
                .filter(details => details);
            } else {
              task.userDetails = [];
            }
          });



          this.emitUserObjTasks();
          resolve();
        },
        error: (error) => {
          console.error(error);
          reject(error);
        }
      });
    });
  }


  // Get Roles Assigned To
  getWorkflowTaskRoles() {
    this.userObjTasks.forEach(task => {
      this.objectWF.getWorkflowTaskRoles(
        task.objectWFTaskTypeID,
        this.Page,
        constants.NotificationFlag.NotNotify,
        task.objectWFTaskDefsID
      ).subscribe({
        next: (data) => {
          task.taskRoles = data.response;
          task.wfTaskAssignedToRole = task.taskRoles.find(role => role.AppRoleID === task.wfTaskAssignedToRole)?.AppRoleID || 0;
          this.getUsersInRole(task);
        },
        error: (error) => {
          console.error(error);
        }
      });
    });
  }

  // Get Users Assigned To
  getUsersInRole(task: any) {
    this.securityService.getUsersInRole(this.Page, task.wfTaskAssignedToRole).subscribe({
      next: (data) => {
        task.taskUsers = data.response;
        task.wfTaskAssignedToUser = task.taskUsers.find(user => user.UserId === task.wfTaskAssignedToUser)?.UserId || 0;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  userAssignedToOnChange(task: any) {

    // Exclude the current task by comparing unique IDs
    const duplicateTask = this.userObjTasks.find(
      (t) =>
        t.objectWFTaskStatusID !== task.objectWFTaskStatusID && // Ensure it's not the current task
        parseInt(t.wfTaskAssignedToUser) === parseInt(task.wfTaskAssignedToUser)
    );

    if (duplicateTask) {
      task.wfTaskAssignedToUser = null;

      setTimeout(() => {
        task.wfTaskAssignedToUser = 0; 
      });
      task.objectWFTaskStart = false;
      task.emailToIDs = "";
      task.emailToAddress = "";
      task.userName = "";

      Swal.fire({
        text: 'User has already been assigned to a different task. Please assign the task to a different user.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } else {
      if (parseInt(task.wfTaskAssignedToUser) !== 0) {
        task.objectWFTaskStart = true;

        const assignedToUser = this.allUsers.find(user => user.UserID === parseInt(task.wfTaskAssignedToUser));
        task.emailToAddress = assignedToUser
          ? assignedToUser.UserEmailAddress.split('@')[0] // remove domain
          : '';

        task.emailToIDs = task.wfTaskAssignedToUser.toString();

        task.userName = assignedToUser.UserName;

      } else {
        task.objectWFTaskStart = false;
      }
    }
    console.log('Current task:', task);
    console.log('wfTaskAssignedToUser:', task.wfTaskAssignedToUser);
    this.emitUserObjTasks();
  }

  getObjectInstanceWorkflowStatus() {
    this.objectWF.getObjectInstanceWorkflowStatus(this.Page, this.ObjectInstanceID, this.ObjectInstanceRevNo).subscribe({
      next: (response) => {
        this.WfStatus = response.response;
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Workflow status fetch complete');
      }
    });
  }


  openPreviousWFComments() {
    this.showPreviousCommentsPopup = true;
    this.waiverService.getRevisionCommentsByWaiver(this.ObjectWFStatusID).subscribe({
      next: (res) => {
        this.RevisionCommentsList = res.response;
        console.log("RevisionCommentsList", this.RevisionCommentsList)
      },
      error: (error) => {
        console.error('Error fetching RevisionCommentsList', error);
      },
    });
    setTimeout(() => {
      const popupWrapper = document.querySelector('.previousCommentsPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .previousCommentsPopup not found');
      }
    }, 0)
  }

  closePreviousCommentsPopup() {
    this.showPreviousCommentsPopup = false;
    const popupWrapper = document.querySelector('.previousCommentsPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .previousCommentsPopup not found');
    }
  }

  addRecipients(task: any) {
    this.selectedTask = task;
    this.showEmailRecipients = true;
    this.recipientsTempUsersList = (task.userDetails || []).map(user => ({
      ...user,
      isChecked: true
    }));
    setTimeout(() => {
      const popupWrapper = document.querySelector('.emailRecipientsPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .emailRecipientsPopup not found');
      }
    }, 0)
  }

  closeEmailRecipientsPopup() {
    this.showEmailRecipients = false;
    this.selectedTask = null;
    this.recipientsTempUsersList = [];
    const popupWrapper = document.querySelector('.emailRecipientsPopup') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .emailRecipientsPopup not found');
    }
  }

  getUsersForEmailPopup(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getUsers().subscribe({
        next: (users) => {
          this.allUsers = users.response;
          this.selectedUser = this.allUsers[0].UserID;
          resolve();
        },
        error: (error) => {
          console.error('Error fetching users: ', error);
          reject(error);
        }
      });
    });
  }

  addUserToSelectedTask() {
    if (this.selectedUser) {
      const user = this.allUsers.find(u => u.UserID === Number(this.selectedUser));
      if (user) {
        const alreadyExists = this.recipientsTempUsersList.some(u => u.UserID === user.UserID);
        if (alreadyExists) {
          this.errorMessage = "User already selected.";
        } else {
          this.recipientsTempUsersList.push({
            ...user,
            isChecked: true
          });
          this.errorMessage = "";
        }
      }
    }
  }

  okClickedSelectedTask() {
    if (this.selectedTask) {
      this.selectedTask.userDetails = [...this.recipientsTempUsersList];

      this.selectedTask.emailCCAddress = this.selectedTask.userDetails
        .map(user => user.UserEmailAddress.split('@')[0]) // remove domain
        .join('; ');

      this.selectedTask.emailCCIDs = this.selectedTask.userDetails
        .map(user => user.UserID)
        .join(';');

      const assignedToUser = this.allUsers.find(user => user.UserID === this.selectedTask.wfTaskAssignedToUser);
      this.selectedTask.emailToAddress = assignedToUser
        ? assignedToUser.UserEmailAddress.split('@')[0] // remove domain
        : '';

      this.selectedTask.emailToIDs = this.selectedTask.wfTaskAssignedToUser.toString();

    }
    this.emitUserObjTasks();
    this.closeEmailRecipientsPopup();
  }


  clearSelectedTaskUsers() {
    if (this.selectedTask) {
      this.recipientsTempUsersList = this.recipientsTempUsersList.filter(user => !user.isChecked);
      this.emitUserObjTasks();
    }
  }

  editWFTask(task: any) {
    this.userObjTasks.forEach(item => {
      item.isEditableTask = false;
    });
    // Set the selected task to editable
    task.isEditableTask = true;
  }

  emitUserObjTasks() {
    this.userObjTasksChange.emit(this.userObjTasks);
  }

}