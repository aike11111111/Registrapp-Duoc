import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from 'src/app/interfaces/usuario';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-detalle-usuario',
  templateUrl: './detalle-usuario.page.html',
  styleUrls: ['./detalle-usuario.page.scss'],
})
export class DetalleUsuarioPage implements OnInit {

  userEmail?: string | null;
  usuario?: Usuario;
  userTipo?: string | null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosService
  ) { }

  ngOnInit() {
    this.userEmail = this.activatedRoute.snapshot.paramMap.get('email');
    if(this.userEmail) {
      this.usuario = this.usuariosService.getUsuarioByEmail(this.userEmail);
      if(this.usuario) {
        this.userTipo = this.usuario.tipo;
      }
    }
  }

}
