// BunBun JavaScript
/* My solution: 
The algorithm first creates a random bunny solution using backtracking. 
It places one bunny in each row and checks that the bunny is not in the 
same column or touching another bunny. If it reaches a position where no 
bunny can be placed, it goes back and tries a different position.

Once a solution has been created, the algorithm gives each bunny a 
different colour and then uses those colours to grow the coloured regions 
across the board. It then checks the puzzle to make sure it is valid and 
has only one possible solution. The puzzle also has a human-style solver 
which uses rules and deductions instead of guessing, so the generated puzzles 
can actually be solved logically.
*/

const playButton = document.getElementById("play-button");
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const gameBoard = document.getElementById("game-board");

// The main idea is to make a random bunny puzzle and then check
// that the puzzle actually works before giving it back.
//
// It goes through a few steps:
// 1. Make a bunny solution
// 2. Check that the solution is valid
// 3. Give each bunny a color
// 4. Fill the rest of the board with colors
// 5. Make a key for the puzzle
// 6. Make sure we haven't already used that puzzle
// 7. Check that a real human player can solve it using 
// the game's logic rules
// 8. Make sure there is only one solution
//
// If something doesn't work, it just tries again.
//
// There are 3 boards being used:
// board = used while making the bunny solution
// solution = stores where the bunnies ended up
// colorBoard = the actual colored puzzle
// ================================================================


// ---------------------------------------------------------------
// Settings
// ---------------------------------------------------------------

// 5x5 Board
const BOARD_SIZE = 5;

// So it doesn't try forever
const MAX_ATTEMPTS = 5000;


// Makes an empty board with BOARD_SIZE rows and columns.
function makeGrid(startValue) {
    return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(startValue));
}

const board = makeGrid(null);
const solution = makeGrid(null);
const colorBoard = makeGrid(null);


// These are the colors used for the five bunny regions.
const colors = [
    "region-1",
    "region-2",
    "region-3",
    "region-4",
    "region-5"
];


// Keep track of puzzles that have already been generated.
// This only lasts until the page is refreshed.
const usedPuzzleKeys = new Set();


// ---------------------------------------------------------------
// Some small helper functions
// ---------------------------------------------------------------

// Clear a board so every space is empty again.
function clearGrid(grid) {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            grid[row][col] = null;
        }
    }
}


// Make a copy of a board.
// I need this because the main boards get reused later.
function copyGrid(grid) {
    return grid.map(rowCells => rowCells.slice());
}


// Check if a row and column are inside the board.
function isOnBoard(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}


// Find all the cells that aren't empty.
// This is mainly used for finding the bunny positions.
function getBunnyCells(grid) {
    const cells = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (grid[row][col] !== null) {
                cells.push({ row: row, col: col });
            }
        }
    }

    return cells;
}


// ================================================================
// Making the bunny solution
// ================================================================
//
// Use acktracking here: Try a spot, and if it doesn't 
// let the rest of the board work, undo it and try another.


function isValidPosition(row, col) {

    // Check if there is already a bunny in this row.
    for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[row][c] === "B") {
            return false;
        }
    }


    // Check if there is already a bunny in this column.
    for (let r = 0; r < BOARD_SIZE; r++) {
        if (board[r][col] === "B") {
            return false;
        }
    }


    // Check the cells around the spot.
    // A bunny can't be touching another bunny.
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {

            // Ignore anything outside the board.
            if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
                continue;
            }

            // Don't compare the cell with itself.
            if (r === row && c === col) {
                continue;
            }

            if (board[r][c] === "B") {
                return false;
            }
        }
    }

    return true;
}


function generateSolution(row) {

    // If we got through every row, then the solution is finished.
    if (row === BOARD_SIZE) {
        return true;
    }


    // Make a list of the columns we can try.
    let columns = [];

    for (let c = 0; c < BOARD_SIZE; c++) {
        columns.push(c);
    }


    // Shuffle them so the same solution isn't made every time.
    columns.sort(() => Math.random() - 0.5);


    for (let col of columns) {

        if (isValidPosition(row, col)) {

            // Put a bunny here for now.
            board[row][col] = "B";


            // Try doing the same thing on the next row.
            if (generateSolution(row + 1)) {
                return true;
            }


            // If that didn't work, remove the bunny and try again.
            board[row][col] = null;
        }
    }


    // None of the spots worked for this row.
    return false;
}


