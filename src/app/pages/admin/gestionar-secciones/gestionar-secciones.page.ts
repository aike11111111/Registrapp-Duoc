import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { ModalSeccionesComponent } from '../../modales/modal-secciones/modal-secciones.component';

@Component({
  selector: 'app-gestionar-secciones',
  templateUrl: './gestionar-secciones.page.html',
  styleUrls: ['./gestionar-secciones.page.scss'],
})
export class GestionarSeccionesPage implements OnInit {
  agregarSeccionForm: FormGroup;
  asignaturas: any[] = [];
  salas: any[] = [];
  secciones: any[] = [];  
  nuevaSala: string = '';  
  isModalOpen: boolean = false;  

  constructor(
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore, 
    private modalController: ModalController
  ) {

    this.agregarSeccionForm = this.formBuilder.group({
      nombre_seccion: ['', Validators.required],
      aid: ['', Validators.required],
      horario: ['', Validators.required],
      sala: ['', Validators.required],  
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.firestore.collection('asignaturas').valueChanges().subscribe((data: any) => {
      this.asignaturas = data;
    });
  
    this.firestore.collection('secciones').valueChanges().subscribe((seccionesData: any) => {
      this.secciones = seccionesData.map((seccion: any) => {
        const asignatura = this.asignaturas.find(a => a.aid === seccion.aid);
        return {
          ...seccion,
          nombre_asignatura: asignatura ? asignatura.nombre_asignatura : 'Asignatura no encontrada'
        };
      });
    });
  }
  

  abrirModalSala() {
    this.isModalOpen = true;  
  }

  cerrarModal() {
    this.isModalOpen = false;  
  }

  onDismiss() {
    this.cerrarModal();  
  }

  async guardarSala() {
    if (this.nuevaSala.trim()) {
      const id_sala = this.firestore.createId(); 
      await this.firestore.collection('salas').doc(id_sala).set({ nombre_sala: this.nuevaSala });
      this.nuevaSala = '';  
      this.cargarDatos();   
      this.cerrarModal();   
    }
  }

  async guardarSeccion() {
    if (this.agregarSeccionForm.valid) {
      const nuevaSeccion = this.agregarSeccionForm.value;
      const id_seccion = this.firestore.createId(); 

      let sala;
      if (nuevaSeccion.sala === 'add') {
        return this.abrirModalSala(); 
      } else {
        sala = nuevaSeccion.sala;
      }

      await this.firestore.collection('secciones').doc(id_seccion).set({
        ...nuevaSeccion,
        id_seccion: id_seccion,
        sala: sala, 
      });

      this.agregarSeccionForm.reset();
      this.cargarDatos();  
    }
  }


  async editarSeccion(id_seccion: string) {
    const seccion = this.secciones.find(s => s.id_seccion === id_seccion);
    if (seccion) {
      this.agregarSeccionForm.patchValue({
        nombre_seccion: seccion.nombre_seccion,
        aid: seccion.aid,
        horario: seccion.horario,
        sala: seccion.sala,  
      });
    }
  }

  async eliminarSeccion(id_seccion: string) {

    await this.firestore.collection('secciones').doc(id_seccion).delete();

    const asignaturaSeccionDoc = this.firestore.collection('asignaturas_seccion')
      .ref.where('id_seccion', '==', id_seccion).limit(1);

    const querySnapshot = await asignaturaSeccionDoc.get();
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      await this.firestore.collection('asignaturas_seccion').doc(doc.id).delete();
    }

    console.log('Sección eliminada:', id_seccion);
    this.cargarDatos();
    this.cerrarModal(); 
  }
  closeModal() {
    this.modalController.dismiss();
  }
  
  async abrirModal() {
    const modal = await this.modalController.create({
      component: ModalSeccionesComponent, 
    });
    return await modal.
    present();
  }

  async abrirModalEditar(id_seccion: string) {
    const modal = await this.modalController.create({
      component: ModalSeccionesComponent, 
      componentProps: { id_seccion } 
    });
    return await modal.present();
  }

}