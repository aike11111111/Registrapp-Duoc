// sala.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Sala } from 'src/app/interfaces/sala'; 

@Injectable({
  providedIn: 'root'
})
export class SalaService {

  constructor(private firestore: AngularFirestore) {}

  cargarSalas(): Observable<Sala[]> {
    return this.firestore.collection<Sala>('salas').valueChanges();
  }

  async agregarSala(nuevaSala: string): Promise<string> {
    const id_sala = this.firestore.createId(); 
    await this.firestore.collection('salas').doc(id_sala).set({
      id_sala: id_sala,
      nombre_sala: nuevaSala
    });
    return id_sala;
  }

  async eliminarSala(id_sala: string): Promise<void> {
    await this.firestore.collection('salas').doc(id_sala).delete();
  }
}
