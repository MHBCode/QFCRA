import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { HeaderComponent } from './header/header.component';
import { ReturnReviewViewComponent } from '../supervision/return-review/return-review-view/return-review-view.component';


@NgModule({
  declarations: [
    HeaderComponent,
    ReturnReviewViewComponent
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
