import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MenuController, ModalController } from '@ionic/angular';
import { ModalAsignaturasComponent } from '../../modales/modal-asignaturas/modal-asignaturas.component';

@Component({
  selector: 'app-gestionar-asignaturas',
  templateUrl: './gestionar-asignaturas.page.html',
  styleUrls: ['./gestionar-asignaturas.page.scss'],
})
export class GestionarAsignaturasPage implements OnInit {

  asignaturasConDocentes: any = [];

  constructor(
    private menuController: MenuController,
    private firestore: AngularFirestore,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.menuController.enable(true);
    this.obtenerNombresDocentesPorAsignatura();
  }

  obtenerNombresDocentesPorAsignatura() {
    this.firestore.collection('asignaturas').valueChanges().subscribe((asignaturas: any[]) => {
      this.firestore.collection('asignaturas_docente').valueChanges().subscribe((asignaturasDocentes: any[]) => {
        this.asignaturasConDocentes = asignaturas.map((asignatura: any) => {
          const relacionDocente = asignaturasDocentes.find((rel: any) => rel.aid === asignatura.aid);
          return {
            ...asignatura,
            id_docente: relacionDocente ? relacionDocente.id_docente : null
          };
        });

        this.firestore.collection('docentes').valueChanges().subscribe((docentes: any[]) => {
          this.asignaturasConDocentes = this.asignaturasConDocentes.map((asignatura: any) => {
            const docente = docentes.find((doc: any) => doc.id_docente === asignatura.id_docente);
            return {
              ...asignatura,
              uid: docente ? docente.uid : null
            };
          });

          const uidsDocentes = this.asignaturasConDocentes.map((asignatura: any) => asignatura.uid).filter((uid: string | null) => uid);

          this.firestore.collection('usuarios', ref => ref.where('uid', 'in', uidsDocentes)).valueChanges().subscribe((usuarios: any[]) => {
            this.asignaturasConDocentes = this.asignaturasConDocentes.map((asignatura: any) => {
              const usuarioDocente = usuarios.find((user: any) => user.uid === asignatura.uid);
              return {
                ...asignatura,
                nombre_docente: usuarioDocente ? usuarioDocente.nombre : 'Nombre no encontrado'
              };
            });
          });
        });
      });
    });
  }

  async deleteAsignatura(aid: string) {

    await this.firestore.collection('asignaturas').doc(aid).delete();
  
    const asignaturasDocenteRef = this.firestore.collection('asignaturas_docente', ref => ref.where('aid', '==', aid));
    const asignaturasDocenteSnapshot = await asignaturasDocenteRef.get().toPromise();
  
    asignaturasDocenteSnapshot?.forEach(async doc => {
      await doc.ref.delete();
    });
  }  

  async abrirModal() {
    const modal = await this.modalController.create({
      component: ModalAsignaturasComponent,
    });
    return await modal.present();
  }

  async abrirModalEditar(aid: string) {
    const modal = await this.modalController.create({
      component: ModalAsignaturasComponent,
      componentProps: { aid }
    });
    return await modal.present();
  }
}
