import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardCheckerComponent } from './board-checker.component';

describe('BoardCheckerComponent', () => {
  let component: BoardCheckerComponent;
  let fixture: ComponentFixture<BoardCheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoardCheckerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
