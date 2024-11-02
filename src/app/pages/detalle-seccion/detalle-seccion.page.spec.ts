import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleSeccionPage } from './detalle-seccion.page';

describe('DetalleSeccionPage', () => {
  let component: DetalleSeccionPage;
  let fixture: ComponentFixture<DetalleSeccionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleSeccionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
