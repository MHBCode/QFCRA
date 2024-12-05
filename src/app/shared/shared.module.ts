import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { SharedRoutingModule } from './shared-routing.module';
import { DataPlaceComponent } from './data-place/data-place.component';
import { AttachmentComponent } from './attachment/attachment.component';
import { LoaderComponent } from './loader/loader.component';
import { PaginationComponent } from './pagination/pagination.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ReviewComponent } from './review/review.component';

@NgModule({
  declarations: [
    DataPlaceComponent,
    AttachmentComponent,
    LoaderComponent,
    PaginationComponent,
    ReviewComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [
    DataPlaceComponent,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AttachmentComponent,
    LoaderComponent,
    PaginationComponent,
    CKEditorModule,
    ReviewComponent
  ]
})
export class SharedModule { }
