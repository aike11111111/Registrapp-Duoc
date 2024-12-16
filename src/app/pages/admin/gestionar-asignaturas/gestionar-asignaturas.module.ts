import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarAsignaturasPageRoutingModule } from './gestionar-asignaturas-routing.module';

import { GestionarAsignaturasPage } from './gestionar-asignaturas.page';
import { ModalAsignaturasComponent } from '../../modales/modal-asignaturas/modal-asignaturas.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionarAsignaturasPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [GestionarAsignaturasPage, ModalAsignaturasComponent],
  exports: [ModalAsignaturasComponent]
})
export class GestionarAsignaturasPageModule {}
