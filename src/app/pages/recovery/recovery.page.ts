import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/firebase/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.page.html',
  styleUrls: ['./recovery.page.scss'],
})
export class RecoveryPage implements OnInit {

  email: string = '';

  constructor(private authService:AuthService) { }

  ngOnInit() {
  }

  async recoveryEmail() {
    try {
      let timerInterval: any;
      Swal.fire({
        title: "Procesando",
        html: "Enviando correo...",
        timer: 1000,
        timerProgressBar: true,
        heightAuto: false,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup()!.querySelector("b");
          timerInterval = setInterval(() => {
            timer!.textContent = `${Swal.getTimerLeft()}`;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          this.authService.recoveryPassword(this.email);
          Swal.fire({
            icon:'success',
            title:'Correo enviado',
            text: 'Se ha enviado un correo para reetablecer tu contraseña!',
            confirmButtonText: 'OK',
            heightAuto: false
          });
        }
      });
      
    } catch (error) {
      Swal.fire({
        icon:'error',
        title:'Error',
        text: 'Hubo un problema al enviar el correo!',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }
}
