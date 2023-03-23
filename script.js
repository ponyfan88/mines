let size = 10;
let chance = 10;

const REVEALED_SAFE_COLOR = "#1e2323";
const REVEALED_MINE_COLOR = "#db1414";
const FLAGGED_TILE_COLOR = "#143edb";
const HIDDEN_TILE_COLOR = "#e1dcdc";

const BADFLAGS_TEXT = "incorrect/missing flags: "

document.getElementById("size-input").value = size;
document.getElementById("chance-input").value = chance;

let r = document.querySelector(':root');

let mines = [];
let shownBoard = Array.from(Array(size), _ => Array(size).fill(false));
let flagged = Array.from(Array(size), _ => Array(size).fill(false));

let gameEnded = false;

let checkedMines = Array.from(Array(size), _ => Array(size).fill(false));

document.getElementById("start-button").addEventListener("click", function() {
    start();
})

function start() {
    size = parseInt(document.getElementById("size-input").value);
    chance = parseInt(document.getElementById("chance-input").value);

    r.style.setProperty('--size', size.toString());
    
    gameEnded = false;
    
    checkedMines = Array.from(Array(size), _ => Array(size).fill(false));
    
    shownBoard = Array.from(Array(size), _ => Array(size).fill(false));
    flagged = Array.from(Array(size), _ => Array(size).fill(false));

    mines = [...Array(size)].map(e => Array(size));
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            mines[y][x] = (Math.random() * 100 <= chance);
        }
    }

    mines[0][0] = false; // top left is always clickable

    board();

    document.getElementById("bad-flags").innerText = BADFLAGS_TEXT + checkRemainingMines().toString();
}

let myMines = [...Array(size)].map(e => Array(size));

let minesweeperContainer = document.getElementById("minesweeper-container");

function board() {
    myMines = [...Array(size)].map(e => Array(size));

    minesweeperContainer.innerHTML = "";

    for (let y = 0; y < size; y++) {
        let myColumn = document.createElement("div");
        minesweeperContainer.appendChild(myColumn);
        
        for (let x = 0; x < size; x++) {
            let myMine = document.createElement("div");

            myMine.addEventListener("click", function() {
                clickOnMine(x, y);
            });
            
            myMine.addEventListener("contextmenu", function() {
                flagMine(x, y);
            });

            myMine.classList.add("mineButton");

            myMines[y][x] = myMine;

            myColumn.appendChild(myMine);
        }
    }
}

function clickOnMine(x,y) {
    if (gameEnded) {
        return;
    }

    let mineCount = checkMines(x,y);

    if (mines[y][x]) {
        myMines[y][x].style.backgroundColor = REVEALED_MINE_COLOR;
        myMines[y][x].innerText = "✱";
        revealAll(true);
        gameEnded = true;
        document.getElementById("losses").innerText += "☠"; //add a skull for every loss
        return;
    }

    flagged[y][x] = false;

    myMines[y][x].style.backgroundColor = REVEALED_SAFE_COLOR;
    if (mineCount == 0) {
        revealChain(0, x, y);
        myMines[y][x].innerText = "";
    }
    else {
        myMines[y][x].innerText = mineCount;
        shownBoard[y][x] = true;
    }

    checkForWin();
}

function reveal(x, y) {
    shownBoard[y][x] = true;
    flagged[y][x] = false;

    let mineCount = checkMines(x,y);

    myMines[y][x].style.backgroundColor = REVEALED_SAFE_COLOR;

    if (mineCount != 0) {
        myMines[y][x].innerText = mineCount;
    }
    else {
        myMines[y][x].innerText = "";
    }
}

function flagMine(x, y) {
    window.event.preventDefault();

    if (gameEnded) {
        return;
    }
    
    if (shownBoard[y][x]) {
        if (flagged[y][x]) {
            myMines[y][x].style.backgroundColor = REVEALED_SAFE_COLOR;
            let mineCount = checkMines(x, y)
            if (mineCount > 0) {
                myMines[y][x].innerText = mineCount;
            }
            else {
                myMines[y][x].innerText = "";
            }
        }
        else {
            myMines[y][x].style.backgroundColor = FLAGGED_TILE_COLOR;
            myMines[y][x].innerText = "⚑";
        }
    }
    else {
        if (flagged[y][x]) {
            myMines[y][x].style.backgroundColor = HIDDEN_TILE_COLOR;
            myMines[y][x].innerText = "";
        }
        else {
            myMines[y][x].style.backgroundColor = FLAGGED_TILE_COLOR;
            myMines[y][x].innerText = "⚑";
        }
    }

    flagged[y][x] = !flagged[y][x];

    checkForWin();

    document.getElementById("bad-flags").innerText = BADFLAGS_TEXT + checkRemainingMines().toString();

    return false;
}

function checkMines(_x, _y) {
    let increaseX = 0;
    let increaseY = 0;
    let decreaseX = 0;
    let decreaseY = 0;
    
    if (_y + 1 < size) {
        increaseY = 1;
    }

    if (_x + 1 < size) {
        increaseX = 1;
    }

    if (_y - 1 >= 0) {
        decreaseY = 1;
    }

    if (_x - 1 >= 0) {
        decreaseX = 1;
    }

    let mineCount = 0;

    for (let y = _y - decreaseY; y <= _y + increaseY; y++) {
        for (let x = _x - decreaseX; x <= _x + increaseX; x++) {
            if (mines[y][x]) {
                mineCount++;
            }
        }
    }

    return mineCount;
}

function revealChain(count, _x, _y) {
    if (checkedMines[_y][_x] == true) {
        return;
    }
    
    if (count <= size ** 2 && !checkedMines[_y][_x]) {
        count++;

        let increaseX = 0;
        let increaseY = 0;
        let decreaseX = 0;
        let decreaseY = 0;
        
        if (_y + 1 < size) {
            increaseY = 1;
        }

        if (_x + 1 < size) {
            increaseX = 1;
        }

        if (_y - 1 >= 0) {
            decreaseY = 1;
        }

        if (_x - 1 >= 0) {
            decreaseX = 1;
        }

        for (let y = _y - decreaseY; y <= _y + increaseY; y++) {
            for (let x = _x - decreaseX; x <= _x + increaseX; x++) {
                if (!mines[y][x] && !checkedMines[y][x]) {

                    reveal(x, y);

                    shownBoard[y][x] = true;

                    checkedMines[_y][_x] = true;

                    if (checkMines(x, y) == 0) {
                        revealChain(count, x, y);
                    }
                }
            }
        }
    }

    document.getElementById("bad-flags").innerText = BADFLAGS_TEXT + checkRemainingMines().toString();
}

function checkForWin() {
    if (mines.length == flagged.length) {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (mines[y][x] != flagged[y][x]) {
                    return false;
                }
            }
        }
    }

    gameEnded = true;

    revealAll(false);

    document.getElementById("wins").innerText += "🏆"; // add a trophy to the text below start for every win

    return true;
}

function revealAll(dead = false) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!mines[y][x]) {
                reveal(x,y);
            } else if (dead) {
                myMines[y][x].style.backgroundColor = REVEALED_MINE_COLOR;
                myMines[y][x].innerText = "✱";
            }
        }
    }
}

function checkRemainingMines() {
    let badFlags = 0;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (mines[y][x] != flagged[y][x]) {
                badFlags++;
            }
        }
    }

    return badFlags;
}

start();