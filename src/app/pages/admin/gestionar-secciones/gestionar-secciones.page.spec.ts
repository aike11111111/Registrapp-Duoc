import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarSeccionesPage } from './gestionar-secciones.page';

describe('GestionarSeccionesPage', () => {
  let component: GestionarSeccionesPage;
  let fixture: ComponentFixture<GestionarSeccionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarSeccionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
