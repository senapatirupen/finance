import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfTypeComponent } from './mf-type.component';

describe('MfTypeComponent', () => {
  let component: MfTypeComponent;
  let fixture: ComponentFixture<MfTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MfTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MfTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
