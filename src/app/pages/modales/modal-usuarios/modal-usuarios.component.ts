import { Component, OnInit, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, ModalController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';

@Component({
  selector: 'app-modal-usuarios',
  templateUrl: './modal-usuarios.component.html',
  styleUrls: ['./modal-usuarios.component.scss'],
})
export class ModalUsuariosComponent implements OnInit {

  uid: string = '';  // Recibimos el uid del usuario como Input
  usuario: Usuario | null = null;  // Recibimos los datos del usuario para editar

  usuarioForm!: FormGroup;
  isModalOpen: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore, 
    private modalController: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private toastController: ToastController,
    private angularFireAuth: AngularFireAuth
  ) { }

  ngOnInit() {
    console.log('UID recibido en el modal:', this.uid);
    console.log('Usuario recibido en el modal:', this.usuario);

    // Inicializamos el formulario con los campos necesarios
    this.usuarioForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required]],  // Si se quiere cambiar la contraseña
      tipo: ['', [Validators.required]] // Valor predeterminado 'alumno'
    });

    // Si estamos editando un usuario, pre-cargamos sus datos en el formulario
    if (this.usuario) {
      this.usuarioForm.setValue({
        nombre: this.usuario.nombre,
        email: this.usuario.email,
        pass: this.usuario.pass,  // No mostramos la contraseña
        tipo: this.usuario.tipo
      });
    }
  }

  generarPassAleatoria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    const longitud = 12; // Define la longitud de la contraseña

    for (let i = 0; i < longitud; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      password += caracteres.charAt(indice);
    }

    // Actualizamos el valor del campo pass en el formulario
    this.usuarioForm.patchValue({ pass: password });

    // Mostrar un toast para informar al usuario que se generó una contraseña
    this.mostrarToast('Contraseña generada: ' + password);
  }

  // Guardar o editar usuario según si existe uid
  async guardarUsuario() {
    if (this.usuarioForm.valid) {
      const nuevoUsuario: Usuario = this.usuarioForm.value;
      const uidFinal = this.uid || this.firestore.createId(); // Si hay un UID, usamos ese, si no, generamos uno nuevo.
  
      try {
        if (this.uid) {
          // Si existe un UID, estamos editando el usuario
          await this.editarUsuario(this.uid, nuevoUsuario); // Editamos el usuario
        } else {
          // Si no existe UID, estamos creando un nuevo usuario
          // Crear el usuario en Firebase Authentication
          const userCredential = await this.angularFireAuth.createUserWithEmailAndPassword(nuevoUsuario.email, nuevoUsuario.pass);
  
          const uidAuth = userCredential.user?.uid;
  
          if (uidAuth) {
            nuevoUsuario.uid = uidAuth;
  
            // Guardamos en la colección usuarios y dependiendo del tipo, en alumnos o docentes
            if (nuevoUsuario.tipo === 'alumno') {
              const idAlumnoAleatorio = this.firestore.createId(); // Generamos un ID aleatorio para el alumno
              await this.firestore.collection('usuarios').doc(uidAuth).set(nuevoUsuario);
              const alumnoData = { id_alumno: idAlumnoAleatorio, uid: uidAuth };
              await this.firestore.collection('alumnos').doc(idAlumnoAleatorio).set(alumnoData);
              this.mostrarToast('Alumno guardado con éxito.');
            } else if (nuevoUsuario.tipo === 'docente') {
              const idDocenteAleatorio = this.firestore.createId();
              await this.firestore.collection('usuarios').doc(uidAuth).set(nuevoUsuario);
              const docenteData = { id_docente: idDocenteAleatorio, uid: uidAuth };
              await this.firestore.collection('docentes').doc(idDocenteAleatorio).set(docenteData);
              this.mostrarToast('Docente guardado con éxito.');
            }
          }
        }
      } catch (error) {
        console.error('Error al crear o editar el usuario:', error);
        this.mostrarToast('Error al crear o editar el usuario.');
      }
    }
  }  

  // Método para editar usuario
  editarUsuario(uid: string, datosEditado: Usuario) {
    try {
      if (!uid) {
        throw new Error("No se ha proporcionado un UID válido.");
      }
  
      console.log("Datos a editar:", datosEditado);
  
      // 1. Actualizar la colección 'usuarios' con el nuevo tipo y otros campos
      this.firestore.doc<Usuario>(`usuarios/${uid}`).update({
        nombre: datosEditado.nombre,
        tipo: datosEditado.tipo,
        email: datosEditado.email,
        pass: datosEditado.pass
      }).then(() => {
        console.log('Datos de usuario actualizados en Firestore');
        
        // Verificamos el tipo de usuario y realizamos las operaciones correspondientes
  
        if (datosEditado.tipo === 'docente') {
          // Si el tipo cambia a 'docente'
          
          // 2. Actualizar o agregar el usuario a la colección 'docentes'
          const idDocente = this.firestore.createId(); // Generamos un ID aleatorio para el docente
          const docenteRef = this.firestore.collection('docentes').doc(uid);
          
          docenteRef.set({
            id_docente: idDocente,
            uid: uid
          }).then(() => {
            console.log('Usuario agregado a la colección docentes');
  
            // 3. Eliminar el documento de 'alumnos' si existía
            const alumnoRef = this.firestore.collection('alumnos').doc(uid);
            alumnoRef.get().subscribe(alumnoDoc => {
              if (alumnoDoc.exists) {
                alumnoRef.delete()
                  .then(() => {
                    console.log('Usuario eliminado de la colección alumnos');
                  })
                  .catch(error => {
                    console.error('Error al eliminar el usuario de alumnos:', error);
                  });
              }
            });
          }).catch(error => {
            console.error('Error al agregar el usuario a la colección docentes:', error);
          });
  
        } else if (datosEditado.tipo === 'alumno') {
          // Si el tipo cambia a 'alumno'
  
          // 2. Actualizar o agregar el usuario a la colección 'alumnos'
          const idAlumno = this.firestore.createId(); // Generamos un ID aleatorio para el alumno
          const alumnoRef = this.firestore.collection('alumnos').doc(uid);
  
          alumnoRef.set({
            id_alumno: idAlumno,
            uid: uid,
          }).then(() => {
            console.log('Usuario agregado a la colección alumnos');
  
            // 3. Eliminar el documento de 'docentes' si existía
            const docenteRef = this.firestore.collection('docentes').doc(uid);
            docenteRef.get().subscribe(docenteDoc => {
              if (docenteDoc.exists) {
                docenteRef.delete()
                  .then(() => {
                    console.log('Usuario eliminado de la colección docentes');
                  })
                  .catch(error => {
                    console.error('Error al eliminar el usuario de docentes:', error);
                  });
              }
            });
          }).catch(error => {
            console.error('Error al agregar el usuario a la colección alumnos:', error);
          });
        }
      }).catch(error => {
        console.error('Error al editar el usuario:', error);
      });
  
      this.mostrarToast('Usuario editado con éxito.');
    } catch (error) {
      console.error('Error al editar el usuario:', error);
      this.mostrarToast('Error al editar el usuario.');
    }
  }

  closeModal() {
    this.showActionSheet();
  }
  
  // Método para cerrar el modal
  cerrarModal() {
    this.isModalOpen = false;
  }

  onDismiss() {
    this.cerrarModal();
  }

  // Mostrar el Action Sheet para confirmar el cierre del modal
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
