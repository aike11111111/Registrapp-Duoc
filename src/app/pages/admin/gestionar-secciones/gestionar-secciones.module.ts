  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule, ReactiveFormsModule } from '@angular/forms';

  import { IonicModule } from '@ionic/angular';

  import { GestionarSeccionesPageRoutingModule } from './gestionar-secciones-routing.module';

  import { GestionarSeccionesPage } from './gestionar-secciones.page';
import { ModalSeccionesComponent } from '../../modales/modal-secciones/modal-secciones.component';

  @NgModule({
    imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      GestionarSeccionesPageRoutingModule,
      ReactiveFormsModule, 
      FormsModule
    ],
    declarations: [GestionarSeccionesPage, ModalSeccionesComponent],
    exports: [ModalSeccionesComponent]
  })
  export class GestionarSeccionesPageModule {}
