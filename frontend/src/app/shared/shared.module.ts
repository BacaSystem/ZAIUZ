import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NavbarComponent } from "./components/nav-bar/nav-bar.component";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent
  ],
  exports: [NavbarComponent]
})
export class SharedModule { }
