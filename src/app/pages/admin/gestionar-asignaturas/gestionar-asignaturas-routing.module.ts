import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarAsignaturasPage } from './gestionar-asignaturas.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarAsignaturasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarAsignaturasPageRoutingModule {}
