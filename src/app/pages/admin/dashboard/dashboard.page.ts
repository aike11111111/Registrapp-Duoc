  import { Component, OnInit } from '@angular/core';
  import { AngularFirestore } from '@angular/fire/compat/firestore';
  import { Router } from '@angular/router';
  import { MenuController } from '@ionic/angular';
  import { Usuario } from 'src/app/interfaces/usuario';
  import { AuthService } from 'src/app/services/firebase/auth.service';

  @Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
  })
  export class DashboardPage implements OnInit {

    usuarios: any = [];

    constructor(
      private menuController: MenuController,
      private firestore: AngularFirestore,
      private authService: AuthService,
      private router: Router
    ) { }

    ngOnInit() {
      this.menuController.enable(true);
      this.config();
    }

    config() {
      this.firestore.collection('usuarios').valueChanges().subscribe(aux => {
        this.usuarios = aux;
      });
    }

    logout() {
      this.authService.logout();
      this.router.navigate(['/login']);
    }

  }
