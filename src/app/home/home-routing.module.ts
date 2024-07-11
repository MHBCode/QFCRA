import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { FirmsPageComponent } from './sub-pages/firms-page/firms-page.component';
import { ViewFirmPageComponent } from './sub-pages/view-firm-page/view-firm-page.component';
import { EditFirmComponent } from './sub-pages/edit-firm/edit-firm.component';
import { NewFirmComponent } from './sub-pages/new-firm/new-firm.component';
import { TasksPageComponent } from './sub-pages/tasksPages/tasks-page/tasks-page.component';
const routes: Routes = [
  { path: '', component: MainPageComponent},
  { path: 'firms-page', component: FirmsPageComponent},
  { path: 'view-firm/:id', component: ViewFirmPageComponent},
  { path: 'edit-firm', component: EditFirmComponent},
  { path: 'new-firm', component: NewFirmComponent},
  { path: 'tasks-page', component: TasksPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
