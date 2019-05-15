import { Winner } from './helper'
export interface IGame {
    rowCount: number,
    colCount: number,
    score: number
}

export class Board {
    fields: Array<Array<any>>;
    player: number;
    gameState: IGame;
    constructor(board, player, gameState: IGame) {
        this.fields = board;
        this.player = player;
        this.gameState = gameState;
    }

    isValidMove(column: number) {
        return this.fields[0][column] === 0;
    }

    getAvailableRow(column: number) {
        for (var i = this.gameState.rowCount - 1; i >= 0; i--) {
            if (this.fields[i][column] === 0) {
                return i;
            }
        }
        return -1;
    }

    placePiece(column: number) {
        if (this.fields[0][column] == 0 && column >= 0 && column < this.gameState.colCount) {
            // Bottom to top
            for (var y = this.gameState.rowCount - 1; y >= 0; y--) {
                if (this.fields[y][column] === 0) {
                    this.fields[y][column] = this.player;
                    break;
                }
            }
            this.player = this.player === Winner.player1 ? Winner.player2 : Winner.player1;
            return true;
        } else {
            return false;
        }
    }

    scorePosition(row, column, delta_y, delta_x): number {
        var human_points = 0;
        var computer_points = 0;


        for (var i = 0; i < 4; i++) {
            if (this.fields[row][column] == 2) {
                human_points++;
            } else if (this.fields[row][column] == 1) {
                computer_points++;
            }

            row += delta_y;
            column += delta_x;
        }

        if (human_points == 4) {
            // Computer won (100000)
            return -this.gameState.score;
        } else if (computer_points == 4) {
            // Human won (-100000)
            return this.gameState.score;
        } else {
            // Return normal points
            return computer_points;
        }

    }


    score() {
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
        for (var row = 0; row < this.gameState.rowCount - 3; row++) {
            // Für jede Column überprüfen
            for (var column = 0; column < this.gameState.colCount; column++) {
                // Die Column bewerten und zu den Punkten hinzufügen
                var score = this.scorePosition(row, column, 1, 0);
                if (score == this.gameState.score) return this.gameState.score;
                if (score == -this.gameState.score) return -this.gameState.score;
                vertical_points += <number>score;
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
        for (var row = 0; row < this.gameState.rowCount; row++) {
            for (var column = 0; column < this.gameState.colCount - 3; column++) {
                var score = this.scorePosition(row, column, 0, 1);
                if (score == this.gameState.score) return this.gameState.score;
                if (score == -this.gameState.score) return -this.gameState.score;
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
        for (var row = 0; row < this.gameState.rowCount - 3; row++) {
            for (var column = 0; column < this.gameState.colCount - 3; column++) {
                var score = this.scorePosition(row, column, 1, 1);
                if (score == this.gameState.score) return this.gameState.score;
                if (score == -this.gameState.score) return -this.gameState.score;
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
        for (var row = 3; row < this.gameState.rowCount; row++) {
            for (var column = 0; column <= this.gameState.colCount - 4; column++) {
                var score = this.scorePosition(row, column, -1, +1);
                if (score == this.gameState.score) return this.gameState.score;
                if (score == -this.gameState.score) return -this.gameState.score;
                diagonal_points2 += score;
            }

        }

        points = horizontal_points + vertical_points + diagonal_points1 + diagonal_points2;
        return points;
    }


    isFinished(depth, score) {
        if (depth == 0 || score == this.gameState.score || score == -this.gameState.score || this.isFull()) {
            return true;
        }
        return false;
    }

    isFull() {
        for (var i = 0; i < this.gameState.colCount; i++) {
            if (this.fields[0][i] === 0) {
                return false;
            }
        }
        return true;
    }


    copy(): Board {
        var new_board = new Array();
        for (var i = 0; i < this.fields.length; i++) {
            new_board.push(this.fields[i].slice());
        }
        return new Board(new_board, this.player, this.gameState);
    }




} 