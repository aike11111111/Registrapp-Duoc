import { TestBed } from '@angular/core/testing';

import { AlumnoSeccionService } from './alumno-seccion.service';

describe('AlumnoSeccionService', () => {
  let service: AlumnoSeccionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlumnoSeccionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
