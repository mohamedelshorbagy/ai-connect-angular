import { Component, OnInit } from '@angular/core';
import { RED, BLACK, key, EMPTY, OVER, min, max, PLAY } from '../../helper'
@Component({
  selector: 'board-container',
  templateUrl: './board-container.component.html',
  styleUrls: ['./board-container.component.css']
})
export class BoardContainerComponent implements OnInit {
  checkers = {};
  playerColor = RED;
  rowCount: number = 6;
  colCount: number = 7;
  isLocked = false;
  status: string = PLAY;
  winner: any = undefined;
  isDraw: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  toggleColor() {
    if (this.playerColor === RED) {
      this.playerColor = BLACK;
    } else {
      this.playerColor = RED;
    }
  }

  setChecker({ row, col }, attrs = {}) {
    const checker = this.getChecker({ row, col });
    this.checkers[key({ row, col })] = { ...checker, ...attrs };
    console.log(this.checkers);
  }

  drop({ col, row }) {
    if (this.isLocked) return;

    // this.isLocked = true;
    const color = this.playerColor;

    console.log('setting checker', key({ row, col }), { row, col, color });
    this.setChecker({ row, col }, { color });

    this.checkForDraw() || this.checkForWinFrom({ row, col });
    this.toggleColor();

  }



  getChecker({ row, col }) {
    return this.checkers[key({ row, col })] || { row, col, color: 'empty' };
  }

  checkForDraw() {
    this.isDraw = Object.keys(this.checkers).length === this.rowCount * this.colCount;
    return this.isDraw;
  }

  getWinner(...segment) {
    if (segment.length !== 4) return false;
    const checkers = segment.map(([row, col]) => this.getChecker({ row, col }));
    const color = checkers[0].color;
    if (color === EMPTY) return false;
    if (checkers.every(c => c.color === color)) return { color, checkers };
    return false;
  }

  checkHorizontalSegments({ focalRow, minCol, maxCol }) {
    for (let row = focalRow, col = minCol; col <= maxCol; col++) {
      const winner = this.getWinner([row, col], [row, col + 1], [row, col + 2], [row, col + 3]);
      if (winner) return winner;
    }
  }

  checkVerticalSegments({ focalRow, focalCol, minRow, maxRow }) {
    for (let col = focalCol, row = minRow; row <= focalRow; row++) {
      const winner = this.getWinner([row, col], [row + 1, col], [row + 2, col], [row + 3, col]);
      if (winner) return winner;
    }
  }

  checkForwardSlashSegments({ focalRow, focalCol, minRow, minCol, maxRow, maxCol }) {
    const startForwardSlash = (row, col) => {
      while (row > minRow && col > minCol) { row--; col--; }
      return [row, col]
    }
    for (let [row, col] = startForwardSlash(focalRow, focalCol); row <= maxRow && col <= maxCol; row++ , col++) {
      const winner = this.getWinner([row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]);
      if (winner) return winner;
    }
  }

  checkBackwardSlashSegments({ focalRow, focalCol, minRow, minCol, maxRow, maxCol }) {
    const startBackwardSlash = (row, col) => {
      while (row < maxRow && col > minCol) { row++; col--; }
      return [row, col]
    }
    for (let [row, col] = startBackwardSlash(focalRow, focalCol); row >= minRow && col <= maxCol; row-- , col++) {
      const winner = this.getWinner([row, col], [row - 1, col + 1], [row - 2, col + 2], [row - 3, col + 3]);
      if (winner) return winner;
    }
  }

  checkForWinFrom(lastChecker) {
    if (!lastChecker) return;
    const { row: focalRow, col: focalCol } = lastChecker;
    const minCol = min(focalCol);
    const maxCol = max(focalCol, this.colCount - 1);
    const minRow = min(focalRow);
    const maxRow = max(focalRow, this.rowCount - 1);
    const coords = { focalRow, focalCol, minRow, minCol, maxRow, maxCol };

    this.winner = this.checkHorizontalSegments(coords) ||
      this.checkVerticalSegments(coords) ||
      this.checkForwardSlashSegments(coords) ||
      this.checkBackwardSlashSegments(coords);
    if (this.isDraw) {
      this.displayDraw();
    }

    if (this.winner) {
      this.isLocked = true;
      this.displayWin(this.winner);
    } else {
      this.isLocked = false;
    }
  }

  displayDraw() {
    this.status = OVER;
  }

  displayWin(winner) {
    this.winner = winner;
    this.status = OVER;
    this.winner.checkers.forEach((checker) => {
      this.setChecker(checker, { isWinner: true });
    });
    console.log('Win!', winner);
  }

  reset() {
    this.winner = undefined;
    this.isLocked = false;
    this.status = PLAY;
    this.checkers = {};

  }




}
