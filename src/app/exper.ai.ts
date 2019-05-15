// getScore({ board, rowCount, colCount, winLength }) {
//     var player1Lines = [];
//     var player2Lines = [];
//     var winSize = winLength - 1;
//     for (var i = 0; i < winLength; i++) {
//       player1Lines[i] = 0;
//       player2Lines[i] = 0;
//     }


//     // Check each tile
//     for (var r = 0; r < rowCount; r++) {
//       for (var c = 0; c < colCount; c++) {

//         /**
//         * These are the lines that are check for each tile. They represent how many
//         * pieces each player has in the line, and whether or not the line is valid.
//         * Format: [player1pieces, player2pieces, valid]
//         */
//         var lineRight: [number, number, boolean] = [0, 0, true];
//         var lineDown: [number, number, boolean] = [0, 0, true];
//         var lineDownLeft: [number, number, boolean] = [0, 0, true];
//         var lineDownRight: [number, number, boolean] = [0, 0, true];


//         // Get line segments for each player
//         for (var w = 0; w < winLength; w++) {

//           // Check right
//           if (c + winSize < colCount) {
//             if (board[r][c + w] == Winner.player1) {
//               (<any>lineRight[0])++;
//             }

//             if (board[r][c + w] == Winner.player2) {
//               (<any>lineRight[1])++;
//             }
//           } else {
//             lineRight[2] = false;
//           }


//           // Check down and diagonals
//           if (r + winSize < rowCount) {

//             // Down
//             if (board[r + w][c] == Winner.player1) {
//               (<any>lineDown[0])++;
//             }

//             if (board[r + w][c] == Winner.player2) {
//               (<any>lineDown[1])++;
//             }


//             // Down left
//             if (c - winSize >= 0) {
//               if (board[r + w][c - w] == Winner.player1) {
//                 (<any>lineDownLeft[0])++;
//               }

//               if (board[r + w][c - w] == Winner.player2) {
//                 (<any>lineDownLeft[1])++;
//               }
//             } else {
//               lineDownLeft[2] = false;
//             }


//             // Down right
//             if (c + winSize < colCount) {
//               if (board[r + w][c + w] == Winner.player1) {
//                 (<any>lineDownRight[0])++;
//               }

//               if (board[r + w][c + w] == Winner.player2) {
//                 (<any>lineDownRight[1])++;
//               }
//             } else {
//               lineDownRight[2] = false;
//             }
//           } else {
//             lineDown[2] = false;
//             lineDownLeft[2] = false;
//             lineDownRight[2] = false;
//           }
//         }



//         // Update player's line counts
//         const updateLines = (line) => {

//           // Make sure line is valid
//           if (line[0] > 0 && line[1] > 0) {
//             line[2] = false;
//           }

//           // Update line counts
//           if (line[2] == true) {
//             if (line[0] > 0) {
//               player1Lines[line[0] - 1]++;
//             }
//             if (line[1] > 0) {
//               player2Lines[line[1] - 1]++;
//             }
//           }
//         }
//         updateLines(lineRight);
//         updateLines(lineDown);
//         updateLines(lineDownLeft);
//         updateLines(lineDownRight);
//       }
//     }


//     // Set score to infinity if any winning lines are found
//     if (player1Lines[player1Lines.length - 1] > 0) {
//       return Infinity;
//     }
//     if (player2Lines[player2Lines.length - 1] > 0) {
//       return -Infinity;
//     }


//     // Sum scores for each player
//     var player1Score = 0;
//     var player2Score = 0;

//     for (var i = 0; i < player1Lines.length - 1; i++) {
//       player1Score += Math.pow(10 * i, i) * player1Lines[i];
//       player2Score -= Math.pow(10 * i, i) * player2Lines[i];
//     }

//     return player1Score + player2Score;
//   }



/******* */


// alphabeta(state: State, depth, alpha, beta, maxplayer) {

//     // End search if we've reached maximum depth or the game is over
//     if (depth == 3 || this.winner) {
//       let getScoreInput = { board: this.board, rowCount: this.rowCount, gScore: this.score, colCount: this.colCount }
//       // console.log('inside if depth: ', this.getScore(getScoreInput));
//       return new State(state.action, state.board, this.getScore(getScoreInput), depth);
//     }


//     /**
//      * Max player is playing. This means that maxplayer will look at his possible moves and return the one
//      * that has the largest score.
//      */
//     if (maxplayer) {

//       // The highest score among this state's children and its associated action
//       var highestScore = -Infinity;
//       var deepestDepth = 0;
//       var bestAction = -1;


