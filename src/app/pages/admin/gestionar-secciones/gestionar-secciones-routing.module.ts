import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarSeccionesPage } from './gestionar-secciones.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarSeccionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarSeccionesPageRoutingModule {}
