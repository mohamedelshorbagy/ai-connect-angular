import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { OVER } from '../../helper'
@Component({
  selector: '[board-column]',
  templateUrl: './board-column.component.html',
  styleUrls: ['./board-column.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class BoardColumnComponent implements OnInit, OnChanges {
  @Input() checkers;
  @Input() col;
  @Input() color;
  @Input() cellSize;
  @Input() boardHeight;
  @Input() checkerRadius;
  @Input() rowCount;
  @Input() mask;
  @Input() status;
  opacity: number;
  @Output('drop') dropOutput = new EventEmitter();
  nextOpenRow: any;
  constructor() { }

  ngOnChanges() {
    this.nextOpenRow = Math.max(...Object.values(this.checkers).map((c: any) => c.row).concat(-1)) + 1;
    this.opacity = (this.status === OVER) ? 0.2 : 1.0;

  }

  ngOnInit() {
    this.nextOpenRow = Math.max(...Object.values(this.checkers).map((c: any) => c.row).concat(-1)) + 1;
    this.opacity = (this.status === OVER) ? 0.2 : 1.0;
  }


  drop() {
    const col = this.col;
    const row = this.nextOpenRow;

    if (row < this.rowCount) {
      console.log('dropping', { row, col });
      // emit Value
      this.dropOutput.emit({ row, col });
    } else {
      console.log('cannot drop', { row, col });
      // this.dropOutput.emit({ row, col, drop: false })
    }
  }
}
