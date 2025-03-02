import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomLoadingComponent } from './custom-loading.component';

describe('CustomLoadingComponent', () => {
  let component: CustomLoadingComponent;
  let fixture: ComponentFixture<CustomLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
