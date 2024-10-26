import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainModule } from './main/main.module';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(mod => mod.HomeModule)
  },
  {
    path: '',
    loadChildren: () => import('./home/home.module').then((mod) => mod.HomeModule)
  },
  { path: 'firms',
    loadChildren: () => import('./firms/firms.module').then(m => m.FirmsModule) 
  },
  {
    path: 'error',
    loadChildren: () => import('./error/error.module').then(mod => mod.ErrorModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
  ],
  exports: [RouterModule,
    MainModule
  ]
})
export class AppRoutingModule { }
