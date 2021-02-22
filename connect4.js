"use strict";
class ComputerPlayer {
  constructor() {
    this.color = "blue";
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

  validateColors(colors) {
    for (let color of colors) {
      let style = new Option().style;
      style.color = color;
      if (
        style.color === "" ||
        style.color === "white" ||
        style.color === "transparent"
      ) {
        alert("Please enter valid colors.")
        return false;
      } else if (this.gameMode === "1" && style.color === this.p2.color) {
        alert(`You can't use ${this.p2.color} for single player.`);
        return false;
      }
    }
    return true;
  }

  startGame() {
    let select = document.getElementById("game-mode");
    this.gameMode = select.value;
    let colorInputs = [];

    if (this.gameMode === '1') {
      this.p2 = new ComputerPlayer();
    }

    for (let i = 1; i <= parseInt(this.gameMode); i++) {
      let color = document.getElementById(`player${i}`).value;
      this[`p${i}`] = new Player(color, i);
      colorInputs.push(color);
    }

    if (!this.validateColors(colorInputs)) return

    this.removeHtmlBoard();
    this.removeOverlay();
    this.makeBoard();
    this.makeHtmlBoard();
    this.inGame = true;
    this.currPlayer = this.p1;
    this.setCurrentColor();
    select.disabled = true;
    let currentDisplay = document.getElementById('current-player');
    currentDisplay.setAttribute('style', 'display: block');

  }

  setCurrentColor() {
    let currentPiece = document.getElementsByClassName("current-piece")[0];
    currentPiece.setAttribute(
      "style",
      `background-color: ${this.currPlayer.color}`
    );
  }

  removeHtmlBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";
  }

  removeOverlay() {
    const overlay = document.getElementById("overlay");
    const display = document.getElementById("winner-display-wrapper");
    overlay.setAttribute("style", "display: none");
    display.setAttribute("style", "display: none");
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
    let select = document.getElementById("game-mode");
    select.disabled = false;
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
    };

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const horiz = [
          [y, x],
          [y, x + 1],
          [y, x + 2],
          [y, x + 3],
        ];
        const vert = [
          [y, x],
          [y + 1, x],
          [y + 2, x],
          [y + 3, x],
        ];
        const diagDR = [
          [y, x],
          [y + 1, x + 1],
          [y + 2, x + 2],
          [y + 3, x + 3],
        ];
        const diagDL = [
          [y, x],
          [y + 1, x - 1],
          [y + 2, x - 2],
          [y + 3, x - 3],
        ];

        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }

  handleClick(evt) {
    if (!this.inGame) return;
    if (this.gameMode === '1' && this.currPlayer.number === 2) return;

    let x = +evt.target.id;
    this.moveAndUpdatePlayer(x);

    if (this.gameMode === "1" && this.currPlayer === this.p2) {
      setTimeout(() => this.playComputerMove(), 500);
    }
  }

  playComputerMove() {
    let x = Math.floor(Math.random() * this.width);
    this.moveAndUpdatePlayer(x);
  }

  moveAndUpdatePlayer(x) {
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

    if (this.gameMode === '1') {
      this.currPlayer = this.currPlayer.number === 1 ? this.p2 : this.p1;
    } else {
      this.currPlayer = this.currPlayer.number == this.gameMode ? this.p1 : this[`p${this.currPlayer.number + 1}`];
    }
    this.setCurrentColor();
  }
}

let game = new Game();
let mode = document.getElementById("game-mode");
mode.addEventListener("change", handleModeSelect);
let btn = document.getElementsByTagName("button")[0];
btn.addEventListener("click", () => game.startGame());

function handleModeSelect() {
  let mode = document.getElementById("game-mode").value;
  for (let i = 1; i <= parseInt(mode); i++) {
    let player = document.getElementById(`player${i}`);
    player.setAttribute('style', 'display: block');
  }
  for (let i = parseInt(mode) + 1; i <= 4; i++) {
    let player = document.getElementById(`player${i}`);
    player.setAttribute('style', 'display: none');
  }
}
