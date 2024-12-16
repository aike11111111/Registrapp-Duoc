import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { AsignaturaInscrita } from 'src/app/interfaces/asignatura-inscrita';

@Injectable({
  providedIn: 'root'
})
export class AsignaturaInscritaService {

  constructor(
    private angularFirestore: AngularFirestore
  ) { }

  getInscripciones(): Observable<any[]> {
    return this.angularFirestore.collection('asignatura_inscrita').valueChanges();
  }
  
  getAsignaturasInscritasPorAlumno(idAlumno: string): Observable<AsignaturaInscrita[]> {
    return this.angularFirestore.collection<AsignaturaInscrita>('asignatura_inscrita', ref =>
      ref.where('id_alumno', '==', idAlumno)  
    ).valueChanges();
  }

  getAsignaturaInscrita(idAlumno: string, aidAsignatura: string): Observable<AsignaturaInscrita[]> {
    return this.angularFirestore.collection<AsignaturaInscrita>('asignatura_inscrita', ref =>
      ref.where('id_alumno', '==', idAlumno)
         .where('aid', '==', aidAsignatura)
    ).valueChanges();
  }

  inscribir(nuevaInscripcion: AsignaturaInscrita): Promise<void> {
    const id = nuevaInscripcion.aid_inscripcion;
    return this.angularFirestore.collection('asignatura_inscrita').doc(id).set(nuevaInscripcion);
  }

  eliminarInscripcionn(idAlumno: string, aidAsignatura: string): Promise<void> {
    const ref = this.angularFirestore.collection('asignatura_inscrita')
      .doc(`${idAlumno}_${aidAsignatura}`);  
    return ref.delete();
  }

  eliminarAsignaturaInscritas(idAlumno: string): Promise<void> {
    const asignaturas = this.angularFirestore.collection('asignatura_inscrita', ref => ref.where('id_alumno', '==', idAlumno)).get();

    // Eliminar todas las asignaturas del docente
    asignaturas.forEach((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });

    return Promise.resolve();
  }

  guardarDocumentoSiNoExiste(documento: any): Observable<string> {
    const collectionRef = this.angularFirestore.collection('asignatura_inscrita', ref =>
      ref.where('aid', '==', documento.aid).where('id_alumno', '==', documento.id_alumno)
    );
  
    return collectionRef.get().pipe(
      switchMap((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Documento ya existe, no lo creamos nuevamente
          console.log('Documento ya existe:', querySnapshot.docs[0].data());
          return of('El documento ya existe.');
        } else {
          // El documento no existe, procedemos a crearlo
          return from(this.angularFirestore.collection('asignatura_inscrita').add(documento)).pipe(
            map(() => 'Documento guardado exitosamente.')
          );
        }
      }),
      catchError((error) => {
        console.error('Error al verificar o guardar documento:', error);
        return throwError(() => new Error('Error al guardar documento.'));
      })
    );
  }
  
  eliminarDocumento(aid: string, idAlumno: string): Observable<string> {
    const collectionRef = this.angularFirestore.collection('asignatura_inscrita', ref =>
      ref.where('aid', '==', aid).where('id_alumno', '==', idAlumno)
    );
  
    return collectionRef.get().pipe(
      switchMap((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Eliminamos todos los documentos que coincidan
          const batch = this.angularFirestore.firestore.batch();
          querySnapshot.forEach((doc) => {
            const docRef = this.angularFirestore.collection('asignatura_inscrita').doc(doc.id).ref;
            batch.delete(docRef);
          });
  
          return from(batch.commit()).pipe(
            map(() => 'Documento eliminado exitosamente.')
          );
        } else {
          console.log('No se encontró ningún documento para eliminar.');
          return of('No se encontró ningún documento para eliminar.');
        }
      }),
      catchError((error) => {
        console.error('Error al eliminar documento:', error);
        return throwError(() => new Error('Error al eliminar documento.'));
      })
    );
  }
  
}