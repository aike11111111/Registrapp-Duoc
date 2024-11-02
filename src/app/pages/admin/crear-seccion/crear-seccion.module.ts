import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearSeccionPageRoutingModule } from './crear-seccion-routing.module';

import { CrearSeccionPage } from './crear-seccion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearSeccionPageRoutingModule
  ],
  declarations: [CrearSeccionPage]
})
export class CrearSeccionPageModule {}
