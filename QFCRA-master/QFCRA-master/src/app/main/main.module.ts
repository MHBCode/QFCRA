import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { HeaderComponent } from './header/header.component';


@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
  ],
  exports:[
    HeaderComponent
  ]
})
export class MainModule { }
