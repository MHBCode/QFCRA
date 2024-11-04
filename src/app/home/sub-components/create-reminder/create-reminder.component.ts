import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import flatpickr from 'flatpickr';
import { FirmService } from 'src/app/ngServices/firm.service';
import { TaskServiceService } from 'src/app/ngServices/task-service.service';
import * as constants from 'src/app/app-constants';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LogformService } from 'src/app/ngServices/logform.service';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';

@Component({
  selector: 'app-create-reminder',
  templateUrl: './create-reminder.component.html',
  styleUrls: ['./create-reminder.component.scss']
})
export class CreateReminderComponent implements OnInit {

  @ViewChildren('dateInputs') dateInputs: QueryList<ElementRef<HTMLInputElement>>;
  userId = 30;
  hasValidationErrors: boolean = false;
  /* error messages */
  errorMessages: { [key: string]: string } = {};

  allFirms: any = [];
  createReminder = {
    summary: '',
    FirmID: 0,
    Notes: '',
    dueDate: null,
    status: 1,
  }
  
  constructor(
    private TaskService: TaskServiceService,
    private firmDetailsService: FirmDetailsService,
    private logForm: LogformService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.populateAllFirms();
  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.initializeFlatpickr();
    });
    this.initializeFlatpickr();
  }

  initializeFlatpickr() {
    this.dateInputs.forEach((input: ElementRef<HTMLInputElement>) => {
      input.nativeElement.placeholder = 'DD/MM/YYY';
      flatpickr(input.nativeElement, {
        allowInput: true,
        dateFormat: 'd/M/Y', // Adjust date format as needed
        onChange: (selectedDates, dateStr) => {
          input.nativeElement.value = dateStr;
          this.createReminder.dueDate = dateStr; // Update the bound value in the component
        }
      });
    });
  }

  populateAllFirms() {
    this.TaskService.getAllFirms().subscribe((data) => {
      this.allFirms = data.response;
    }, error => {
      console.error('Error Fetching Firms: ', error)
    })
  }

  prepareReminderObject() {
    let personalReminder = {
      userId: this.userId,
      summary: this.createReminder.summary,
      firmId: this.createReminder.FirmID,
      notes: this.createReminder.Notes,
      dueDate: this.convertDateToYYYYMMDD(this.createReminder.dueDate),
      status: this.createReminder.status,
      objectActItmID: 0,
      outparam: 0,
    }
    return personalReminder;
  }

  insertReminder() {
    this.hasValidationErrors = false; // Ensure it starts off as false
    // summary validation
    if (this.isNullOrEmpty(this.createReminder.summary)) {
      this.getErrorMessages('Summary', constants.Firm_CoreDetails_Messages.ENTER_SUMMARY);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['Summary'];
    }

    // date validation
    if (this.isNullOrEmpty(this.createReminder.dueDate)) {
      this.getErrorMessages('DueDate', constants.CRORegisterReports.ENTER_DATE);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['DueDate'];
    }

    // Step 2: Handle Validation Errors
    if (this.hasValidationErrors) {
      this.firmDetailsService.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      return; // Prevent further action if validation fails
    }

    const reminder = this.prepareReminderObject();
    this.TaskService.createReminder(reminder).subscribe((data => {
      console.log('Reminder Created Successfully: ', data.response);
    }), error => {
      console.error('Faile to create: ', error);
    })
  }

  cancelReminder() {
    this.router.navigate(['home/tasks-page/assigned-tasks']);
}


  convertDateToYYYYMMDD(dateStr: string | Date): string | null {

    if (!dateStr) {
      return null; // Return null if the input is invalid or empty
    }
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    if (isNaN(date.getTime())) {
      console.error('Invalid date format:', dateStr);
      return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');

    // Only return the date in YYYY-MM-DD format, stripping the time part
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  }

  getErrorMessages(fieldName: string, msgKey: number) {
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

  isNullOrEmpty(value: any): boolean {
    return value === null || value === '';
  }
} 
