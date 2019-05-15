import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { cssUrl, range } from '../../helper'

@Component({
  selector: 'game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameBoardComponent implements OnInit {
  @Input() checkers;
  @Input() rowCount;
  @Input() colCount;
  @Input() status;
  @Output('drop') dropOutput = new EventEmitter();
  @Input() disableClick: boolean;
  patternId: string = 'cell-pattern';
  maskId: string = 'cell-mask';
  cellSize: number = 100;
  pattern: string = cssUrl(this.patternId);
  mask: string = cssUrl(this.maskId);
  rows: any[];
  cols: any[];
  boardWidth: number;
  boardHeight: number;
  checkerRadius: number = this.cellSize * 0.45;
  constructor() { }

  ngOnInit() {
    this.rows = range(this.rowCount);
    this.cols = range(this.colCount);
    this.boardWidth = this.colCount * this.cellSize;
    this.boardHeight = this.rowCount * this.cellSize;
    this.checkerRadius = this.cellSize * 0.45;
  }



  checkerStack(col) {
    let values =  Object.values(this.checkers).filter((c: any) => c.col === col)
    .sort((a: any, b: any) => a.row - b.row);
    return values;
    // return Object.values(this.checkers).filter((c: any) => c.col === col)
    //   .sort((a: any, b: any) => a.row - b.row);
  }

  drop(data: { row: number, col: number }) {
    // Emit Value
    // let nextOpenRow = Math.max(...this.checkers.map(c => c.row).concat(-1)) + 1;
    // const row = nextOpenRow;

    // if (row < this.rowCount) {
    //   console.log('dropping', { row, col });
    //   // emit Value
    //   // this.dropOutput.emit({ row, col });
    // } else {
    //   console.log('cannot drop', { row, col });
    // }
    this.dropOutput.emit(data);
  }





}
