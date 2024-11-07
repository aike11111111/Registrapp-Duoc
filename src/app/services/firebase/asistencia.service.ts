import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { format, toZonedTime } from 'date-fns-tz';
import { SeccionesService } from 'src/app/services/firebase/secciones.service';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {

  constructor(private angularFirestore: AngularFirestore, private seccionesService: SeccionesService) {}

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
                { id_alumno: idAlumno, estado: 'presente' } // Guardamos el estado del alumno por su ID
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

    async contarPresentes(aid: string, idSeccion: string): Promise<{ count: number; ids: string[] }> {
        try {
            console.log(`Iniciando conteo de presentes para aid: ${aid}, idSeccion: ${idSeccion}`);
            
            const snapshot = await this.angularFirestore.collection('asistencia_alumno', ref =>
                ref.where('aid', '==', aid)
                .where('id_seccion', '==', idSeccion)
            ).get().toPromise();

            if (!snapshot) {
                console.warn('No se encontró ningún documento. Devolviendo 0.');
                return { count: 0, ids: [] };
            }

            let count = 0;
            const presentesIds: string[] = [];
            snapshot.forEach(doc => {
                const data = doc.data() as any;

                if (Array.isArray(data.asistencias)) {
                    const presentes = data.asistencias.filter((asistencia: { id_alumno: string; estado: string }) => asistencia.estado === 'presente');
                    count += presentes.length;
                    presentes.forEach((asistencia: { id_alumno: string }) => {
                        presentesIds.push(asistencia.id_alumno);
                    });
                }
            });

            console.log(`Número de alumnos con estado 'presente': ${count}`);
            return { count, ids: presentesIds };
        } catch (error) {
            console.error('Error al contar los presentes:', error);
            return { count: 0, ids: [] };
        }
    }


    // Método para registrar asistencia en una sección específica
    async registrarAsistenciaSeccion(aid: string, idSeccion: string, idDocente: string, cantPresentes: number, cantAusentes: number) {
    const now = new Date();
    const zonaHorariaChile = 'America/Santiago';
    const fechaHoraLocal = toZonedTime(now, zonaHorariaChile);
    const formattedFechaHora = format(fechaHoraLocal, 'yyyy-MM-dd HH:mm:ss');

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

    async registrarAusentes(idsAlumnos: string[], aid: string, idSeccion: string) {
    // Obtener el horario de la sección usando el servicio
    // Consultar Firestore para documentos específicos de fecha, id y sección
    const snapshot = await this.angularFirestore.collection('asistencia_alumno', ref =>
        ref.where('aid', '==', aid)
            .where('id_seccion', '==', idSeccion)
    ).get().toPromise();

    if (!snapshot || snapshot.empty) {
        console.error('No se encontró el documento para actualizar.');
        return; // Salir si no se encuentra el documento
    }

    // Preparar las nuevas ausencias
    const nuevasAusencias = idsAlumnos.map(idAlumno => ({
        id_alumno: idAlumno,
        estado: 'ausente'
    }));

    // Recorrer los documentos encontrados para actualizar sus ausencias
    const promises = snapshot.docs.map(async doc => {
        const data = doc.data() as any;
        const existingAsistencias = Array.isArray(data.asistencias) ? data.asistencias : [];

        // Combinar las asistencias existentes con las nuevas ausencias
        const updatedAsistencias = [...existingAsistencias, ...nuevasAusencias];

        // Actualizar el documento con el conjunto combinado
        return this.angularFirestore.doc(`asistencia_alumno/${doc.id}`).update({
            asistencias: updatedAsistencias
        });
    });

    try {
        await Promise.all(promises);
        console.log('Ausencias registradas con éxito');
    } catch (error) {
        console.error('Error al registrar ausencias:', error);
    }
    }
    }