import { Component, OnInit } from '@angular/core';
import { RED, BLACK, key, EMPTY, OVER, min, max, PLAY, Winner } from '../../helper';
import { Board, IGame } from '../../board.class';
import { Observable } from 'rxjs'
import { delay } from 'rxjs/operators'



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
  scoreState: [number, number] = [null, null];
  delayTime: number = 100;
  disableClick: boolean = false;
  depths: number[] = [4, 5, 6, 7];
  constructor(
  ) { }

  ngOnInit() {
    this.evaluatePlayerState();
    this.createBoard();

  }

  /**
   * @function enableAItoPlaywithItSelf
   * @description enable AI to Play with itself
   * @returns {VoidFunction}
   */
  enableAItoPlaywithItSelf() {
    this.reset();
    this.delayTime = 500;
    this.disableClick = true;
    let randCol = Math.floor(Math.random() * this.rowCount);
    this.drop({ col: randCol, row: 0 });
    // this.aIMoveOnBoard(this.delayTime);
  }

  /**
   * @function aIMoveOnBoard
   * @description util wrapper for aiPlays() function
   * @param {Number=100} delayTime 
   */
  aIMoveOnBoard(delayTime = 100) {
    let nextMoveDelayed$ = this.aiPlays(delayTime);
    this.isLocked = true;
    nextMoveDelayed$.subscribe(([colVal, scoreVal]) => {
      this.isLocked = false;
      this.scoreState = [colVal, scoreVal];
      this.placePieceByAI(colVal);
      this.evaluatePlayerState();
    })
  }


  /**
   * @function evaluatePlayerState
   * @description get the state of the player so I can set the right value in board [1,2]
   * @returns {VoidFunction}
   */
  evaluatePlayerState() {
    this.playerState = this.playerColor === BLACK ? Winner.player1 : Winner.player2;
  }



  /**
   * @function createBoard
   * @description create Board based on the [Board] Class and populate it with internal variable
   * @returns {VoidFunction}
   */
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

  }
  /**
   * @function updateBoard
   * @description Update Board with checked circle
   * @param {Number} param.col 
   */
  updateBoard({ col }) {
    this.board.placePiece(col);
    console.log('Board: ', this.board.fields);
  }

  /**
   * @function toggleColor
   * @description toggle playing in the game and also responsible for AI Playing
   * @returns {VoidFunction}
   */
  toggleColor() {
    if (!this.winner) {
      if (this.playerColor === RED) {
        this.playerColor = BLACK;
        this.aIMoveOnBoard();
      } else {
        this.playerColor = RED;
        if (this.disableClick) {
          this.aIMoveOnBoard();
        }
      }
    }
  }

  /**
   * @function aiPlays
   * @description detect move for AI and delay it by amount of time
   * @param {Number=100} time 
   * @returns {Observable}
   */
  aiPlays(time = 100) {
    /**
     * Finite State
     * 1. Get Board Score
     * 2. Get AI_Move
     * 3. Delay it by some amount of time
     *
     */
    let boardScore = this.board.score();
    if (boardScore != this.score && boardScore != -this.score && !this.board.isFull()) {
      // let nextMove: [number | any, number] = (<any>this.maximize(this.board, this.depth));
      let nextMove$ = new Observable((observer) => {
        let nextMove: [number | any, number] = (<any>this.maximize(this.board, this.depth));
        observer.next(nextMove);
        observer.complete();
      });

      return nextMove$.pipe(
        delay(time)
      );
    }
  }


  /**
   * @function setChecker
   * @description set row,col for checkers object and update board and also make a new checkers Object so I can trigger OnPush detection
   * @param {Number} param.row 
   * @param {Number} param.col 
   * @param {Object=} attrs 
   */
  setChecker({ row, col }, attrs = {}) {
    const checker = this.getChecker({ row, col });
    let checkers = Object.assign({}, this.checkers); // Make a new Copy
    checkers[key({ row, col })] = { ...checker, ...attrs };
    this.checkers = checkers;
    this.updateBoard({ col });
    console.log(this.checkers);
  }


  /**
   * @function drop
   * @description fill the circle with specified color and add it to checkers object
   * @param {Number} param.row 
   * @param {Number} param.col
   */
  drop({ col, row }) {
    if (this.isLocked) return;

    console.log('Drop Triggered', this.isLocked, this.playerState);
    // this.isLocked = true;
    const color = this.playerColor;

    // console.log('setting checker', key({ row, col }), { row, col, color });
    this.setChecker({ row, col }, { color });

    this.checkForDraw() || this.checkForWinFrom({ row, col });
    this.toggleColor();

  }


  /**
   * @function getChecker
   * @description get checked circle based on row and key
   * @param {Number} param.row
   * @param {Number} param.col 
   */
  public getChecker({ row, col }) {
    return this.checkers[key({ row, col })] || { row, col, color: 'empty' };
  }

  /**
   * @function checkForDraw
   * @returns {Boolean}
   */
  checkForDraw() {
    this.isDraw = Object.keys(this.checkers).length === this.rowCount * this.colCount;
    return this.isDraw;
  }
  /**
   * @function getWinner
   * @description return fasle if winner is not exist or the winner object if exist
   * @param {Array} segment
   * @returns {Boolean | Object} 
   */
  getWinner(...segment) {
    if (segment.length !== 4) return false;
    const checkers = segment.map(([row, col]) => this.getChecker({ row, col }));
    const color = checkers[0].color;
    if (color === EMPTY) return false;
    if (checkers.every(c => c.color === color)) return { color, checkers };
    return false;
  }
  /**
   * @function checkHorizontalSegments
   * @description check for winning based in horizontal case
   * @param {Number} focalRow
   * @param {Number} focalCol  
   * @param {Number} minRow
   * @param {Number} minCol
   * @returns {Array | Object}  
   */
  checkHorizontalSegments({ focalRow, minCol, maxCol }) {
    for (let row = focalRow, col = minCol; col <= maxCol; col++) {
      const winner = this.getWinner([row, col], [row, col + 1], [row, col + 2], [row, col + 3]);
      if (winner) return winner;
    }
  }

  /**
   * @function checkVerticalSegments
   * @description check for winning based in vertical case
   * @param {Number} focalRow
   * @param {Number} focalCol  
   * @param {Number} minRow
   * @param {Number} minCol
   * @returns {Array | Object}  
   */

  checkVerticalSegments({ focalRow, focalCol, minRow }) {
    for (let col = focalCol, row = minRow; row <= focalRow; row++) {
      const winner = this.getWinner([row, col], [row + 1, col], [row + 2, col], [row + 3, col]);
      if (winner) return winner;
    }
  }
  /**
   * @function checkForwardSlashSegments
   * @description check for winning based in first diagonal case
   * @param {Number} param.focalRow
   * @param {Number} param.focalCol  
   * @param {Number} param.minRow
   * @param {Number} param.minCol
   * @param {Number} param.maxRow
   * @param {Number} param.maxCol
   * @returns {Array | Object}  
   */
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
  /**
   * @function checkBackwardSlashSegments
   * @description check for winning based in second diagonal case
   * @param {Number} param.focalRow
   * @param {Number} param.focalCol  
   * @param {Number} param.minRow
   * @param {Number} param.minCol
   * @param {Number} param.maxRow
   * @param {Number} param.maxCol
   * @returns {Array | Object}  
   */
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
  /**
   * @function checkForWinFrom
   * @description check for winning state for all situations [vert., horiz., both diagonals]
   * @param lastChecker 
   */
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

  /**
   * @function displayDraw
   * @description set status to OVER if the game is finished
   * @returns {VoidFunction}
   */
  displayDraw() {
    this.status = OVER;
  }

  /**
   * @function displayWin
   * @description util function for setting values for win so I can visualize it in the UI
   * @param {Object} winner 
   * @returns {VoidFunction}
   */
  displayWin(winner) {
    this.winner = winner;
    this.status = OVER;
    this.winner.checkers.forEach((checker) => {
      this.setChecker(checker, { isWinner: true });
    });
    console.log('Win!', winner);
  }
  /**
   * @function reset
   * @description Reset all active variables to defaults so you can start playing again
   * @returns {VoidFunction}
   */
  reset() {
    this.winner = undefined;
    this.isLocked = false;
    this.disableClick = false;
    this.status = PLAY;
    this.checkers = {};
    this.board = undefined;
    this.playerColor = RED;
    this.playerState = Winner.player2;
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
        console.log('From AI');
        this.drop({ col, row });
      }
    }
  }




  /**
   * @function maximize
   * @description when Max player is playing; so maxplayer will look at his possible moves and return the one with max score
   * @param {Board} board 
   * @param {Number} depth 
   * @param {Number=} alpha 
   * @param {Number=} beta 
   * @returns {Array} [column, score]
   */
  maximize(board: Board, depth, alpha?: number, beta?: number) {
    // Call score of our board
    let score = board.score();

    if (board.isFinished(depth, score)) return [undefined, score];

    // Column, Score
    var max = [undefined, -99999];
    // we generate states based on current state by looking for every 
    // possible move maxplayer can play
    for (var column = 0; column < this.colCount; column++) {
      var new_board = board.copy(); // Clone new Board from exisiting Board

      let placement = new_board.placePiece(column);
      if (placement) {
        this.iterations++;

        var next_move = this.minimize(new_board, depth - 1, alpha, beta); // recursive calls

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
  /**
   * @function minimize
   * @description when Min player is playing; so minplayer will look at his possible moves and return the one with min score
   * @param {Board} board 
   * @param {Number} depth 
   * @param {Number=} alpha 
   * @param {Number=} beta
   * @returns {Array} [column, score]
   */
  minimize(board: Board, depth: number, alpha?: number, beta?: number) {
    let score = board.score();
    if (board.isFinished(depth, score)) {
      return [undefined, score]
    }

    // Column, score
    var min = [undefined, 99999];
    // we generate states based on current state by looking for every 
    // possible move minplayer can play

    for (var column = 0; column < this.colCount; column++) {
      var new_board: Board = board.copy(); // Clone new Board from exisiting Board
      let placement = new_board.placePiece(column);
      if (placement) {
        this.iterations++; // inc. iterations
        var next_move = this.maximize(new_board, depth - 1, alpha, beta); // recurisve calls

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
