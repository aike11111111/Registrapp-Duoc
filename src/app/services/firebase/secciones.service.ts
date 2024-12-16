import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, map, Observable, switchMap, tap } from 'rxjs';
import { AlumnoSeccion } from 'src/app/interfaces/alumno-seccion';
import { Asignatura } from 'src/app/interfaces/asignatura';
import { AsignaturaSeccion } from 'src/app/interfaces/asignatura-seccion';
import { Seccion } from 'src/app/interfaces/seccion';

@Injectable({
  providedIn: 'root'
})
export class SeccionesService {

  seccionesCollection = this.firestore.collection<Seccion>('secciones'); 
  asignaturas: Asignatura[] = [];

  constructor(private firestore: AngularFirestore, private httpClient: HttpClient) {}

  getSecciones(): Observable<Seccion[]> {
    return this.firestore.collection<Seccion>('secciones').valueChanges();
  }

  getSeccionById(id_seccion: string) {
    return this.getSecciones().pipe(
      map(secciones => secciones.find(seccion => seccion.id_seccion === id_seccion))
    )
  }

  getSeccionesPorIds(idsSeccion: string[]): Observable<Seccion[]> {
    return this.firestore.collection<Seccion>('secciones', ref => ref.where('id_seccion', 'in', idsSeccion)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Seccion; 
          return {
            id_seccion: data.id_seccion,
            nombre_seccion: data.nombre_seccion,
            aid: data.aid,
            horario: data.horario,
            sala: data.sala
          };
        });
      })
    );
  }  

  /*getSeccionById(idSeccion: string): Observable<AlumnoSeccion | undefined> {
    console.log('Consultando sección con ID:', idSeccion); // Debug
    return this.firestore.collection<AlumnoSeccion>('alumnos_seccion').doc(idSeccion).valueChanges().pipe(
      tap((seccion) => {
        if (seccion) {
          console.log('Sección obtenida:', seccion); // Debug
        } else {
          console.log('No se encontró la sección con ID:', idSeccion); // Debug
        }
      })
    );
  }*/
  getSeccionesPorAsignatura(aid: string): Observable<Seccion[]> {
    return this.firestore.collection<AsignaturaSeccion>('asignaturas_seccion', ref => ref.where('aid', '==', aid))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => (a.payload.doc.data() as AsignaturaSeccion).id_seccion)),
        switchMap(seccionIds => {
          return this.firestore.collection<Seccion>('secciones', ref => ref.where('id_seccion', 'in', seccionIds))
            .snapshotChanges()
            .pipe(
              map(actions => actions.map(a => {
                const data = a.payload.doc.data() as Seccion;
                return { id: a.payload.doc.id, ...data };
              }))
            );
        })
      );
  }

  
}