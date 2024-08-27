import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/ngServices/users.service';

@Component({
  selector: 'app-user-access',
  templateUrl: './user-access.component.html',
  styleUrls: ['./user-access.component.scss']
})
export class UserAccessComponent implements OnInit {
  rows: any[] = [];

  userData: any = {}; // Property to store the fetched user data
  appRoles: any[] = [];
  filteredRoles: any[] = []; // For storing roles for selected user
  selectedUserId: number | string = ''; // Property to store the selected user ID
  noDataFound: boolean = false; // To track if no data was found
  userId: number = 30; // this must be dynamic

  constructor(private usersService: UsersService) { }

  isObjectEmpty(value: any): boolean {
    return Object.keys(value || {}).length === 0;
  }

  addRow() {
    // Add a new row with all fields enabled
    this.rows.push({
      userRole: '',
      firmLevel: '',
      UserRoleEffectiveDate: '',
      UserRoleEndDate: '',
      justification: '',
      isEditable: true 
    });
  }

  removeRow(index: number) {
    if (this.rows.length > 1) {
      this.rows.splice(index, 1);
    }
  }
  ngOnInit(): void {
    this.loadUserData(); 
    this.loadAppRoles();
  }
  loadUserData() {
    this.usersService.getUserByAccess(this.userId).subscribe({
      next: (data) => {
        this.userData = data;  // Store the user data
        console.log('User Data:', this.userData);
        // You can update the `rows` or other properties here based on the data
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      }
    });
  }
  loadAppRoles(){
    this.usersService.getAllAppRoles().subscribe({
      next: (data) => {
        this.appRoles = data.response;
        console.log("App roles :", this.appRoles);
      },
      error: (error) =>{
        console.error('Error fetching', error);
      }
    })
  }
  onUserChange(): void {
    if (this.selectedUserId) {
      if (Number(this.selectedUserId) === this.userId) {
        this.usersService.getAppRoleByUserId(this.userId).subscribe({
          next: (data) => {
            // Map each role to include the required fields
            this.filteredRoles = data.response.map(role => ({
              userRole: role.AppRoleID,
              firmLevel: role.FirmLevel,
              effectiveDate: role.UserRoleEffectiveDate,
              expirationDate: role.UserRoleEndDate,
              justification: role.Justification,
              isEditable: false // Set existing roles as non-editable
            }));

            this.noDataFound = this.filteredRoles.length === 0;
            this.rows = [...this.filteredRoles]; // Set rows to filteredRoles
            console.log('Filtered Roles:', this.filteredRoles);
          },
          error: (error) => {
            console.error('Error fetching user roles:', error);
            this.noDataFound = true;
            this.filteredRoles = [];
            this.rows = []; // Clear rows if error occurs
          }
        });
      } else {
        this.noDataFound = true;
        this.filteredRoles = [];
        this.rows = []; // Clear rows if no matching user
      }
    } else {
      this.noDataFound = false;
      this.filteredRoles = [];
      this.rows = []; // Clear rows if no user selected
    }
  }
}


