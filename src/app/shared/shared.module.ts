import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { DataPlaceComponent } from './data-place/data-place.component';


@NgModule({
  declarations: [
    DataPlaceComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports: [
    DataPlaceComponent
  ]
})
export class SharedModule { }