// Start with a completely empty board before making a solution.
function createNewSolution() {
    clearGrid(board);
    return generateSolution(0);
}


// Copy the bunny board into the solution board.
// The colors get added later.
function copyBoardToSolution() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            solution[row][col] = board[row][col];
        }
    }
}


// ================================================================
// Check the solution
// ================================================================
//
// I check the solution again after making it. The position checking
// above should already prevent problems, but this gives me another
// check that there are the right number of bunnies and that none
// of them are in the same row, column, or touching.


function isSolutionValid() {
    const bunnies = getBunnyCells(board);


    // There should be exactly one bunny for each row.
    if (bunnies.length !== BOARD_SIZE) {
        return false;
    }


    // Compare every bunny with every other bunny.
    for (let a = 0; a < bunnies.length; a++) {
        for (let b = a + 1; b < bunnies.length; b++) {

            const rowDifference = Math.abs(bunnies[a].row - bunnies[b].row);
            const colDifference = Math.abs(bunnies[a].col - bunnies[b].col);


            // Same row isn't allowed.
            if (rowDifference === 0) {
                return false;
            }


            // Same column isn't allowed.
            if (colDifference === 0) {
                return false;
            }


            // Check if the two bunnies are touching.
            if (rowDifference <= 1 && colDifference <= 1) {
                return false;
            }
        }
    }

    return true;
}


// ================================================================
// Give the bunnies colors
// ================================================================
//
// Shuffle the colors first so the bunny colors are different each
// time. Then go through the board and give each bunny one color.


function assignBunnyColors() {
    let bunnyColors = [...colors];

    // Shuffle the colors.
    bunnyColors.sort(() => Math.random() - 0.5);

    let colorIndex = 0;


    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {

            if (solution[row][col] === "B") {
                solution[row][col] = bunnyColors[colorIndex];
                colorIndex++;
            }
        }
    }
}


// ================================================================
// Make the colored board
// ================================================================
//
// Start with the bunny cells as the colored "seeds" and then let
// those colors spread to nearby empty cells.


function getColoredNeighbors(row, col) {
    const neighborColors = [];


    // Only checking up, down, left and right here.
    const directions = [
        [-1, 0], // up
        [1, 0],  // down
        [0, -1], // left
        [0, 1]   // right
    ];


    for (const direction of directions) {
        const neighborRow = row + direction[0];
        const neighborCol = col + direction[1];


        if (isOnBoard(neighborRow, neighborCol)) {
            const neighborColor = colorBoard[neighborRow][neighborCol];

            if (neighborColor !== null) {
                neighborColors.push(neighborColor);
            }
        }
    }


    return neighborColors;
}


function generateColorBoard() {
    clearGrid(colorBoard);


    // Put the bunny colors onto the color board first.
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {

            if (solution[row][col] !== null) {
                colorBoard[row][col] = solution[row][col];
            }
        }
    }


    // There are BOARD_SIZE bunnies already colored.
    let emptyCellCount = BOARD_SIZE * BOARD_SIZE - BOARD_SIZE;


    // Keep filling cells until there aren't any empty ones.
    while (emptyCellCount > 0) {

        // Find all empty cells that are next to a colored cell.
        const growableCells = [];

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {

                if (colorBoard[row][col] === null) {

                    const neighborColors = getColoredNeighbors(row, col);

                    if (neighborColors.length > 0) {
                        growableCells.push({
                            row: row,
                            col: col,
                            neighborColors: neighborColors
                        });
                    }
                }
            }
        }


        // Pick a random cell to fill.
        const chosenCell =
            growableCells[Math.floor(Math.random() * growableCells.length)];


        // Pick one of the colors next to that cell.
        const chosenColor =
            chosenCell.neighborColors[
                Math.floor(Math.random() * chosenCell.neighborColors.length)
            ];


        colorBoard[chosenCell.row][chosenCell.col] = chosenColor;

        emptyCellCount--;
    }
}


