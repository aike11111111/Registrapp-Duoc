import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Alumno } from 'src/app/interfaces/alumno';
import { Seccion } from 'src/app/interfaces/seccion';
import { AlumnosService } from 'src/app/services/firebase/alumnos.service';
import { SeccionesService } from 'src/app/services/firebase/secciones.service';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { AsignaturasService } from 'src/app/services/firebase/asignaturas.service';
import { AsistenciaService } from 'src/app/services/firebase/asistencia.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { UsuariosService } from 'src/app/services/firebase/usuarios.service';
import { DocentesService } from 'src/app/services/firebase/docentes.service';
import { AlumnoSeccionService } from 'src/app/services/firebase/alumno-seccion.service';
import Swal from 'sweetalert2';
import { format, toZonedTime } from 'date-fns-tz';

@Component({
  selector: 'app-detalle-seccion',
  templateUrl: './detalle-seccion.page.html',
  styleUrls: ['./detalle-seccion.page.scss'],
})
export class DetalleSeccionPage implements OnInit {

  texto: string = ''; 
  seccion: Seccion | null = null; 
  id_seccion: string = ''; 
  nombre_seccion: string = '';
  aid: string = '';
  horario: string = '';
  alumnosConNombres: { id_alumno: string; uid: string; nombre: string }[] = [];
  uidUsuario: string = '';
  idDocente: string = '';
  textoInterno: string = '';
  aidqr: string = '';
  id_seccionqr: string = '';
  presentingElement: Element | null = null; // Mantenida según tu solicitud
  nombreAsignatura: string | null = null;
  qrGenerado: boolean = false;
  numeroDeAlumnos: number = 0;
  asistenciaCerrada: boolean = false; 

  @ViewChild('modal', { static: false }) modal: any;

  constructor(
    private router: Router,
    private alumnoService: AlumnosService,
    private alumnoSeccionService: AlumnoSeccionService,
    private usuarioService: UsuariosService,
    private docenteService: DocentesService,
    private seccionService: SeccionesService,
    private actionSheetCtrl: ActionSheetController,
    private asignaturaService: AsignaturasService,
    private asistenciaService: AsistenciaService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.id_seccion = this.route.snapshot.paramMap.get('id_seccion')!;
    this.nombre_seccion = this.route.snapshot.paramMap.get('nombre_seccion')!;
    this.aid = this.route.snapshot.paramMap.get('aid')!;
    this.horario = this.route.snapshot.paramMap.get('horario')!;

    const usuarioLogin = localStorage.getItem('usuarioLogin');
    if (usuarioLogin) {
      const usuarioData = JSON.parse(usuarioLogin);
      this.uidUsuario = usuarioData.uid;
    }

    this.obtenerAlumnosPorSeccion(this.id_seccion);
    this.obtenerSeccion(this.id_seccion); 
    this.cargarIdDocente();
  }

  async cerrarAsistenciaSeccion() {
    console.log("Iniciando el cierre de asistencia...");

    // Verificar si la asistencia ya ha sido cerrada
    if (this.asistenciaCerrada) {
        this.mostrarAlerta('Error', 'La asistencia ya ha sido cerrada.', 'error');
        return;
    }
    
    // Verificación del código QR y separación
    if (!this.textoInterno) {
        this.mostrarAlerta('Error', 'El código QR no ha sido generado aún.', 'error');
        return;
    }

    const [aidqr, id_seccionqr] = this.textoInterno.split('-');
    this.aidqr = aidqr;
    this.id_seccionqr = id_seccionqr;

    // Validación de coincidencia de secciones
    if (this.id_seccion === this.id_seccionqr && this.aid === this.aidqr) {
        console.log("ID de sección y asignación coinciden, procediendo...");

        try {
            // Obtener IDs de alumnos por sección
            const idsAlumnos = await new Promise<string[]>((resolve, reject) => {
                this.alumnoSeccionService.getAlumnosByIdSeccion(this.id_seccionqr).subscribe(alumnosEncontrados => {
                    console.log("Alumnos encontrados:", alumnosEncontrados);
                    if (alumnosEncontrados.length > 0) {
                        resolve(alumnosEncontrados.map(alumno => alumno.id_alumno));
                    } else {
                        console.warn("No se encontraron alumnos en esta sección.");
                        resolve([]);
                    }
                }, error => {
                    console.error("Error al obtener alumnos por sección:", error);
                    reject(error);
                });
            });

            // Conteo de presentes
            const { count: presentesCount, ids: presentesIds } = await this.asistenciaService.contarPresentes(this.aidqr, this.id_seccionqr);
            console.log("Presentes encontrados:", presentesCount, " IDs:", presentesIds);
            
            const ausentesIds = idsAlumnos.filter(id => !presentesIds.includes(id));
            console.log("IDs de alumnos ausentes:", ausentesIds);

            // Registro de presentes
            await this.asistenciaService.registrarAsistenciaSeccion(this.aidqr, this.id_seccionqr, this.idDocente, presentesCount, idsAlumnos.length - presentesCount);

            // Registro de ausentes
            if (ausentesIds.length > 0) { // Cambiar >= 0 a > 0 para evitar registros vacíos
                console.log("Registrando ausentes...");
                await this.asistenciaService.registrarAusentes(ausentesIds, this.aidqr, this.id_seccionqr);
            }

            // Actualizar la bandera de estado de asistencia cerrada
            this.asistenciaCerrada = true; // Marcar como cerrada
            console.log("Asistencia cerrada con éxito.");
        } catch (error) {
            console.error("Error al cerrar la asistencia:", error);
            this.mostrarAlerta('Error', 'No se pudo cerrar la asistencia. Intenta nuevamente.', 'error');
        }
    } else {
        console.error("Error de coincidencia en ID de sección o asignatura.");
        this.mostrarAlerta('Error', 'Los IDs de sección o asignatura no coinciden.', 'error');
    }
}

