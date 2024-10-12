import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorRoutingModule } from './error-routing.module';
import { FirmAccessDeniedComponent } from 'src/app/error/firm-access-denied/firm-access-denied.component';



@NgModule({
  declarations: [
    FirmAccessDeniedComponent
  ],
  imports: [
    CommonModule,
    ErrorRoutingModule 
  ]
})
export class ErrorModule { }
