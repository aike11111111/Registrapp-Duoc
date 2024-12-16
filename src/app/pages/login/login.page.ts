import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, MenuController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/firebase/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  emailValue?: string = '';
  passValue?: string = '';
  
  constructor(
    private router: Router, 
    private loadingController: LoadingController,  
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private menuController: MenuController,
    private firestore: AngularFirestore
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required,Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.menuController.enable(false);
  }

  async login() {
    try {
      
      const loading = this.loadingController.create({
        message: 'Cargando.....',
        duration: 2000
      });

      const email = this.emailValue;
      const pass = this.passValue;

      const aux = await this.authService.login(email as string, pass as string);
     
      if (aux.user) {

        const usuarioLogeado = await this.firestore.collection('usuarios').doc(aux.user.uid).get().toPromise();
        const usuarioData = usuarioLogeado?.data() as Usuario;

        localStorage.setItem('usuarioLogin', JSON.stringify(usuarioData));

        const storedUser = localStorage.getItem('usuarioLogin');
        if (storedUser) {
          console.log('Datos guardados en localStorage:', JSON.parse(storedUser)); 
        }

        (await loading).present();

        
        setTimeout(async() => {
          (await loading).dismiss();

          if ( usuarioData.tipo === 'admin' ) {
            this.router.navigate(['/usuarios']);
          } else if ( usuarioData.tipo === 'docente' ) {
            this.router.navigate(['/home-docente']);
          } else {
            this.router.navigate(['/home-alumno']);
          }
        },2000);

      } 
    } catch (error) {
      Swal.fire({
        icon:'error',
        title:'Error',
        text: 'Hubo un error al iniciar sesión.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      this.emailValue = '';
      this.passValue = '';
    }
  }
  
  recovery() {
    this.router.navigate(['/recovery']);
  }
}
