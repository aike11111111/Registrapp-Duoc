import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { Alumno } from 'src/app/interfaces/alumno';
import { AlumnoSeccion } from 'src/app/interfaces/alumno-seccion';
import { Seccion } from 'src/app/interfaces/seccion';

@Injectable({
  providedIn: 'root'
})
export class AlumnosService {

  alumnos: Alumno[] = [];

  constructor(private angularFirestore: AngularFirestore) { }

  getAlumnos(): Observable<Alumno[]> {
    return this.angularFirestore.collection<Alumno>('alumnos').valueChanges();
  }

  getNombresDeAlumnos(): Observable<{ id_alumno: string; nombre: string }[]> {
    const alumnos$ = this.angularFirestore.collection('alumnos').valueChanges();
    const usuarios$ = this.angularFirestore.collection('usuarios').valueChanges();
  
    return combineLatest([alumnos$, usuarios$]).pipe(
      map(([alumnos, usuarios]: [any[], any[]]) => {
        return alumnos.map(alumno => {
          const usuario = usuarios.find(user => user.uid === alumno.uid); // Comparar UID
          return {
            id_alumno: alumno.id_alumno, // ID del alumno
            nombre: usuario?.nombre || 'Nombre no encontrado' // Nombre del usuario o valor por defecto
          };
        });
      })
    );
  }  

  obtenerIdAlumnoPorUid(uid: string): Observable<any[]> {
    return this.angularFirestore.collection('usuarios', ref => ref.where('uid', '==', uid)).valueChanges();
  }

  getIdAlumnoPorUid(uid: string): Observable<any[]> {
    return this.angularFirestore.collection('alumnos', ref => ref.where('uid', '==', uid)).valueChanges();
  }

  cargarAlumno(uidUsuario: string): Observable<Alumno> {
    return this.getAlumnos().pipe(
      map(alumnos => {
        const alumnoFiltrado = alumnos.find(alumno => alumno.uid === uidUsuario);
        if (!alumnoFiltrado) throw new Error('No se encontró un alumno.');
        return alumnoFiltrado;
      })
    );
  }

  //alumnos_seccion
  getSeccionesIdsPorAlumno(idAlumno: string): Observable<string[]> {
    return this.angularFirestore.collection<AlumnoSeccion>('alumnos_seccion', ref => ref.where('id_alumno', '==', idAlumno)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as AlumnoSeccion;
          return data.id_seccion; // Retorna solo el id_seccion
        }).filter(id => id !== undefined);
      })
    );
  }

  getAlumnosPorIDs(ids: string[]): Observable<any[]> {
    return this.angularFirestore.collection('alumnos', ref => ref.where('id_alumno', 'in', ids)).snapshotChanges();
  }

  getAlumnoByUid(uid: string) {
  return this.getAlumnos().pipe(
    map(alumnos => alumnos.find(alumno => alumno.uid === uid))
    );
  }

  getAlumnosPorIds(idsAlumnos: string[]): Observable<Alumno[]> {
    return this.angularFirestore.collection<Alumno>('alumnos', ref =>
      ref.where('id_alumno', 'in', idsAlumnos)
    ).valueChanges();
  }  

  verificarInscripcion(idAlumno: string, idSeccion: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.angularFirestore.collection('alumnos_seccion', ref => 
        ref.where('id_alumno', '==', idAlumno)
           .where('id_seccion', '==', idSeccion)
      ).get().subscribe(snapshot => {
        observer.next(!snapshot.empty);
        observer.complete();
      }, error => {
        console.error('Error verificando inscripción:', error);
        observer.error(error);
      });
    });
  }

  // Método auxiliar para obtener detalles de los alumnos
  obtenerDetallesAlumnos(idsAlumnos: string[]): Observable<Alumno[]> {
    return this.angularFirestore.collection<Alumno>('alumnos', ref => 
      ref.where('id_alumno', 'in', idsAlumnos)).valueChanges();
  }

  getAlumnosPorSeccion(idSeccion: string): Observable<Alumno[]> {
    return this.angularFirestore.collection<AlumnoSeccion>('alumnos_seccion', ref =>
      ref.where('id_seccion', '==', idSeccion)
    ).valueChanges().pipe(
      switchMap(alumnosSeccion => {
        const alumnosIds = alumnosSeccion.map(alumno => alumno.id_alumno); // Suponiendo que id_alumno está en AlumnoSeccion
        return this.angularFirestore.collection<Alumno>('alumnos', ref =>
          ref.where('id_alumno', 'in', alumnosIds) // Cambia 'id_alumno' al nombre de campo correspondiente
        ).valueChanges().pipe(
          map(alumnos => alumnos.map(alumno => ({
            id_alumno: alumno.id_alumno, // Cambia según las propiedades de tu interfaz Alumno
            uid: alumno.uid, // Cambia según las propiedades de tu interfaz Alumno
            // Aquí puedes agregar más propiedades si es necesario
            seccion: idSeccion // O eliminarlo si no es parte de Alumno
          })))
        );
      })
    );
  }

  getSeccionesPorIds(idsSecciones: string[]): Observable<any[]> {
    return new Observable<any[]>((observer) => {
      this.angularFirestore.collection('secciones', ref => 
        ref.where('id_seccion', 'in', idsSecciones)
      ).get().subscribe(snapshot => {
        const secciones = snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...(data as Record<string, any>) }; // Asegúrate de que data sea un objeto
        });
        observer.next(secciones);
        observer.complete();
      }, error => {
        console.error('Error obteniendo secciones:', error);
        observer.error(error);
      });
    });
  }

  asignarAlumnoAAAsignatura(idAlumno: string, aid: string) {
    const sidAlumno = this.angularFirestore.createId(); // Usando createId() para generar un ID único
  
    const alumnoAsignaturaData = {
      id_alumno: idAlumno,
      aid: aid,
      sid_alumno: sidAlumno,  // Asigna el ID generado
    };
  
    this.angularFirestore.collection('alumnos_asignatura').doc(sidAlumno).set(alumnoAsignaturaData)
      .then(() => {
        console.log('Alumno asignado correctamente a la asignatura');
  
        // Aquí puedes hacer lo que necesites después de asignar el alumno, como actualizar la lista de alumnos
        // Si es necesario, puedes filtrar y cargar nuevamente los alumnos por asignatura.
      })
      .catch(error => {
        console.error('Error al asignar alumno a asignatura:', error);
      });
  }
  
  eliminarAlumnoPorUid(uid: string): Promise<void> {
    return this.angularFirestore.collection('alumnos', ref => ref.where('uid', '==', uid)).get().toPromise().then(querySnapshot => {
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
}


