import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable, switchMap } from 'rxjs';
import { Alumno } from 'src/app/interfaces/alumno';
import { AlumnoSeccion } from 'src/app/interfaces/alumno-seccion';
import { AlumnosService } from './alumnos.service';

@Injectable({
  providedIn: 'root'
})
export class AlumnoSeccionService {

  constructor(private angularFirestore: AngularFirestore, private alumnosService: AlumnosService) { }

  getAlumnosSeccion(): Observable<AlumnoSeccion[]> {
    return this.angularFirestore.collection<AlumnoSeccion>('alumnos_seccion').valueChanges();
  }

  getAlumnosPorSeccion(idSeccion: string): Observable<AlumnoSeccion[]> {
    return this.angularFirestore.collection<AlumnoSeccion>('alumnos_seccion', ref =>
      ref.where('id_seccion', '==', idSeccion)
    ).valueChanges();
  }  

  getAlumnosByIdSeccion(idSeccion: string): Observable<AlumnoSeccion[]> {
    return this.angularFirestore.collection<AlumnoSeccion>('alumnos_seccion', ref => ref.where('id_seccion', '==', idSeccion)).valueChanges();
  }

  getAlumnosByIdAlumno(id_alumno: string) {
    return this.getAlumnosSeccion().pipe(
      map((alumnos_seccion: AlumnoSeccion[]) => alumnos_seccion.filter(alumno => alumno.id_alumno === id_alumno))
    );
  }

  getAlumnosSinSeccion(): Observable<any[]> {
    return new Observable<any[]>((observer) => {
      this.alumnosService.getAlumnos().subscribe((alumnos: any[]) => {
        this.angularFirestore.collection<AlumnoSeccion>('alumnos_seccion').valueChanges().subscribe((alumnosSeccion: AlumnoSeccion[]) => {
          const alumnosConSeccionIds = alumnosSeccion.map((as) => as.id_alumno);
          const alumnosSinSeccion = alumnos.filter((alumno) => !alumnosConSeccionIds.includes(alumno.id_alumno));

          observer.next(alumnosSinSeccion);
          observer.complete();
        });
      });
    });
  }

  eliminarAlumnoSeccion(idAlumno: string): Promise<void> {
    const alumnos = this.angularFirestore.collection('alumnos_seccion', ref => ref.where('id_alumno', '==', idAlumno)).get();

    // Eliminar todas las asignaturas del docente
    alumnos.forEach((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });

    return Promise.resolve();
  }
}
