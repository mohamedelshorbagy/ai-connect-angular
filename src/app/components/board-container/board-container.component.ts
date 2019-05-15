import { Component, OnInit } from '@angular/core';
import { RED, BLACK, key, EMPTY, OVER, min, max, PLAY, Winner } from '../../helper';
import { State } from '../../state.class';
import { Board, IGame } from '../../board.class'
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
  board: Board;
  winLength: number = 4;
  playerState: number;
  iterations: number = 0;
  sameScore: number = 0;
  score: number = 100000;
  depth: number = 4;
  scoreState: [number, number] = [null, null]
  constructor() { }

  ngOnInit() {
    this.evaluatePlayerState();
    this.createBoard();

    // let score = this.getScore({ board: this.board, rowCount: this.rowCount, colCount: this.colCount, gScore: this.score });
    // console.log('score', score);
  }


  evaluatePlayerState() {
    this.playerState = this.playerColor === BLACK ? Winner.player1 : Winner.player2;
  }




  createBoard() {
    let board = new Array(this.rowCount);
    for (let i = 0; i < board.length; i++) {
      board[i] = new Array(this.colCount);
      for (let j = 0; j < board[i].length; j++) {
        board[i][j] = 0;
      }
    }
    let gameState: IGame = {
      rowCount: this.rowCount,
      colCount: this.colCount,
      score: this.score
    }
    this.board = new Board(board, this.playerState, gameState);

    // console.log('Board Creation', this.board);
  }

  updateBoard({ col }) {
    this.board.placePiece(col);
    console.log('Board: ', this.board.fields);
  }

  toggleColor() {
    if (this.playerColor === RED) {
      this.playerColor = BLACK;
      // Go AI
      /**
       * Finite State
       * 1. Get Board Score
       * 2. Get AI_Move
       *
       */
      let boardScore = this.board.score();
      if (boardScore != this.score && boardScore != -this.score && !this.board.isFull()) {
        let nextMove: [number | any, number] = (<any>this.maximizePlay(this.board, this.depth));
        console.log('nextMove', nextMove);
        this.scoreState = nextMove;
        // Place into the Board
        // Place in the UI
        // Find row to fill in
        this.placePieceByAI(nextMove[0]);

      }


    } else {
      this.playerColor = RED;
    }
    this.evaluatePlayerState();
  }

  setChecker({ row, col }, attrs = {}) {
    const checker = this.getChecker({ row, col });
    this.checkers[key({ row, col })] = { ...checker, ...attrs };
    this.updateBoard({ col });
    console.log(this.checkers);
  }



  drop({ col, row }) {
    if (this.isLocked) return;

    // this.isLocked = true;
    const color = this.playerColor;

    // console.log('setting checker', key({ row, col }), { row, col, color });
    this.setChecker({ row, col }, { color });

    this.checkForDraw() || this.checkForWinFrom({ row, col });
    this.toggleColor();

  }



  public getChecker({ row, col }) {
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
    this.board = undefined;
    this.evaluatePlayerState();
    this.createBoard();
    this.iterations = 0;
    this.sameScore = 0;
    this.scoreState = [null, null]
  }

  placePieceByAI(col: number) {
    if (this.board.fields[0][col] == 0 && col >= 0 && col < this.colCount) {
      // Bottom to top
      let row = this.board.getAvailableRow(col);
      if (~row) {
        row = this.rowCount - row - 1; // to be converted in the Board
        this.drop({ col, row });
      }
    }
  }





  maximizePlay(board: Board, depth, alpha = undefined, beta = undefined) {
    // Call score of our board
    let score = board.score();

    if (board.isFinished(depth, score)) return [undefined, score];

    // Column, Score
    var max = [undefined, -99999];
    // For all possible moves
    for (var column = 0; column < this.colCount; column++) {
      var new_board = board.copy(); // Create new board

      let placement = new_board.placePiece(column);
      if (placement) {
        this.iterations++;

        var next_move = this.minimizePlay(new_board, depth - 1, alpha, beta); // Recursive calling

        // Evaluate new move
        if (max[0] === undefined || next_move[1] > max[1]) {
          max[0] = column;
          max[1] = next_move[1];
          alpha = next_move[1];
        }

        if (alpha >= beta) return max;
      }
    }

    return max;
  }

  minimizePlay(board: Board, depth: number, alpha?: number, beta?: number) {
    let score = board.score();
    if (board.isFinished(depth, score)) {
      return [undefined, score]
    }

    // Column, score
    var min = [undefined, 99999];

    for (var column = 0; column < this.colCount; column++) {
      var new_board: Board = board.copy();
      let placement = new_board.placePiece(column);
      if (placement) {
        this.iterations++;
        var next_move = this.maximizePlay(new_board, depth - 1, alpha, beta);

        if (min[0] === undefined || next_move[1] < min[1]) {
          min[0] = column;
          min[1] = next_move[1];
          beta = next_move[1];
        }
        if (alpha >= beta) return min;
      }
    }
    return min;
  }

}
