import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'; 
import { AlumnosService } from 'src/app/services/firebase/alumnos.service';
import { AsignaturasService } from 'src/app/services/firebase/asignaturas.service';
import { AsistenciaService } from 'src/app/services/firebase/asistencia.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-escanearqr',
  templateUrl: './escanearqr.page.html',
  styleUrls: ['./escanearqr.page.scss'],
})
export class EscanearqrPage implements OnDestroy {

  private scannedResult: string = '';
  content_visibility = '';
  uidUsuario: string = '';
  idAlumno: string = '';
  secciones: { id_seccion: string; aid: string; nombre_asignatura?: string; nombre_seccion?: string }[] = [];
  asignaturas: { aid: string; nombre_asignatura: string }[] = [];
  seccionesMap: { [key: string]: { id_seccion: string; aid: string; nombre_asignatura: string; nombre_seccion: string } } = {};
  mensajeEstado: string = ''; 
  mensajeError: string = ''; 
  isLoading: boolean = false; 
  id_seccion: string = '' ;
  aid: string = '';

  constructor(private alumnoService: AlumnosService, private asignaturasService: AsignaturasService, private route: ActivatedRoute, private asistenciaService: AsistenciaService) { }

  ngOnInit() {
    console.log('Iniciando ngOnInit...');
    this.id_seccion = this.route.snapshot.paramMap.get('id_seccion') ?? '';
    this.aid = this.route.snapshot.paramMap.get('aid') ?? '';
    
    const usuarioLogin = localStorage.getItem('usuarioLogin');
    if (usuarioLogin) {
      const usuarioData = JSON.parse(usuarioLogin);
      this.uidUsuario = usuarioData.uid;
      console.log('Usuario UID:', this.uidUsuario);
      this.cargarAsignaturas(); 
      this.cargarIdAlumno(); 
    } else {
      console.log('No se encontró el usuario en localStorage.');
    }
  }

  cargarAsignaturas() {
    this.asignaturasService.getAsignaturas().subscribe(asignaturas => {
      this.asignaturas = asignaturas;
      console.log('Asignaturas cargadas:', this.asignaturas);
    }, error => {
      console.error('Error al cargar las asignaturas:', error);
    });
  }

  cargarIdAlumno() {
    const usuarioLogin = localStorage.getItem('usuarioLogin');
    if (usuarioLogin) {
      const usuarioData = JSON.parse(usuarioLogin);
      this.uidUsuario = usuarioData.uid;
      console.log('Cargando alumno con UID:', this.uidUsuario);
      this.alumnoService.cargarAlumno(this.uidUsuario).subscribe(
        alumno => {
          console.log('Alumno cargado:', alumno);
          this.idAlumno = alumno.id_alumno;
          this.cargarSecciones();
        },
        error => {
          console.error('Error cargando el alumno:', error);
          this.mostrarError('Error al cargar el alumno.');
        }
      );
    } else {
      console.log('No se encontró el usuario en localStorage al cargar el alumno.');
    }
  }

  cargarSecciones() {
    this.isLoading = true;
    this.mensajeEstado = 'Cargando secciones...';
    this.alumnoService.getSeccionesIdsPorAlumno(this.idAlumno).subscribe(idsSecciones => {
      console.log('IDs de secciones cargados:', idsSecciones);
      this.alumnoService.getSeccionesPorIds(idsSecciones).subscribe(secciones => {
        console.log('Secciones cargadas:', secciones);
        this.secciones = secciones.map(seccion => ({
          ...seccion,
          nombre_asignatura: this.getNombreAsignatura(seccion.aid),
        }));

        // Filtrar la sección seleccionada
        this.secciones = this.secciones.filter(seccion => seccion.id_seccion === this.id_seccion && seccion.aid === this.aid);
        
        this.isLoading = false;
        this.mensajeEstado = 'Secciones cargadas con éxito.';
      }, error => {
        this.isLoading = false;
        this.mostrarError('Error al cargar las secciones.');
        console.error('Error al cargar secciones:', error);
      });
    });
  }

