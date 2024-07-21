import { Component } from '@angular/core';

@Component({
  selector: 'app-user-access',
  templateUrl: './user-access.component.html',
  styleUrls: ['./user-access.component.scss']
})
export class UserAccessComponent {
  rows: any[] = [{ userRole: '', firmLevel: '', effectiveDate: '', expirationDate: '', justification: '' }];

  addRow() {
    this.rows.push({ userRole: '', firmLevel: '', effectiveDate: '', expirationDate: '', justification: '' });
  }
  removeRow(index: number) {
    if (this.rows.length > 1) {
      this.rows.splice(index, 1);
    }
  }
}
