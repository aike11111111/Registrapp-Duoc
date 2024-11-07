// sala.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Sala } from 'src/app/interfaces/sala'; // Asegúrate de importar la interfaz Sala

@Injectable({
  providedIn: 'root'
})
export class SalaService {

  constructor(private firestore: AngularFirestore) {}

  // Método para cargar las salas usando valueChanges()
  cargarSalas(): Observable<Sala[]> {
    return this.firestore.collection<Sala>('salas').valueChanges();
  }

  // Método para agregar una nueva sala
  async agregarSala(nuevaSala: string): Promise<string> {
    const id_sala = this.firestore.createId(); // Crear un ID único para la sala
    await this.firestore.collection('salas').doc(id_sala).set({
      id_sala: id_sala,
      nombre_sala: nuevaSala
    });
    return id_sala;
  }

  // Método para eliminar una sala
  async eliminarSala(id_sala: string): Promise<void> {
    await this.firestore.collection('salas').doc(id_sala).delete();
  }
}
