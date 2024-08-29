// src/app/home/sub-components/firm-list/firm-list.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirmService } from 'src/app/ngServices/firm.service';

@Component({
  selector: 'app-firm-list',
  templateUrl: './firm-list.component.html',
  styleUrls: ['./firm-list.component.scss']
})
export class FirmListComponent implements OnInit {

  @Input() listCount: number = 50;

  @Input() firms: any[] = [];

  v: any[] = this.firms.slice(5);
  constructor(
    private router: Router,
    private firmService: FirmService
  ) { }

  ngOnInit(): void {
    this.loadFirms();
  }

  loadFirms(): void {
    this.firmService.getAssignedFirms(10044).subscribe(
      data => {
        this.firms = data.response;
        console.log(this.firms);
      },
      error => {
        console.error('Error fetching firms', error);
      }
    );
  }

  viewFirm(firmId: number) {
    if (firmId) {
      console.log("Navigating to firm with ID:", firmId);
      this.router.navigate(['home/view-firm', firmId]);
    } else {
      console.error('Invalid firm ID:', firmId);
    }
  }

  goToAllFirms() {
    this.router.navigate(['home/firms-page']);
  }
}
