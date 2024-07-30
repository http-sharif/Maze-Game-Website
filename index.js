let playing = false;
const breakableWallProbability = 0.1;
const vinesProbability = 0.1;
let vinesCount = 10;
let breakableWallCount = 10;
let rows = 21;
let cols = 21;
let grid = Array.from({ length: rows }, () => Array(cols).fill('wall'));
let initialGrid;
const mazeContainer = document.getElementById('maze');
const moveCounter = document.getElementById('moves-counter');
const timer = document.getElementById('timer');
const timevalue = document.getElementById("time-value");
const timeoutput = document.getElementById("time-output");
const maxMazeSize = 600;
let timeLeft = 60;
let timerInterval;
let timerStarted = false;
let numOfMoves = 0;
let cellSize;

function startTimer() {
    timer.textContent = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        timer.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playing = false;
            timerStarted = false;
            loseSignal();
        }
    }, 1000);
}

function createMaze() {
    cellSize = Math.min(20,maxMazeSize/(rows-1));
    mazeContainer.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    mazeContainer.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    playing = true;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function generateMaze(row, col) {
        const directions = shuffle([
            [-2, 0], [2, 0], [0, -2], [0, 2]
        ]);

        grid[row][col] = 'path';

        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;

            if (newRow > 0 && newRow < rows && newCol > 0 && newCol < cols && grid[newRow][newCol] === 'wall') {
                grid[newRow - dx / 2][newCol - dy / 2] = 'path';
                generateMaze(newRow, newCol);
            }
        }
    }

    function addBreakableWalls() {
        for (let row = 1; row < rows; row += 2) {
            for (let col = 1; col < cols; col += 2) {
                if (grid[row][col] === 'path' && Math.random() < breakableWallProbability) {
                    grid[row][col] = 'breakable-wall';
                    breakableWallCount--;
                }
                if (breakableWallCount == 0) {
                    return;
                }
            }
        }
    }

    function addVines() {
        for (let row = 1; row < rows; row += 2) {
            for (let col = 1; col < cols; col += 2) {
                if (grid[row][col] === 'path' && Math.random() < vinesProbability) {
                    grid[row][col] = 'vines';
                    vinesCount--;
                }
                if (vinesCount == 0) {
                    return;
                }
            }
        }
    }

    function placeBorder() {
        for (let i = 0; i < rows; i++) {
            grid[i][0] = 'border';
            grid[0][i] = 'border';
            grid[i][rows - 1] = 'border';
            grid[rows - 1][i] = 'border';
        }
    }

    generateMaze(1, 1);
    addBreakableWalls();
    addVines();
    placeBorder();
    grid[1][1] = 'characterright';
    grid[rows - 2][cols - 2] = 'exit';
    initialGrid = structuredClone(grid);
    renderMaze();
}

function renderMaze() {
    mazeContainer.innerHTML = '';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.classList.add('cell');
            if (grid[row][col] === 'vinesAnimated' || grid[row][col] === 'wallAnimated') {
                playing = false;
                setTimeout(() => {
                    grid[row][col] = 'path';
                    playing = true;
                }, 1000);
            }
            cell.classList.add(grid[row][col]);
            mazeContainer.appendChild(cell);
        }
    }
}

let i = 1, j = 1;

function handleButtonClick(text) {
    switch (text) {
        case 'UP':
            if (grid[i - 1][j] == 'path') {
                let temp = grid[i][j];
                grid[i][j] = 'path';
                grid[i - 1][j] = temp;
                i -= 1;
            }
            else {
                numOfMoves--;
            }
            break;
        case 'DOWN':
            if (grid[i + 1][j] == 'path' || grid[i + 1][j] == 'exit') {
                let temp = grid[i][j];
                grid[i][j] = 'path';
                grid[i + 1][j] = temp;
                i += 1;
            }
            else {
                numOfMoves--;
            }
            if (i == rows - 2 && j == cols - 2) {
                playing = false;
                if(timeLeft == 0){
                    winSignal('2');
                }
                else{
                    winSignal('1');
                }
            }
            break;
        case 'LEFT':
            grid[i][j] = 'characterleft';
            if (grid[i][j - 1] == 'path') {
                const temp = grid[i][j];
                grid[i][j] = 'path';
                grid[i][j - 1] = temp;
                j -= 1;
            }
            else {
                numOfMoves--;
            }
            break;
        case 'RIGHT':
            grid[i][j] = 'characterright';
            if (grid[i][j + 1] == 'path' || grid[i][j + 1] == 'exit') {
                const temp = grid[i][j];
                grid[i][j] = 'path';
                grid[i][j + 1] = temp;
                j += 1;
            }
            else {
                numOfMoves--;
            }
            if (i == rows - 2 && j == cols - 2) {
                playing = false;
                if(timeLeft == 0){
                    winSignal('2');
                }
                else{
                    winSignal('1');
                }
            }
            break;
        case 'SLASH':
            let c = 0;
            if (grid[i - 1][j] == 'vines') {
                grid[i - 1][j] = 'vinesAnimated';
                c++;
            }
            if (grid[i + 1][j] == 'vines') {
                grid[i + 1][j] = 'vinesAnimated';
                c++;
            }
            if (grid[i][j - 1] == 'vines') {
                grid[i][j - 1] = 'vinesAnimated';
                c++;
            }
            if (grid[i][j + 1] == 'vines') {
                grid[i][j + 1] = 'vinesAnimated';
                c++;
            }
            if (c == 0) numOfMoves--;
            break;
        case 'BREAK':
            let d = 0;
            if (grid[i - 1][j] == 'breakable-wall') {
                grid[i - 1][j] = 'wallAnimated';
                d++;
            }
            if (grid[i + 1][j] == 'breakable-wall') {
                grid[i + 1][j] = 'wallAnimated';
                d++;
            }
            if (grid[i][j - 1] == 'breakable-wall') {
                grid[i][j - 1] = 'wallAnimated';
                d++;
            }
            if (grid[i][j + 1] == 'breakable-wall') {
                grid[i][j + 1] = 'wallAnimated';
                d++;
            }
            if (d == 0) numOfMoves--;
            break;
        default:
            numOfMoves--;
            break;
    }
    numOfMoves++;
    moveCounter.textContent = numOfMoves;
    renderMaze();
}

