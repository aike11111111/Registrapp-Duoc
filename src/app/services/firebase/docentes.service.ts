import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Asignatura } from 'src/app/interfaces/asignatura';
import { Docente } from 'src/app/interfaces/docente';
import { Usuario } from 'src/app/interfaces/usuario';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DocentesService {

  docentes: Docente[] = [];

  constructor(private firestore: AngularFirestore) {}

  getDocentes(): Observable<Docente[]> {
    return this.firestore.collection<Docente>('docentes').valueChanges();
  }

  cargarDocente(uidUsuario: string): Observable<Docente> {
    return this.getDocentes().pipe(
      map(docentes => {
        const docenteFiltrado = docentes.find(docente => docente.uid === uidUsuario);
        if (!docenteFiltrado) throw new Error('No se encontró un docente.');
        return docenteFiltrado;
      })
    );
  }
}