  mostrarAlerta(titulo: string, texto: string, icono: 'success' | 'error' | 'warning') {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: 'Aceptar',
      heightAuto: false
    });
  }

  obtenerSeccion(idSeccion: string) {
    this.seccionService.getSeccionesPorIds([idSeccion]).subscribe(
      (secciones) => {
        if (secciones.length > 0) {
          this.seccion = secciones[0];
          this.obtenerNombreAsignatura(this.seccion.aid); 
        }
      },
      (error) => {
        console.error('Error al obtener la sección:', error);
      }
    );
  }
  
  obtenerNombreAsignatura(aid: string) {
    this.asignaturaService.getAsignaturasPorIds([aid]).subscribe(
      (asignaturas) => {
        if (asignaturas.length > 0) {
          this.nombreAsignatura = asignaturas[0].nombre_asignatura;
          console.log('Nombre de la asignatura almacenado:', this.nombreAsignatura);
        }
      },
      (error) => {
        console.error('Error al obtener la asignatura:', error);
      }
    );
  }

  obtenerAlumnosPorSeccion(idSeccion: string) {
    this.alumnoSeccionService.getAlumnosByIdSeccion(idSeccion).subscribe(alumnosEncontrados => {
      if (alumnosEncontrados.length > 0) {
        const idsAlumnosEncontrados = alumnosEncontrados.map(alumno => alumno.id_alumno);
        this.alumnoService.getAlumnos().subscribe(todosLosAlumnos => {
          const alumnosFiltrados = todosLosAlumnos.filter(alumno => idsAlumnosEncontrados.includes(alumno.id_alumno));
          const alumnosUids = alumnosFiltrados.map(alumno => alumno.uid);

          this.usuarioService.getUsuariosPorUids(alumnosUids).subscribe(usuarios => {
            this.alumnosConNombres = alumnosFiltrados.map(alumno => {
              const usuario = usuarios.find(user => user.uid === alumno.uid);
              return {
                id_alumno: alumno.id_alumno,
                uid: alumno.uid,
                nombre: usuario ? usuario.nombre : 'Nombre no encontrado'
              };
            });

            // Aquí puedes obtener el número total de alumnos
            this.numeroDeAlumnos = this.alumnosConNombres.length;
            console.log(`Número de alumnos en la sección: ${this.numeroDeAlumnos}`);
            // También puedes hacer algo más con este número, como mostrarlo en la interfaz de usuario
          }, error => {
            console.error('Error al obtener nombres de los usuarios:', error);
          });
        }, error => {
          console.error('Error al obtener todos los alumnos: ', error);
        });
      } else {
        console.warn('No se encontraron alumnos en esta sección.');
      }
    }, error => {
      console.error('Error al obtener alumnos por sección: ', error);
    });
}
  
        
  cargarIdDocente() {
    const usuarioLogin = localStorage.getItem('usuarioLogin');
    if (usuarioLogin) {
      const usuarioData = JSON.parse(usuarioLogin);
      this.uidUsuario = usuarioData.uid; 
      this.docenteService.cargarDocente(this.uidUsuario).subscribe(
        docente => {
          this.idDocente = docente.id_docente; 
        },
        error => {
          console.error('Error cargando el docente:', error);
        }
      );
    }
  }

  generarQR(nombre_seccion: string): boolean {
    if (this.asistenciaCerrada) {
        this.texto = 'La asistencia ya ha sido cerrada. No se puede generar el código QR.';
        this.qrGenerado = false; // No se generó el QR
        // Aquí puedes usar un servicio de alerta para mostrar el mensaje
        alert(this.texto); // Ejemplo simple de alerta
        return false;
    }

    if (!this.nombreAsignatura || !nombre_seccion) {
        this.texto = 'Información no disponible';
        this.qrGenerado = false; // Asegúrate de establecer en false si no se genera
        return false;
    } else {
        console.log('horario', this.horario);

        const diasHorarios = this.horario.split(',').map(diaHorario => {
            const [dia, rangoHorario] = diaHorario.trim().split(' ');
            const [horaInicio, horaFin] = rangoHorario.split('-');
            return {
                dia: dia.toLowerCase(),  // Convertir a minúsculas para comparar
                horaInicio: horaInicio,
                horaFin: horaFin
            };
        });

        console.log('horarios bien: ', diasHorarios);

        const now = new Date();
        const zonaHorariaChile = 'America/Santiago';
        const fechaHoraLocal = toZonedTime(now, zonaHorariaChile);
        const formattedFechaHora = format(fechaHoraLocal, 'yyyy-MM-dd HH:mm:ss');
        const horaActual = formattedFechaHora.substring(11, 16); // Formato HH:MM
        
        // Ajustar el cálculo del día actual
        const diaActualIndex = now.getHours() === 0 ? 1 : now.getDay() + 1; // 0 = domingo, 1 = lunes, ...
        const diasDeLaSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const diaActual = diasDeLaSemana[diaActualIndex % 7]; // Ajustar para que domingo a medianoche sea lunes

        console.log('Día actual:', diaActual);
        console.log('Hora actual:', horaActual);

        // Verificar si el día y hora actual están dentro del horario
        const horarioActivo = diasHorarios.some(item => {
            const { dia, horaInicio, horaFin } = item;

            // Convertir horas a minutos desde medianoche para comparar fácilmente
            const [hiHoras, hiMinutos] = horaInicio.split(':').map(Number);
            const [hfHoras, hfMinutos] = horaFin.split(':').map(Number);
            const [haHoras, haMinutos] = horaActual.split(':').map(Number);

            const minutosInicio = hiHoras * 60 + hiMinutos;
            const minutosFin = hfHoras * 60 + hfMinutos;
            const minutosActual = haHoras * 60 + haMinutos;

            // Ajustar para los rangos que cruzan medianoche
            if (minutosFin < minutosInicio) {
                return (minutosActual >= minutosInicio || minutosActual <= minutosFin);
            } else {
                return (minutosActual >= minutosInicio && minutosActual <= minutosFin);
            }
        });

        console.log('Horario activo:', horarioActivo);

        if (horarioActivo) {
            // Solo genera el código QR si hay horario activo
            this.textoInterno = `${this.aid}-${this.id_seccion}`;
            this.texto = `${this.nombreAsignatura}-${nombre_seccion}`;
            this.qrGenerado = true; // Se generó el QR
            console.log(this.texto);
            return true;
        } else {
            this.texto = 'Horario no activo. No se puede generar el código QR.';
            this.qrGenerado = false; // No se generó el QR
            console.log('Horario no activo. No se puede generar el código QR.');
            return false;
        }
    }
}

  async abrirModal() {
    // Verificar si el QR fue generado
    const qrGenerado = this.generarQR(this.nombre_seccion);
    
    if (!qrGenerado) {
      this.mostrarAlerta('Error', 'Código QR no generado. Debe generarse en horario de clases.', 'error');
    } else {
      this.modal.present(); 
    }
  }


  async closeQrModal() {
    const shouldDismiss = await this.canDismiss();
    if (shouldDismiss) {
      this.modal.dismiss();
    }
  }
  
  canDismiss = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Estás seguro/a?',
      buttons: [
        {
          text: 'Sí',
          role: 'confirm',
          handler: () => {
            return true;
          },
        },
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            return false;
          },
        },
      ],
    });
  
    await actionSheet.present();
    const result = await actionSheet.onDidDismiss();
    return result.role === 'confirm';
  }
}
