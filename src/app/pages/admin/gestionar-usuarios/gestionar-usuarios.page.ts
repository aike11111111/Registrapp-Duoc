import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { ModalUsuariosComponent } from '../../modales/modal-usuarios/modal-usuarios.component';
import { Usuario } from 'src/app/interfaces/usuario';
import Swal from 'sweetalert2';
import { UsuariosService } from 'src/app/services/firebase/usuarios.service';
import { DocentesService } from 'src/app/services/firebase/docentes.service';
import { AsignaturaDocenteService } from 'src/app/services/firebase/asignaturasDocente.service';
import { AlumnosService } from 'src/app/services/firebase/alumnos.service';
import { AsignaturaInscripta } from 'src/app/asignatura-inscripta';
import { AlumnoSeccionService } from 'src/app/services/firebase/alumno-seccion.service';
import { AsignaturaInscritaService } from 'src/app/services/firebase/asignatura-inscrita.service';

@Component({
  selector: 'app-gestionar-usuarios',
  templateUrl: './gestionar-usuarios.page.html',
  styleUrls: ['./gestionar-usuarios.page.scss'],
})
export class GestionarUsuariosPage implements OnInit {

  usuarios: Usuario[] = [];
  isEditMode: boolean = false;
  isModalOpen: boolean = false;

  constructor(
    private menuController: MenuController,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    private modalController: ModalController,
    private usuariosService: UsuariosService,
    private docentesService: DocentesService,
    private asignaturasDocenteService: AsignaturaDocenteService,
    private alumnosService: AlumnosService,
    private alumnosSeccionService: AlumnoSeccionService,
    private asignaturaInscritasService: AsignaturaInscritaService


  ) {}

  ngOnInit() {
    this.menuController.enable(true);
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe(
      (data: Usuario[]) => {
        this.usuarios = data;
        console.log('Usuarios cargados:', this.usuarios);
        // Verifica si cada usuario tiene un UID
        this.usuarios.forEach(usuario => {
          console.log('Usuario UID:', usuario.uid);
        });
      },
      (error: any) => {
        console.error('Error al cargar usuarios:', error);
      }
    );
  }  

  eliminarUsuario(uid: string, tipo: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este usuario será eliminado permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Eliminando usuario con uid:', uid);
        
        // Si es tipo docente, eliminar documentos relacionados
        if (tipo === 'docente') {
          this.docentesService.obtenerIdDocentePorUid(uid).subscribe(docente => {
            if (docente && docente.length > 0) {
              const idDocente = docente[0].id_docente;
              
              // Eliminar asignaturas del docente
              this.asignaturasDocenteService.eliminarAsignaturasDocente(idDocente).then(() => {
                console.log('Asignaturas del docente eliminadas');
              }).catch(error => {
                console.error('Error eliminando asignaturas_docente', error);
              });
  
              // Eliminar el documento del docente
              this.docentesService.eliminarDocentePorUid(uid).then(() => {
                console.log('Docente eliminado de la colección docentes');
              }).catch(error => {
                console.error('Error eliminando docente de la colección docentes', error);
              });
            }
          });
        }

        if (tipo === 'alumno') {
          // Obtener el id_alumno por uid
          this.alumnosService.getIdAlumnoPorUid(uid).subscribe(alumno => {
            if (alumno && alumno.length > 0) {
              const idAlumno = alumno[0].id_alumno;
  
              // Eliminar asignaturas inscritas del alumno
              this.asignaturaInscritasService.eliminarAsignaturaInscritas(idAlumno).then(() => {
                console.log('Asignaturas inscritas del alumno eliminadas');
              }).catch(error => {
                console.error('Error eliminando asignaturas inscritas', error);
              });
  
              // Eliminar documentos de alumnos_seccion
              this.alumnosSeccionService.eliminarAlumnoSeccion(idAlumno).then(() => {
                console.log('Documentos de alumnos_seccion eliminados');
              }).catch(error => {
                console.error('Error eliminando alumnos_seccion', error);
              });
  
              // Eliminar documento de la colección alumnos por uid
              this.alumnosService.eliminarAlumnoPorUid(uid).then(() => {
                console.log('Alumno eliminado de la colección alumnos');
              }).catch(error => {
                console.error('Error eliminando alumno de la colección alumnos', error);
              });
            }
          });
        }  
  
        // Eliminar el documento del usuario de la colección usuarios
        this.usuariosService.eliminarUsuario(uid).then(() => {
          console.log('Usuario eliminado de la colección usuarios');
          
          // Eliminar también el documento de Authentication
          this.authService.eliminarUsuario(uid).then(() => {
            console.log('Usuario eliminado de Authentication');
          }).catch(error => {
            console.error('Error eliminando usuario de authentication', error);
          });
  
        }).catch(error => {
          console.error('Error eliminando usuario de usuarios', error);
        });
      }
    });
  }    

  mostrarAlerta(titulo: string, mensaje: string, tipo: 'success' | 'error') {
    Swal.fire({
      icon: tipo,
      title: titulo,
      text: mensaje,
      confirmButtonText: 'OK',
      heightAuto: false,
    });
  }

  cerrarModal() {
    this.isModalOpen = false;  
  }

  onDismiss() {
    this.cerrarModal();  
  }

  closeModal() {
    this.modalController.dismiss();
  }
  
  async abrirModal() {
    const modal = await this.modalController.create({
      component: ModalUsuariosComponent,
    });
    return await modal.
    present();
  }

  async abrirModalEditar(usuario: Usuario) {
    console.log('UID del usuario:', usuario.uid); // Verifica el valor del UID
    const modal = await this.modalController.create({
      component: ModalUsuariosComponent,
      componentProps: {
        uid: usuario.uid,  // Pasamos el UID del usuario al modal
        usuario: usuario   // Pasamos los datos del usuario al modal
      }
    });
    return await modal.present();
  }  
}
