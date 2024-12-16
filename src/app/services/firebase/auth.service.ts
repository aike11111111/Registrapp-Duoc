import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAdmin: boolean = false;

  constructor(private angularFireAuth: AngularFireAuth, private afAuth: AngularFireAuth) { }

  login(email: string, pass: string) {
    return this.angularFireAuth.signInWithEmailAndPassword(email, pass);
  }

  register(email: string, pass: string) {
    return this.angularFireAuth.createUserWithEmailAndPassword(email, pass);
  }

  logout() {
    return this.angularFireAuth.signOut();
  }

  recoveryPassword(email: string) {
    return this.angularFireAuth.sendPasswordResetEmail(email)
    .then(() => {
      console.log('Correo enviado!');
    })
    .catch((error) => {
      console.log('Error al enviar el correo!');
      throw error;
    });
  }

  eliminarUsuario(uid: string) {
    return this.afAuth.currentUser.then(user => {
      return user?.delete();
    }).catch(error => {
      console.error('Error eliminando usuario de Firebase Authentication', error);
      return Promise.reject(error);
    });
  }
  
}  