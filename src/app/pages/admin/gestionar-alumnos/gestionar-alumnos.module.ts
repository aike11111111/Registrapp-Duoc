import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarAlumnosPageRoutingModule } from './gestionar-alumnos-routing.module';

import { GestionarAlumnosPage } from './gestionar-alumnos.page';
import { ModalAlumnosComponent } from '../../modales/modal-alumnos/modal-alumnos.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionarAlumnosPageRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [GestionarAlumnosPage, ModalAlumnosComponent],
  exports: [ModalAlumnosComponent]
})
export class GestionarAlumnosPageModule {}
