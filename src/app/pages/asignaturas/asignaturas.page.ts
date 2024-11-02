import { Component, OnInit } from '@angular/core';
import { AsignaturasService } from 'src/app/services/firebase/asignaturas.service';
import { AsignaturaDocenteService } from 'src/app/services/firebase/asignaturasDocente.service';
import { DocentesService } from 'src/app/services/firebase/docentes.service';
import { Observable } from 'rxjs';
import { AlumnosService } from 'src/app/services/firebase/alumnos.service';
import { Asignatura } from 'src/app/interfaces/asignatura';
import { Docente } from 'src/app/interfaces/docente';
import { AsignaturaDocente } from 'src/app/interfaces/asignatura-docente';
import { Alumno } from 'src/app/interfaces/alumno';
import { Seccion } from 'src/app/interfaces/seccion';
import { SeccionesService } from 'src/app/services/firebase/secciones.service';

@Component({
  selector: 'app-asignaturas',
  templateUrl: './asignaturas.page.html',
  styleUrls: ['./asignaturas.page.scss'],
})
export class AsignaturasPage implements OnInit {

  asignaturas: Asignatura[] = []; // Almacena las asignaturas filtradas
  asignaturasDocente: AsignaturaDocente[] = [];
  secciones: Seccion[] = []
  tipoUsuario: string = '';
  uidUsuario: string = '';
  idDocente: string = '';
  idAlumno: string = '';
  docentes: Docente[] = [];
  alumnos: Alumno[] = [];
  seccionesIds: string[] = [];
  seccionesMap: { [key: string]: { id_seccion: string; aid: string } } = {};

  constructor(
    private asignaturasService: AsignaturasService,
    private asignaturasDocentesService: AsignaturaDocenteService,
    private docentesService: DocentesService,
    private alumnosService: AlumnosService,
    private seccionesService: SeccionesService
  ) {}

  ngOnInit() {
    const usuarioLogin = localStorage.getItem('usuarioLogin');

    if (usuarioLogin) {
      const usuarioData = JSON.parse(usuarioLogin);
      this.tipoUsuario = usuarioData.tipo;
      this.uidUsuario = usuarioData.uid;

      this.cargarDocentesyAlumnos();
    }
  }

  cargarDocentesyAlumnos() {
    // Lógica para determinar el tipo de usuario y cargar datos
    if (this.tipoUsuario === 'docente') {
      this.docentesService.cargarDocente(this.uidUsuario).subscribe(
        docente => {
          this.idDocente = docente.id_docente;
          console.log('ID del docente:', this.idDocente);
          this.cargarAsignaturasDocente();
        },
        error => {
          console.error('Error cargando el docente:', error);
        }
      );

    } else if (this.tipoUsuario === 'alumno') {
      this.alumnosService.cargarAlumno(this.uidUsuario).subscribe(
        alumno => {
          this.idAlumno = alumno.id_alumno;
          console.log('ID del alumno:', this.idAlumno);
          this.cargarAsignaturasAlumno(this.uidUsuario);
        },
        error => {
          console.error('Error cargando el alumno:', error);
        }
      );
    }
  }

  cargarAsignaturasDocente() {
    this.asignaturasDocentesService.getAsignaturasDocentePorId(this.idDocente).subscribe(
      (asignaturasDocente) => {
        this.asignaturasDocente = asignaturasDocente;
        console.log('Asignaturas del docente cargadas:', this.asignaturasDocente);
        
        // Aquí puedes seguir con el flujo para cargar las asignaturas según tus necesidades
        const aids = this.asignaturasDocente.map(ad => ad.aid); // Suponiendo que 'aid' es el campo correcto
        this.cargarAsignaturas(aids);
      },
      (error) => {
        console.error('Error al cargar las asignaturas del docente:', error);
      }
    );
  }

  cargarAsignaturasAlumno(uidUsuario: string) {
    this.alumnosService.cargarAlumno(uidUsuario).subscribe(alumno => {
        this.idAlumno = alumno.id_alumno;

        this.alumnosService.getSeccionesIdsPorAlumno(this.idAlumno).subscribe(idsSecciones => {
            this.seccionesService.getSeccionesPorIds(idsSecciones).subscribe(secciones => {
                // Crear un mapeo entre nombres y IDs
                this.seccionesMap = secciones.reduce((map, seccion) => {
                    map[`${seccion.nombre_seccion}`] = { 
                        id_seccion: seccion.id_seccion, // Asegúrate de que id_seccion es un string
                        aid: seccion.aid // Asegúrate de que aid es un string
                    };
                    return map;
                }, {} as { [key: string]: { id_seccion: string; aid: string } }); // Aquí defines el tipo correcto

                // Cargar las asignaturas
                const idsAsignaturas = [...new Set(secciones.map(seccion => seccion.aid))];
                this.asignaturasService.getAsignaturasPorIds(idsAsignaturas).subscribe(asignaturas => {
                    this.asignaturas = asignaturas.map(asignatura => ({
                        aid: asignatura.aid,
                        nombre_asignatura: asignatura.nombre_asignatura,
                        descripcion: asignatura.descripcion,
                        secciones: secciones.filter(seccion => seccion.aid === asignatura.aid)
                    }));
                });
            });
        });
    });
}

  cargarAsignaturas(aids: string[]) {
    this.asignaturasService.getAsignaturasFiltradas(aids).subscribe(
      (asignaturas) => {
        this.asignaturas = asignaturas;
        console.log('Asignaturas filtradas cargadas:', this.asignaturas);
      },
      (error) => {
        console.error('Error al cargar las asignaturas filtradas:', error);
      }
    );
  }

  verSercciones() {
    
  }
}
