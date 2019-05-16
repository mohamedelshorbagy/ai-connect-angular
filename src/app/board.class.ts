import { Winner } from './helper'
/**
 * @interface IGame
 * @description can be used in IGame for gameState in the Board Class
 */
export interface IGame {
    rowCount: number,
    colCount: number,
    score: number
}
/**
 * @class Board
 * @classdesc for make a resuable Board so it can be used in many places
 */
export class Board {
    fields: Array<Array<any>>;
    player: number;
    gameState: IGame;
    constructor(board, player, gameState: IGame) {
        this.fields = board;
        this.player = player;
        this.gameState = gameState;
    }
    /**
     * @function getAvailableRow
     * @description get available row to be used in placement of AI
     * @param {Number} column 
     */
    getAvailableRow(column: number) {
        for (var i = this.gameState.rowCount - 1; i >= 0; i--) {
            if (this.fields[i][column] === 0) {
                return i;
            }
        }
        return -1;
    }

    /**
     * @function placePiece
     * @description update the fields of the Board by changing it's location
     * @param {Number} column 
     */
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

    /**
     * @function scorePosition
     * @description it's the utility function for the main Utility Function to calculate the score for specific position [row, col] 
     * @param {Number} row 
     * @param {Number} column 
     * @param {Number} delta_y 
     * @param {Number} delta_x
     * @returns {Number} 
     */
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
            return -this.gameState.score;
        } else if (computer_points == 4) {
            return this.gameState.score;
        } else {
            return computer_points;
        }

    }


    /**
     * @function score()
     * @description Consider as the Utility Function to calculate the score of the Board
     * @returns {Number}
     */
    score(): number {
        var points = 0;

        var vertical_points = 0;
        var horizontal_points = 0;
        var diagonal_points_left_bottom = 0;
        var diagonal_points_right_bottom = 0;


        // Vertical points
        // Example :
        //  0  1  2  3  4  5  6
        //                      0
        //                      1
        //  x                   2
        //  x                   3
        //  x                   4
        //  x                   5
        // So we have to subtract (3) from the height (rows)
        for (var row = 0; row < this.gameState.rowCount - 3; row++) {
            for (var column = 0; column < this.gameState.colCount; column++) {
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
        //                      0
        //                      1
        //                      2
        //                      3
        //                      4
        //  x  x  x  x          5
        // So we have to subtract (3) from the width (cols)

        for (var row = 0; row < this.gameState.rowCount; row++) {
            for (var column = 0; column < this.gameState.colCount - 3; column++) {
                var score = this.scorePosition(row, column, 0, 1);
                if (score == this.gameState.score) return this.gameState.score;
                if (score == -this.gameState.score) return -this.gameState.score;
                horizontal_points += score;
            }
        }



        // Diagonal points Left Bottom
        //
        // Possible situation
        //  0  1  2  3  4  5  6
        //  x                   0
        //     x                1
        //        x             2
        //           x          3
        //                      4
        //                      5
        // we have to subtract 3 from height (rows)
        for (var row = 0; row < this.gameState.rowCount - 3; row++) {
            for (var column = 0; column < this.gameState.colCount - 3; column++) {
                var score = this.scorePosition(row, column, 1, 1);
                if (score == this.gameState.score) return this.gameState.score;
                if (score == -this.gameState.score) return -this.gameState.score;
                diagonal_points_left_bottom += score;
            }
        }

        // Diagonal points 2 Right Bottom
        //
        // Possible situation
        //  0  1  2  3  4  5  6
        //                      0
        //                      1
        //           x          2
        //        x             3
        //     x                4
        //  x                   5
        for (var row = 3; row < this.gameState.rowCount; row++) {
            for (var column = 0; column <= this.gameState.colCount - 4; column++) {
                var score = this.scorePosition(row, column, -1, +1);
                if (score == this.gameState.score) return this.gameState.score;
                if (score == -this.gameState.score) return -this.gameState.score;
                diagonal_points_right_bottom += score;
            }

        }
        // Calculate All scores from all situations [Vertical, Horizontal, Diagonal_Left_Bottom, diagonal_Right_Bottom]
        points = horizontal_points + vertical_points + diagonal_points_left_bottom + diagonal_points_right_bottom;
        return points;
    }

    /**
     * @function isFinished(depth, score)
     * @description checks if the Board is finished so I sholud stop recursion
     * @param {Number} depth 
     * @param {Number} score
     * @returns {Boolean} 
     */
    isFinished(depth, score) {
        if (depth == 0 || score == this.gameState.score || score == -this.gameState.score || this.isFull()) {
            return true;
        }
        return false;
    }

    /**
     * @function isFull()
     * @description checks if the Board is Full or not
     * @returns {Boolean}
     */
    isFull() {
        for (var i = 0; i < this.gameState.colCount; i++) {
            if (this.fields[0][i] === 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * @function copy()
     * @description Make a Clone From Board [ Useful in recursive calls of new board patterns ]
     * @return {VoidFunction}
     */
    copy(): Board {
        var new_board = new Array();
        for (var i = 0; i < this.fields.length; i++) {
            new_board.push(this.fields[i].slice());
        }
        return new Board(new_board, this.player, this.gameState);
    }




} 