// Make sure the colored board still matches the intended solution.
function isPuzzleValid() {
    const bunnies = getBunnyCells(solution);
    const colorsSeen = [];


    for (const bunny of bunnies) {

        const bunnyColor = solution[bunny.row][bunny.col];


        // The bunny should be sitting in its own color.
        if (colorBoard[bunny.row][bunny.col] !== bunnyColor) {
            return false;
        }


        // Each color should only have one bunny.
        if (colorsSeen.includes(bunnyColor)) {
            return false;
        }

        colorsSeen.push(bunnyColor);
    }


    return colorsSeen.length === BOARD_SIZE;
}


// ================================================================
// Make a puzzle key
// ================================================================
//
// I turn the color board into a string so I can tell if I've
// already generated the exact same puzzle before.


function makePuzzleKey() {
    const rowStrings = [];


    for (let row = 0; row < BOARD_SIZE; row++) {

        const numbers = [];


        for (let col = 0; col < BOARD_SIZE; col++) {

            // Turn region-1, region-2, etc. into 1, 2, etc.
            numbers.push(colors.indexOf(colorBoard[row][col]) + 1);
        }


        rowStrings.push(numbers.join(","));
    }


    return rowStrings.join("|");
}


// ================================================================
// Check if a puzzle was already used
// ================================================================

function hasPuzzleBeenUsed(key) {
    return usedPuzzleKeys.has(key);
}


// ================================================================
// Human-style solver
// ================================================================
//
// This part tries to solve the puzzle without guessing.
//
// I keep track of which cells could still have a bunny. When a
// cell gets ruled out, its candidate becomes false.
//
// The solver uses rows, columns, and colors as groups because each
// one needs exactly one bunny.


const GROUP_KINDS = ["color", "row", "column"];


function createSolverState() {
    return {
        candidates: makeGrid(true),
        bunnies: [],
        log: []
    };
}


// Figure out which group a cell belongs to.
function getGroupNumber(kind, row, col) {

    if (kind === "row") {
        return row;
    }

    if (kind === "column") {
        return col;
    }

    // Otherwise it is a color group.
    return colors.indexOf(colorBoard[row][col]);
}


// Get all the possible cells for one group.
function getCandidateCells(state, kind, groupNumber) {
    const cells = [];


    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {

            if (
                state.candidates[row][col] &&
                getGroupNumber(kind, row, col) === groupNumber
            ) {
                cells.push({ row: row, col: col });
            }
        }
    }


    return cells;
}


// Remove a cell from the possible choices.
function eliminateCell(state, row, col) {

    if (state.candidates[row][col]) {
        state.candidates[row][col] = false;
        return true;
    }

    return false;
}


// Check if we already put a bunny in this cell.
function hasBunnyAt(state, row, col) {

    for (const bunny of state.bunnies) {

        if (bunny.row === row && bunny.col === col) {
            return true;
        }
    }

    return false;
}


// Put a bunny in a cell and remove all the cells that can no longer
// have a bunny because of it.
function placeBunny(state, row, col) {

    if (hasBunnyAt(state, row, col)) {
        return false;
    }


    state.bunnies.push({ row: row, col: col });

    const placedColor = colorBoard[row][col];


    for (let otherRow = 0; otherRow < BOARD_SIZE; otherRow++) {
        for (let otherCol = 0; otherCol < BOARD_SIZE; otherCol++) {

            // Keep the bunny's own cell.
            if (otherRow === row && otherCol === col) {
                continue;
            }


            const sameRow = otherRow === row;
            const sameColumn = otherCol === col;
            const sameColor =
                colorBoard[otherRow][otherCol] === placedColor;


            // Check all the cells around the bunny.
            const touching =
                Math.abs(otherRow - row) <= 1 &&
                Math.abs(otherCol - col) <= 1;


            if (sameRow || sameColumn || sameColor || touching) {
                eliminateCell(state, otherRow, otherCol);
            }
        }
    }


    return true;
}


