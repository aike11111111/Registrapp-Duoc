import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private firestore: AngularFirestore) {}

  getUsuariosPorUids(uidsAlumnos: string[]): Observable<Usuario[]> {
    return this.firestore.collection<Usuario>('usuarios', ref =>
      ref.where('uid', 'in', uidsAlumnos)
    ).valueChanges();
  }
}
