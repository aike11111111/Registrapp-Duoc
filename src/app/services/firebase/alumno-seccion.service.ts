import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable, switchMap } from 'rxjs';
import { Alumno } from 'src/app/interfaces/alumno';
import { AlumnoSeccion } from 'src/app/interfaces/alumno-seccion';

@Injectable({
  providedIn: 'root'
})
export class AlumnoSeccionService {

  constructor(private angularFirestore: AngularFirestore) { }

  getAlumnosSeccion(): Observable<AlumnoSeccion[]> {
    return this.angularFirestore.collection<AlumnoSeccion>('alumnos_seccion').valueChanges();
  }

  getAlumnosPorSeccion(idSeccion: string): Observable<AlumnoSeccion[]> {
    return this.angularFirestore.collection<AlumnoSeccion>('alumnos_seccion', ref =>
      ref.where('id_seccion', '==', idSeccion)
    ).valueChanges();
  }  
  // En el servicio alumnoSeccionService
  getAlumnosByIdSeccion(idSeccion: string): Observable<AlumnoSeccion[]> {
    return this.angularFirestore.collection<AlumnoSeccion>('alumnos_seccion', ref => ref.where('id_seccion', '==', idSeccion)).valueChanges();
  }

  getAlumnosByIdAlumno(id_alumno: string) {
    return this.getAlumnosSeccion().pipe(
      map((alumnos_seccion: AlumnoSeccion[]) => alumnos_seccion.filter(alumno => alumno.id_alumno === id_alumno))
    );
  }
}
