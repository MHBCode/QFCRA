import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskServiceService } from 'src/app/ngServices/task-service.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {

  @Input() listCount: number = 50;
  @Input() isMainView: boolean = false;
  Tasks: any[] = [];

  constructor(
    private TaskService : TaskServiceService,
    private router: Router,
  ){};

  ngOnInit(): void {
    this.getTasksList();
  }

  getTasksList() : void{
    this.TaskService.getAssignedTaskReminders(30).subscribe(
      data => {
        this.Tasks = data.response;
        console.log("Tasks Reminders: ", this.Tasks)
      },
      error =>{
        console.error('Error fetching Tasks', error);
      }
    )
  }

  goToAllTasks(){
    this.router.navigate(['home/tasks-page']);
  }

}
