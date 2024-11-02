import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-docente',
  templateUrl: './home-docente.page.html',
  styleUrls: ['./home-docente.page.scss'],
})
export class HomeDocentePage implements OnInit {

  usuarioLogin?: string;

  constructor() { }

  ngOnInit(){
    this.usuarioLogin = localStorage.getItem('usuarioLogin') || '';
  }

}
