import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { SharedRoutingModule } from './shared-routing.module';
import { DataPlaceComponent } from './data-place/data-place.component';
import { AttachmentComponent } from './attachment/attachment.component';
import { LoaderComponent } from './loader/loader.component';
import { PaginationComponent } from './pagination/pagination.component';
import { ToolbarService, LinkService, ImageService, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor'

@NgModule({
  declarations: [
    DataPlaceComponent,
    AttachmentComponent,
    LoaderComponent,
    PaginationComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RichTextEditorAllModule
  ],
  exports: [
    DataPlaceComponent,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AttachmentComponent,
    LoaderComponent,
    PaginationComponent,
    RichTextEditorAllModule
  ],
  providers: [
    ToolbarService,
    LinkService,
    ImageService,
    HtmlEditorService
  ],
})
export class SharedModule { }
