import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-controller',
  templateUrl: './edit-controller.component.html',
  styleUrls: ['./edit-controller.component.scss']
})
export class EditControllerComponent implements OnInit {
  isCompanyTraded: boolean | null = null;
  isCompanyRegulated: boolean | null = null;
  more10UBOs: boolean | null = null;

  constructor() {}

  ngOnInit(): void {
    
  }
}
