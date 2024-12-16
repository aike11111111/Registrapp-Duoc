import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EscanearqrPageRoutingModule } from './escanearqr-routing.module';

import { EscanearqrPage } from './escanearqr.page';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EscanearqrPageRoutingModule,
    QRCodeModule
  ],
  declarations: [EscanearqrPage]
})
export class EscanearqrPageModule {}
