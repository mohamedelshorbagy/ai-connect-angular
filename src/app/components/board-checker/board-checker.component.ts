import { Component, OnInit, Input, ChangeDetectionStrategy, EventEmitter, OnChanges } from '@angular/core';
import { OVER } from '../../helper';
@Component({
  selector: '[board-checker]',
  templateUrl: './board-checker.component.html',
  styleUrls: ['./board-checker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardCheckerComponent implements OnInit, OnChanges {
  @Input() checker;
  @Input() cellSize;
  @Input() rowCount;
  @Input() checkerRadius;
  @Input() status;
  opacity: number;
  isWinner: boolean;
  colorHexes = {
    red: 'rgb(231,70,69)',
    black: '#222',
    green: 'green'
  }
  color: string;
  centerX: any;
  centerY: any;
  constructor() { }

  ngOnChanges() {
    this.isWinner = this.checker.isWinner;
    this.opacity = (this.status === OVER && !this.isWinner) ? 0.25 : 1.0; 
  }

  ngOnInit() {
    this.color = this.colorHexes[this.checker.color];
    this.centerX = this.cellSize / 2;
    this.centerY = (this.cellSize / 2) + (this.cellSize * (this.rowCount - 1 - this.checker.row));
    this.isWinner = this.checker.isWinner;
    this.opacity = (this.status === OVER && !this.isWinner) ? 0.25 : 1.0; 
  }
}
