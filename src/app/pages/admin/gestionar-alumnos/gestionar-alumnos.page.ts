  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { AsignaturasService } from 'src/app/services/firebase/asignaturas.service';
  import { AlumnosService } from 'src/app/services/firebase/alumnos.service';
  import { UsuariosService } from 'src/app/services/firebase/usuarios.service';
  import { AsignaturaInscritaService } from 'src/app/services/firebase/asignatura-inscrita.service';
  import { Asignatura } from 'src/app/interfaces/asignatura';
  import { Alumno } from 'src/app/interfaces/alumno';
  import { AsignaturaInscrita } from 'src/app/interfaces/asignatura-inscrita';
  import { AngularFirestore } from '@angular/fire/compat/firestore';
  import { ModalAlumnosComponent } from '../../modales/modal-alumnos/modal-alumnos.component';
  import { ModalController } from '@ionic/angular';
  import Swal from 'sweetalert2';

  @Component({
    selector: 'app-gestionar-alumnos',
    templateUrl: './gestionar-alumnos.page.html',
    styleUrls: ['./gestionar-alumnos.page.scss'],
  })
  export class GestionarAlumnosPage implements OnInit {
    asignaturas: Asignatura[] = [];
    alumnosConNombres: { id_alumno: string; nombre: string }[] = [];
    alumnos: Alumno[] = [];
    alumnosInscripcionForm: FormGroup;
    selectedAlumno: string = '';  
    selectedAsignatura: string = ''; 
    asignaturasInscritas: Asignatura[] = [];
    isModalOpen: boolean = false;
    seccionesDisponibles: any[] = [];
    aid: string = ''; 
    seccionInscripcionForm!: FormGroup;
    documentosFiltrados: any[] = [];

    constructor(
      private asignaturasService: AsignaturasService,
      private alumnoService: AlumnosService,
      private usuarioService: UsuariosService,
      private asignaturaInscritaService: AsignaturaInscritaService,
      private fb: FormBuilder, 
      private angularFirestore: AngularFirestore,
      private modalController: ModalController
    ) {
      this.alumnosInscripcionForm = this.fb.group({
        id_alumno: ['', Validators.required],
        asignatura: ['', Validators.required]
      });

      this.seccionInscripcionForm = this.fb.group({
        id_seccion: ['', Validators.required]
      });
    }

    ngOnInit() {
      this.cargarAlumnos();
      this.cargarAsignaturas();
      this.cargarSeccionesDisponibles();
    }

    cargarAlumnos() {
      this.alumnoService.getNombresDeAlumnos().subscribe(alumnosConNombres => {
        this.alumnosConNombres = alumnosConNombres;
      });    
    }

    cargarAsignaturas() {
      this.asignaturasService.getAsignaturas().subscribe(asignaturas => {
        this.asignaturas = asignaturas;
      });
    }

    ngOnChanges() {
      if (this.aid) {
        this.cargarSeccionesDisponibles();
      }
    }

    cargarSeccionesDisponibles() {
      if (this.aid) {
        this.angularFirestore.collection('secciones', ref => ref.where('aid', '==', this.aid))
          .valueChanges()
          .subscribe(secciones => {
            this.seccionesDisponibles = secciones;
            console.log(this.seccionesDisponibles); 
          });
      }
    }

    seleccionarAsignatura(aid: string) {
      this.aid = aid;
      this.cargarSeccionesDisponibles();
    }

    buscarAsignaturas() {
      if (this.selectedAlumno) {
        this.asignaturaInscritaService.getAsignaturasInscritasPorAlumno(this.selectedAlumno).subscribe((inscripciones: AsignaturaInscrita[]) => {
          const asignaturasIds = inscripciones.map(inscripcion => inscripcion.aid);
          this.asignaturasInscritas = this.asignaturas.filter(asignatura => asignaturasIds.includes(asignatura.aid));
        });
      }
    }

    inscribirAlumno() {
      const idAlumno = this.selectedAlumno;
      const aidAsignatura = this.selectedAsignatura;
    
      const nuevoAidInscripcion = this.angularFirestore.createId();
      const nuevoDocumento = {
        id_alumno: idAlumno,
        aid: aidAsignatura,
        aid_inscripcion: nuevoAidInscripcion // Guardar el ID aleatorio generado
      };
      // Intentamos guardar el documento solo si no existe
      this.asignaturaInscritaService.guardarDocumentoSiNoExiste(nuevoDocumento).subscribe(
        (mensaje) => {
          console.log(mensaje);
          if (mensaje === 'Documento guardado exitosamente.') {
            alert('Alumno inscrito exitosamente.');
          } else {
            alert('El alumno ya estaba inscrito previamente.');
          }
        },
        (error) => {
          console.error('Error al guardar documento:', error);
          alert('Hubo un error al inscribir al alumno.');
        }
      );
    }

    eliminarInscripcion() {
      const idAlumno = this.selectedAlumno;
      const aidAsignatura = this.selectedAsignatura;
    
      this.asignaturaInscritaService.eliminarDocumento(aidAsignatura, idAlumno).subscribe(
        (mensaje) => {
          console.log(mensaje);
          if (mensaje === 'Documento eliminado exitosamente.') {
            alert('Alumno desinscrito exitosamente.');
          } else {
            alert('No se encontró inscripción para eliminar.');
          }
        },
        (error) => {
          console.error('Error al eliminar inscripción:', error);
          alert('Hubo un error al desinscribir al alumno.');
        }
      );
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
    
    async abrirModal(aid: string) {
      const id_alumno = this.alumnosInscripcionForm.get('id_alumno')?.value;
      const modal = await this.modalController.create({
        component: ModalAlumnosComponent,
        componentProps: {
          aid,
          id_alumno 
        }
      });
      await modal.present();
    }

  }
