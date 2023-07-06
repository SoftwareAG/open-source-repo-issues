import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent,bodyDialogView,titleDialogView} from './app.component';
import { MaterialModule } from './material/material.module';
import {FormsModule} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { DropDownComponent } from './drop-down/drop-down.component';


@NgModule({
  declarations: [
    AppComponent,
    bodyDialogView,
    titleDialogView,
    DropDownComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    FormsModule,
    NgbModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [DropDownComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
