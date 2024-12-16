import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarUsuariosPageRoutingModule } from './gestionar-usuarios-routing.module';

import { GestionarUsuariosPage } from './gestionar-usuarios.page';
import { ModalUsuariosComponent } from '../../modales/modal-usuarios/modal-usuarios.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    GestionarUsuariosPageRoutingModule
  ],
  declarations: [GestionarUsuariosPage, ModalUsuariosComponent],
  exports: [ModalUsuariosComponent]
})
export class GestionarUsuariosPageModule {}
