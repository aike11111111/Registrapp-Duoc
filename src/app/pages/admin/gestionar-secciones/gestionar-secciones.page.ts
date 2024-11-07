import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { GestionarModalComponent } from '../../modales/gestionar-modal/gestionar-modal.component';

@Component({
  selector: 'app-gestionar-secciones',
  templateUrl: './gestionar-secciones.page.html',
  styleUrls: ['./gestionar-secciones.page.scss'],
})
export class GestionarSeccionesPage implements OnInit {
  agregarSeccionForm: FormGroup;
  asignaturas: any[] = [];
  salas: any[] = [];
  secciones: any[] = [];  // Secciones cargadas desde Firestore
  nuevaSala: string = '';  // Define la variable para el nombre de la sala
  isModalOpen: boolean = false;  // Controla el estado del modal

  constructor(
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore, 
    private modalController: ModalController
  ) {
    // Inicialización del formulario
    this.agregarSeccionForm = this.formBuilder.group({
      nombre_seccion: ['', Validators.required],
      aid: ['', Validators.required],
      horario: ['', Validators.required],
      sala: ['', Validators.required],  // Modificado para guardar el nombre de la sala directamente
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  // Función para cargar datos de asignaturas y salas
  cargarDatos() {
    // Obtener asignaturas desde Firebase
    this.firestore.collection('asignaturas').valueChanges().subscribe((data: any) => {
      this.asignaturas = data;
    });
  
    // Obtener secciones desde Firebase
    this.firestore.collection('secciones').valueChanges().subscribe((seccionesData: any) => {
      // Iteramos sobre las secciones y encontramos el nombre de la asignatura asociada
      this.secciones = seccionesData.map((seccion: any) => {
        const asignatura = this.asignaturas.find(a => a.aid === seccion.aid);
        return {
          ...seccion,
          nombre_asignatura: asignatura ? asignatura.nombre_asignatura : 'Asignatura no encontrada'
        };
      });
    });
  }
  

  // Función para abrir el modal
  abrirModalSala() {
    this.isModalOpen = true;  // Abre el modal
  }

  // Función para cerrar el modal
  cerrarModal() {
    this.isModalOpen = false;  // Cierra el modal
  }

  // Función para manejar el evento cuando se cierra el modal
  onDismiss() {
    this.cerrarModal();  // Llama a la función que cierra el modal
  }

  // Función para guardar una nueva sala
  async guardarSala() {
    if (this.nuevaSala.trim()) {
      const id_sala = this.firestore.createId();  // Genera un ID único para la sala
      await this.firestore.collection('salas').doc(id_sala).set({ nombre_sala: this.nuevaSala });
      this.nuevaSala = '';  // Limpia el campo de nombre de sala
      this.cargarDatos();   // Recarga la lista de salas
      this.cerrarModal();   // Cierra el modal después de guardar
    }
  }

  // Función para guardar la nueva sección
  async guardarSeccion() {
    if (this.agregarSeccionForm.valid) {
      const nuevaSeccion = this.agregarSeccionForm.value;
      const id_seccion = this.firestore.createId();  // Genera un ID único para la sección

      // Verificar si la sala seleccionada es nueva (por ejemplo, 'add' para agregar una nueva)
      let sala;
      if (nuevaSeccion.sala === 'add') {
        // Si el valor es "add", se debe agregar una nueva sala
        return this.abrirModalSala();  // Abre el modal para agregar una nueva sala
      } else {
        // Si ya se ha seleccionado una sala, buscar la sala correspondiente por nombre
        sala = nuevaSeccion.sala;
      }

      // Guardar la nueva sección en la base de datos, guardando el nombre de la sala
      await this.firestore.collection('secciones').doc(id_seccion).set({
        ...nuevaSeccion,
        id_seccion: id_seccion,
        sala: sala,  // Guardar el nombre de la sala directamente
      });

      // Limpiar el formulario después de guardar
      this.agregarSeccionForm.reset();
      this.cargarDatos();   // Recarga la lista de secciones después de guardar
    }
  }

  // Método para editar una sección (asumiendo que la edición se realiza por ID)
  async editarSeccion(id_seccion: string) {
    const seccion = this.secciones.find(s => s.id_seccion === id_seccion);
    if (seccion) {
      this.agregarSeccionForm.patchValue({
        nombre_seccion: seccion.nombre_seccion,
        aid: seccion.aid,
        horario: seccion.horario,
        sala: seccion.sala,  // Asignar el nombre de la sala directamente
      });
    }
  }

  // Método para eliminar una sección
  async eliminarSeccion(id_seccion: string) {
    await this.firestore.collection('secciones').doc(id_seccion).delete();
    console.log('Sección eliminada:', id_seccion);
    this.cargarDatos();  // Recarga las secciones después de eliminar
  }

  closeModal() {
    this.modalController.dismiss();
  }
  
  async abrirModal() {
    const modal = await this.modalController.create({
      component: GestionarModalComponent, // Componente del modal
    });
    return await modal.
    present();
  }

  async abrirModalEditar(id_seccion: string) {
    const modal = await this.modalController.create({
      component: GestionarModalComponent,
      componentProps: { id_seccion } // Pasando id_seccion como propiedad del modal
    });
    return await modal.present();
  }

}