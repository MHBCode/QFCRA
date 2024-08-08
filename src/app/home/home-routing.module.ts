import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { FirmsPageComponent } from './sub-pages/firms-page/firms-page.component';
import { ViewFirmPageComponent } from './sub-pages/view-firm-page/view-firm-page.component';
import { EditFirmComponent } from './sub-pages/edit-firm/edit-firm.component';
import { NewFirmComponent } from './sub-pages/new-firm/new-firm.component';
import { TasksPageComponent } from './sub-pages/tasksPages/tasks-page/tasks-page.component';
import { IndividualPageComponent } from './sub-pages/individualPages/individual-page/individual-page.component';
import { IndividualRegistrationStatusComponent } from './sub-pages/individualPages/individual-registration-status/individual-registration-status.component';
import { IndividualPendingAiAppsComponent } from './sub-pages/individualPages/individual-pending-ai-apps/individual-pending-ai-apps.component';
import { UserAccessComponent } from './sub-pages/adminPages/user-access/user-access.component';
import { ReAssignTasksComponent } from './sub-pages/adminPages/re-assign-tasks/re-assign-tasks.component';
import { FirmReportsComponent } from './sub-pages/reportsPages/firm-reports/firm-reports.component';
import { NoticesAndResponsesComponent } from './sub-pages/notices-and-responses/notices-and-responses.component';
import { CreateIndividualComponent } from './sub-pages/individualPages/create-individual/create-individual.component';
import { ViewIndividualComponent } from './sub-pages/individualPages/view-individual/view-individual.component';
import { ViewIndividualStatusChangeComponent } from './sub-pages/individualPages/view-individual-status-change/view-individual-status-change.component';
import { DocsComponent } from './sub-pages/individualPages/individual-registration-status-subpages/docs/docs.component';
import { IndividualComponent } from './sub-pages/individualPages/individual-registration-status-subpages/individual/individual.component';
import { RecommendationComponent } from './sub-pages/individualPages/individual-registration-status-subpages/recommendation/recommendation.component';
import { ReportsComponent } from './sub-pages/individualPages/individual-registration-status-subpages/reports/reports.component';
import { TrackingComponent } from './sub-pages/individualPages/individual-registration-status-subpages/tracking/tracking.component';
import { CreateNoticesComponent } from './sub-pages/create-notices/create-notices.component';
import { EnforcementAndDisciplinaryActionComponent } from './sub-pages/enforcement-and-disciplinary-action/enforcement-and-disciplinary-action.component';
import { CoSupervisorsComponent } from './sub-pages/co-supervisors/co-supervisors.component';
const routes: Routes = [
  { path: '', component: MainPageComponent},
  { path: 'firms-page', component: FirmsPageComponent},
  { path: 'view-firm/:id', component: ViewFirmPageComponent},
  { path: 'edit-firm', component: EditFirmComponent},
  { path: 'new-firm', component: NewFirmComponent},
  { path: 'tasks-page', component: TasksPageComponent},
  { path: 'individual-page', component: IndividualPageComponent},
  { path: 'individual-registration-status', component: IndividualRegistrationStatusComponent},
  { path: 'individual-pending-ai-apps', component: IndividualPendingAiAppsComponent},
  { path: 'firm-reports', component: FirmReportsComponent},
  { path: 'userAccess', component: UserAccessComponent},
  { path: 're-assign-tasks', component: ReAssignTasksComponent},
  { path: 'notices-and-responses', component: NoticesAndResponsesComponent},
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
  { path: 'notices-and-responses', component: NoticesAndResponsesComponent},
  { path: 'create-notices' , component: CreateNoticesComponent},
  { path: 'enforcement-and-disciplinary' , component:EnforcementAndDisciplinaryActionComponent},
  { path: 'co-supervisors' , component:CoSupervisorsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
