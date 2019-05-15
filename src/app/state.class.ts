
export class State {
    action: any;
    board: Array<Array<any>>;
    score: number;
    depth: number;
    constructor(action, board, score, depth) {
        this.action = action;
        this.board = board;
        this.score = score;
        this.depth = depth;
    }
}