// ---------------------------------------------------------------
// Rule 1: only one possible place
// ---------------------------------------------------------------
//
// If a row, column, or color only has one possible cell left,
// that cell has to contain the bunny.


function applyOnlyOnePlaceRule(state) {

    for (const kind of GROUP_KINDS) {

        for (
            let groupNumber = 0;
            groupNumber < BOARD_SIZE;
            groupNumber++
        ) {

            const cells =
                getCandidateCells(state, kind, groupNumber);


            if (cells.length === 1) {

                const cell = cells[0];


                if (placeBunny(state, cell.row, cell.col)) {

                    state.log.push(
                        "Only one place left for " +
                        kind +
                        " " +
                        groupNumber +
                        ": bunny at row " +
                        cell.row +
                        ", column " +
                        cell.col
                    );

                    return true;
                }
            }
        }
    }


    return false;
}


// ---------------------------------------------------------------
// Rule 2: groups that are limited to other groups
// ---------------------------------------------------------------
//
// This is a little harder to explain, but basically if one or two
// groups can only use the same one or two groups, then other cells
// in those groups can be crossed off.


function applyGroupRuleToChosenGroups(
    state,
    kindA,
    kindB,
    chosenGroups
) {

    // Get all the possible cells from the selected groups.
    let chosenCells = [];


    for (const groupNumber of chosenGroups) {

        chosenCells = chosenCells.concat(
            getCandidateCells(state, kindA, groupNumber)
        );
    }


    // See which groups of type B contain those cells.
    const touchedBGroups = [];


    for (const cell of chosenCells) {

        const bGroup =
            getGroupNumber(kindB, cell.row, cell.col);


        if (!touchedBGroups.includes(bGroup)) {
            touchedBGroups.push(bGroup);
        }
    }


    // The number of groups has to match.
    if (touchedBGroups.length !== chosenGroups.length) {
        return false;
    }


    let changedSomething = false;


    // Remove cells that belong to a different A group.
    for (const bGroup of touchedBGroups) {

        const cellsInB =
            getCandidateCells(state, kindB, bGroup);


        for (const cell of cellsInB) {

            const aGroup =
                getGroupNumber(kindA, cell.row, cell.col);


            if (!chosenGroups.includes(aGroup)) {

                if (
                    eliminateCell(
                        state,
                        cell.row,
                        cell.col
                    )
                ) {
                    changedSomething = true;
                }
            }
        }
    }


    if (changedSomething) {

        state.log.push(
            "Group rule: " +
            kindA +
            " " +
            chosenGroups.join(" & ") +
            " must use up " +
            kindB +
            " " +
            touchedBGroups.join(" & ")
        );
    }


    return changedSomething;
}


function applyGroupRules(state) {

    // Try every combination of group types.
    for (const kindA of GROUP_KINDS) {

        for (const kindB of GROUP_KINDS) {

            if (kindA === kindB) {
                continue;
            }


            // First try one group at a time.
            for (let a = 0; a < BOARD_SIZE; a++) {

                if (
                    applyGroupRuleToChosenGroups(
                        state,
                        kindA,
                        kindB,
                        [a]
                    )
                ) {
                    return true;
                }
            }


            // Then try pairs of groups.
            for (let a = 0; a < BOARD_SIZE; a++) {

                for (
                    let a2 = a + 1;
                    a2 < BOARD_SIZE;
                    a2++
                ) {

                    if (
                        applyGroupRuleToChosenGroups(
                            state,
                            kindA,
                            kindB,
                            [a, a2]
                        )
                    ) {
                        return true;
                    }
                }
            }
        }
    }


    return false;
}


// If a group has no possible cells left, something went wrong.
function hasContradiction(state) {

    for (const kind of GROUP_KINDS) {

        for (
            let groupNumber = 0;
            groupNumber < BOARD_SIZE;
            groupNumber++
        ) {

            if (
                getCandidateCells(
                    state,
                    kind,
                    groupNumber
                ).length === 0
            ) {
                return true;
            }
        }
    }


    return false;
}


