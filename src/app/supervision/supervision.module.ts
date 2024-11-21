import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisionViewComponent } from './supervision-view/supervision-view.component';
import { ReportingScheduleViewComponent } from './reporting-schedule/reporting-schedule-view/reporting-schedule-view.component';
import { ReportingScheduleComponent } from './reporting-schedule/reporting-schedule.component';
import { ReturnReviewComponent } from './return-review/return-review.component';
import { NoticesComponent } from './notices/notices.component';
import { AdminFeeComponent } from './admin-fee/admin-fee.component';
import { RmpsComponent } from './rmps/rmps.component';
import { WaiversComponent } from './waivers/waivers.component';
import { EnfActionsComponent } from './enf-actions/enf-actions.component';
import { RegFundsComponent } from './reg-funds/reg-funds.component';
import { JournalComponent } from './journal/journal.component';
import { BreachesComponent } from './breaches/breaches.component';
import { SupervisionRoutingModule } from './supervision-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AdminFeePopupComponent } from './admin-fee/admin-fee-popup/admin-fee-popup.component';
import { JournalViewDetailsComponent } from './journal/journal-view-details/journal-view-details.component';
import { NoticesDetailsComponent } from './notices/notices-details/notices-details.component';



@NgModule({
  declarations: [
    SupervisionViewComponent,
    ReportingScheduleComponent,
    ReturnReviewComponent,
    NoticesComponent,
    AdminFeeComponent,
    RmpsComponent,
    WaiversComponent,
    EnfActionsComponent,
    RegFundsComponent,
    JournalComponent,
    ReportingScheduleViewComponent,
    BreachesComponent,
    AdminFeePopupComponent,
    JournalViewDetailsComponent,
    NoticesDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SupervisionRoutingModule
  ]
})
export class SupervisionModule { }
