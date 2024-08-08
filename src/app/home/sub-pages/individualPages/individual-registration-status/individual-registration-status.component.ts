import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-individual-registration-status',
  templateUrl: './individual-registration-status.component.html',
  styleUrls: ['./individual-registration-status.component.scss']
})
export class IndividualRegistrationStatusComponent {
  constructor(private router: Router) {}

  viewIndividualStatusChange() {
    this.router.navigate(['home/view-individual-status-change/individual'])
  }
}
