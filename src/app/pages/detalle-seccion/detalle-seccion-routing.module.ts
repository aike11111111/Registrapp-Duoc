import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleSeccionPage } from './detalle-seccion.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleSeccionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleSeccionPageRoutingModule {}
