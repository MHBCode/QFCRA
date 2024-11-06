import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateContactComponent } from './home/sub-pages/create-contact/create-contact.component';
import { DetailsLayoutComponent } from './details-layout-component/details-layout-component.component';



@NgModule({
  declarations: [
    AppComponent,
    CreateContactComponent,
    DetailsLayoutComponent,
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
