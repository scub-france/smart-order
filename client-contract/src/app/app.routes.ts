import {Routes} from "@angular/router";
import {MainComponent} from "./components/views/main/main.component";
import {Error403Component} from "./components/views/error-403/error-403.component";
import {Error404Component} from "./components/views/error-404/error-404.component";
import {DoctorViewComponent} from "./components/views/main/doctor/doctor.view.component";
import {PharmacistViewComponent} from "./components/views/main/pharmacist/pharmacist.view.component";
import {PatientViewComponent} from "./components/views/main/patient/patient.view.component";
import {OracleViewComponent} from "./components/views/main/oracle/oracle.view.component";

export const APP_ROUTES: Routes = [
  {
    path: "", component: MainComponent,
    children: [
      {path: "doctor", component: DoctorViewComponent},
      {path: "pharmacist", component: PharmacistViewComponent},
      {path: "patient", component: PatientViewComponent},
      {path: "oracle", component: OracleViewComponent},
    ]
  },
  {path: "error/404", component: Error404Component},
  {path: "error/403", component: Error403Component},
  {path: "**", redirectTo: "error/404", pathMatch: "full"}
];
