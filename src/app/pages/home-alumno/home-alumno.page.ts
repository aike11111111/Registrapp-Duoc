import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-home-alumno',
  templateUrl: './home-alumno.page.html',
  styleUrls: ['./home-alumno.page.scss'],
})
export class HomeAlumnoPage implements OnInit {
   
  usuarioLogin?: string;
  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario); 
      this.usuarioLogin = usuarioParsed.nombre; 
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
