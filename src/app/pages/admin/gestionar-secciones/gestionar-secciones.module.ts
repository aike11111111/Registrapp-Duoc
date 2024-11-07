  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule, ReactiveFormsModule } from '@angular/forms';

  import { IonicModule } from '@ionic/angular';

  import { GestionarSeccionesPageRoutingModule } from './gestionar-secciones-routing.module';

  import { GestionarSeccionesPage } from './gestionar-secciones.page';
import { GestionarModalComponent } from '../../modales/gestionar-modal/gestionar-modal.component';

  @NgModule({
    imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      GestionarSeccionesPageRoutingModule,
      ReactiveFormsModule, 
      FormsModule
    ],
    declarations: [GestionarSeccionesPage, GestionarModalComponent],
    exports: [GestionarModalComponent]
  })
  export class GestionarSeccionesPageModule {}
