import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-home-docente',
  templateUrl: './home-docente.page.html',
  styleUrls: ['./home-docente.page.scss'],
})
export class HomeDocentePage implements OnInit {

  usuarioLogin?: string;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(){
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
