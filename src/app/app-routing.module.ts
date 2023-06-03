import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingRoutingModule } from './app-routing-routing.module';
import {RouterModule, Routes} from "@angular/router";
import {Home1Component} from "./pages/home1/home1.component";
import {Home2Component} from "./pages/home2/home2.component";
import {Home3Component} from "./pages/home3/home3.component";



const routes: Routes = [
  { path: '', redirectTo: '/home1', pathMatch: 'full' },
  { path: 'home1', component: Home1Component },
  { path: 'home2', component: Home2Component },
  { path: 'home3', component: Home3Component },
];

@NgModule({
  declarations: [],

  exports: [RouterModule],
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    CommonModule,
    AppRoutingRoutingModule
  ]
})
export class AppRoutingModule { }
