import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { ViewFirmPageComponent } from './sub-pages/view-firm-page/view-firm-page.component';
import { NewFirmComponent } from './sub-pages/new-firm/new-firm.component';
import { TasksPageComponent } from './sub-pages/tasksPages/tasks-page/tasks-page.component';
import { IndividualPageComponent } from './sub-pages/individualPages/individual-page/individual-page.component';
import { IndividualRegistrationStatusComponent } from './sub-pages/individualPages/individual-registration-status/individual-registration-status.component';
import { IndividualPendingAiAppsComponent } from './sub-pages/individualPages/individual-pending-ai-apps/individual-pending-ai-apps.component';
import { UserAccessComponent } from './sub-pages/adminPages/user-access/user-access.component';
import { ReAssignTasksComponent } from './sub-pages/adminPages/re-assign-tasks/re-assign-tasks.component';
import { CreateIndividualComponent } from './sub-pages/individualPages/create-individual/create-individual.component';
import { ViewIndividualComponent } from './sub-pages/individualPages/view-individual/view-individual.component';
import { ViewIndividualStatusChangeComponent } from './sub-pages/individualPages/view-individual-status-change/view-individual-status-change.component';
import { DocsComponent } from './sub-pages/individualPages/individual-registration-status-subpages/docs/docs.component';
import { IndividualComponent } from './sub-pages/individualPages/individual-registration-status-subpages/individual/individual.component';
import { RecommendationComponent } from './sub-pages/individualPages/individual-registration-status-subpages/recommendation/recommendation.component';
import { ReportsComponent } from './sub-pages/individualPages/individual-registration-status-subpages/reports/reports.component';
import { TrackingComponent } from './sub-pages/individualPages/individual-registration-status-subpages/tracking/tracking.component';
import { CoSupervisorsComponent } from './sub-pages/co-supervisors/co-supervisors.component';
import { ShadowSupervisorComponent } from './sub-components/shadow-supervisor/shadow-supervisor.component';
import { TasksIAssignedComponent } from './sub-components/tasks-i-assigned/tasks-i-assigned.component';
import { MyTeamTasksComponent } from './sub-components/my-team-tasks/my-team-tasks.component';
import { CreateReminderComponent } from './sub-components/create-reminder/create-reminder.component';
import { TaskListComponent } from './sub-components/task-list/task-list.component';
import { NoticesComponent } from '../supervision/notices/notices.component';
import { EnfActionsComponent } from '../supervision/enf-actions/enf-actions.component';

const routes: Routes = [
  { path: '', component: MainPageComponent},
  { path: 'view-firm/:id', component: ViewFirmPageComponent},
  { path: 'new-firm', component: NewFirmComponent},
  //{ path: 'tasks-page', component: TasksPageComponent},
  { path: 'individual-page', component: IndividualPageComponent},
  { path: 'individual-registration-status', component: IndividualRegistrationStatusComponent},
  { path: 'individual-pending-ai-apps', component: IndividualPendingAiAppsComponent},
  { path: 'userAccess', component: UserAccessComponent},
  { path: 're-assign-tasks', component: ReAssignTasksComponent},
  { path: 'notices-and-responses', component: NoticesComponent},
  { path: 'create-individual', component: CreateIndividualComponent},
  { path: 'view-individual', component: ViewIndividualComponent},
  {
    path: '',
    component: ViewIndividualStatusChangeComponent,
    children: [
      { path: '', redirectTo: 'view-individual-status-change/individual', pathMatch: 'full'},
      { path: 'view-individual-status-change/individual', component: IndividualComponent },
      { path: 'view-individual-status-change/recommendation', component: RecommendationComponent },
      { path: 'view-individual-status-change/tracking', component: TrackingComponent },
      { path: 'view-individual-status-change/docs', component: DocsComponent },
      { path: 'view-individual-status-change/reports', component: ReportsComponent }
    ]
  },
  {
    path: 'home/tasks-page',
    component: TasksPageComponent,
    children: [
      { path: '', redirectTo: 'assigned-tasks', pathMatch: 'full' },
      { path: 'assigned-tasks', component: TaskListComponent },
      { path: 'shadow-supervisor', component: ShadowSupervisorComponent },
      { path: 'tasks-i-assigned', component: TasksIAssignedComponent },
      { path: 'my-team-tasks', component: MyTeamTasksComponent },
      { path: 'create-reminder', component: CreateReminderComponent },
    ]
  },
  { path: 'enforcement-and-disciplinary' , component:EnfActionsComponent},
  { path: 'co-supervisors' , component:CoSupervisorsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
