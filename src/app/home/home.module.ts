// src/app/home/home.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { MainPageComponent } from './main-page/main-page.component';
import { StatisticsHeaderComponent } from './sub-components/statistics-header/statistics-header.component';
import { AIByFunctionComponent } from './sub-components/ai-by-function/ai-by-function.component';
import { ReportsSubmissionsComponent } from './sub-components/reports-submissions/reports-submissions.component';
import { FirmsBySelectorComponent } from './sub-components/firms-by-selector/firms-by-selector.component';
import { TaskListComponent } from './sub-components/task-list/task-list.component';
import { FirmListComponent } from './sub-components/firm-list/firm-list.component';
import { ViewFirmPageComponent } from './sub-pages/view-firm-page/view-firm-page.component';
import { NewFirmComponent } from './sub-pages/new-firm/new-firm.component';
import { TasksPageComponent } from './sub-pages/tasksPages/tasks-page/tasks-page.component';
import { SharedModule } from '../shared/shared.module';
import { IndividualPageComponent } from './sub-pages/individualPages/individual-page/individual-page.component';
import { IndividualListComponent } from './sub-components/individual-list/individual-list.component';
import { IndividualRegistrationStatusComponent } from './sub-pages/individualPages/individual-registration-status/individual-registration-status.component';
import { IndividualPendingAiAppsComponent } from './sub-pages/individualPages/individual-pending-ai-apps/individual-pending-ai-apps.component';
import { UserAccessComponent } from './sub-pages/adminPages/user-access/user-access.component';
import { ReAssignTasksComponent } from './sub-pages/adminPages/re-assign-tasks/re-assign-tasks.component';
import { CoSupervisorsComponent } from './sub-pages/co-supervisors/co-supervisors.component';
import { CreateIndividualComponent } from './sub-pages/individualPages/create-individual/create-individual.component';
import { ViewIndividualComponent } from './sub-pages/individualPages/view-individual/view-individual.component';
import { ViewIndividualStatusChangeComponent } from './sub-pages/individualPages/view-individual-status-change/view-individual-status-change.component';
import { ShadowSupervisorComponent } from './sub-components/shadow-supervisor/shadow-supervisor.component';
import { TasksIAssignedComponent } from './sub-components/tasks-i-assigned/tasks-i-assigned.component';
import { MyTeamTasksComponent } from './sub-components/my-team-tasks/my-team-tasks.component';
import { CreateReminderComponent } from './sub-components/create-reminder/create-reminder.component';


@NgModule({
  declarations: [
    MainPageComponent,
    StatisticsHeaderComponent,
    AIByFunctionComponent,
    ReportsSubmissionsComponent,
    FirmsBySelectorComponent,
    TaskListComponent,
    FirmListComponent,
    ViewFirmPageComponent,
    NewFirmComponent,
    TasksPageComponent,
    IndividualPageComponent,
    IndividualListComponent,
    IndividualRegistrationStatusComponent,
    IndividualPendingAiAppsComponent,
    UserAccessComponent,
    ReAssignTasksComponent,
    CoSupervisorsComponent,
    CreateIndividualComponent,
    ViewIndividualComponent,
    ViewIndividualStatusChangeComponent,
    ShadowSupervisorComponent,
    TasksIAssignedComponent,
    MyTeamTasksComponent,
    CreateReminderComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    HomeRoutingModule,
    FormsModule,
    HttpClientModule  // Add HttpClientModule to the imports array
  ]
})
export class HomeModule {}
