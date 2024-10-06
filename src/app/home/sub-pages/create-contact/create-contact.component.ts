import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-contact',
  templateUrl: './create-contact.component.html',
  styleUrls: ['./create-contact.component.scss']
})
export class CreateContactComponent {

  selectedType: string = '';
  showHoldingsPercentage: boolean = false;
  selectedControlType: string = 'select';
  hideForms: boolean = true;
  isCompanyTraded: boolean | null = null;
  isCompanyRegulated: boolean | null = null;
  more10UBOs: boolean | null = null;

  constructor() {}

  ngOnInit(): void {
    
  }

  changeType() {
    if (this.selectedType === 'percentage') {
      this.showHoldingsPercentage = true;
    } else {
      this.showHoldingsPercentage = false;
    }
  }

  changeControlType() {
    if (this.selectedControlType === 'select') {
      this.hideForms = true;
    } 
    else {
      this.hideForms = false;
    }
  }
}