// Keep applying the rules until the puzzle is solved or we get stuck.
function solveLikeAHuman() {

    const state = createSolverState();


    while (state.bunnies.length < BOARD_SIZE) {

        if (hasContradiction(state)) {
            break;
        }


        // Start with the easier rule.
        // If it doesn't work, try the group rule.
        const madeProgress =
            applyOnlyOnePlaceRule(state) ||
            applyGroupRules(state);


        if (!madeProgress) {
            // Nothing else can be figured out with these rules.
            break;
        }
    }


    const solved =
        state.bunnies.length === BOARD_SIZE &&
        !hasContradiction(state);


    return {
        solved: solved,
        bunnies: state.bunnies,
        log: state.log
    };
}


// Turn the bunny positions into a string so they are easy to compare.
function bunniesToText(bunnies) {

    const sorted =
        bunnies.slice().sort((a, b) => a.row - b.row);


    return sorted
        .map(bunny => bunny.row + ":" + bunny.col)
        .join(",");
}


// ================================================================
// Check for exactly one solution
// ================================================================
//
// This is another backtracking function, but instead of stopping
// after finding one solution, it counts them.
//
// I only need to know if there is more than one, so I stop after 2.


function countSolutions(row, colorsUsed, limit) {

    // Getting to the end means we found a solution.
    if (row === BOARD_SIZE) {
        return 1;
    }


    let count = 0;


    for (let col = 0; col < BOARD_SIZE; col++) {

        const color = colorBoard[row][col];


        // Can't have two bunnies with the same color.
        if (colorsUsed.includes(color)) {
            continue;
        }


        // Also make sure the bunny position itself is allowed.
        if (!isValidPosition(row, col)) {
            continue;
        }


        // Try putting a bunny here.
        board[row][col] = "B";
        colorsUsed.push(color);


        // Continue with the next row.
        count += countSolutions(
            row + 1,
            colorsUsed,
            limit
        );


        // Undo the choice so we can try another one.
        board[row][col] = null;
        colorsUsed.pop();


        // Two solutions is already enough to know it isn't unique.
        if (count >= limit) {
            break;
        }
    }


    return count;
}


function hasExactlyOneSolution() {

    // Start the search with an empty board.
    clearGrid(board);

    return countSolutions(0, [], 2) === 1;
}


// ================================================================
// Generate the actual puzzle
// ================================================================
//
// This puts all the steps together. If any check fails, the current
// puzzle is thrown away and another one is made.


function generatePuzzle() {

    for (
        let attempt = 1;
        attempt <= MAX_ATTEMPTS;
        attempt++
    ) {

        // Make a bunny solution.
        if (!createNewSolution()) {
            continue;
        }


        // Make sure the solution follows the rules.
        if (!isSolutionValid()) {
            continue;
        }


        // Give each bunny a different color.
        copyBoardToSolution();
        assignBunnyColors();


        // Grow the colors across the rest of the board.
        generateColorBoard();


        // Check that the colored board is okay.
        if (!isPuzzleValid()) {
            continue;
        }


        // Make a key for this puzzle.
        const key = makePuzzleKey();


        // Don't give the player the same puzzle twice.
        if (hasPuzzleBeenUsed(key)) {
            continue;
        }


        // Try solving it without guessing.
        const humanResult = solveLikeAHuman();


        if (!humanResult.solved) {
            continue;
        }


        // Make sure the human solver found the same bunny positions
        // as the solution we originally made.
        if (
            bunniesToText(humanResult.bunnies) !==
            bunniesToText(getBunnyCells(solution))
        ) {
            continue;
        }


        // Finally check that there isn't another possible solution.
        if (!hasExactlyOneSolution()) {
            continue;
        }


        // Everything worked, so remember this puzzle.
        usedPuzzleKeys.add(key);


        // Return copies because the main boards will be reused
        // the next time another puzzle is generated.
        return {
            colorBoard: copyGrid(colorBoard),
            solution: copyGrid(solution),
            key: key,
            hintSteps: humanResult.log
        };
    }


    // This means we tried too many times without finding one.
    return null;
}


