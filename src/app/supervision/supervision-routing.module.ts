import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DetailsLayoutComponent } from '../details-layout-component/details-layout-component.component';
import { SupervisionViewComponent } from './supervision-view/supervision-view.component';
import { ReportingScheduleComponent } from './reporting-schedule/reporting-schedule.component';
import { ReturnReviewComponent } from './return-review/return-review.component';
import { NoticesComponent } from './notices/notices.component';
import { AdminFeeComponent } from './admin-fee/admin-fee.component';
import { RmpsComponent } from './rmps/rmps.component';
import { WaiversComponent } from './waivers/waivers.component';
import { BreachesComponent } from './breaches/breaches.component';
import { EnfActionsComponent } from './enf-actions/enf-actions.component';
import { RegFundsComponent } from './reg-funds/reg-funds.component';
import { JournalComponent } from './journal/journal.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'view',
        component: DetailsLayoutComponent,
        children: [
          {
            path: ':id',
            component: SupervisionViewComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'Supervision Details' },
          },
          {
            path: 'reporting-schedule/:id',
            component: ReportingScheduleComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'Reporting Schedule' },
          },
          {
            path: 'return-review/:id/:firmRptSchID',
            component: ReturnReviewComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'Return Review' },
          },
          {
            path: 'notices/:id',
            component: NoticesComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'Notices' },
          },
          {
            path: 'admin-fee/:id',
            component: AdminFeeComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'Admin Fee' },
          },
          {
            path: 'RMPs/:id',
            component: RmpsComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'RMPs' },
          },
          {
            path: 'breaches/:id',
            component: BreachesComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'Breaches' },
          },
          {
            path: 'waivers/:id',
            component: WaiversComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'Waivers' },
          },
          {
            path: 'enforcement-actions/:id',
            component: EnfActionsComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'Enforcement Actions' },
          },
          {
            path: 'registered-fund/:id',
            component: RegFundsComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'Registered Fund' },
          },
          {
            path: 'journal/:id',
            component: JournalComponent,
            data: { subsiteName: 'Supervision', pageTitle: 'Journal' },
          }
        ],
      },
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SupervisionRoutingModule { }

