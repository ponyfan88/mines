
const SIZE = 5;
const CHANCE = 10;

let mines = [];
let shownBoard = Array.from(Array(SIZE), _ => Array(SIZE).fill(false));
let flagged = Array.from(Array(SIZE), _ => Array(SIZE).fill(false));

let gameEnded = false;

let checkedMines = Array.from(Array(SIZE), _ => Array(SIZE).fill(false));

document.getElementById("start-button").addEventListener("click", function() {
    gameEnded = false;
    
    checkedMines = Array.from(Array(SIZE), _ => Array(SIZE).fill(false));
    
    shownBoard = Array.from(Array(SIZE), _ => Array(SIZE).fill(false));
    flagged = Array.from(Array(SIZE), _ => Array(SIZE).fill(false));

    mines = [...Array(SIZE)].map(e => Array(SIZE));
    
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            mines[y][x] = mine();
        }
    }

    mines[0][0] = false;

    board();
})


function mine() {
    return Math.random() * 100 <= CHANCE;
}

let myMines = [...Array(SIZE)].map(e => Array(SIZE));

let minesweeperContainer = document.getElementById("minesweeper-container");

function board() {
    minesweeperContainer.innerHTML = "";

    for (let y = 0; y < SIZE; y++) {
        let myColumn = document.createElement("div");
        minesweeperContainer.appendChild(myColumn);
        
        for (let x = 0; x < SIZE; x++) {
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
        myMines[y][x].style.backgroundColor = "red"
        revealAll(true);
        endGame();
        return;
    }

    myMines[y][x].style.backgroundColor = "green"
    
    if (mineCount == 0) {
        revealChain(0, x, y);
    }
    else {
        myMines[y][x].innerText = mineCount;
    }

    checkForWin();
}

function reveal(x, y) {
    shownBoard[y][x] = true;

    let mineCount = checkMines(x,y);

    myMines[y][x].style.backgroundColor = "green"

    if (mineCount != 0) {
        myMines[y][x].innerText = mineCount;
    }
}

function flagMine(x, y) {
    window.event.preventDefault();

    if (gameEnded) {
        return;
    }
    
    if (shownBoard[y][x]) {
        if (flagged[y][x]) {
            myMines[y][x].style.backgroundColor = "green";
        }
        else {
            myMines[y][x].style.backgroundColor = "blue";
        }

        flagged[y][x] = !flagged[y][x];
    }
    else {
        if (flagged[y][x]) {
            myMines[y][x].style.backgroundColor = "black";
        }
        else {
            myMines[y][x].style.backgroundColor = "blue";
        }

        flagged[y][x] = !flagged[y][x];
    }

    checkForWin();

    

    //alert(x + ", " + y + " flag");

    return false;
}

function checkMines(_x, _y) {
    let increaseX = 0;
    let increaseY = 0;
    let decreaseX = 0;
    let decreaseY = 0;
    
    if (_y + 1 < SIZE) {
        increaseY = 1;
    }

    if (_x + 1 < SIZE) {
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
    
    if (count <= SIZE ** 2 && !checkedMines[_y][_x]) {
        console.log(count + " checking " + _x + ", " + _y);
        console.log(_x + ", " + _y + " = " + checkedMines[_y][_x])
        count++;

        let increaseX = 0;
        let increaseY = 0;
        let decreaseX = 0;
        let decreaseY = 0;
        
        if (_y + 1 < SIZE) {
            increaseY = 1;
        }

        if (_x + 1 < SIZE) {
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

                    checkedMines[_y][_x] = true;

                    if (checkMines(x, y) == 0) {
                        revealChain(count, x, y);
                    }
                }
            }
        }
    }
    else {
        console.log("halp")
    }
}

function endGame() {
    gameEnded = true;
    alert("ended")
}

function checkForWin() {
    if (mines.length == flagged.length) {
        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
                if (mines[y][x] != flagged[y][x]) {
                    return false;
                }
            }
        }
    }

    alert("you win!")
    gameEnded = true;

    revealAll(false);

    return true;
}

function revealAll(dead = false) {
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (!mines[y][x]) {
                reveal(x,y);
            } else if (dead) {
                myMines[y][x].style.backgroundColor = "red"
            }
        }
    }
}
