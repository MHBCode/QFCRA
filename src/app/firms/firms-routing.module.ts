import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FirmsPageComponent } from './firms-page/firms-page.component';
import { NewFirmComponent } from './new-firm/new-firm.component';
import { FirmsDetailsComponent } from './firms-details/firms-details.component';
import { DetailsLayoutComponent } from '../details-layout-component/details-layout-component.component';
import { ScopeComponent } from './scope/scope.component';
import { CoreDetailsComponent } from './core-details/core-details.component';
import { ControllersComponent } from './controllers/controllers.component';
import { AuditorsComponent } from './auditors/auditors.component';
import { ContactsComponent } from './contacts/contacts.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: FirmsPageComponent },
      { path: 'new-firm', component: NewFirmComponent },
      {
        path: 'view',
        component: DetailsLayoutComponent,
        children: [
          {
            path: ':id',
            component: FirmsDetailsComponent          },
          {
            path: 'core-details/:id',
            component: CoreDetailsComponent          },
          {
            path: 'controllers/:id',
            component: ControllersComponent
          },
          {
            path: 'auditors/:id',
            component: AuditorsComponent
          },
          {
            path: 'contacts/:id',
            component: ContactsComponent
          },
          {
            path: 'scope/:id',
            component: ScopeComponent
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

export class FirmsRoutingModule { }

