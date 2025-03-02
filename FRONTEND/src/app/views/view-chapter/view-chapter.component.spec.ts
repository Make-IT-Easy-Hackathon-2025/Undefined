import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewChapterComponent } from './view-chapter.component';

describe('ViewChapterComponent', () => {
  let component: ViewChapterComponent;
  let fixture: ComponentFixture<ViewChapterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewChapterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewChapterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
