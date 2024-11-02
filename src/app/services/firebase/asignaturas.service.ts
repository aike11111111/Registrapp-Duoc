import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable, switchMap, tap } from 'rxjs';
import { Asignatura } from 'src/app/interfaces/asignatura';
import { AsignaturaSeccion } from 'src/app/interfaces/asignatura-seccion';
import { Seccion } from 'src/app/interfaces/seccion';

@Injectable({
  providedIn: 'root'
})

export class AsignaturasService {

  asignaturas: Asignatura[] = []
    
  constructor(private firestore: AngularFirestore) { }

  getAsignaturas(): Observable<Asignatura[]> {
    return this.firestore.collection<Asignatura>('asignaturas').valueChanges();
  }

  getAsignaturasFiltradas(aids: string[]): Observable<Asignatura[]> {
    return this.firestore.collection<Asignatura>('asignaturas', ref => 
      ref.where('aid', 'in', aids) // Filtra por la lista de IDs
    ).valueChanges();
  }
  // Obtener todas las asignaturas
  async guardarAsignatura(nombre: string, descripcion: string) {
    const aid = this.firestore.createId(); // Crear un ID único para la asignatura

    try {
      // Guardar la asignatura en Firestore
      await this.firestore.collection('asignaturas').doc(aid).set({
        aid: aid,
        nombre_asignatura: nombre,
        descripcion: descripcion
      });

      console.log('Asignatura guardada correctamente en Firestore');
      return true; // Indicar éxito
    } catch (error) {
      console.error('Error guardando la asignatura en Firestore:', error);
      throw error; // Lanzar error para manejar en el componente
    }
  }

  getAsignaturasPorIds(idsAsignaturas: string[]): Observable<Asignatura[]> {
    return this.firestore.collection<Asignatura>('asignaturas', ref => ref.where('aid', 'in', idsAsignaturas)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Asignatura;
          return { id: a.payload.doc.id, ...data }; // Retorna el objeto completo
        });
      })
    );
  }
    getSeccionesPorAsignatura(aid: string): Observable<Seccion[]> {
      return this.firestore.collection<AsignaturaSeccion>('asignaturas_seccion', ref => ref.where('aid', '==', aid)).snapshotChanges().pipe(
        map(actions => {
          // Obtenemos los ids de sección desde la tabla intermedia
          const seccionIds = actions.map(a => (a.payload.doc.data() as AsignaturaSeccion).id_seccion);
          return seccionIds;
        }),
        // Paso 2: Usar los IDs de sección para obtener los detalles de las secciones
        switchMap(seccionIds => {
          return this.firestore.collection<Seccion>('secciones', ref => ref.where('id_seccion', 'in', seccionIds)).snapshotChanges().pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data() as Seccion;
                return { id: a.payload.doc.id, ...data };
              });
            })
          );
        })
      );
    }
  
    getAsignaturaById(aid: string): Observable<Asignatura | undefined> {
      console.log('Consultando asignatura con ID:', aid); // Debug
      return this.firestore.collection<Asignatura>('asignaturas').doc(aid).valueChanges().pipe(
        tap((asignatura) => {
          if (asignatura) {
            console.log('Asignatura obtenida:', asignatura); // Debug
          } else {
            console.log('No se encontró la asignatura con ID:', aid); // Debug
          }
        })
      );
    }
  }
