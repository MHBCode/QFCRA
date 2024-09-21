import { Component } from '@angular/core';

@Component({
  selector: 'app-individual-pending-ai-apps',
  templateUrl: './individual-pending-ai-apps.component.html',
  styleUrls: ['./individual-pending-ai-apps.component.scss']
})
export class IndividualPendingAiAppsComponent {
 isModalVisible: boolean = false;

 showModal() {
  this.isModalVisible = true;
 }

 hideModal() {
  this.isModalVisible = false;
 }
}
