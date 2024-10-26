import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FirmsRoutingModule } from './firms-routing.module';
import { FirmsListComponent } from './firms-list/firms-list.component';
import { FirmsPageComponent } from './firms-page/firms-page.component';
import { FirmsDetailsComponent } from './firms-details/firms-details.component';
import { NewFirmComponent } from './new-firm/new-firm.component';
import { CoreDetailsComponent } from './core-details/core-details.component';
import { ScopeComponent } from './scope/scope.component';
import { ControllersComponent } from './controllers/controllers.component';
import { AuditorsComponent } from './auditors/auditors.component';
import { ContactsComponent } from './contacts/contacts.component';



@NgModule({
  declarations: [
    FirmsDetailsComponent,
    FirmsListComponent,
    FirmsPageComponent,
    NewFirmComponent,
    CoreDetailsComponent,
    ScopeComponent,
    ControllersComponent,
    AuditorsComponent,
    ContactsComponent

  ],
  imports: [
    CommonModule,
    SharedModule,
    FirmsRoutingModule,
  ]
})
export class FirmsModule { }
