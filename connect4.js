"use strict";
/** Connect Four
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

class ComputerPlayer {
  constructor() {
    this.color = 'red';
    this.number = 2;
  }
}
class Player {
  constructor(color, num) {
    this.color = color;
    this.number = num;
  }
}

class Game {
  constructor(height = 6, width = 7) {
    this.height = height;
    this.width = width;
    this.inGame = true;
  }

  validateColors(...colors) {
    for(let color of colors) {
      let style = new Option().style;
      style.color = color;
      if(style.color === '' || style.color === 'white' || style.color === "transparent") return false;
    }
    return true;
  }

  startGame() {
    let color1 = document.getElementById('player1').value;
    let color2 = document.getElementById('player2').value;
    this.gameMode = document.getElementById('game-mode').value;
    if(!this.validateColors(color1, color2)) {
      alert("Please enter valid colors.");
      return;
    }
    
    this.makeBoard();
    this.inGame = true;
    const board = document.getElementById('board');
    const overlay = document.getElementById('overlay');
    const display = document.getElementById('winner-display-wrapper');
    overlay.setAttribute('style', 'display: none');
    display.setAttribute('style', 'display: none');
    board.innerHTML = '';
    this.makeHtmlBoard();

    if(this.gameMode === "multi") {
      this.p1 = new Player(color1, 1);
      this.p2 = new Player(color2, 2);
    } else {
      this.p1 = new Player(color1, 1);
      this.p2 = new ComputerPlayer();
    }

    this.currPlayer = this.p1;
    let currentPiece = document.getElementsByClassName('current-piece')[0];
    currentPiece.setAttribute('style', `background-color: ${this.currPlayer.color}`)
  }

  makeBoard() {
    this.board = new Array(this.height)
      .fill(null)
      .map(() => new Array(this.width).fill(null));
  }

  makeHtmlBoard() {
    let htmlBoard = document.getElementById("board");
    let top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    top.addEventListener("click", (e) => this.handleClick(e));
    for (let x = 0; x < this.width; x++) {
      let headCell = document.createElement("td");
      headCell.setAttribute("id", x);
      top.append(headCell);
    }
    htmlBoard.append(top);
    for (let y = 0; y < this.height; y++) {
      let row = document.createElement("tr");
      for (let x = 0; x < this.width; x++) {
        let cell = document.createElement("td");
        cell.setAttribute("id", `${y}-${x}`);
        row.append(cell);
      }
      htmlBoard.append(row);
    }
  }

  findSpotForCol(x) {
    for (let y = this.board.length - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  placeInTable(y, x) {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.setAttribute("style", `background-color: ${this.currPlayer.color}`);
    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  endGame(msg) {
    let overlay = document.getElementById("overlay");
    let display = document.getElementById("winner-display-wrapper");
    overlay.setAttribute("style", "display: block");
    display.setAttribute("style", "display: block");
    display.childNodes[0].innerText = msg;
    this.inGame = false;
  }

  resetGame() {
    resetHtmlBoard();
    makeBoard();
    let overlay = document.getElementById("overlay");
    let button = document.getElementsByTagName("button")[0];
    let display = document.getElementById("winner-display-wrapper");
    overlay.setAttribute("style", "display: none");
    button.setAttribute("style", "display: none");
    display.setAttribute("style", "display: none");
  }

  resetHtmlBoard() {
    let htmlBoard = document.getElementById("board");
    htmlBoard.innerHTML = '';
  }

  checkForWin() { 
    const _win = (cells) => {
      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer.number
      );
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {

        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }


  handleClick(evt) {

    if(!this.inGame) return; 

    let x = +evt.target.id;

    let y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    this.board[y][x] = this.currPlayer.number;
    this.placeInTable(y, x);

    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer.number} won!`);
    }

    if (this.board.every((row) => row.every((col) => col !== null))) {
      return this.endGame("It's a Tie!");
    }

    this.currPlayer = this.currPlayer.number === 1 ? this.p2 : this.p1;
    let currentPiece = document.getElementsByClassName('current-piece')[0];
    currentPiece.setAttribute('style', `background-color: ${this.currPlayer.color}`)

    if(!this.multiMode && this.currPlayer === this.p2) {
      setTimeout(() => this.playComputerMove(), 500);
    }
  }

  playComputerMove() {
    let x = Math.floor(Math.random() * (this.width));
    console.log(x);
    let y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    this.board[y][x] = this.currPlayer.number;
    this.placeInTable(y, x);

    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer.number} won!`);
    }

    if (this.board.every((row) => row.every((col) => col !== null))) {
      return this.endGame("It's a Tie!");
    }

    this.currPlayer = this.currPlayer.number === 1 ? this.p2 : this.p1;
    let currentPiece = document.getElementsByClassName('current-piece')[0];
    currentPiece.setAttribute('style', `background-color: ${this.currPlayer.color}`)
  }
}

let game = new Game();
let btn = document.getElementsByTagName("button")[0];
btn.addEventListener("click", () => game.startGame());
