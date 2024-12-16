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

  obtenerIdDocentePorUid(uid: string): Observable<any> {
    return this.firestore.collection('docentes', ref => ref.where('uid', '==', uid)).valueChanges();
  }

  // docentes.service.ts
  obtenerDocentePorUid(uid: string) {
  return this.firestore.collection('docentes', ref => ref.where('uid', '==', uid)).get().toPromise();
  }

  eliminarDocentePorUid(uid: string): Promise<void> {
    return this.firestore.collection('docentes', ref => ref.where('uid', '==', uid)).get().toPromise().then(querySnapshot => {
      if (querySnapshot && !querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          doc.ref.delete(); // Elimina el documento encontrado
        });
      } else {
        console.log('No se encontró ningún documento para eliminar.');
      }
    }).catch(error => {
      console.error('Error al eliminar el documento del docente:', error);
    });
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
