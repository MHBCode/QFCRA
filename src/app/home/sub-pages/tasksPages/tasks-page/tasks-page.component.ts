import { Component } from '@angular/core';
import {TaskServiceService} from 'src/app/ngServices/task-service.service';
@Component({
  selector: 'app-tasks-page',
  templateUrl: './tasks-page.component.html',
  styleUrls: ['./tasks-page.component.scss']
})
export class TasksPageComponent {
  ShowExportButton : boolean = false;

  constructor(private TaskServiceService: TaskServiceService) {}
  
  exportToExcel() {
    this.ShowExportButton = !this.ShowExportButton;
    this.TaskServiceService.setShowExportButton(this.ShowExportButton);  // Update the service with the new value
  }

}
