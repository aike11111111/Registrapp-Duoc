import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController, ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-modal-asignaturas',
  templateUrl: './modal-asignaturas.component.html',
  styleUrls: ['./modal-asignaturas.component.scss'],
})
export class ModalAsignaturasComponent implements OnInit {

  agregarAsignaturaForm: FormGroup;
  docentes: any[] = []; // Declaración de docentes
  aid: string = ''; // Declaración de aid
  isModalOpen: boolean = false;
  asignaturasConDocentes: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore, 
    private modalController: ModalController,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.agregarAsignaturaForm = this.formBuilder.group({
      nombre_asignatura: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      id_docente: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.cargarDocentes();
    this.cargarDatos(); // Cargar datos de asignaturas y docentes
  }

  cargarDocentes() {
    // Usamos un Set para evitar duplicados de id_docente
    const docentesUnicos = new Set();
  
    this.firestore.collection('docentes').valueChanges().subscribe((docentes: any[]) => {
      docentes.forEach((docente) => {
        // Verificamos si el id_docente ya fue procesado
        if (!docentesUnicos.has(docente.id_docente)) {
          docentesUnicos.add(docente.id_docente);  // Agregamos el id_docente al Set
          
          // Realizamos la consulta para obtener el usuario asociado al docente
          this.firestore.collection('usuarios', ref => ref.where('uid', '==', docente.uid))
            .valueChanges()
            .subscribe((usuarios: any[]) => {
              if (usuarios.length > 0) {
                // Solo se agrega el docente si su id_docente es único
                const docenteExistente = this.docentes.find(d => d.id_docente === docente.id_docente);
                if (!docenteExistente) {
                  this.docentes.push({
                    id_docente: docente.id_docente,
                    nombre: usuarios[0].nombre
                  });
                }
              }
            });
        }
      });
    });
  }
  
  cargarDatos() {
  if (this.aid) {
    this.firestore.collection('asignaturas').doc(this.aid).get().subscribe((asignaturaDoc: any) => {
      const asignatura = asignaturaDoc.data();
      this.agregarAsignaturaForm.patchValue({
        nombre_asignatura: asignatura.nombre_asignatura,
        descripcion: asignatura.descripcion,
        // Aquí aseguramos que el id_docente se asigne correctamente para editar
        id_docente: asignatura.id_docente
      });

      console.log('Datos de  la asignatura cargados:', asignatura);
      this.cargarNombresDocentes(this.aid);  // Cargamos los docentes en base al aid
    });
  }
}
  
cargarNombresDocentes(aid: string) {
  console.log("Cargando docentes para el aid:", aid);

  // Paso 1: Obtener las asignaturas-docente filtradas por aid
  this.firestore.collection('asignaturas_docente', ref => ref.where('aid', '==', aid)).valueChanges().subscribe((asignaturasDocentes: any[]) => {
    console.log("Asignaturas docentes encontradas por aid:", asignaturasDocentes);

    if (asignaturasDocentes.length > 0) {
      // Paso 2: Obtener el id_docente de la asignatura docente
      const idDocente = asignaturasDocentes[0].id_docente;

      // Paso 3: Obtener los docentes filtrados por id_docente
      this.firestore.collection('docentes', ref => ref.where('id_docente', '==', idDocente)).valueChanges().subscribe((docentes: any[]) => {
        console.log("Docentes encontrados por id_docente:", docentes);

        if (docentes.length > 0) {
          const docente = docentes[0];

          // Paso 4: Obtener el nombre del docente desde usuarios usando su uid
          this.firestore.collection('usuarios', ref => ref.where('uid', '==', docente.uid)).valueChanges().subscribe((usuarios: any[]) => {
            console.log("Usuarios encontrados por uid:", usuarios);

            if (usuarios.length > 0) {
              const usuarioDocente = usuarios[0];
              console.log("Nombre del docente encontrado:", usuarioDocente.nombre);

              // Actualiza el formulario con el nombre del docente
              this.agregarAsignaturaForm.patchValue({
                docente: usuarioDocente.nombre // Aquí cargamos el nombre del docente
              });

              // También puedes agregar el id_docente al formulario si necesitas guardarlo
              this.agregarAsignaturaForm.patchValue({
                id_docente: docente.id_docente // Este campo se usa para guardar el id_docente en la base de datos
              });
            }
          });
        } else {
          // Si no se encuentra el docente (posiblemente eliminado), mostrar un campo para seleccionar uno nuevo
          this.agregarAsignaturaForm.patchValue({
            id_docente: null, // Dejar el id_docente vacío
          });
        }
      });
    } else {
      // Si no hay asignatura-docente asociada, dejar el campo vacío para seleccionar un docente
      this.agregarAsignaturaForm.patchValue({
        id_docente: null, // Dejar el id_docente vacío
      });
    }
  });
}

  eliminarAsignatura(aid: string) {
    this.firestore.collection('asignaturas').doc(aid).delete()
      .then(() => {
        this.mostrarToast('Asignatura eliminada con éxito.');
        this.cerrarModal(); // Cierra el modal después de eliminar
      })
      .catch(err => {
        this.mostrarToast('Error al eliminar la asignatura.');
      });
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.modalController.dismiss();
  }

  async guardarAsignatura() {
    if (this.agregarAsignaturaForm.valid) {
      const nuevaAsignatura = this.agregarAsignaturaForm.value;
      const aid = this.firestore.createId();  // Generamos un nuevo ID para la asignatura
  
      try {
        // 1. Guardar en la colección 'asignaturas'
        await this.firestore.collection('asignaturas').doc(aid).set({
          aid: aid,
          nombre_asignatura: nuevaAsignatura.nombre_asignatura,
          descripcion: nuevaAsignatura.descripcion
        });
  
        // 2. Guardar en la colección 'asignaturas_docentes'
        await this.firestore.collection('asignaturas_docente').add({
          aid: aid,
          aid_docente: this.firestore.createId(),  // Generamos un ID aleatorio para el docente
          id_docente: nuevaAsignatura.id_docente
        });
  
        this.agregarAsignaturaForm.reset();
        this.cerrarModal();  // Cierra el modal después de guardar
        this.mostrarToast('Asignatura registrada con éxito.');
      } catch (error) {
        console.error('Error al guardar la asignatura:', error);
        this.mostrarToast('Error al registrar la asignatura.');
      }
    } else {
      this.mostrarToast('Por favor, rellene todos los campos correctamente.');
    }
  }  

  async editarAsignatura(aid: string) {
    if (this.agregarAsignaturaForm.valid) {
      const asignaturaEditada = this.agregarAsignaturaForm.value;
  
      try {
        // 1. Actualizar la asignatura en la colección 'asignaturas'
        await this.firestore.collection('asignaturas').doc(aid).update({
          nombre_asignatura: asignaturaEditada.nombre_asignatura,
          descripcion: asignaturaEditada.descripcion
        });
  
        // 2. Actualizar el docente en la colección 'asignaturas_docente'
        const asignaturaDocenteRef = this.firestore.collection('asignaturas_docente', ref => ref.where('aid', '==', aid));
        const snapshot = await asignaturaDocenteRef.get().toPromise();
  
        if (snapshot && !snapshot.empty) {
          // Encontramos el documento relacionado con el aid en asignaturas_docente
          const docRef = snapshot.docs[0].ref;
  
          // Actualizamos el docente asociado
          await docRef.update({
            id_docente: asignaturaEditada.id_docente  // Aquí se actualiza el id_docente con el nuevo valor
          });
        } else {
          // Si no hay asociación docente, entonces crea una nueva entrada
          await this.firestore.collection('asignaturas_docente').add({
            aid: aid,
            aid_docente: this.firestore.createId(),
            id_docente: asignaturaEditada.id_docente
          });
        }
  
        this.agregarAsignaturaForm.reset();
        this.cerrarModal();  // Cierra el modal después de editar
        this.mostrarToast('Asignatura editada con éxito.');
  
      } catch (error) {
        console.error('Error al editar la asignatura:', error);
        this.mostrarToast('Error al editar la asignatura.');
      }
    } else {
      this.mostrarToast('Por favor, rellene todos los campos correctamente');
    }
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
            console.log('Usuario canceló.');
          },
        },
      ],
    });
    await actionSheet.present();
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }
}
