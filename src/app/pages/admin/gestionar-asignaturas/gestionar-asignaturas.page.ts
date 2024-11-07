import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-gestionar-asignaturas',
  templateUrl: './gestionar-asignaturas.page.html',
  styleUrls: ['./gestionar-asignaturas.page.scss'],
})
export class GestionarAsignaturasPage implements OnInit {

  usuarios: any = [];
  asignaturas: any = [];
  secciones: any = [];
  agregarAsignaturaForm!: FormGroup;  // Agregar el operador '!' aquí

  constructor(
    private menuController: MenuController,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder // Importa FormBuilder para crear el formulario
  ) {}

  ngOnInit() {
    this.menuController.enable(true);
    this.config();
    this.inicializarFormulario();  // Llamamos a la función para inicializar el formulario
  }

  config() {
    // Obtener usuarios
    this.firestore.collection('usuarios').valueChanges().subscribe(aux => {
      this.usuarios = aux;
    });
    // Obtener asignaturas
    this.firestore.collection('asignaturas').valueChanges().subscribe(data => {
      this.asignaturas = data;
    });
    // Obtener secciones
    this.firestore.collection('secciones').valueChanges().subscribe(data => {
      this.secciones = data;
    });
  }

  // Inicializar el formulario
  inicializarFormulario() {
    this.agregarAsignaturaForm = this.fb.group({
      nombre_asignatura: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  // Método para guardar una asignatura
  guardarAsignatura() {
    if (this.agregarAsignaturaForm.valid) {
      const nuevaAsignatura = {
        aid: this.firestore.createId(),  // Genera un ID aleatorio
        ...this.agregarAsignaturaForm.value  // Propiedades del formulario
      };

      // Agrega la nueva asignatura a la colección de Firestore
      this.firestore.collection('asignaturas').doc(nuevaAsignatura.aid).set(nuevaAsignatura)
        .then(() => {
          console.log('Asignatura guardada correctamente:', nuevaAsignatura);
          this.agregarAsignaturaForm.reset();  // Limpia el formulario después de guardar
        })
        .catch((error) => {
          console.error('Error al guardar asignatura: ', error);
        });
    } else {
      console.log('Formulario no válido');
    }
  }

  // Métodos de CRUD para Asignaturas
  openAddAsignatura() {
    // Lógica para abrir modal de añadir asignatura
  }

  openEditAsignatura() {
    // Lógica para abrir modal de edición de asignatura
  }

  async deleteAsignatura(aid: string) {
    await this.firestore.collection('asignaturas').doc(aid).delete();
    console.log('Asignatura eliminada:', aid);
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
