import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleSeccionPageRoutingModule } from './detalle-seccion-routing.module';

import { DetalleSeccionPage } from './detalle-seccion.page';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleSeccionPageRoutingModule,
    QRCodeModule
    
  ],
  declarations: [DetalleSeccionPage]
})
export class DetalleSeccionPageModule {}
