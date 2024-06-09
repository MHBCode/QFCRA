import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-firm-list',
  templateUrl: './firm-list.component.html',
  styleUrls: ['./firm-list.component.scss']
})
export class FirmListComponent {

  constructor(private router: Router){};
  

  viewFirm() {
    this.router.navigate(['home/view-firm']);
  }


}