function handleMovement(event) {
    event.preventDefault();
    const key = event.key;
    const allowedKey = ['W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F', 'L', 'R', 'N', 'w', 'a', 's', 'd', 'f', 'l', 'r', 'n'];
    if (!playing || !allowedKey.includes(key)) {
        return;
    }
    if (timerStarted == false && timeLeft > 0) {
        startTimer();
        timerStarted = true;
    }
    switch (key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            handleButtonClick('UP');
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            handleButtonClick('LEFT');
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            handleButtonClick('DOWN');
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            handleButtonClick("RIGHT");
            break;
        case 'f':
        case 'F':
            handleButtonClick("SLASH");
            break;
        case 'l':
        case 'L':
            handleButtonClick("BREAK");
            break;
        case 'r':
        case 'R':
            restart();
            break;
        case 'n':
        case 'N':
            playAgain();
            break;
        default:
            handleButtonClick(key);
            break;
    }
}
const slider = document.getElementById('slider');
let resizeTimeout;
window.addEventListener('resize',function(){
    slider.style.transition = 'none';

    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
        slider.style.transition = 'left 0.5s ease-out';
    }, 100);
});
document.addEventListener('keydown', handleMovement);

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('menu-button');
    const slider = document.getElementById('slider');

    toggleButton.addEventListener('click', function () {
        toggleButton.classList.toggle('change');
        slider.classList.toggle('show');
    });

    createMaze();
});

function restart() {
    playing = true;
    grid = structuredClone(initialGrid);
    i = 1, j = 1;
    numOfMoves = 0;
    moveCounter.textContent = numOfMoves;
    renderMaze();
    clearInterval(timerInterval);
    timeLeft = timevalue.value;
    timer.textContent = timeLeft;
    timerStarted = false;
}

function playAgain() {
    const modal = document.getElementById("modal");
    modal.style.display = 'none';
    playing = true;
    i = 1;
    j = 1;
    grid = Array.from({ length: rows }, () => Array(cols).fill('wall'));
    vinesCount =  (10 * Math.ceil(rows/20))+1;
    breakableWallCount = (10 * Math.ceil(rows/20))+1;
    createMaze();
    numOfMoves = 0;
    moveCounter.textContent = numOfMoves;
    clearInterval(timerInterval);
    timeLeft = timevalue.value;
    timer.textContent = timeLeft;
    timerStarted = false;
}
function loseSignal() {
    const result = document.getElementById('result');
    const message = document.getElementById('message');
    result.textContent = 'GAME OVER!';
    message.textContent = 'You couldn\'t reach the exit on time.';
    const modal = document.getElementById("modal");
    modal.style.display = "block";
}
function winSignal(type) {
    const result = document.getElementById('result');
    const message = document.getElementById('message');
    result.textContent = 'CONGRATULATIONS!';
    clearInterval(timerInterval);
    if(type === '1'){
        message.textContent = 'You have found the exit in ' + (numOfMoves + 1) + ' moves with ' + timeLeft + ' seconds left.';
    }
    else{
        message.textContent = 'You have found the exit in ' + (numOfMoves + 1) + ' moves.';
    }
    const modal = document.getElementById("modal");
    modal.style.display = "block";
}
document.getElementById('dark-mode-specifier').addEventListener('click', function () {
    const darkmodebutton = document.getElementById('dark-mode-specifier');
    darkmodebutton.classList.toggle('right');
    setTimeout(function(){
        document.body.classList.toggle('darkmode');
        this.classList.toggle('darkmode');
    },400);
});
const mazesize = document.getElementById("maze-size");
const output = document.getElementById("size-output");
output.textContent = 'Maze size: ' + mazesize.value;

mazesize.oninput = function () {
    output.textContent = 'Maze size: ' + this.value;
    rows = parseInt(this.value);
    cols = parseInt(this.value);
    clearInterval(timerInterval);
    timerStarted = false;
    vinesCount =  (10 * Math.ceil(rows/20))+1;
    breakableWallCount = (10 * Math.ceil(rows/20))+1;
    grid = Array.from({ length: rows }, () => Array(cols).fill('wall'));
    playAgain();
}

timeoutput.textContent = 'Time: '+60+' seconds';

timevalue.oninput = function () {
    timeoutput.textContent = 'Time: '+this.value+' seconds'
    clearInterval(timerInterval);
    timerStarted = false;
    timeLeft = parseInt(this.value);
    if(timeLeft === 0){
        timerStarted = true;
    }
    restart();
}

console.log("Project by Shariful Islam");