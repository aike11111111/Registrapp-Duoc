import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarAlumnosPage } from './gestionar-alumnos.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarAlumnosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarAlumnosPageRoutingModule {}
