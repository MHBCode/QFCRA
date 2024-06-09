import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
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
    NewFirmComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
