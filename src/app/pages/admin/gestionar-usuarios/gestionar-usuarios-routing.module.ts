import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarUsuariosPage } from './gestionar-usuarios.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarUsuariosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarUsuariosPageRoutingModule {}
