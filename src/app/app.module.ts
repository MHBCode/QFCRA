import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { FirmListComponent } from './home/sub-components/firm-list/firm-list.component';
import { CreateContactComponent } from './home/sub-pages/create-contact/create-contact.component';


@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    CreateContactComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