  getNombreAsignatura(aid: string): string {
    const asignatura = this.asignaturas.find(asig => asig.aid === aid);
    if (!asignatura) {
      console.warn('Asignatura no encontrada para AID:', aid);
    }
    return asignatura ? asignatura.nombre_asignatura : 'Asignatura no encontrada';
  }

  async checkPermission(): Promise<boolean> {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      console.log('Estado de permisos:', status);
      return status.granted ?? false;
    } catch (e) {
      console.error('Error al verificar permisos:', e);
      return false;
    }
  }

  async startScan() {
    const permission = await this.checkPermission();
    if (!permission) {
      this.mostrarError('Permiso no otorgado para escanear.');
      return;
    }

    await BarcodeScanner.hideBackground();
    const body = document.querySelector('body');
    body?.classList.add('scanner-active');

    this.content_visibility = 'hidden';
    const result = await BarcodeScanner.startScan();
    console.log('Resultado del escaneo:', result);
    await this.handleScanResult(result);
  }

  private async handleScanResult(result: any) {
    await new Promise(resolve => setTimeout(resolve, 300)); 
    BarcodeScanner.showBackground();
    const body = document.querySelector('body');
    body?.classList.remove('scanner-active');
    this.content_visibility = '';

    if (result?.hasContent) {
      this.scannedResult = result.content;
      console.log('Contenido escaneado:', this.scannedResult);
      await this.validarEscaneo(this.scannedResult);
    } else {
      this.mostrarAlerta('Error de Escaneo', 'No se escaneó ningún código válido.', 'error');
    }
  }

  async validarEscaneo(codigo: string) {
    const [nombre_asignatura, nombre_seccion] = codigo.split('-');
    console.log('Nombre de asignatura:', nombre_asignatura);
    console.log('Nombre de sección:', nombre_seccion);
  
    // Verifica si la sección y asignatura son las actuales
    const seccionActual = this.secciones[0]; // Asumiendo que secciones tiene un solo elemento
  
    if (seccionActual) {
      if (nombre_asignatura === seccionActual.nombre_asignatura && nombre_seccion === seccionActual.nombre_seccion) {
        await this.verificarInscripcion(seccionActual);
      } else {
        this.mostrarAlerta('Código Inválido', 'El código escaneado no corresponde a la asignatura y sección actuales.', 'error');
      }
    } else {
      this.mostrarAlerta('Error', 'No se ha cargado ninguna sección actual.', 'error');
    }
  }
  
  private async verificarInscripcion(seccion: any) {
    try {
      this.mensajeEstado = 'Verificando inscripción...';
      const seccionInscrita = await this.alumnoService.verificarInscripcion(this.idAlumno, seccion.id_seccion).toPromise();
      console.log('Inscripción verificada:', seccionInscrita);
  
      if (seccionInscrita) {
        // Registrar asistencia y estado 'presente'
        await this.asistenciaService.registrarAsistencia(this.idAlumno, seccion.id_seccion, seccion.aid);
        this.mostrarAlerta('Registro Exitoso', 'La asistencia ha sido registrada con éxito.', 'success');
      } else {
        this.mostrarAlerta('No Registrado', 'El alumno no está inscrito en la sección de la asignatura.', 'error');
      }
    } catch (error) {
      console.error('Error al verificar inscripción:', error);
      this.mostrarAlerta('Error', 'Ocurrió un error al verificar la inscripción.', 'error');
    }
  }  

  mostrarAlerta(titulo: string, texto: string, icono: 'success' | 'error' | 'warning') {
    console.log('Mostrando alerta:', { titulo, texto, icono });
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: 'Aceptar',
      heightAuto: false
    });
  }

  mostrarError(mensaje: string) {
    this.mensajeError = mensaje;
    console.error(mensaje);
  }

  stopScan() {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    const body = document.querySelector('body');
    body?.classList.remove('scanner-active');
    this.content_visibility = '';
  }
  
  ngOnDestroy(): void {
    this.stopScan();
  }
}




