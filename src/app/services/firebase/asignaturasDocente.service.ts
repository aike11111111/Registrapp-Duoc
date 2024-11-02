import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firestore } from 'firebase-admin';
import { Observable } from 'rxjs';
import { AsignaturaDocente } from 'src/app/interfaces/asignatura-docente';

@Injectable({
  providedIn: 'root'
})
export class AsignaturaDocenteService {

  asignaturaDocente: AsignaturaDocente[] = [] 

  constructor(private firestore: AngularFirestore) { }

  getAsignaturasDocente(): Observable<AsignaturaDocente[]> {
    return this.firestore.collection<AsignaturaDocente>('asignaturas_docente').valueChanges();
  }

  getAsignaturasDocentePorId(idDocente: string): Observable<AsignaturaDocente[]> {
    return this.firestore.collection<AsignaturaDocente>('asignaturas_docente', ref =>
      ref.where('id_docente', '==', idDocente) 
    ).valueChanges();
  }
}

