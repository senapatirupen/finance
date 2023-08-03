import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfKeyTermsComponent } from './mf-key-terms.component';

describe('MfKeyTermsComponent', () => {
  let component: MfKeyTermsComponent;
  let fixture: ComponentFixture<MfKeyTermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MfKeyTermsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MfKeyTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
