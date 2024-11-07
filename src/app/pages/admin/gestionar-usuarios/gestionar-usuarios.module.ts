import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarUsuariosPageRoutingModule } from './gestionar-usuarios-routing.module';

import { GestionarUsuariosPage } from './gestionar-usuarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionarUsuariosPageRoutingModule
  ],
  declarations: [GestionarUsuariosPage]
})
export class GestionarUsuariosPageModule {}
