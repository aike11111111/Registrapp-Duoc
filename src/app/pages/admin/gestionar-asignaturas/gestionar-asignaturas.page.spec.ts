import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarAsignaturasPage } from './gestionar-asignaturas.page';

describe('GestionarAsignaturasPage', () => {
  let component: GestionarAsignaturasPage;
  let fixture: ComponentFixture<GestionarAsignaturasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarAsignaturasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
