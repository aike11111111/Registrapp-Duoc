import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth) {}

  getUsuariosPorUids(uidsAlumnos: string[]): Observable<Usuario[]> {
    return this.firestore.collection<Usuario>('usuarios', ref =>
      ref.where('uid', 'in', uidsAlumnos)
    ).valueChanges();
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.firestore.collection<Usuario>('usuarios').valueChanges(); // Devuelve todos los usuarios de la colección
  }

  // Eliminar un usuario de la colección usuarios por su uid
  eliminarUsuario(uid: string): Promise<void> {
    return this.firestore.collection('usuarios').doc(uid).delete();
  }
}  