import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Alumno } from 'src/app/interfaces/alumno';
import { Seccion } from 'src/app/interfaces/seccion';
import { AlumnosService } from 'src/app/services/firebase/alumnos.service';
import { SeccionesService } from 'src/app/services/firebase/secciones.service';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { AsignaturasService } from 'src/app/services/firebase/asignaturas.service';
import { Asignatura } from 'src/app/interfaces/asignatura';
import { Usuario } from 'src/app/interfaces/usuario';
import { UsuariosService } from 'src/app/services/firebase/usuarios.service';
import { DocentesService } from 'src/app/services/firebase/docentes.service';
import { AlumnoSeccionService } from 'src/app/services/firebase/alumno-seccion.service';
import { AlumnoSeccion } from 'src/app/interfaces/alumno-seccion';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-detalle-seccion',
  templateUrl: './detalle-seccion.page.html',
  styleUrls: ['./detalle-seccion.page.scss'],
})
export class DetalleSeccionPage implements OnInit {

  texto: string = ''; 
  alumnos: Alumno[] = []; 
  usuarios: Usuario[] = [];
  seccion: Seccion | null = null; 
  id_seccion: string = ''; 
  id_alumno: string = '';
  nombre_seccion: string = '';
  presentingElement: Element | null = null;
  alumnosConNombres: { id_alumno: string; uid: string; nombre: string }[] = [];
  uidDocente: string = '';
  idDocente: string = '';
  uidUsuario: string = '';
  nombre: string = '';

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
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private angularFirestore: AngularFirestore
  ) {}

  ngOnInit() {
    // Obtener los parámetros pasados desde SeccionesPage
    this.id_seccion = this.route.snapshot.paramMap.get('id_seccion')!;
    this.nombre_seccion = this.route.snapshot.paramMap.get('nombre_seccion')!;
    
    console.log('ID de Sección:', this.id_seccion);
    
    const usuarioLogin = localStorage.getItem('usuarioLogin');
    if (usuarioLogin) {
      const usuarioData = JSON.parse(usuarioLogin);
      this.uidUsuario = usuarioData.uid;
      console.log('Usuario UID:', this.uidUsuario);
    } else {
      console.log('No se encontró el usuario en localStorage.');
    }

    // Llamar al método para obtener los alumnos y la sección
    //obteneralumnosporseccion
    this.obtenerAlumnosPorSeccion(this.id_seccion);
    this.obtenerSeccion(this.id_seccion); 
    this.cargarIdDocente();
  }
    
  obtenerSeccion(idSeccion: string) {
    this.seccionService.getSeccionesPorIds([idSeccion]).subscribe(
      (secciones) => {
        if (secciones.length > 0) {
          this.seccion = secciones[0]; 
          console.log('Sección obtenida:', this.seccion); 
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
          const nombreAsignatura = asignaturas[0].nombre_asignatura; 
          this.generarQR(nombreAsignatura, this.nombre_seccion); 
        }
      },
      (error) => {
        console.error('Error al obtener la asignatura:', error);
      }
    );
  }

  obtenerAlumnosPorSeccion(idSeccion: string) {
    console.log('id_seccion de secciones: ', idSeccion);
  
    this.alumnoSeccionService.getAlumnosByIdSeccion(idSeccion).subscribe(alumnosEncontrados => {
      if (alumnosEncontrados.length > 0) {
        console.log('Alumnos encontrados en la sección: ', alumnosEncontrados);
        
        // Extraer los id_alumno de los alumnos encontrados
        const idsAlumnosEncontrados = alumnosEncontrados.map(alumno => alumno.id_alumno);
        console.log('IDs de alumnos encontrados en la sección: ', idsAlumnosEncontrados);
  
        // Obtener todos los alumnos para filtrar
        this.alumnoService.getAlumnos().subscribe(todosLosAlumnos => {
          // Filtrar los alumnos por id_alumno
          const alumnosFiltrados = todosLosAlumnos.filter(alumno => idsAlumnosEncontrados.includes(alumno.id_alumno));
          console.log('Alumnos filtrados por ID: ', alumnosFiltrados);
  
          // Obtener los UIDs
          const alumnosUids = alumnosFiltrados.map(alumno => alumno.uid);
  
          // Aquí iría la lógica para obtener los nombres usando los UIDs
          this.usuarioService.getUsuariosPorUids(alumnosUids).subscribe(usuarios => {
            this.alumnosConNombres = alumnosFiltrados.map(alumno => {
              const usuario = usuarios.find(user => user.uid === alumno.uid);
              return {
                id_alumno: alumno.id_alumno,
                uid: alumno.uid,
                nombre: usuario ? usuario.nombre : 'Nombre no encontrado'
              };
            });
            console.log('Alumnos con nombres:', this.alumnosConNombres);
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
    console.log('Cargando docente con UID:', this.uidUsuario);
    
    // Suponiendo que tienes un servicio para cargar el docente
    this.docenteService.cargarDocente(this.uidUsuario).subscribe(
      docente => {
        console.log('Docente cargado:', docente);
        this.idDocente = docente.id_docente; // Asegúrate de que esto sea correcto
        // Aquí puedes llamar a otra función si es necesario, como cargar secciones
      },
      error => {
        console.error('Error cargando el docente:', error);
      }
    );
  } else {
    console.log('No se encontró el usuario en localStorage al cargar el docente.');
  }
}

  generarQR(nombre_asignatura: string, nombre_seccion: string) {
    // Asegúrate de que los valores no sean nulos o indefinidos
    if (!nombre_asignatura || !nombre_seccion) {
      console.error('Error: nombre_asignatura o nombre_seccion están vacíos.');
      this.texto = 'Información no disponible'; // Mensaje por defecto
    } else {
      // Genera un texto solo con los valores, separado por un espacio o un símbolo
      this.texto = `${nombre_asignatura}-${this.nombre_seccion}`; // Solo los valores
    }
    
    console.log('Texto para QR:', this.texto); // Log para depuración
    // Aquí deberías tener la lógica para generar el código QR utilizando this.texto
  }
    
  abrirModal() {
    this.modal.present(); // Abre el modal
  }

  closeQrModal() {
    this.modal.dismiss(); // Cierra el modal
  }

  canDismiss = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Estas Seguro/a?',
      buttons: [
        {
          text: 'Si',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });
  }
}
