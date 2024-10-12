import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FirmAccessDeniedComponent } from './firm-access-denied/firm-access-denied.component';


const routes: Routes = [
  { path: 'FirmAccessDenied', component: FirmAccessDeniedComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErrorRoutingModule {}
