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
import { FirmsPageComponent } from './sub-pages/firms-page/firms-page.component';
import { ViewFirmPageComponent } from './sub-pages/view-firm-page/view-firm-page.component';
import { EditFirmComponent } from './sub-pages/edit-firm/edit-firm.component';
import { NewFirmComponent } from './sub-pages/new-firm/new-firm.component';
import { TasksPageComponent } from './sub-pages/tasksPages/tasks-page/tasks-page.component';
import { SharedModule } from '../shared/shared.module';
import { IndividualPageComponent } from './sub-pages/individualPages/individual-page/individual-page.component';
import { IndividualListComponent } from './sub-components/individual-list/individual-list.component';
import { IndividualRegistrationStatusComponent } from './sub-pages/individualPages/individual-registration-status/individual-registration-status.component';
import { IndividualPendingAiAppsComponent } from './sub-pages/individualPages/individual-pending-ai-apps/individual-pending-ai-apps.component';
import { UserAccessComponent } from './sub-pages/adminPages/user-access/user-access.component';
import { ReAssignTasksComponent } from './sub-pages/adminPages/re-assign-tasks/re-assign-tasks.component';
import { FirmReportsComponent } from './sub-pages/reportsPages/firm-reports/firm-reports.component';
import { NoticesAndResponsesComponent } from './sub-pages/notices-and-responses/notices-and-responses.component';
import { CreateNoticesComponent } from './sub-pages/create-notices/create-notices.component';
import { EnforcementAndDisciplinaryActionComponent } from './sub-pages/enforcement-and-disciplinary-action/enforcement-and-disciplinary-action.component';
import { CoSupervisorsComponent } from './sub-pages/co-supervisors/co-supervisors.component';
import { CreateIndividualComponent } from './sub-pages/individualPages/create-individual/create-individual.component';
import { ViewIndividualComponent } from './sub-pages/individualPages/view-individual/view-individual.component';
import { ViewIndividualStatusChangeComponent } from './sub-pages/individualPages/view-individual-status-change/view-individual-status-change.component';
import { ViewControllerComponent } from './sub-pages/view-controller/view-controller.component';
import { EditControllerComponent } from './sub-pages/edit-controller/edit-controller.component';
import { CreateControllerComponent } from './sub-pages/create-controller/create-controller.component';


@NgModule({
  declarations: [
    MainPageComponent,
    StatisticsHeaderComponent,
    AIByFunctionComponent,
    ReportsSubmissionsComponent,
    FirmsBySelectorComponent,
    TaskListComponent,
    FirmListComponent,
    FirmsPageComponent,
    ViewFirmPageComponent,
    EditFirmComponent,
    NewFirmComponent,
    TasksPageComponent,
    IndividualPageComponent,
    IndividualListComponent,
    IndividualRegistrationStatusComponent,
    IndividualPendingAiAppsComponent,
    FirmReportsComponent,
    UserAccessComponent,
    ReAssignTasksComponent,
    NoticesAndResponsesComponent,
    CreateNoticesComponent,
    EnforcementAndDisciplinaryActionComponent,
    CoSupervisorsComponent,
    CreateIndividualComponent,
    ViewIndividualComponent,
    ViewIndividualStatusChangeComponent,
    ViewControllerComponent,
    EditControllerComponent,
    CreateControllerComponent,
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
