import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfScreenerComponent } from './mf-screener.component';

describe('MfScreenerComponent', () => {
  let component: MfScreenerComponent;
  let fixture: ComponentFixture<MfScreenerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MfScreenerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MfScreenerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
