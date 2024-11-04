import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { format, toZonedTime } from 'date-fns-tz';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {

  constructor(private angularFirestore: AngularFirestore) {}

  async registrarAsistencia(idAlumno: string, idSeccion: string, aid: string) {
    const now = new Date();
    const zonaHorariaChile = 'America/Santiago';
    const fechaHoraLocal = toZonedTime(now, zonaHorariaChile);
    const formattedFechaHora = format(fechaHoraLocal, 'yyyy-MM-dd HH:mm:ss');

    const docId = `${aid}_${idSeccion}_${formattedFechaHora}`;
    const asistenciaRef = this.angularFirestore.doc(`asistencia_alumno/${docId}`);

    // Preparamos el objeto de asistencia que se añadirá o actualizará
    const asistenciaData = {
        id_asist_a: this.angularFirestore.createId(), // Generar un nuevo ID
        aid: aid,
        id_seccion: idSeccion,
        fecha: formattedFechaHora,
        asistencias: [
            {id_alumno: idAlumno, estado: 'presente'} // Guardamos el estado del alumno por su ID
        ]
    };

    try {
        // Usamos set con merge: true para crear o actualizar el documento
        await asistenciaRef.set(asistenciaData, { merge: true });
        console.log('Asistencia registrada con éxito');
    } catch (error) {
        console.error('Error al registrar asistencia:', error);
    }
}


async contarPresentes(aid: string, idSeccion: string): Promise<number> {
  try {
    console.log(`Iniciando conteo de presentes para aid: ${aid}, idSeccion: ${idSeccion}`);
    
    // Obtener los documentos de Firestore
    const snapshot = await this.angularFirestore.collection('asistencia_alumno', ref =>
      ref.where('aid', '==', aid)
         .where('id_seccion', '==', idSeccion)
    ).get().toPromise();

    // Validar que snapshot no sea undefined
    if (!snapshot) {
      console.warn('No se encontró ningún documento. Devolviendo 0.');
      return 0;
    }

    let count = 0;
    snapshot.forEach(doc => {
      const data = doc.data() as any; // Definimos 'data' con tipo 'any' para evitar errores de tipo

      // Verificamos que 'asistencias' sea un array antes de filtrar
      if (Array.isArray(data.asistencias)) {
        const presentes = data.asistencias.filter((asistencia: any) => asistencia.estado === 'presente');
        count += presentes.length;
      }
    });

    console.log(`Número de alumnos con estado 'presente': ${count}`);
    return count;
  } catch (error) {
    console.error('Error al contar los presentes:', error);
    return 0;
  }
}

// Método para registrar asistencia en una sección específica
async registrarAsistenciaSeccion(aid: string, idSeccion: string, idDocente: string, cantPresentes: number, cantAusentes: number) {
    const now = new Date();
    const zonaHorariaChile = 'America/Santiago';
    const formattedFechaHora = format(now, 'yyyy-MM-dd HH:mm:ss', { timeZone: zonaHorariaChile });

    try {
        // Llamamos a la función contarPresentes para obtener el número de alumnos presentes
        // Esta línea se puede eliminar si ya estás pasando 'cantPresentes' como parámetro
        // const cantPresentes = await this.contarPresentes(aid, idSeccion);

        const asistenciaSeccionData = {
            id_asist_s: this.angularFirestore.createId(),
            id_seccion: idSeccion,
            aid: aid,
            id_docente: idDocente,
            fecha_hora: formattedFechaHora,
            cant_presentes: cantPresentes,
            cant_ausentes: cantAusentes // Agregar el conteo de ausentes
        };

        await this.angularFirestore.collection('asistencia_seccion').add(asistenciaSeccionData);
        console.log('Asistencia registrada con éxito');
    } catch (error) {
        console.error('Error al registrar asistencia de la sección:', error);
    }
}
}