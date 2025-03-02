import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedFilesPanelComponent } from './shared-files-panel.component';

describe('SharedFilesPanelComponent', () => {
  let component: SharedFilesPanelComponent;
  let fixture: ComponentFixture<SharedFilesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedFilesPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedFilesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