// ================================================================
// Print a puzzle in the console
// ================================================================
//
// This is just useful for testing the generator without having
// to build the whole game UI first.


function printPuzzle(puzzle) {

    for (let row = 0; row < BOARD_SIZE; row++) {

        let line = "";


        for (let col = 0; col < BOARD_SIZE; col++) {

            const number =
                colors.indexOf(
                    puzzle.colorBoard[row][col]
                ) + 1;


            // Put brackets around the bunny cells so they're easier
            // to see when looking at the console.
            line +=
                (puzzle.solution[row][col] !== null)
                    ? "[" + number + "] "
                    : " " + number + "  ";
        }


        console.log(line);
    }
}


// To test it in the browser console:
// const puzzle = generatePuzzle();
// printPuzzle(puzzle);
// console.log(puzzle.key, puzzle.hintSteps);


// ====================================================================





// ================================================================
// BunBun game
// ================================================================
//
// Let's connect the puzzle generator to the actual game screen.

// ================================================================


// This keeps track of the puzzle the player is currently doing.
let currentPuzzle = null;
let lives = 3;
let wins = 0;
let gameOver = false;

// ---------------------------------------------------------------
// Start a new puzzle
// ---------------------------------------------------------------

function startNewPuzzle() {

    // Generate a completely new puzzle.
    currentPuzzle = generatePuzzle();

    if (currentPuzzle === null) {
        console.log("Could not generate a puzzle.");
        return;
    }

    // Reset the game for the new puzzle.
    lives = 3;
    gameOver = false;

    updateLives();

    // Put the puzzle on the screen.
    displayPuzzle(currentPuzzle);

    // Reset the message.
    document.getElementById("message-text").textContent = 
        "Pick a square to place your first bunny!";


    document.getElementById("next-puzzle-button").style.display = "show";
}


// ---------------------------------------------------------------
// Display the puzzle
// ---------------------------------------------------------------
//
// The color board is shown to the player, but the solution isn't.
// The player has to figure out where the bunnies go.


function displayPuzzle(puzzle) {

    const gameBoard = document.getElementById("game-board");

    // Clear the old puzzle first.
    gameBoard.innerHTML = "";


    for (let row = 0; row < BOARD_SIZE; row++) {

        for (let col = 0; col < BOARD_SIZE; col++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");

            // Use the region name as a CSS class.
            // For example: region-1, region-2, etc.
            cell.classList.add(puzzle.colorBoard[row][col]);


            // Save the position of the cell.
            // This makes it easier to check the player's answer later.
            cell.dataset.row = row;
            cell.dataset.col = col;


            // Let the player click the cell to place/remove a bunny.
            let clickTimer;
            

            // Cell is crossed off ("X) when clicked once.
            // If clicked again, the "X" disappears and so on.
            cell.addEventListener("click", function() {

                clickTimer = setTimeout(function() {

                    if (cell.querySelector(".bunny")) {
                    return;
                    }

                    cell.classList.toggle("marked");
                }, 200);

            });

            // When cell is doble clicked, the bunny appears
            cell.addEventListener("dblclick", function() {
                clearTimeout(clickTimer);

                if (cell.querySelector(".bunny")) {
                    return;
                }

                cell.classList.remove("marked");

                const bunny = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                bunny.classList.add("bunny");

                const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
                use.setAttribute("href", "#bunny");

                bunny.appendChild(use);
                cell.appendChild(bunny);

                // Here I just learned in JavaScript, function 
                // declarations can be called before they appear in the file
                checkBunnyPlacement(cell, row, col); 

            });

            gameBoard.appendChild(cell);

        }
    }
}

