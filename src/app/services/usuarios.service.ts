import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  usuarios: Usuario[] = [] 

  constructor() { }

  getUsuarios() {
    return this.usuarios;
  }

  getUsuarioByEmail(email:string) {
    return this.usuarios.find(aux => aux.email === email);
  }

  addUsuario(usuario: Usuario) {
    this.usuarios.push(usuario);
  }

  deleteUsuario() {

  }

  updateUsuario() {

  }
}
