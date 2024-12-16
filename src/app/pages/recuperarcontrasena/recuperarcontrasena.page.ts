import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-recuperarcontrasena',
  templateUrl: './recuperarcontrasena.page.html',
  styleUrls: ['./recuperarcontrasena.page.scss'],
})
export class RecuperarcontrasenaPage implements OnInit {

  resetForm: FormGroup;

  constructor(
    private formbuilder: FormBuilder, 
    private router: Router, 
    private usuariosService: UsuariosService  
  ) {
    this.resetForm = this.formbuilder.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  resetPassword() {
    
  }
}