import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import { Usuario } from 'src/app/interfaces/usuario';
import { AsignaturasService } from 'src/app/services/firebase/asignaturas.service';
import { DocentesService } from 'src/app/services/firebase/docentes.service';

@Component({
  selector: 'app-gestionar-asignaturas',
  templateUrl: './gestionar-asignaturas.page.html',
  styleUrls: ['./gestionar-asignaturas.page.scss'],
})
export class GestionarAsignaturasPage implements OnInit {

  agregarAsignaturaForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private firestore: AngularFirestore, private asignaturaService: AsignaturasService, private docenteService: DocentesService) {
    this.agregarAsignaturaForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
    });
  }

  ngOnInit() {
  }
  
  async guardarAsignatura() {
    console.log('Intentando guardar asignatura...');
  
    // Validar el formulario
    if (this.agregarAsignaturaForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, complete todos los campos requeridos.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      return;
    }
  
    // Obtener los valores del formulario
    const { nombre, descripcion} = this.agregarAsignaturaForm.value;
  
    try {
      const result = await this.asignaturaService.guardarAsignatura(nombre, descripcion);
      if (result) {
        Swal.fire({
          icon: 'success',
          title: 'Asignatura Guardada',
          text: 'La asignatura se guardó correctamente',
          confirmButtonText: 'OK',
          heightAuto: false
        });
        this.agregarAsignaturaForm.reset(); // Reiniciar el formulario después de guardar
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al guardar la asignatura.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }
}