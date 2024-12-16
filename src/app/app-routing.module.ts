import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splashscreen',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'splashscreen',
    loadChildren: () => import('./pages/splashscreen/splashscreen.module').then( m => m.SplashscreenPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home-docente',
    loadChildren: () => import('./pages/home-docente/home-docente.module').then( m => m.HomeDocentePageModule)
  },
  {
    path: 'asignaturas',
    loadChildren: () => import('./pages/asignaturas/asignaturas.module').then( m => m.AsignaturasPageModule)
  },
  {
    path: 'secciones/:aid', // Modifica aquí para incluir el parámetro
    loadChildren: () => import('./pages/secciones/secciones.module').then(m => m.SeccionesPageModule)
  },  
  {
    path: 'asistencia',
    loadChildren: () => import('./pages/asistencia/asistencia.module').then( m => m.AsistenciaPageModule)
  },
  {
    path: 'detalle-seccion/:id_seccion/:aid/:nombre_seccion/:horario',
    loadChildren: () => import('./pages/detalle-seccion/detalle-seccion.module').then( m => m.DetalleSeccionPageModule)
  },
  {
    path: 'home-alumno',
    loadChildren: () => import('./pages/home-alumno/home-alumno.module').then( m => m.HomeAlumnoPageModule)
  },
  {
    path: 'recuperarcontrasena',
    loadChildren: () => import('./pages/recuperarcontrasena/recuperarcontrasena.module').then( m => m.RecuperarcontrasenaPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'recovery',
    loadChildren: () => import('./pages/recovery/recovery.module').then( m => m.RecoveryPageModule)
  },
  {
    path: 'usuarios',
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then( m => m.DashboardPageModule)
      },
    ]
  },
  {
    path: 'detalle-usuario/:email',
    loadChildren: () => import('./pages/admin/detalle-usuario/detalle-usuario.module').then( m => m.DetalleUsuarioPageModule)
  },   
  {
    path: 'gestionar-asignaturas',
    loadChildren: () => import('./pages/admin/gestionar-asignaturas/gestionar-asignaturas.module').then( m => m.GestionarAsignaturasPageModule)
  },
  {
    path: 'crear-seccion',
    loadChildren: () => import('./pages/admin/crear-seccion/crear-seccion.module').then( m => m.CrearSeccionPageModule)
  },
  {
    path: 'escanearqr/:id_seccion/:aid',
    loadChildren: () => import('./pages/escanearqr/escanearqr.module').then( m => m.EscanearqrPageModule)
  },
  {
    path: 'gestionar-secciones',
    loadChildren: () => import('./pages/admin/gestionar-secciones/gestionar-secciones.module').then( m => m.GestionarSeccionesPageModule)
  },
  {
    path: 'gestionar-usuarios',
    loadChildren: () => import('./pages/admin/gestionar-usuarios/gestionar-usuarios.module').then( m => m.GestionarUsuariosPageModule)
  },
  {
    path: 'gestionar-alumnos',
    loadChildren: () => import('./pages/admin/gestionar-alumnos/gestionar-alumnos.module').then( m => m.GestionarAlumnosPageModule)
  },
  
 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
