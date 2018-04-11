import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { AppComponent } from "./app.component";
import { Web3Service } from "./services/web3/web3.service";
import { APP_ROUTES } from "./app.routes";
import { RouterModule } from "@angular/router";
import { MainComponent } from "./components/views/main/main.component";
import { Error404Component } from "./components/views/error-404/error-404.component";
import { Error403Component } from "./components/views/error-403/error-403.component";
import { DoctorViewComponent } from "./components/views/main/doctor/doctor.view.component";
import { PharmacistViewComponent } from "./components/views/main/pharmacist/pharmacist.view.component";
import { PatientViewComponent } from "./components/views/main/patient/patient.view.component";
import { AboutViewComponent } from "./components/views/main/about/about.view.component";

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(APP_ROUTES),
    FormsModule,
    ReactiveFormsModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    MainComponent,
    AboutViewComponent,
    DoctorViewComponent,
    PharmacistViewComponent,
    PatientViewComponent,
    Error404Component,
    Error403Component
  ],
  providers: [
    Web3Service
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