function checkBunnyPlacement(cell, row, col) {

    // Get the correct bunny positions from the hidden solution.
    const correctBunnies =
        getBunnyCells(currentPuzzle.solution);


    // See if this cell is one of the correct positions.
    const isCorrect = correctBunnies.some(function(bunny) {

        return bunny.row === row && bunny.col === col;
    });


    if (isCorrect) {

        // The bunny is correct, so leave it there.
        checkPuzzle();

    } else {

        // The bunny is in the wrong place.
        const bunny = cell.querySelector(".bunny");

        if (bunny) {
            bunny.remove();
        }


        // Put an X in the cell.
        cell.classList.add("marked");


        // Make this X a wrong-answer X.
        cell.classList.add("wrong");


        // Player loses one carrot.
        loseLife();
    }
}
 

function loseLife() {

    lives--;

    updateLives();


    if (lives <= 0) {

        // Player lost all 3 lives
        restartCurrentPuzzle();
    }
}

function updateWins() {

    document.getElementById("win-count").textContent = wins;
}

function updateLives() {

    const carrots =
        document.querySelectorAll("#lives .carrot");


    carrots.forEach(function(carrot, index) {

        if (index >= lives) {
            carrot.classList.add("lost");
        } else {
            carrot.classList.remove("lost");
        }
    });


    // Update the accessibility label too.
    const livesContainer =
        document.getElementById("lives");

    livesContainer.setAttribute(
        "aria-label",
        lives + (lives === 1 ? " life left" : " lives left")
    );
}

// ---------------------------------------------------------------
// Check the player's answer
// ---------------------------------------------------------------
//
// Get all the cells where the player placed a bunny and compare
// them to the hidden solution.


function checkPuzzle() {

    // Don't try to check anything if there isn't a puzzle yet.
    if (currentPuzzle === null || gameOver) {
        return;
    }


    const playerBunnies = [];

    const cells = document.querySelectorAll(".cell");


    // Find all the bunnies the player has placed.
    cells.forEach(function(cell) {

        if (cell.querySelector(".bunny")) {

            playerBunnies.push({
                row: Number(cell.dataset.row),
                col: Number(cell.dataset.col)
            });
        }
    });

    // Get the correct bunny positions.
    const correctBunnies =
        getBunnyCells(currentPuzzle.solution);


    // If there aren't enough bunnies yet, the puzzle isn't solved.
    if (playerBunnies.length !== correctBunnies.length) {
        return;
    }


    // Check each bunny the player placed.
    for (const playerBunny of playerBunnies) {

        const isCorrect = correctBunnies.some(function (correctBunny) {

            return (
                playerBunny.row === correctBunny.row &&
                playerBunny.col === correctBunny.col
            );
        });


        // If even one bunny is in the wrong place,
        // the puzzle isn't solved yet.
        if (!isCorrect) {
            return;
        }
    }


    // If we got this far, every bunny is correct.
    puzzleWon();
}


// ---------------------------------------------------------------
// Puzzle won
// ---------------------------------------------------------------

function puzzleWon() {

    wins++;

    // Update the message.
    document.getElementById("message-text").textContent =
        "Wow! You solved it!";

    // Show the next puzzle button
    document.getElementById("next-puzzle-button").style.display = "show";
    updateWins();
}

function showGameOver() {

    // Stop the player from interacting with the board.
    const cells = document.querySelectorAll(".cell");

    cells.forEach(function(cell) {
        cell.classList.add("disabled");
    });
}

function restartCurrentPuzzle() {

    lives = 3;
    gameOver = false;

    updateLives();


    // Put the same puzzle back on the board.
    displayPuzzle(currentPuzzle);


    document.getElementById("message-text").textContent =
        "Try again! You have 3 lives.";

    document.getElementById("next-puzzle-button").style.display =
        "show";
}

// ---------------------------------------------------------------
// Play button
// ---------------------------------------------------------------

playButton.addEventListener("click", () => {
    titleScreen.classList.add("is-hidden")
    gameScreen.classList.remove("is-hidden")

    startNewPuzzle()
});


// ---------------------------------------------------------------
// Next Puzzle button
// ---------------------------------------------------------------

const nextPuzzleButton =
    document.getElementById("next-puzzle-button");


if (nextPuzzleButton) {

    nextPuzzleButton.addEventListener("click", function () {

        // Make a new puzzle.
        startNewPuzzle();
    });
}
