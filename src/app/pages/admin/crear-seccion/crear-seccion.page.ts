import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import { SeccionesService } from 'src/app/services/firebase/secciones.service';
import { AsignaturasService } from 'src/app/services/firebase/asignaturas.service';
import { Asignatura } from 'src/app/interfaces/asignatura';
import { Seccion } from 'src/app/interfaces/seccion';

@Component({
  selector: 'app-crear-seccion',
  templateUrl: './crear-seccion.page.html',
  styleUrls: ['./crear-seccion.page.scss'],
})
export class CrearSeccionPage implements OnInit {
  crearSeccionForm: FormGroup;
  asignaturas: Asignatura[] = []; 

  constructor(
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore,
    private seccionesService: SeccionesService,
    private asignaturasService: AsignaturasService
  ) {
    this.crearSeccionForm = this.formBuilder.group({
      nombreSeccion: ['', [Validators.required]],
      idAsignatura: ['', [Validators.required]],
      horario: ['', [Validators.required]],
      sala: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.asignaturasService.getAsignaturas(); 
  }

  async guardarAsignatura() {
    console.log('Intentando guardar seccion...');
  
    if (this.crearSeccionForm.invalid) {
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
    /*const { nombre, horario, sala} = this.crearSeccionForm.value;
  
    try {
      const result = await this.seccionesService.guardarSeccion(nombre, horario, sala);
      if (result) {
        Swal.fire({
          icon: 'success',
          title: 'Seccion Guardada',
          text: 'La seccion se guardó correctamente',
          confirmButtonText: 'OK',
          heightAuto: false
        });
        this.crearSeccionForm.reset(); // Reiniciar el formulario después de guardar
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al guardar la seccion.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }*/
  }
}