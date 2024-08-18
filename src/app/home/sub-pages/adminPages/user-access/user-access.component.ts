import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/ngServices/users.service';

@Component({
  selector: 'app-user-access',
  templateUrl: './user-access.component.html',
  styleUrls: ['./user-access.component.scss']
})
export class UserAccessComponent implements OnInit {
  rows: any[] = [{ userRole: '', firmLevel: '', effectiveDate: '', expirationDate: '', justification: '' }];

  userData: any = {}; // Property to store the fetched user data
  appRoles: any = {};

  constructor(private usersService: UsersService) { }

  addRow() {
    this.rows.push({ userRole: '', firmLevel: '', effectiveDate: '', expirationDate: '', justification: '' });
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
    const userId = 10044;  // Replace with the actual user ID if necessary
    this.usersService.getUserByAccess(userId).subscribe({
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
        this.appRoles = data;
        console.log("App roles :", this.appRoles);
      },
      error: (error) =>{
        console.error('Error fetching', error);
      }
    })
  }
}
