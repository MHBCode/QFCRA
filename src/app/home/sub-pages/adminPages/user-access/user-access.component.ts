import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import flatpickr from 'flatpickr';
import { FirmService } from 'src/app/ngServices/firm.service';
import { UsersService } from 'src/app/ngServices/users.service';
import * as constants from 'src/app/app-constants';
import { SecurityService } from 'src/app/ngServices/security.service';

@Component({
  selector: 'app-user-access',
  templateUrl: './user-access.component.html',
  styleUrls: ['./user-access.component.scss']
})
export class UserAccessComponent implements OnInit {

  userData: any = []; // Array to store the fetched user data
  appRoles: any = [];
  firmLevels: any = [];
  selectedUserId: number | string = ''; // Property to store the selected user ID
  noDataFound: boolean = false; // To track if no data was found

  userAccessForm: FormGroup;


  @ViewChildren('dateInputs') dateInputs: QueryList<ElementRef<HTMLInputElement>>;

  constructor(private usersService: UsersService, private firmService: FirmService, private securityService: SecurityService) {
   
  }


  ngOnInit(): void {
    this.loadUserData();
    this.loadAppRoles();
    this.populateFirmLevels();
  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.initializeFlatpickr();
    });
    this.initializeFlatpickr();
  }

  initializeFlatpickr() {
    this.dateInputs.forEach((input: ElementRef<HTMLInputElement>) => {
      flatpickr(input.nativeElement, {
        allowInput: true,
        dateFormat: 'd/M/Y', // Adjust date format as needed
        onChange: (selectedDates, dateStr) => {
          input.nativeElement.value = dateStr;
        }
      });
    });
  }


  loadUserData() {
    this.usersService.getAllUsersData().subscribe(data => {
      this.userData = data.response; // Store the user data
      console.log('User Data:', this.userData);
    }, error => {
      console.log("Error Fetching Users Data: ", error);
    });
  }

  loadAppRoles() {
    this.usersService.getAllAppRoles().subscribe(data => {
      this.appRoles = data.response;
      console.log("App roles:", this.appRoles);
    }, error => {
      console.log("Error Fetching App Roles: ", error);
    });
  }


  populateFirmLevels() {
    this.securityService.getObjectTypeTable(constants.firmLevels).subscribe(data => {
      this.firmLevels = data.response;
    }, error => {
      console.error('Error Fetching Countries dropdown: ', error);
    })
  }

  save() {
    
  }

  

  cancel() {
    // Handle cancel logic here
  }


  convertDateToYYYYMMDD(dateStr: string | Date): string | null {
    console.log(dateStr);

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
}