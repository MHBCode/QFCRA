import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-controller',
  templateUrl: './view-controller.component.html',
  styleUrls: ['./view-controller.component.scss']
})
export class ViewControllerComponent {
  constructor(private router: Router) {}

  editController() {
    this.router.navigate(['home/edit-controller'])
  }
}
