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
  scoreState: [number, number] = [-1, -1]
  constructor() { }

  ngOnInit() {
    this.createBoard();
    this.evaluatePlayerState();

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

  updateBoard({ row, col }) {
    this.board[row][col] = this.playerState;
    // console.log('Board: ', this.board);

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
      let getScoreInput = { board: this.board, rowCount: this.rowCount, winLength: this.winLength, colCount: this.colCount, gScore: this.score }
      var score = this.getScore(getScoreInput);
      if (score != this.score && score != -this.score && !this.boardisFull(this.board)) {
        console.log(this.iterations);
        this.iterations = 0;
        var ai_move = this.maximizePlay(this.board, this.depth);
        console.log(ai_move);
        this.scoreState = (<any>ai_move);
        this.placePieceByAI(ai_move[0]);
        // this.drop({  })
      }
      // let action = this.getMove(this.board);
      // this.placePieceByAI(action);
      // console.log('action', action);
    } else {
      this.playerColor = RED;
    }
    this.evaluatePlayerState();
  }

  setChecker({ row, col }, attrs = {}) {
    const checker = this.getChecker({ row, col });
    this.checkers[key({ row, col })] = { ...checker, ...attrs };
    this.updateBoard({ row, col });
    console.log(this.checkers);
  }

  scorePosition(board, row, column, delta_y, delta_x) {
    board = JSON.parse(JSON.stringify(board));
    var human_points = 0;
    var computer_points = 0;

    // Save winning positions to arrays for later usage
    let winning_array_human = [];
    let winning_array_cpu = [];

    // Determine score through amount of available chips
    for (var i = 0; i < 4; i++) {
      if (board[row][column] == 2) {
        winning_array_human.push([row, column]);
        human_points++; // Add for each human chip
      } else if (board[row][column] == 1) {
        winning_array_cpu.push([row, column]);
        computer_points++; // Add for each computer chip
      }

      // Moving through our board
      row += delta_y;
      column += delta_x;
    }

    // Marking winning/returning score
    let winning_array = [];

    if (human_points == 4) {
      winning_array = winning_array_human;
      // Computer won (100000)
      return -this.score;
    } else if (computer_points == 4) {
      winning_array = winning_array_cpu;
      // Human won (-100000)
      return this.score;
    } else {
      // Return normal points
      return computer_points;
    }
  }

  /**
   * Returns the overall score for our board.
   *
   * @return {number}
   */
  getScore({ rowCount, colCount, board, gScore, winLength }: {
    board: any[][];
    rowCount: number;
    gScore: number;
    colCount: number;
    winLength?: number
  }) {
    board = JSON.parse(JSON.stringify(board));
    var points = 0;

    var vertical_points = 0;
    var horizontal_points = 0;
    var diagonal_points1 = 0;
    var diagonal_points2 = 0;

    // Board-size: 7x6 (height x width)
    // Array indices begin with 0
    // => e.g. height: 0, 1, 2, 3, 4, 5

    // Vertical points
    // Check each column for vertical score
    // 
    // Possible situations
    //  0  1  2  3  4  5  6
    // [x][ ][ ][ ][ ][ ][ ] 0
    // [x][x][ ][ ][ ][ ][ ] 1
    // [x][x][x][ ][ ][ ][ ] 2
    // [x][x][x][ ][ ][ ][ ] 3
    // [ ][x][x][ ][ ][ ][ ] 4
    // [ ][ ][x][ ][ ][ ][ ] 5
    for (var row = 0; row < rowCount - 3; row++) {
      // Für jede Column überprüfen
      for (var column = 0; column < colCount; column++) {
        // Die Column bewerten und zu den Punkten hinzufügen
        var score = this.scorePosition(board, row, column, 1, 0);
        if (score == gScore) return gScore;
        if (score == -gScore) return -gScore;
        vertical_points += score;
      }
    }

    // Horizontal points
    // Check each row's score
    // 
    // Possible situations
    //  0  1  2  3  4  5  6
    // [x][x][x][x][ ][ ][ ] 0
    // [ ][x][x][x][x][ ][ ] 1
    // [ ][ ][x][x][x][x][ ] 2
    // [ ][ ][ ][x][x][x][x] 3
    // [ ][ ][ ][ ][ ][ ][ ] 4
    // [ ][ ][ ][ ][ ][ ][ ] 5
    for (var row = 0; row < rowCount; row++) {
      for (var column = 0; column < colCount - 3; column++) {
        var score = this.scorePosition(board, row, column, 0, 1);
        if (score == gScore) return gScore;
        if (score == -gScore) return -gScore;
        horizontal_points += score;
      }
    }



    // Diagonal points 1 (left-bottom)
    //
    // Possible situation
    //  0  1  2  3  4  5  6
    // [x][ ][ ][ ][ ][ ][ ] 0
    // [ ][x][ ][ ][ ][ ][ ] 1
    // [ ][ ][x][ ][ ][ ][ ] 2
    // [ ][ ][ ][x][ ][ ][ ] 3
    // [ ][ ][ ][ ][ ][ ][ ] 4
    // [ ][ ][ ][ ][ ][ ][ ] 5
    for (var row = 0; row < rowCount - 3; row++) {
      for (var column = 0; column < colCount - 3; column++) {
        var score = this.scorePosition(board, row, column, 1, 1);
        if (score == gScore) return gScore;
        if (score == -gScore) return -gScore;
        diagonal_points1 += score;
      }
    }

    // Diagonal points 2 (right-bottom)
    //
    // Possible situation
    //  0  1  2  3  4  5  6
    // [ ][ ][ ][x][ ][ ][ ] 0
    // [ ][ ][x][ ][ ][ ][ ] 1
    // [ ][x][ ][ ][ ][ ][ ] 2
    // [x][ ][ ][ ][ ][ ][ ] 3
    // [ ][ ][ ][ ][ ][ ][ ] 4
    // [ ][ ][ ][ ][ ][ ][ ] 5
    for (var row = 3; row < rowCount; row++) {
      for (var column = 0; column <= colCount - 4; column++) {
        var score = this.scorePosition(board, row, column, -1, +1);
        if (score == gScore) return gScore;
        if (score == -gScore) return -gScore;
        diagonal_points2 += score;
      }

    }

    points = horizontal_points + vertical_points + diagonal_points1 + diagonal_points2;
    return points;
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
    this.createBoard();
    this.evaluatePlayerState();
  }


  copyBoard(board: Array<Array<any>>) {
    var new_board = new Array();
    for (var i = 0; i < board.length; i++) {
      new_board.push(board[i].slice());
    }
    return new_board;
    // // let newBoard: Array<Array<any>> = board;
    // for (let i = 0; i < board.length; i++) {
    //   for (let j = 0; j < board[i].length; j++) {
    //     newBoard[i][j] = board[i][j];
    //   }
    // }
    // return newBoard;
  }




  placePiece(board, column, player) {
    let newBoard = JSON.parse(JSON.stringify(board)); // deep clonning
    if (this.isValidMove(newBoard, column) === true) {
      var row = this.getAvailableRow(newBoard, column);
      newBoard[row][column] = player;
      return newBoard;
    } else {
      return false;
    }


  }

  isValidMove(board, column) {
    return board[0][column] === 0;
  }

  getAvailableRow = (board, column) => {
    // Check from the bottom up for an empty space
    for (var i = this.rowCount - 1; i >= 0; i--) {
      if (board[i][column] == 0) {
        return i;
      }
    }
    // Move is invalid
    return -1;
  }


  getMove(board) {
    var maxplayer = this.playerState === 1;
    board = JSON.parse(JSON.stringify(board));
    var result = this.alphabeta(new State(0, board, 0, 0), 0, -Infinity, Infinity, maxplayer);
    return result.action;
  }


  placePieceByAI(col: number) {
    for (let i = 0; i < this.rowCount; i++) {
      if (this.board[i][col] === 0) {
        this.drop({ col, row: i });
        break;
      }
    }
  }


  boardisFull(board) {
    for (var i = 0; i < this.colCount; i++) {
      if (board[0][i] == 0) {
        return false;
      }
    }
    return true;
  }


  boardisFinished(board, depth, score) {
    if (depth == 0 || score == this.score || score == -this.score || this.boardisFull(board)) {
      return true;
    }
    return false;
  }


  maximizePlay(board, depth, alpha = undefined, beta = undefined) {
    // Call score of our board
    board = JSON.parse(JSON.stringify(board))
    let getScoreInput = { board: board, rowCount: this.rowCount, colCount: this.colCount, gScore: this.score, winLength: this.winLength }
    var score = this.getScore(getScoreInput);
    console.log('score ===>', score);
    if (this.boardisFinished(board, depth, score)) return [0, score];

    // Column, Score
    var max = [0, -99999];
    // For all possible moves
    for (var column = 0; column < this.colCount; column++) {
      var new_board = this.copyBoard(board) // Create new board
      let placement = this.placeBoard(new_board, column);
      if (placement) {
        new_board = placement[1];
        this.iterations++;

        var next_move = this.minimizePlay(new_board, depth - 1, alpha, beta); // Recursive calling

        // Evaluate new move
        if (max[0] == 0 || next_move[1] > max[1]) {
          max[0] = column;
          max[1] = next_move[1];
          alpha = next_move[1];
        }

        if (alpha >= beta) return max;
      }
    }

    return max;
  }

  minimizePlay(board, depth, alpha = undefined, beta = undefined) {
    board = JSON.parse(JSON.stringify(board));
    let getScoreInput = { board: board, rowCount: this.rowCount, colCount: this.colCount, gScore: this.score, winLength: this.winLength }
    var score = this.getScore(getScoreInput);

    if (this.boardisFinished(board, depth, score)) {
      return [0, score]
    }

    // Column, score
    var min = [0, 99999];

    for (var column = 0; column < this.colCount; column++) {
      var new_board = this.copyBoard(board);
      let placement = this.placeBoard(new_board, column);
      if (placement) {
        new_board = placement[1];
        this.iterations++;

        var next_move = this.maximizePlay(new_board, depth - 1, alpha, beta);

        if (min[0] == 0 || next_move[1] < min[1]) {
          min[0] = column;
          min[1] = next_move[1];
          beta = next_move[1];
        }

        if (alpha >= beta) return min;

      }
    }
    return min;
  }


  placeBoard(board, column) {
    let newBoard = JSON.parse(JSON.stringify(board));
    if (newBoard[0][column] == 0 && column >= 0 && column < this.colCount) {
      // Bottom to top
      for (var y = this.rowCount - 1; y >= 0; y--) {
        if (newBoard[y][column] == 0) {
          newBoard[y][column] = this.playerState;
          break; // Break from loop after inserting
        }
      }
      return [true, newBoard];
    } else {
      return false;
    }
  }


  alphabeta(state: State, depth, alpha, beta, maxplayer) {

    // End search if we've reached maximum depth or the game is over
    // board = JSON.parse(JSON.stringify(board));
    if (depth === 4 || this.winner) {
      let getScoreInput = { board: state.board, rowCount: this.rowCount, gScore: this.score, colCount: this.colCount }
      // console.log('inside if depth: ', this.getScore(getScoreInput));
      return new State(state.action, state.board, this.getScore(getScoreInput), depth);
    }


    /**
     * Max player is playing. This means that maxplayer will look at his possible moves and return the one
     * that has the largest score.
     */
    if (maxplayer) {

      // The highest score among this state's children and its associated action
      var highestScore = -Infinity;
      var deepestDepth = 0;
      var bestAction = -1;


      /**
       * Generate successor states of this state. We do this by looking at each possible action
       * that maxplayer can perform while in this current state. Actions are represented by the
       * current value of i. For example, when i = 4, this represents the action of maxplayer dropping
       * his piece in the 5th column. We do this for each column and only examine the successor state
       * if it is valid.
       */
      for (var i = 0; i < this.colCount; i++) {

        // Only check valid actions
        if (this.isValidMove(state.board, i)) {
          this.iterations++;


          // Get resulting state from performing this action
          var newBoard = this.copyBoard(state.board);
          let placeState = this.placePiece(newBoard, i, 1);
          newBoard = placeState ? placeState : newBoard;

          var nextState = this.alphabeta(new State(i, newBoard, 0, depth + 1), depth + 1, alpha, beta, false);


          /**
          * Update the largest score found among this state's children so far, as well as
          * update the action that was taken to get that score. If 2 states have the same score,
          * break the ties by choosing the state with a deeper depth
          */
          var score = nextState.score;//board.getScore(1);
          if (bestAction == -1 || score >= highestScore) {

            // Break ties by choosing the deeper state
            if (score == highestScore) {
              this.sameScore++;
              //console.log("Same score=" + score);
              //console.log("nextstate.depth=" + nextState.depth + ",deepestDepth=" + deepestDepth);
              if (nextState.depth > deepestDepth) {
                highestScore = score;
                bestAction = i;
                deepestDepth = nextState.depth;
              }
            } else {
              highestScore = score;
              bestAction = i;
            }
          }


          // Save the largest score found among all states in this entire branch so far
          alpha = Math.max(alpha, highestScore);


          /**
          * We can ignore the rest of the successor states in this branch because they will result in worse scores
          * than if we choose one of the actions in a previous branch
          */
          if (beta <= alpha) {
            console.log('highestScore (beta <= alpha)', highestScore);
            return new State(bestAction, state.board, highestScore, depth);
          }
        }
      }

      console.log('highestScore ===>', highestScore);
      return new State(bestAction, state.board, highestScore, depth);
    }


    /**
    * Min player is playing. This means that minplayer will look at his possible moves and return the one
    * that has the smallest score.
    */
    if (!maxplayer) {

      // The smallest score among this state's children and its associated action
      var smallestScore = Infinity;
      var deepestDepth = 0;
      var bestAction = -1;


      /**
      * Generate successor states of this state. We do this by looking at each possible action
      * that minplayer can perform while in this current state. Actions are represented by the
      * current value of i. For example, when i = 4, this represents the action of minplayer dropping
      * his piece in the 5th column. We do this for each column and only examine the successor state
      * if it is valid.
      */
      for (var i = 0; i < this.colCount; i++) {

        // Only check valid actions
        if (this.isValidMove(state.board, i)) {
          this.iterations++;


          // Get resulting state from performing this action
          var newBoard = this.copyBoard(state.board);
          let placeState = this.placePiece(newBoard, i, 2);
          newBoard = placeState ? placeState : newBoard;
          var nextState = this.alphabeta(new State(i, newBoard, 0, depth + 1), depth + 1, alpha, beta, true);



          /**
          * Update the smallest score found among this state's children so far, as well as
          * update the action that was taken to get that score
          */
          var score = nextState.score;//board.getScore(2);
          if (bestAction == -1 || score <= smallestScore) {

            // Break ties by choosing the deeper state
            if (score == smallestScore) {
              this.sameScore++;
              //console.log("Same score=" + score);
              //console.log("nextstate.depth=" + nextState.depth + ",deepestDepth=" + deepestDepth);
              if (nextState.depth > deepestDepth) {
                smallestScore = score;
                bestAction = i;
                deepestDepth = nextState.depth;
              }
            } else {
              smallestScore = score;
              bestAction = i;
            }
          }


          // Save the smallest score found among all states in this entire branch so far
          beta = Math.min(beta, smallestScore);


          /**
          * We can ignore the rest of the successor states in this branch because they will result in worse scores
          * than if we choose one of the actions in a previous branch
          */
          if (beta <= alpha) {
            return new State(bestAction, state.board, smallestScore, depth);
          }
        }
      }

      return new State(bestAction, state.board, smallestScore, depth);
    }
  }

  // getScore({ board, rowCount, colCount, winLength, gScore }) {
  //   var player1Lines = [];
  //   var player2Lines = [];
  //   var winSize = winLength - 1;
  //   for (var i = 0; i < winLength; i++) {
  //     player1Lines[i] = 0;
  //     player2Lines[i] = 0;
  //   }


  //   // Check each tile
  //   for (var r = 0; r < rowCount; r++) {
  //     for (var c = 0; c < colCount; c++) {

  //       /**
  //       * These are the lines that are check for each tile. They represent how many
  //       * pieces each player has in the line, and whether or not the line is valid.
  //       * Format: [player1pieces, player2pieces, valid]
  //       */
  //       var lineRight: [number, number, boolean] = [0, 0, true];
  //       var lineDown: [number, number, boolean] = [0, 0, true];
  //       var lineDownLeft: [number, number, boolean] = [0, 0, true];
  //       var lineDownRight: [number, number, boolean] = [0, 0, true];


  //       // Get line segments for each player
  //       for (var w = 0; w < winLength; w++) {

  //         // Check right
  //         if (c + winSize < colCount) {
  //           if (board[r][c + w] == Winner.player1) {
  //             (<any>lineRight[0])++;
  //           }

  //           if (board[r][c + w] == Winner.player2) {
  //             (<any>lineRight[1])++;
  //           }
  //         } else {
  //           lineRight[2] = false;
  //         }


  //         // Check down and diagonals
  //         if (r + winSize < rowCount) {

  //           // Down
  //           if (board[r + w][c] == Winner.player1) {
  //             (<any>lineDown[0])++;
  //           }

  //           if (board[r + w][c] == Winner.player2) {
  //             (<any>lineDown[1])++;
  //           }


  //           // Down left
  //           if (c - winSize >= 0) {
  //             if (board[r + w][c - w] == Winner.player1) {
  //               (<any>lineDownLeft[0])++;
  //             }

  //             if (board[r + w][c - w] == Winner.player2) {
  //               (<any>lineDownLeft[1])++;
  //             }
  //           } else {
  //             lineDownLeft[2] = false;
  //           }


  //           // Down right
  //           if (c + winSize < colCount) {
  //             if (board[r + w][c + w] == Winner.player1) {
  //               (<any>lineDownRight[0])++;
  //             }

  //             if (board[r + w][c + w] == Winner.player2) {
  //               (<any>lineDownRight[1])++;
  //             }
  //           } else {
  //             lineDownRight[2] = false;
  //           }
  //         } else {
  //           lineDown[2] = false;
  //           lineDownLeft[2] = false;
  //           lineDownRight[2] = false;
  //         }
  //       }



  //       // Update player's line counts
  //       const updateLines = (line) => {

  //         // Make sure line is valid
  //         if (line[0] > 0 && line[1] > 0) {
  //           line[2] = false;
  //         }

  //         // Update line counts
  //         if (line[2] == true) {
  //           if (line[0] > 0) {
  //             player1Lines[line[0] - 1]++;
  //           }
  //           if (line[1] > 0) {
  //             player2Lines[line[1] - 1]++;
  //           }
  //         }
  //       }
  //       updateLines(lineRight);
  //       updateLines(lineDown);
  //       updateLines(lineDownLeft);
  //       updateLines(lineDownRight);
  //     }
  //   }


  //   //     // Set score to infinity if any winning lines are found
  //   if (player1Lines[player1Lines.length - 1] > 0) {
  //     return Infinity;
  //   }
  //   if (player2Lines[player2Lines.length - 1] > 0) {
  //     return -Infinity;
  //   }


  //   // Sum scores for each player
  //   var player1Score = 0;
  //   var player2Score = 0;

  //   for (var i = 0; i < player1Lines.length - 1; i++) {
  //     player1Score += Math.pow(10 * i, i) * player1Lines[i];
  //     player2Score -= Math.pow(10 * i, i) * player2Lines[i];
  //   }

  //   return player1Score + player2Score;
  // }





}
