import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {

  constructor(private firestore: AngularFirestore) {}

  // Método para registrar la asistencia de un alumno
  async registrarAsistencia(idAlumno: string, idSeccion: string, aid: string) {
    const fechaHoraActual = new Date().toISOString(); // Obtener la fecha y hora actual en formato ISO
  
    const asistenciaData = {
      id_alumno: idAlumno,
      id_seccion: idSeccion,
      aid: aid,
      fecha_hora: fechaHoraActual,
      estado: 'presente' // Agrega el estado como 'presente'
    };
  
    try {
      await this.firestore.collection('asistencias').add(asistenciaData);
      console.log('Asistencia registrada con éxito');
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
    }
  }

  // Método para registrar la asistencia de la sección
  async registrarAsistenciaSeccion(asistenciaSeccionData: any) {
    try {
      await this.firestore.collection('asistencias_seccion').add(asistenciaSeccionData);
      console.log('Asistencia de sección registrada con éxito:', asistenciaSeccionData);
    } catch (error) {
      console.error('Error al registrar asistencia de sección:', error);
    }
  }
}