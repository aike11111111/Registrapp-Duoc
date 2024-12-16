import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { format, toZonedTime } from 'date-fns-tz';
import { Observable } from 'rxjs';
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

        const asistenciaData = {
            id_asist_a: this.angularFirestore.createId(), 
            aid: aid,
            id_seccion: idSeccion,
            fecha: formattedFechaHora,
            asistencias: [
                { id_alumno: idAlumno, estado: 'presente' } 
            ]
        };

        try {
       
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

    async registrarAsistenciaSeccion(aid: string, idSeccion: string, idDocente: string, cantPresentes: number, cantAusentes: number) {
    const now = new Date();
    const zonaHorariaChile = 'America/Santiago';
    const fechaHoraLocal = toZonedTime(now, zonaHorariaChile);
    const formattedFechaHora = format(fechaHoraLocal, 'yyyy-MM-dd HH:mm:ss');

        try {

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
    
    const snapshot = await this.angularFirestore.collection('asistencia_alumno', ref =>
        ref.where('aid', '==', aid)
            .where('id_seccion', '==', idSeccion)
    ).get().toPromise();

    if (!snapshot || snapshot.empty) {
        console.error('No se encontró el documento para actualizar.');
        return; 
    }

    const nuevasAusencias = idsAlumnos.map(idAlumno => ({
        id_alumno: idAlumno,
        estado: 'ausente'
    }));

    const promises = snapshot.docs.map(async doc => {
        const data = doc.data() as any;
        const existingAsistencias = Array.isArray(data.asistencias) ? data.asistencias : [];

        const updatedAsistencias = [...existingAsistencias, ...nuevasAusencias];

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

    getAsistenciaPorFecha(aid: string, idSeccion: string, fecha: string): Observable<any[]> {
        return this.angularFirestore.collection('asistencia_alumno', ref =>
          ref.where('aid', '==', aid)
             .where('id_seccion', '==', idSeccion)
             .where('fecha', '>=', fecha + ' 00:00:00')
             .where('fecha', '<=', fecha + ' 23:59:59')
        ).valueChanges();
      }      
    }