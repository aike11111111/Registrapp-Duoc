import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearSeccionPage } from './crear-seccion.page';

describe('CrearSeccionPage', () => {
  let component: CrearSeccionPage;
  let fixture: ComponentFixture<CrearSeccionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearSeccionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
