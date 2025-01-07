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
import { WorkflowComponent } from './workflow/workflow.component';
import { ReferenceFormComponent } from './reference-form/reference-form.component';
import { FirmPopupFilterComponent } from './firm-popup-filter/firm-popup-filter.component';
@NgModule({
  declarations: [
    DataPlaceComponent,
    AttachmentComponent,
    LoaderComponent,
    PaginationComponent,
    ReviewComponent,
    WorkflowComponent,
    ReferenceFormComponent,
    FirmPopupFilterComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CKEditorModule
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
    ReviewComponent,
    WorkflowComponent,
    ReferenceFormComponent,
    FirmPopupFilterComponent
  ]
})
export class SharedModule { }
