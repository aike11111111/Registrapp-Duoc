import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, MenuController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  loginForm: FormGroup;
  emailValue: string = '';
  passValue: string = '';
  nombreValue: string = '';

  constructor(
    private router: Router, 
    private loadingController: LoadingController, 
    private alertController: AlertController, 
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

  async registrarse() {
    try {
      const loading = await this.loadingController.create({
        message: 'Registrando...',
        duration: 2000,
      });
      await loading.present();
  
      const aux = await this.authService.register(this.emailValue, this.passValue);
      const user = aux.user;
  
      if (user) {
        console.log('Datos a guardar:', {
          uid: user.uid,
          nombre: this.nombreValue,
          email: user.email,
          pass: this.passValue,
          tipo: 'usuario'
        });
  
        await this.firestore.collection('usuarios').doc(user.uid).set({
          uid: user.uid,
          nombre: this.nombreValue,
          email: user.email,
          pass: this.passValue,
          tipo: 'usuario'
        });
  
        console.log('Usuario guardado correctamente en Firestore');
  
        await loading.dismiss();
  
        Swal.fire({
          icon: 'success',
          title: 'Registro Exitoso',
          text: 'Usuario registrado correctamente',
          confirmButtonText: 'OK',
          heightAuto: false
        }).then(() => {
          this.router.navigate(['/login']);
        });
      }
    } catch (error: any) {
      console.error('Error guardando el usuario en Firestore:', error);
      await this.loadingController.dismiss();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al registrar el usuario.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }
}  