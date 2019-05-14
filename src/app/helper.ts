export const cssUrl = id => `url(#${id})`;
export const key = ({ row, col }) => `${row}${col}`;
export const range = num => [...Array(num).keys()];
export const RED = 'red';
export const BLACK = 'black';
export const GREEN = 'green';
export const EMPTY = 'empty';
export const OVER = 'over';
export const PLAY = 'play';

export const min = num => Math.max(num - 3, 0);
export const max = (num, max) => Math.min(num + 3, max);
