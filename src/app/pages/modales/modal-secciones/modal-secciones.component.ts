import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-modal-secciones',
  templateUrl: './modal-secciones.component.html',
  styleUrls: ['./modal-secciones.component.scss'],
})
export class ModalSeccionesComponent implements OnInit {

  presentingElement: HTMLElement | null = null;
  agregarSeccionForm: FormGroup;
  asignaturas: any[] = [];
  secciones: any[] = [];
  nuevaSala: string = '';
  isModalOpen: boolean = false;

  // Recibe la id_seccion cuando se edita una sección
  id_seccion: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore, 
    private modalController: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private toastController: ToastController // Se añade para los toasts
  ) {
    this.agregarSeccionForm = this.formBuilder.group({
      nombre_seccion: ['', [Validators.required, Validators.minLength(2)]],
      aid: ['', Validators.required],
      horario: ['', [Validators.required, Validators.minLength(17)]],
      sala: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit() {
    this.cargarDatos(); // Cargar los datos de asignaturas y secciones
    this.presentingElement = document.querySelector('.ion-page');
  }

  cargarDatos() {
    // Cargar asignaturas
    this.firestore.collection('asignaturas').valueChanges().subscribe((data: any) => {
      this.asignaturas = data;
    });

    // Cargar secciones
    this.firestore.collection('secciones').valueChanges().subscribe((seccionesData: any) => {
      this.secciones = seccionesData.map((seccion: any) => {
        const asignatura = this.asignaturas.find(a => a.aid === seccion.aid);
        return {
          ...seccion,
          nombre_asignatura: asignatura ? asignatura.nombre_asignatura : 'Asignatura no encontrada'
        };
      });

      // Si id_seccion está presente, cargar los datos correspondientes
      if (this.id_seccion) {
        const seccion = this.secciones.find(s => s.id_seccion === this.id_seccion);
        if (seccion) {
          this.agregarSeccionForm.patchValue({
            nombre_seccion: seccion.nombre_seccion,
            aid: seccion.aid,
            horario: seccion.horario,
            sala: seccion.sala,
          });
        }
      }
    });
  }

  cerrarModal() {
    this.isModalOpen = false;
  }

  onDismiss() {
    this.cerrarModal();
  }

  async guardarSeccion() {
    if (this.agregarSeccionForm.valid) {
      const nuevaSeccion = this.agregarSeccionForm.value;
      const id_seccion = this.firestore.createId(); // Genera el id aleatorio para la sección
      const id_asig_seccion = this.firestore.createId(); // Genera el id aleatorio para la relación en asignaturas_seccion

      // Guarda la sección en la colección 'secciones'
      await this.firestore.collection('secciones').doc(id_seccion).set({
        ...nuevaSeccion,
        id_seccion: id_seccion,
      });

      // Guarda la relación en la colección 'asignaturas_seccion'
      await this.firestore.collection('asignaturas_seccion').doc(id_asig_seccion).set({
        aid: nuevaSeccion.aid, // El mismo aid que se guarda en 'secciones'
        id_asig_seccion: id_asig_seccion,
        id_seccion: id_seccion, // Relacionado con 'id_seccion' que se guarda en 'secciones'
      });

      this.agregarSeccionForm.reset();
      this.cargarDatos();
      this.cerrarModal(); // Cierra el modal después de guardar
      this.mostrarToast('Sección registrada con éxito.'); // Alerta de éxito
    } else {
      this.mostrarToast('Por favor, rellene todos los campos correctamente.'); // Alerta de error
    }
  }

  async editarSeccion(id_seccion: string) {
    if (this.agregarSeccionForm.valid) {
      const seccionEditada = this.agregarSeccionForm.value;

      // Actualiza la sección en la colección 'secciones'
      await this.firestore.collection('secciones').doc(id_seccion).update({
        ...seccionEditada,
      });

      // Actualiza la relación en la colección 'asignaturas_seccion'
      const asignaturaSeccionDoc = this.firestore.collection('asignaturas_seccion')
        .ref.where('id_seccion', '==', id_seccion).limit(1);

      const querySnapshot = await asignaturaSeccionDoc.get();
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const id_asig_seccion = doc.id;

        // Actualiza el 'aid' en la relación
        await this.firestore.collection('asignaturas_seccion').doc(id_asig_seccion).update({
          aid: seccionEditada.aid,
        });
      }

      this.agregarSeccionForm.reset();
      this.cargarDatos();
      this.cerrarModal(); // Cierra el modal después de editar
      this.mostrarToast('Sección editada con éxito.'); // Alerta de éxito
    } else {
      this.mostrarToast('Por favor, rellene todos los campos correctamente'); // Alerta de error
    }
  }

  async eliminarSeccion(id_seccion: string) {
    // Elimina la sección de la colección 'secciones'
    await this.firestore.collection('secciones').doc(id_seccion).delete();

    // Elimina la relación en la colección 'asignaturas_seccion'
    const asignaturaSeccionDoc = this.firestore.collection('asignaturas_seccion')
      .ref.where('id_seccion', '==', id_seccion).limit(1);

    const querySnapshot = await asignaturaSeccionDoc.get();
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      await this.firestore.collection('asignaturas_seccion').doc(doc.id).delete();
    }

    console.log('Sección eliminada:', id_seccion);
    this.cargarDatos();
    this.cerrarModal(); // Cierra el modal después de eliminar
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

  // Método para mostrar el toast
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,  // El toast aparecerá por 2 segundos
      position: 'top', // Ubicación del toast
    });
    toast.present();
  }
}
