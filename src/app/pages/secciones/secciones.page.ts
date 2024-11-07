import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Importa Router para la redirección
import { map } from 'rxjs';
import { Seccion } from 'src/app/interfaces/seccion';
import { AsignaturasService } from 'src/app/services/firebase/asignaturas.service'; // Asegúrate de que la ruta sea correcta
import { SeccionesService } from 'src/app/services/firebase/secciones.service';

@Component({
  selector: 'app-secciones',
  templateUrl: './secciones.page.html',
  styleUrls: ['./secciones.page.scss'],
})
export class SeccionesPage implements OnInit {

  aid: string = ''; // ID de la asignatura
  secciones: Seccion[] = []; // Inicializa como un arreglo vacío
  tipoUsuario: string = ''; // Propiedad para almacenar el tipo de usuario

  constructor(
    private route: ActivatedRoute, 
    private router: Router, // Inyecta el Router para la redirección
    private asignaturaService: AsignaturasService,
    private seccionService: SeccionesService
  ) {}

  ngOnInit() {
    // Captura el aid de la URL
    this.aid = this.route.snapshot.paramMap.get('aid') ?? '';
    console.log('Asignatura ID (aid):', this.aid);

    // Cargar las secciones usando el aid
    this.cargarSecciones();

    // Obtener el tipo de usuario desde localStorage
    const usuarioLogin = localStorage.getItem('usuarioLogin');

    if (usuarioLogin) {
      const usuarioData = JSON.parse(usuarioLogin);
      this.tipoUsuario = usuarioData.tipo;

      this.cargarSecciones();
    }
  }

  cargarSecciones() {
    this.asignaturaService.getSeccionesPorAsignatura(this.aid).subscribe(
      (secciones) => {
        this.secciones = secciones; // Asigna las secciones recibidas a la propiedad secciones
        console.log('Secciones:', this.secciones); // Imprime las secciones en la consola
      },
      (error) => {
        console.error('Error al obtener secciones:', error); // Maneja el error en caso de que ocurra
      }
    );
  }

  // Función para manejar el clic en una sección
  detalleSeccion(seccion: Seccion) {
    if (this.tipoUsuario === 'docente') {
      // Redirigir a la página detalle-seccion si es docente
      this.router.navigate(['/detalle-seccion', seccion.id_seccion, seccion.aid, seccion.nombre_seccion, seccion.horario], {
      });
    } else if (this.tipoUsuario === 'alumno') {
      // Redirigir a la página escanearqr si es alumno
      this.router.navigate(['/escanearqr', seccion.id_seccion, seccion.aid]);
    }
  }
}
