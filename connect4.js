"use strict";

const htmlBoard = document.getElementById("board");
const currentDisplay = document.getElementById('current-player');
const currentPiece = document.getElementById("current-piece");
const display = document.getElementById("winner-display-wrapper");
const overlay = document.getElementById("overlay");
const select = document.getElementById("game-mode");
const startBtn = document.getElementsByTagName("button")[0];
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

  /* Ensures that the user entered visible colors, and if single player, did not pick the same color as the computer. */
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
      } else if (this.numPlayers === "1" && style.color === this.p2.color) {
        alert(`You can't use ${this.p2.color} for single player.`);
        return false;
      }
    }
    return true;
  }

  //creates players and assigns colors (if valid), displays new game board and current player
  startGame() {
    this.numPlayers = select.value;
    let colorInputs = []; //colors that will be checked with the validator

    //create new players based on the numPlayers selected
    for (let i = 1; i <= parseInt(this.numPlayers); i++) {
      let color = document.getElementById(`player${i}`).value;
      this[`p${i}`] = new Player(color, i);
      colorInputs.push(color);
    }

    if (this.numPlayers === '1') {
      this.p2 = new ComputerPlayer();
    }
    this.currPlayer = this.p1;
    this.setCurrentColor();

    if (!this.validateColors(colorInputs)) return

    htmlBoard.innerHTML = "";
    this.removeOverlay();
    this.makeBoard();
    this.makeHtmlBoard();
    this.inGame = true;
    select.disabled = true;
    currentDisplay.setAttribute('style', 'display: block'); //display current player piece
  }

  //updates color of current player on the UI
  setCurrentColor() {
    currentPiece.setAttribute(
      "style",
      `background-color: ${this.currPlayer.color}`
    );
  }

  //removes overlay that displays the winner of the most recent game
  removeOverlay() {
    overlay.setAttribute("style", "display: none");
    display.setAttribute("style", "display: none");
  }

  //create a 2D array filled with null that has this.height "rows" and this.width "columns"
  makeBoard() {
    this.board = new Array(this.height)
      .fill(null)
      .map(() => new Array(this.width).fill(null));
  }

  //fills table with a top "control" row, and this.height # of rows all with this.width # of cells, all with unique ids 
  makeHtmlBoard() {
    let top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    top.setAttribute('style', "cursor: pointer")
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

  //looks for the first available empty cell in column x, starting at bottom row and moving up
  //if all spots are already full, return null
  findSpotForCol(x) {
    for (let y = this.board.length - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  //create new piece and assign its color, then append it to the selected div on the board
  placeInTable(y, x) {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.setAttribute("style", `background-color: ${this.currPlayer.color}`);
    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  //displays message in the overlay display div, switches inGame to false to prevent future handling of clicks
  endGame(msg) {
    overlay.setAttribute("style", "display: block");
    display.setAttribute("style", "display: block");
    display.childNodes[0].innerText = msg;
    this.inGame = false;
    select.disabled = false;
  }

  //iterates through every cell and assigns four possible orientations of four pieces that could win (horiz, vert, diagDR, diagDL)
  //then checks each orientation that the selected positions are within the bounds of the game
  //and that the divs contain the same colored pieces as the current player, indicating 
  //that the current player won the game
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

  //do not handle clicks if inGame=false, or if the current player is the computer player
  //otherwise make a move and update the player, if next player is the computer, delay, then call on 
  //the computer to move
  handleClick(evt) {
    if (!this.inGame) return;
    if (this.currPlayer instanceof ComputerPlayer) return;

    let x = +evt.target.id; //chosen column
    this.moveAndUpdatePlayer(x);

    if (this.currPlayer instanceof ComputerPlayer) {
      setTimeout(() => this.playComputerMove(), 500);
    }
  }

  //chose a random available column to place a piece
  playComputerMove() {
    let x = Math.floor(Math.random() * this.width);
    this.moveAndUpdatePlayer(x);
  }

  moveAndUpdatePlayer(x) {
    let y = this.findSpotForCol(x);
    //if there is no spot available, ignore move
    if (y === null) {
      return;
    }

    //update array and UI board positions with the current player's number/piece
    this.board[y][x] = this.currPlayer.number;
    this.placeInTable(y, x);

    //end game if player won
    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer.number} won!`);
    }

    //end game if players tied
    if (this.board.every((row) => row.every((col) => col !== null))) {
      return this.endGame("It's a Tie!");
    }

    //update current player
    if (this.numPlayers === '1') {
      this.currPlayer = this.currPlayer.number === 1 ? this.p2 : this.p1;
    } else {
      this.currPlayer = this.currPlayer.number == this.numPlayers ? this.p1 : this[`p${this.currPlayer.number + 1}`];
    }
    this.setCurrentColor();
  }
}

let game = new Game();
select.addEventListener("change", handleModeSelect);
startBtn.addEventListener("click", () => game.startGame());

//update visible form inputs when select menu changes
function handleModeSelect() {
  let mode = select.value;
  for (let i = 1; i <= parseInt(mode); i++) {
    let player = document.getElementById(`player${i}`);
    player.setAttribute('style', 'display: block');
  }
  for (let i = parseInt(mode) + 1; i <= 4; i++) {
    let player = document.getElementById(`player${i}`);
    player.setAttribute('style', 'display: none');
  }
}
