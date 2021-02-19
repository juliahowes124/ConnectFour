"use strict";

/** Connect Four
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
let board; // array of rows, each row is array of cells  (board[y][x])

function makeBoard() {
  board = new Array(HEIGHT).fill(null).map(() => new Array(WIDTH).fill(null));
}

/** makeHtmlBoard: make HTML table and row of column tops. */
function makeHtmlBoard() {
  let htmlBoard = document.getElementById('board');

  // creates top "control" row of the game board
  let top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  // dynamically fills top "control" row with cells based on board's WIDTH
  for (let x = 0; x < WIDTH; x++) {
    let headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  htmlBoard.append(top);

  // dynamically creates the main part of html board using HEIGHT AND WIDTH for rows and columns
  for (let y = 0; y < HEIGHT; y++) {
    let row = document.createElement('tr');
    for (let x = 0; x < WIDTH; x++) {
      let cell = document.createElement('td');
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}

/** findSpotForCol: given column x, return top empty y (null if filled) */
function findSpotForCol(x) {
  for(let y=board.length-1; y >= 0; y--) {
    if(!board[y][x]) {
      return y;
    } 
  }
  return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */
function placeInTable(y, x) {
  let newPiece = document.createElement('div');
  let selectedCell = document.getElementById(`${y}-${x}`);
  newPiece.setAttribute('class', currPlayer === 1 ? 'piece red': 'piece blue');
  selectedCell.appendChild(newPiece);
}

/** endGame: announce game end */
function endGame(msg) {
  alert(msg);
}

/** handleClick: handle click of column top to play piece */
function handleClick(evt) {
  let x = +evt.target.id; // get x from ID of clicked cell

  // get next spot in column (if none, ignore click)
  let y = findSpotForCol(x); 
  if (y === null) {
    return;
  }

  // place piece in board and add to HTML table
  board[y][x] = currPlayer;
  placeInTable(y, x);

  // check for win
  if (checkForWin()) {
    return endGame(`Player ${currPlayer} won!`);
  }

  // check for tie
  if(board.every(row => row.every(col => col !== null))) {
    return endGame("It's a Tie!");
  }

  // switch players
  currPlayer = (currPlayer === 1) ? 2 : 1;
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */
function checkForWin() {
  /** _win:
   * takes input array of 4 cell coordinates [ [y, x], [y, x], [y, x], [y, x] ]
   * returns true if all are legal coordinates for a cell & all cells match
   * currPlayer */

  function _win(cells) {
    //check if all cell coordinates are within the board's boundaries
    let legalLocations = cells.every(([y,x]) => y>=0 && y<HEIGHT && x>=0 && x<WIDTH);
    if(!legalLocations) return false;

    let sameColor = cells.every(([y,x]) => board[y][x] === currPlayer);
    return sameColor;
  }

  // using HEIGHT and WIDTH, generate "check list" of coordinates
  // for 4 cells (starting here) for each of the different
  // ways to win: horizontal, vertical, diagonalDR, diagonalDL
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      let vert = [[y,x], [y+1, x], [y+2, x], [y+3, x]];
      let diagDL = [[y,x], [y-1, x-1], [y-2, x-2], [y-3, x-3]];
      let diagDR = [[y,x], [y-1, x+1], [y-2, x+2], [y-3, x+3]];

      // find winner (only checking each win-possibility as needed)
      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

makeBoard();
makeHtmlBoard();

function resetGame() {
  resetHtmlBoard();
  makeBoard();
}

function resetHtmlBoard() {
  let cells = document.getElementsByTagName('td');
  for(let cell of cells) {
    let child = cell.getElementsByClassName('piece')[0]
    if(child) {
      cell.removeChild(child);
    }
  }
}


