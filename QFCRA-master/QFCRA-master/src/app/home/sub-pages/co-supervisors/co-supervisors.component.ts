import { Component } from '@angular/core';

@Component({
  selector: 'app-co-supervisors',
  templateUrl: './co-supervisors.component.html',
  styleUrls: ['./co-supervisors.component.scss']
})

export class CoSupervisorsComponent {
  isPersonnelSectionVisible: boolean = false;
  isModalVisible: boolean = false;
  // Set the visibility of the personnel section to true
  showPersonnelSection(): void {
    this.isPersonnelSectionVisible = true;
  }

  isInputsFieldSetVisible: boolean = false;  // Controls the visibility of the inputs field set

  toggleInputsFieldSet() {
    this.isInputsFieldSetVisible = true; // Show the inputs field set
  }
  showModal() {
    this.isModalVisible = true;
    
  }
 
  hideModal() {
    this.isModalVisible = false;
    
  }
  

}