//       /**
//        * Generate successor states of this state. We do this by looking at each possible action
//        * that maxplayer can perform while in this current state. Actions are represented by the
//        * current value of i. For example, when i = 4, this represents the action of maxplayer dropping
//        * his piece in the 5th column. We do this for each column and only examine the successor state
//        * if it is valid.
//        */
//       for (var i = 0; i < this.colCount; i++) {

//         // Only check valid actions
//         if (this.isValidMove(state.board, i)) {
//           this.iterations++;


//           // Get resulting state from performing this action
//           var newBoard = this.copyBoard(state.board);
//           let placeState = this.placePiece(newBoard, i, 1);
//           newBoard = placeState ? placeState : newBoard;

//           var nextState = this.alphabeta(new State(i, newBoard, 0, depth + 1), depth + 1, alpha, beta, false);


//           /**
//           * Update the largest score found among this state's children so far, as well as
//           * update the action that was taken to get that score. If 2 states have the same score,
//           * break the ties by choosing the state with a deeper depth
//           */
//           var score = nextState.score;//board.getScore(1);
//           if (bestAction == -1 || score >= highestScore) {

//             // Break ties by choosing the deeper state
//             if (score == highestScore) {
//               this.sameScore++;
//               //console.log("Same score=" + score);
//               //console.log("nextstate.depth=" + nextState.depth + ",deepestDepth=" + deepestDepth);
//               if (nextState.depth > deepestDepth) {
//                 highestScore = score;
//                 bestAction = i;
//                 deepestDepth = nextState.depth;
//               }
//             } else {
//               highestScore = score;
//               bestAction = i;
//             }
//           }


//           // Save the largest score found among all states in this entire branch so far
//           alpha = Math.max(alpha, highestScore);


//           /**
//           * We can ignore the rest of the successor states in this branch because they will result in worse scores
//           * than if we choose one of the actions in a previous branch
//           */
//           if (beta <= alpha) {
//             console.log('highestScore (beta <= alpha)', highestScore);
//             return new State(bestAction, state.board, highestScore, depth);
//           }
//         }
//       }

//       console.log('highestScore ===>', highestScore);
//       return new State(bestAction, state.board, highestScore, depth);
//     }


//     /**
//     * Min player is playing. This means that minplayer will look at his possible moves and return the one
//     * that has the smallest score.
//     */
//     if (!maxplayer) {

//       // The smallest score among this state's children and its associated action
//       var smallestScore = Infinity;
//       var deepestDepth = 0;
//       var bestAction = -1;


//       /**
//       * Generate successor states of this state. We do this by looking at each possible action
//       * that minplayer can perform while in this current state. Actions are represented by the
//       * current value of i. For example, when i = 4, this represents the action of minplayer dropping
//       * his piece in the 5th column. We do this for each column and only examine the successor state
//       * if it is valid.
//       */
//       for (var i = 0; i < this.colCount; i++) {

//         // Only check valid actions
//         if (this.isValidMove(state.board, i)) {
//           this.iterations++;


//           // Get resulting state from performing this action
//           var newBoard = this.copyBoard(state.board);
//           let placeState = this.placePiece(newBoard, i, 2);
//           newBoard = placeState ? placeState : newBoard;
//           var nextState = this.alphabeta(new State(i, newBoard, 0, depth + 1), depth + 1, alpha, beta, true);



//           /**
//           * Update the smallest score found among this state's children so far, as well as
//           * update the action that was taken to get that score
//           */
//           var score = nextState.score;//board.getScore(2);
//           if (bestAction == -1 || score <= smallestScore) {

//             // Break ties by choosing the deeper state
//             if (score == smallestScore) {
//               this.sameScore++;
//               //console.log("Same score=" + score);
//               //console.log("nextstate.depth=" + nextState.depth + ",deepestDepth=" + deepestDepth);
//               if (nextState.depth > deepestDepth) {
//                 smallestScore = score;
//                 bestAction = i;
//                 deepestDepth = nextState.depth;
//               }
//             } else {
//               smallestScore = score;
//               bestAction = i;
//             }
//           }


//           // Save the smallest score found among all states in this entire branch so far
//           beta = Math.min(beta, smallestScore);


//           /**
//           * We can ignore the rest of the successor states in this branch because they will result in worse scores
//           * than if we choose one of the actions in a previous branch
//           */
//           if (beta <= alpha) {
//             return new State(bestAction, state.board, smallestScore, depth);
//           }
//         }
//       }

//       return new State(bestAction, state.board, smallestScore, depth);
//     }
//   }