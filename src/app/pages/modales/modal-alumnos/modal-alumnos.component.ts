import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-modal-alumnos',
  templateUrl: './modal-alumnos.component.html',
  styleUrls: ['./modal-alumnos.component.scss'],
})
export class ModalAlumnosComponent implements OnInit {
  @Input() aid: string = ''; // ID de la asignatura seleccionada
  @Input() id_alumno: string = ''; // ID del alumno seleccionado
  seccionesDisponibles: any[] = [];
  asignarSeccionForm!: FormGroup;
  detallesSeccion: any = null; // Para almacenar los detalles de la sección seleccionada
  isModalOpen: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore,
    private actionSheetCtrl: ActionSheetController,
    private modalController: ModalController,
    private toastController: ToastController
  ) {

    this.asignarSeccionForm = this.formBuilder.group({
      id_seccion: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Inicializar el formulario
    this.cargarSeccionesDisponibles();
    this.cargarDetallesSeccion(); // Cargar detalles si hay sección existente
  }

  cargarSeccionesDisponibles() {
    this.firestore.collection('secciones', ref => ref.where('aid', '==', this.aid))
      .valueChanges()
      .subscribe(secciones => {
        this.seccionesDisponibles = secciones;
      });
  }

  // Método para inscribir al alumno en la sección seleccionada
  inscribirEnSeccion() {
    const id_seccion = this.asignarSeccionForm.get('id_seccion')?.value;
  
    if (id_seccion) {
      // Query to check if the student is already enrolled in any section for the selected assignment (aid)
      this.firestore.collection('alumnos_seccion', ref => 
        ref.where('id_alumno', '==', this.id_alumno)
           .where('id_seccion', '==', id_seccion)
      ).get().subscribe(querySnapshot => {
        if (!querySnapshot.empty) {
          // If the snapshot is not empty, the student is already enrolled in a section for this assignment
          this.mostrarToast('El alumno ya está inscrito en una sección para esta asignatura.');
        } else {
          // Otherwise, proceed with enrolling the student
          const sid_alumno = this.firestore.createId();
  
          this.firestore.collection('alumnos_seccion').doc(sid_alumno).set({
            sid_alumno,
            id_alumno: this.id_alumno,
            id_seccion
          })
          .then(() => {
            this.mostrarToast('Alumno inscrito en la sección correctamente.');
            this.modalController.dismiss();
          })
          .catch(error => {
            this.mostrarToast('Error al inscribir al alumno en la sección.');
            console.error(error);
          });
        }
      }, error => {
        console.error('Error al verificar la inscripción del alumno', error);
        this.mostrarToast('Error al verificar la inscripción del alumno.');
      });
    } else {
      this.mostrarToast('Por favor, seleccione una sección.');
    }
  }  
  

  // Cargar los detalles de la sección asignada al alumno
  cargarDetallesSeccion() {
    this.firestore.collection('alumnos_seccion', ref => ref.where('id_alumno', '==', this.id_alumno))
      .get()
      .subscribe(querySnapshot => {
        querySnapshot.forEach(doc => {
          const data = doc.data() as { id_seccion: string, sid_alumno: string }; // Type assertion
          this.detallesSeccion = data;
          this.asignarSeccionForm.patchValue({
            id_seccion: data.id_seccion
          });
        });
      });
  }

  // Método para editar la sección
  editarSeccion() {
    const id_seccion = this.asignarSeccionForm.get('id_seccion')?.value;

    if (id_seccion && this.detallesSeccion) {
      this.firestore.collection('alumnos_seccion').doc(this.detallesSeccion.sid_alumno).update({
        id_seccion
      })
      .then(() => {
        this.mostrarToast('Sección actualizada correctamente.');
        this.modalController.dismiss();
      })
      .catch(error => {
        this.mostrarToast('Error al actualizar la sección.');
        console.error(error);
      });
    } else {
      this.mostrarToast('Por favor, seleccione una sección.');
    }
  }

  // Método para eliminar la sección
  eliminarSeccion() {
    if (this.detallesSeccion) {
      const id_seccion = this.detallesSeccion.id_seccion; // Obtener el id_seccion desde detallesSeccion
  
      if (id_seccion) {
        // Obtener los documentos de 'alumnos_seccion' que coincidan con id_seccion
        this.firestore.collection('alumnos_seccion', ref => ref.where('id_seccion', '==', id_seccion))
          .get()
          .subscribe(querySnapshot => {
            if (!querySnapshot.empty) {
              // Si hay documentos que coinciden, eliminarlos
              querySnapshot.forEach(doc => {
                doc.ref.delete()
                  .then(() => {
                    console.log(`Sección con id_seccion: ${id_seccion} eliminada correctamente para el alumno ${doc.id}`);
                  })
                  .catch(error => {
                    console.error(`Error al eliminar documento con id_seccion: ${id_seccion}`, error);
                  });
              });
              this.mostrarToast('Sección eliminada correctamente.');
              this.modalController.dismiss(); // Cerrar el modal tras la eliminación
            } else {
              this.mostrarToast('No se encontraron registros con el id_seccion proporcionado.');
            }
          }, error => {
            console.error('Error al obtener documentos de alumnos_seccion', error);
            this.mostrarToast('Error al obtener los registros.');
          });
      } else {
        this.mostrarToast('No se encontró el id_seccion para eliminar la sección.');
      }
    } else {
      this.mostrarToast('No se encontraron detalles de la sección.');
    }
  }

  cerrarModal() {
    this.isModalOpen = false;
  }

  onDismiss() {
    this.cerrarModal();
  }

  closeModal() {
    this.showActionSheet();
  }

  showActionSheet = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Estás seguro/a?',
      buttons: [
        {
          text: 'Sí',
          role: 'confirm',
          handler: () => {
            console.log('Usuario confirmó el cierre.');
            this.modalController.dismiss();
          },
        },
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Usuario canceló el cierre.');
          },
        },
      ],
    });
    await actionSheet.present();
  };

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }
}
